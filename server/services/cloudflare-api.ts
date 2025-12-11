/**
 * Cloudflare API Service
 * Manages Cloudflare Access Zero Trust configuration programmatically
 */

interface CloudflareAccount {
  id: string;
  name: string;
}

interface CloudflareAccessApp {
  id: string;
  uid: string;
  name: string;
  domain: string;
  aud: string;
  session_duration: string;
  allowed_idps: string[];
  auto_redirect_to_identity: boolean;
}

interface CloudflareIdentityProvider {
  id: string;
  name: string;
  type: string;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  errors: any[];
  messages: any[];
  result: T;
}

class CloudflareApiService {
  private globalApiKey: string;
  private email: string;
  private accountId: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor() {
    this.globalApiKey = process.env.CLOUDFLARE_GLOBAL_API_KEY || '';
    this.email = process.env.CLOUDFLARE_EMAIL || 'nick@washbizhub.com';
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
  }

  private getHeaders(): HeadersInit {
    return {
      'X-Auth-Email': this.email,
      'X-Auth-Key': this.globalApiKey,
      'Content-Type': 'application/json',
    };
  }

  isConfigured(): boolean {
    return !!(this.globalApiKey && this.email);
  }

  /**
   * Get account ID from Cloudflare API
   */
  async getAccounts(): Promise<CloudflareAccount[]> {
    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: this.getHeaders(),
    });
    const data: CloudflareApiResponse<CloudflareAccount[]> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to get accounts: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * Get or detect account ID
   */
  async getAccountId(): Promise<string> {
    if (this.accountId) return this.accountId;
    
    const accounts = await this.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No Cloudflare accounts found');
    }
    this.accountId = accounts[0].id;
    return this.accountId;
  }

  /**
   * List existing Access applications
   */
  async listAccessApps(): Promise<CloudflareAccessApp[]> {
    const accountId = await this.getAccountId();
    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/apps`,
      { headers: this.getHeaders() }
    );
    const data: CloudflareApiResponse<CloudflareAccessApp[]> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to list Access apps: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * Get Access application by name
   */
  async getAccessAppByName(name: string): Promise<CloudflareAccessApp | null> {
    const apps = await this.listAccessApps();
    return apps.find(app => app.name === name) || null;
  }

  /**
   * Create a new Access application
   */
  async createAccessApp(config: {
    name: string;
    domain: string;
    sessionDuration?: string;
    allowedIdps?: string[];
  }): Promise<CloudflareAccessApp> {
    const accountId = await this.getAccountId();
    
    const payload = {
      name: config.name,
      domain: config.domain,
      type: 'self_hosted',
      session_duration: config.sessionDuration || '24h',
      allowed_idps: config.allowedIdps || [],
      auto_redirect_to_identity: false,
      app_launcher_visible: true,
      enable_binding_cookie: false,
      http_only_cookie_attribute: true,
      same_site_cookie_attribute: 'lax',
      skip_interstitial: true,
    };

    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/apps`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );
    
    const data: CloudflareApiResponse<CloudflareAccessApp> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to create Access app: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * Update an existing Access application
   */
  async updateAccessApp(appId: string, config: {
    name?: string;
    domain?: string;
    sessionDuration?: string;
    allowedIdps?: string[];
  }): Promise<CloudflareAccessApp> {
    const accountId = await this.getAccountId();
    
    const payload: any = {};
    if (config.name) payload.name = config.name;
    if (config.domain) payload.domain = config.domain;
    if (config.sessionDuration) payload.session_duration = config.sessionDuration;
    if (config.allowedIdps) payload.allowed_idps = config.allowedIdps;

    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/apps/${appId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );
    
    const data: CloudflareApiResponse<CloudflareAccessApp> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to update Access app: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * List identity providers
   */
  async listIdentityProviders(): Promise<CloudflareIdentityProvider[]> {
    const accountId = await this.getAccountId();
    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/identity_providers`,
      { headers: this.getHeaders() }
    );
    const data: CloudflareApiResponse<CloudflareIdentityProvider[]> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to list identity providers: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * Create an Access policy for an application
   */
  async createAccessPolicy(appId: string, config: {
    name: string;
    decision: 'allow' | 'deny' | 'bypass';
    include: any[];
    require?: any[];
    exclude?: any[];
  }): Promise<any> {
    const accountId = await this.getAccountId();
    
    const payload = {
      name: config.name,
      decision: config.decision,
      include: config.include,
      require: config.require || [],
      exclude: config.exclude || [],
      precedence: 1,
    };

    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/apps/${appId}/policies`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );
    
    const data: CloudflareApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to create Access policy: ${JSON.stringify(data.errors)}`);
    }
    return data.result;
  }

  /**
   * Get team domain (Access organization domain)
   */
  async getTeamDomain(): Promise<string> {
    const accountId = await this.getAccountId();
    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/access/organizations`,
      { headers: this.getHeaders() }
    );
    const data: CloudflareApiResponse<{ auth_domain: string }> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to get organization: ${JSON.stringify(data.errors)}`);
    }
    return data.result.auth_domain;
  }

  /**
   * Full setup: Create WashBizHub Access application
   */
  async setupWashBizHubAccess(appDomain: string): Promise<{
    app: CloudflareAccessApp;
    audienceTag: string;
    teamDomain: string;
    identityProviders: CloudflareIdentityProvider[];
  }> {
    console.log('🔐 Setting up Cloudflare Access for WashBizHub...');
    
    // Get team domain
    const teamDomain = await this.getTeamDomain();
    console.log(`   Team domain: ${teamDomain}`);
    
    // List identity providers
    const idps = await this.listIdentityProviders();
    console.log(`   Found ${idps.length} identity providers`);
    
    // Check if app already exists
    let app = await this.getAccessAppByName('WashBizHub');
    
    if (app) {
      console.log(`   Existing app found: ${app.id}`);
      // Update the domain if needed
      if (app.domain !== appDomain) {
        app = await this.updateAccessApp(app.id, {
          domain: appDomain,
          allowedIdps: idps.map(idp => idp.id),
        });
        console.log('   Updated app domain');
      }
    } else {
      // Create new app
      app = await this.createAccessApp({
        name: 'WashBizHub',
        domain: appDomain,
        sessionDuration: '24h',
        allowedIdps: idps.map(idp => idp.id),
      });
      console.log(`   Created new app: ${app.id}`);
      
      // Create default "Allow All" policy
      await this.createAccessPolicy(app.id, {
        name: 'Allow Authenticated Users',
        decision: 'allow',
        include: [{ everyone: {} }],
      });
      console.log('   Created default access policy');
    }
    
    console.log('✅ Cloudflare Access setup complete!');
    console.log(`   Audience Tag (AUD): ${app.aud}`);
    
    return {
      app,
      audienceTag: app.aud,
      teamDomain,
      identityProviders: idps,
    };
  }
}

export const cloudflareApi = new CloudflareApiService();
