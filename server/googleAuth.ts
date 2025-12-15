import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { adminActivityLog } from "@shared/schema";

export async function setupGoogleAuth(app: Express) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.log("⚠️ Google OAuth not configured - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
    return;
  }

  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
    `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/api/auth/google/callback`;

  console.log(`🔐 Setting up Google OAuth with callback: ${callbackURL}`);

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
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

  // Primary Google OAuth route
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      prompt: "select_account",
    })
  );

  // Alias for /api/auth/google/login (used by frontend)
  app.get(
    "/api/auth/google/login",
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      prompt: "select_account",
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/login?error=google_auth_failed",
      session: true,
    }),
    (req, res) => {
      res.redirect("/auth/callback");
    }
  );

  console.log("✅ Google OAuth configured successfully");
}

export async function verifyGoogleToken(idToken: string) {
  const { OAuth2Client } = await import("google-auth-library");
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
