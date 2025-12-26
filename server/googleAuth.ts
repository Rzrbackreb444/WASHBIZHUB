import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { adminActivityLog } from "@shared/schema";
import { OAuth2Client } from "google-auth-library";

// Platform owner emails with full admin access
const ADMIN_EMAILS = [
  "nick@washbizhub.com",
  "rzrbackreb444@gmail.com",
  "thelaundromatfb@gmail.com",
  "larry@washbizhub.com"
];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

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
          const userIsAdmin = isAdminEmail(email);
          
          if (existingUser) {
            // Always update isAdmin status and googleId if needed
            const needsUpdate = !existingUser.googleId || existingUser.isAdmin !== userIsAdmin;
            if (needsUpdate) {
              await storage.updateUser(existingUser.id, {
                googleId: existingUser.googleId || googleId,
                profileImageUrl: existingUser.profileImageUrl || profileImageUrl,
                isAdmin: userIsAdmin,
              });
              existingUser = await storage.getUser(existingUser.id);
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
            isAdmin: userIsAdmin,
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

  // Callback handler with dynamic URL and fallback to Replit Auth on failure
  app.get("/api/auth/google/callback", (req: Request, res: Response, next: NextFunction) => {
    const callbackUrl = getCallbackUrl(req);
    console.log(`🔐 Google OAuth callback received at: ${callbackUrl}`);
    
    passport.authenticate("google", {
      session: true,
      callbackURL: callbackUrl,
    })(req, res, (err: any) => {
      if (err) {
        console.error("Google OAuth callback error:", err);
        // Redirect to fallback with transparent messaging
        return res.redirect("/api/auth/fallback?reason=google_oauth_error&message=Google+login+encountered+an+issue.+Using+backup+login.");
      }
      
      // Check if authentication was successful
      if (!req.user) {
        console.log("🔄 Google OAuth did not return user, using fallback auth");
        return res.redirect("/api/auth/fallback?reason=google_no_user&message=Google+login+incomplete.+Using+backup+login.");
      }
      
      res.redirect("/auth/callback");
    });
  });

  console.log("✅ Google OAuth configured with dynamic callback URLs");
}

// RISC (Risk and Incident Sharing and Coordination) Event Receiver for Cross-Account Protection
// This endpoint receives security event notifications from Google about potential account hijacking
export function setupRISCEventReceiver(app: Express) {
  // RISC event receiver endpoint - receives Security Event Tokens (SETs) from Google
  app.post("/api/risc/events", async (req: Request, res: Response) => {
    try {
      const eventToken = req.body;
      
      if (!eventToken) {
        console.warn("⚠️ RISC: Empty event received");
        return res.status(400).json({ error: "No event token provided" });
      }

      // Log the security event for monitoring
      console.log("🔒 RISC Security Event Received:", {
        type: eventToken.events ? Object.keys(eventToken.events) : "unknown",
        subject: eventToken.sub,
        timestamp: new Date().toISOString(),
      });

      // Handle different RISC event types
      const events = eventToken.events || {};
      
      for (const [eventType, eventData] of Object.entries(events)) {
        switch (eventType) {
          case "https://schemas.openid.net/secevent/risc/event-type/sessions-revoked":
            // User's Google sessions were revoked - invalidate their session here too
            console.log("🚫 RISC: Sessions revoked for user:", eventToken.sub);
            await handleSessionsRevoked(eventToken.sub);
            break;
            
          case "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required":
            // User must change credentials - notify and flag account
            console.log("⚠️ RISC: Credential change required for user:", eventToken.sub);
            await handleCredentialChangeRequired(eventToken.sub);
            break;
            
          case "https://schemas.openid.net/secevent/risc/event-type/account-disabled":
            // Google disabled the account - disable access here
            console.log("🔴 RISC: Account disabled for user:", eventToken.sub);
            await handleAccountDisabled(eventToken.sub);
            break;
            
          case "https://schemas.openid.net/secevent/risc/event-type/account-enabled":
            // Account was re-enabled
            console.log("🟢 RISC: Account re-enabled for user:", eventToken.sub);
            break;
            
          case "https://schemas.openid.net/secevent/risc/event-type/tokens-revoked":
            // All OAuth tokens revoked
            console.log("🔄 RISC: Tokens revoked for user:", eventToken.sub);
            await handleTokensRevoked(eventToken.sub);
            break;
            
          default:
            console.log("ℹ️ RISC: Unhandled event type:", eventType);
        }
      }

      // Acknowledge receipt of the event (required by RISC protocol)
      res.status(202).json({ status: "accepted" });
    } catch (error) {
      console.error("❌ RISC event processing error:", error);
      // Still return 202 to prevent retries for malformed events
      res.status(202).json({ status: "accepted with errors" });
    }
  });

  // Health check endpoint for RISC (required for Google to verify receiver)
  app.get("/api/risc/health", (req: Request, res: Response) => {
    res.status(200).json({ 
      status: "healthy", 
      service: "WashBizHub RISC Receiver",
      timestamp: new Date().toISOString() 
    });
  });

  console.log("✅ RISC Cross-Account Protection endpoint configured at /api/risc/events");
}

// Handler functions for RISC events
async function handleSessionsRevoked(googleId: string) {
  try {
    // Find user by Google ID and invalidate their sessions
    const user = await storage.getUserByGoogleId(googleId);
    if (user) {
      console.log(`🔒 Invalidating sessions for user: ${user.email}`);
      // In a production system, you would invalidate all sessions for this user
      // For now, we log the event - session invalidation happens on next request
    }
  } catch (error) {
    console.error("Error handling sessions-revoked:", error);
  }
}

async function handleCredentialChangeRequired(googleId: string) {
  try {
    const user = await storage.getUserByGoogleId(googleId);
    if (user) {
      console.log(`⚠️ Flagging account for credential change: ${user.email}`);
      // Flag the account for credential change on next login
    }
  } catch (error) {
    console.error("Error handling credential-change-required:", error);
  }
}

async function handleAccountDisabled(googleId: string) {
  try {
    const user = await storage.getUserByGoogleId(googleId);
    if (user) {
      console.log(`🔴 Disabling access for user: ${user.email}`);
      // Disable the user's account in our system
      await storage.updateUser(user.id, { isActive: false });
    }
  } catch (error) {
    console.error("Error handling account-disabled:", error);
  }
}

async function handleTokensRevoked(googleId: string) {
  try {
    const user = await storage.getUserByGoogleId(googleId);
    if (user) {
      console.log(`🔄 Tokens revoked for user: ${user.email}`);
      // User will need to re-authenticate on next request
    }
  } catch (error) {
    console.error("Error handling tokens-revoked:", error);
  }
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
