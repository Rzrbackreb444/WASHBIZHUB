/**
 * Cloudflare Access Authentication Service
 * Enterprise-grade Zero Trust authentication
 * 
 * Features:
 * - JWT validation with Cloudflare's public keys
 * - Automatic user provisioning from Cloudflare claims
 * - Support for multiple identity providers via Cloudflare
 * - Device posture and MFA enforcement (configured in Cloudflare dashboard)
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

interface CloudflareAccessClaims {
  aud: string[];
  email: string;
  exp: number;
  iat: number;
  nbf: number;
  iss: string;
  type: string;
  identity_nonce: string;
  sub: string;
  country?: string;
  custom?: Record<string, any>;
  name?: string;
  given_name?: string;
  family_name?: string;
}

interface CloudflareJWK {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  e: string;
  n: string;
}

interface CloudflareJWKS {
  keys: CloudflareJWK[];
}

export class CloudflareAccessService {
  private teamDomain: string;
  private audienceTag: string;
  private jwksCache: CloudflareJWKS | null = null;
  private jwksCacheExpiry: number = 0;
  private readonly JWKS_CACHE_TTL = 3600000; // 1 hour

  constructor() {
    this.teamDomain = process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN || '';
    this.audienceTag = process.env.CLOUDFLARE_ACCESS_AUDIENCE || '';
  }

  isConfigured(): boolean {
    // Both team domain AND audience are required for secure Zero Trust validation
    return !!(this.teamDomain && this.audienceTag);
  }
  
  hasAudienceConfigured(): boolean {
    return !!this.audienceTag;
  }
  
  getConfigurationStatus(): { configured: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!this.teamDomain) issues.push('CLOUDFLARE_ACCESS_TEAM_DOMAIN is not set');
    if (!this.audienceTag) issues.push('CLOUDFLARE_ACCESS_AUDIENCE is not set (required for Zero Trust)');
    return { configured: issues.length === 0, issues };
  }

  getLoginUrl(redirectPath: string = '/', appUrl?: string): string {
    if (!this.isConfigured()) {
      throw new Error('Cloudflare Access is not configured');
    }
    // Use full app URL for redirect so Cloudflare returns to the correct domain
    const baseUrl = appUrl || process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : (process.env.APP_URL || '');
    const fullRedirectUrl = baseUrl ? `${baseUrl}${redirectPath}` : redirectPath;
    return `https://${this.teamDomain}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(fullRedirectUrl)}`;
  }

  getLogoutUrl(): string {
    if (!this.isConfigured()) {
      throw new Error('Cloudflare Access is not configured');
    }
    return `https://${this.teamDomain}/cdn-cgi/access/logout`;
  }

  private async fetchJWKS(): Promise<CloudflareJWKS> {
    const now = Date.now();
    
    if (this.jwksCache && now < this.jwksCacheExpiry) {
      return this.jwksCache;
    }

    const response = await fetch(
      `https://${this.teamDomain}/cdn-cgi/access/certs`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Cloudflare JWKS: ${response.status}`);
    }

    this.jwksCache = await response.json() as CloudflareJWKS;
    this.jwksCacheExpiry = now + this.JWKS_CACHE_TTL;

    return this.jwksCache;
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  private async importKey(jwk: CloudflareJWK): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'jwk',
      {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
        alg: jwk.alg,
        use: jwk.use,
      },
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );
  }

  async validateToken(token: string): Promise<CloudflareAccessClaims | null> {
    if (!this.isConfigured()) {
      console.error('Cloudflare Access not configured');
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }

      const [headerB64, payloadB64, signatureB64] = parts;
      
      const header = JSON.parse(this.base64UrlDecode(headerB64));
      const payload = JSON.parse(this.base64UrlDecode(payloadB64)) as CloudflareAccessClaims;

      // Validate expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.error('Token expired');
        return null;
      }

      // Validate not before
      if (payload.nbf && payload.nbf > now) {
        console.error('Token not yet valid');
        return null;
      }

      // Validate audience (MANDATORY for Zero Trust security)
      if (!payload.aud || !payload.aud.includes(this.audienceTag)) {
        console.error('❌ Invalid audience. Token aud:', payload.aud, 'Expected:', this.audienceTag);
        console.error('   This is a security violation - token may be from a different Access application');
        return null;
      }

      // Validate issuer
      const expectedIssuer = `https://${this.teamDomain}`;
      if (payload.iss !== expectedIssuer) {
        console.error('Invalid issuer');
        return null;
      }

      // Fetch JWKS and find matching key
      const jwks = await this.fetchJWKS();
      const key = jwks.keys.find(k => k.kid === header.kid);
      
      if (!key) {
        console.error('No matching key found');
        return null;
      }

      // Verify signature
      const cryptoKey = await this.importKey(key);
      const signatureBuffer = Buffer.from(
        signatureB64.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      );
      const dataBuffer = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

      const isValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBuffer,
        dataBuffer
      );

      if (!isValid) {
        console.error('Invalid signature');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  extractTokenFromRequest(req: any): string | null {
    // Check CF_Authorization cookie (set by Cloudflare Access)
    const cfAuthCookie = req.cookies?.['CF_Authorization'];
    if (cfAuthCookie) {
      return cfAuthCookie;
    }

    // Check Authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check Cf-Access-Jwt-Assertion header
    const cfAccessToken = req.headers?.['cf-access-jwt-assertion'];
    if (cfAccessToken) {
      return cfAccessToken;
    }

    return null;
  }

  async authenticateRequest(req: any): Promise<CloudflareAccessClaims | null> {
    const token = this.extractTokenFromRequest(req);
    if (!token) {
      return null;
    }
    return this.validateToken(token);
  }

  async provisionUser(claims: CloudflareAccessClaims): Promise<any> {
    const email = claims.email.toLowerCase().trim();
    
    // Check if user exists
    const existingUsers = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      
      // Update user profile if needed
      const updates: any = {};
      
      if (claims.given_name && !user.firstName) {
        updates.firstName = claims.given_name;
      }
      if (claims.family_name && !user.lastName) {
        updates.lastName = claims.family_name;
      }
      
      if (Object.keys(updates).length > 0) {
        await db.update(users)
          .set(updates)
          .where(eq(users.id, user.id));
      }
      
      return { ...user, ...updates };
    }

    // Create new user
    const newUserId = crypto.randomUUID();
    const firstName = claims.given_name || claims.name?.split(' ')[0] || '';
    const lastName = claims.family_name || claims.name?.split(' ').slice(1).join(' ') || '';

    const [newUser] = await db.insert(users)
      .values({
        id: newUserId,
        email,
        firstName,
        lastName,
        emailVerified: true, // Cloudflare Access already verified the email
        subscriptionTier: 'free',
        createdAt: new Date(),
      })
      .returning();

    console.log(`✅ New user provisioned via Cloudflare Access: ${email}`);
    
    return newUser;
  }
}

export const cloudflareAccess = new CloudflareAccessService();
