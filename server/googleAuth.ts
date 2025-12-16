import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { adminActivityLog } from "@shared/schema";
import { OAuth2Client } from "google-auth-library";

// Get dynamic callback URL based on request
function getCallbackUrl(req: Request): string {
  // Use X-Forwarded headers if behind proxy, otherwise use request host
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || req.hostname;
  return `${protocol}://${host}/api/auth/google/callback`;
}

// Store for dynamic OAuth clients per origin
const oauthClients = new Map<string, OAuth2Client>();

function getOAuthClient(callbackUrl: string): OAuth2Client {
  if (!oauthClients.has(callbackUrl)) {
    oauthClients.set(callbackUrl, new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl
    ));
  }
  return oauthClients.get(callbackUrl)!;
}

export async function setupGoogleAuth(app: Express) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.log("⚠️ Google OAuth not configured - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
    return;
  }

  console.log(`🔐 Setting up Google OAuth with dynamic callback URLs`);
  console.log(`   Production domains: washbizhub.com, washbizhub.xyz, washbizhub.replit.app`);

  // Use passReqToCallback to get dynamic callback URL
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: "/api/auth/google/callback", // Relative URL - passport resolves it
        passReqToCallback: true,
      },
      async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const firstName = profile.name?.givenName || "";
          const lastName = profile.name?.familyName || "";
          const profileImageUrl = profile.photos?.[0]?.value || "";

          if (!email) {
            return done(new Error("No email provided by Google"), undefined);
          }

          let existingUser = await storage.getUserByEmail(email);
          
          if (existingUser) {
            if (!existingUser.googleId) {
              await storage.updateUser(existingUser.id, {
                googleId,
                profileImageUrl: existingUser.profileImageUrl || profileImageUrl,
              });
            }
            
            const sessionUser = {
              id: existingUser.id,
              sub: existingUser.id,
              email: existingUser.email,
              claims: {
                sub: existingUser.id,
                email: existingUser.email,
                first_name: existingUser.firstName,
                last_name: existingUser.lastName,
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
              },
              expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            };
            
            return done(null, sessionUser);
          }

          const newUser = await storage.upsertUser({
            id: googleId,
            email,
            firstName,
            lastName,
            profileImageUrl,
            googleId,
            emailVerified: true,
          });

          try {
            await db.insert(adminActivityLog).values({
              type: 'user_signup',
              description: `New user registered via Google: ${email}`,
              email: email,
              metadata: {
                userId: newUser.id,
                firstName,
                lastName,
                provider: 'google',
              },
              tenant: 'washbizhub.com',
            });
          } catch (e) {
            console.error('Failed to log user signup:', e);
          }

          const sessionUser = {
            id: newUser.id,
            sub: newUser.id,
            email: newUser.email,
            claims: {
              sub: newUser.id,
              email: newUser.email,
              first_name: firstName,
              last_name: lastName,
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            },
            expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          };

          done(null, sessionUser);
        } catch (error) {
          console.error("Google OAuth error:", error);
          done(error as Error, undefined);
        }
      }
    )
  );

  // Dynamic OAuth login - constructs URL based on current request origin
  app.get("/api/auth/google", (req: Request, res: Response, next: NextFunction) => {
    const callbackUrl = getCallbackUrl(req);
    console.log(`🔐 Google OAuth initiated with callback: ${callbackUrl}`);
    
    // Store callback URL in session for later verification
    if (req.session) {
      (req.session as any).oauthCallbackUrl = callbackUrl;
    }
    
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      callbackURL: callbackUrl,
    })(req, res, next);
  });

  // Alias for /api/auth/google/login (used by frontend)
  app.get("/api/auth/google/login", (req: Request, res: Response, next: NextFunction) => {
    const callbackUrl = getCallbackUrl(req);
    console.log(`🔐 Google OAuth login initiated with callback: ${callbackUrl}`);
    
    if (req.session) {
      (req.session as any).oauthCallbackUrl = callbackUrl;
    }
    
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      callbackURL: callbackUrl,
    })(req, res, next);
  });

  // Callback handler with dynamic URL
  app.get("/api/auth/google/callback", (req: Request, res: Response, next: NextFunction) => {
    const callbackUrl = getCallbackUrl(req);
    console.log(`🔐 Google OAuth callback received at: ${callbackUrl}`);
    
    passport.authenticate("google", {
      failureRedirect: "/login?error=google_auth_failed",
      session: true,
      callbackURL: callbackUrl,
    })(req, res, (err: any) => {
      if (err) {
        console.error("Google OAuth callback error:", err);
        return res.redirect("/login?error=google_auth_failed");
      }
      res.redirect("/auth/callback");
    });
  });

  console.log("✅ Google OAuth configured with dynamic callback URLs");
}

export async function verifyGoogleToken(idToken: string) {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }
    
    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profileImageUrl: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid Google token");
  }
}
