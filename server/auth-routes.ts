import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes, randomInt } from "crypto";
import { Resend } from "resend";
import { sendFreeWelcomeEmail } from "./subscription-emails";

// Email sending helper with fallback
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY not configured");
    throw new Error("Email service not configured");
  }
  
  const resend = new Resend(apiKey);
  const fromEmail = "WashBizHub <info@washbizhub.com>";
  
  console.log(`📧 Sending email to: ${to}, subject: ${subject}`);
  
  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });
  
  if (result.error) {
    console.error("❌ Resend error:", result.error);
    throw new Error(result.error.message);
  }
  
  console.log(`✅ Email sent successfully to ${to}, id: ${result.data?.id}`);
}

const router = Router();

// Generate a random token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Generate a 6-digit OTP code (cryptographically secure)
function generateOTPCode(): string {
  return randomInt(100000, 999999).toString();
}

// ==================== RATE LIMITING ====================
// Multi-tier rate limiting for security

// OTP/Magic link rate limiting
const otpAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const OTP_RATE_LIMIT = 5; // max OTP requests per email
const OTP_WINDOW = 15 * 60 * 1000; // 15 minutes
const OTP_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour block after too many attempts

// OTP verification attempts (brute force protection)
const verifyAttempts = new Map<string, { count: number; lastAttempt: number }>();
const VERIFY_RATE_LIMIT = 5; // max verification attempts
const VERIFY_WINDOW = 5 * 60 * 1000; // 5 minutes

// IP-based rate limiting for additional security
const ipAttempts = new Map<string, { count: number; lastAttempt: number }>();
const IP_RATE_LIMIT = 20; // max requests per IP
const IP_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkOTPRateLimit(email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const attempts = otpAttempts.get(email);
  
  if (!attempts || now - attempts.lastAttempt > OTP_WINDOW) {
    otpAttempts.set(email, { count: 1, lastAttempt: now, blocked: false });
    return { allowed: true };
  }
  
  if (attempts.blocked && now - attempts.lastAttempt < OTP_BLOCK_DURATION) {
    const minutesLeft = Math.ceil((OTP_BLOCK_DURATION - (now - attempts.lastAttempt)) / 60000);
    return { allowed: false, message: `Too many attempts. Please try again in ${minutesLeft} minutes.` };
  }
  
  if (attempts.count >= OTP_RATE_LIMIT) {
    attempts.blocked = true;
    attempts.lastAttempt = now;
    return { allowed: false, message: "Too many attempts. Please try again in 1 hour." };
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true };
}

function checkVerifyRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = verifyAttempts.get(email);
  
  if (!attempts || now - attempts.lastAttempt > VERIFY_WINDOW) {
    verifyAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempts.count >= VERIFY_RATE_LIMIT) {
    return false;
  }
  
  attempts.count++;
  return true;
}

function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
         req.socket.remoteAddress || 
         'unknown';
}

function checkIPRateLimit(req: Request): boolean {
  const ip = getClientIP(req);
  const now = Date.now();
  const attempts = ipAttempts.get(ip);
  
  if (!attempts || now - attempts.lastAttempt > IP_WINDOW) {
    ipAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempts.count >= IP_RATE_LIMIT) {
    return false;
  }
  
  attempts.count++;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpAttempts.entries()) {
    if (now - value.lastAttempt > OTP_BLOCK_DURATION) {
      otpAttempts.delete(key);
    }
  }
  for (const [key, value] of verifyAttempts.entries()) {
    if (now - value.lastAttempt > VERIFY_WINDOW) {
      verifyAttempts.delete(key);
    }
  }
  for (const [key, value] of ipAttempts.entries()) {
    if (now - value.lastAttempt > IP_WINDOW) {
      ipAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

// Legacy rate limit function (kept for backward compatibility)
const magicLinkAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAGIC_LINK_RATE_LIMIT = 3;
const MAGIC_LINK_WINDOW = 15 * 60 * 1000;

function checkRateLimit(email: string): boolean {
  const result = checkOTPRateLimit(email);
  return result.allowed;
}

// ==================== AUTH PROVIDERS ENDPOINT ====================

// GET /api/auth/providers - Available authentication methods
router.get("/providers", (req: Request, res: Response) => {
  res.json({
    primary: 'email-otp',
    providers: ['google', 'email-otp'],
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      loginUrl: '/api/auth/google/login',
      label: 'Continue with Google',
    },
    emailOtp: {
      enabled: !!process.env.RESEND_API_KEY,
      requestUrl: '/api/auth/otp/request',
      verifyUrl: '/api/auth/otp/verify',
      label: 'Continue with Email',
    },
    security: {
      rateLimiting: true,
      bruteForceProtection: true,
      secureSession: true,
    }
  });
});

// ==================== 6-DIGIT OTP AUTHENTICATION ====================

// POST /api/auth/otp/request - Request a 6-digit OTP code
router.post("/otp/request", async (req: Request, res: Response) => {
  try {
    // IP rate limiting
    if (!checkIPRateLimit(req)) {
      return res.status(429).json({ 
        error: "Too many requests from this IP. Please try again later." 
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // Rate limiting per email
    const rateLimitResult = checkOTPRateLimit(normalizedEmail);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ error: rateLimitResult.message });
    }

    // Generate 6-digit OTP
    const otpCode = generateOTPCode();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists or create new
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      // Create new user with OTP
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        emailVerificationToken: otpHash,
        emailVerificationExpires: expiresAt,
        emailVerified: false,
      }).returning();
    } else {
      // Update existing user with OTP
      await db.update(users)
        .set({
          emailVerificationToken: otpHash,
          emailVerificationExpires: expiresAt,
        })
        .where(eq(users.id, user.id));
    }

    // Send beautiful OTP email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px 30px; text-align: center;">
            
            <!-- Logo -->
            <div style="margin-bottom: 24px;">
              <h1 style="color: #C8A661; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">WashBizHub</h1>
              <p style="color: #888; margin: 8px 0 0 0; font-size: 13px;">Secure Login Verification</p>
            </div>
            
            <!-- OTP Code -->
            <div style="background: rgba(200, 166, 97, 0.1); border: 2px dashed #C8A661; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="color: #aaa; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
              <div style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', 'Courier New', monospace;">
                ${otpCode}
              </div>
              <p style="color: #888; margin: 12px 0 0 0; font-size: 13px;">
                Expires in 10 minutes
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background: rgba(34, 197, 94, 0.1); border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="color: #22c55e; margin: 0; font-size: 13px;">
                🔒 Never share this code with anyone. WashBizHub will never ask for it.
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 24px;">
            If you didn't request this code, please ignore this email.<br>
            &copy; ${new Date().getFullYear()} WashBizHub. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    await sendEmail(normalizedEmail, `${otpCode} is your WashBizHub verification code`, emailHtml);

    res.json({ 
      success: true, 
      message: "Verification code sent! Check your email.",
      // Don't expose if user existed or was created (security)
    });
  } catch (error: any) {
    console.error("OTP request error:", error);
    res.status(500).json({ error: "Failed to send verification code. Please try again." });
  }
});

// POST /api/auth/otp/verify - Verify OTP and log in
router.post("/otp/verify", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    // Brute force protection
    if (!checkVerifyRateLimit(normalizedEmail)) {
      return res.status(429).json({ 
        error: "Too many verification attempts. Please request a new code." 
      });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or code" });
    }

    // Check if OTP is expired
    if (!user.emailVerificationExpires || new Date() > new Date(user.emailVerificationExpires)) {
      return res.status(401).json({ error: "Code has expired. Please request a new one." });
    }

    // Verify OTP
    if (!user.emailVerificationToken) {
      return res.status(401).json({ error: "No pending verification. Please request a new code." });
    }

    const isValid = await bcrypt.compare(normalizedCode, user.emailVerificationToken);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    // Clear OTP and mark email as verified
    await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Clear rate limit for this email
    verifyAttempts.delete(normalizedEmail);
    otpAttempts.delete(normalizedEmail);

    // Set session
    (req as any).session.userId = user.id;

    // If new user, send welcome email
    if (!user.emailVerified) {
      try {
        await sendFreeWelcomeEmail(user.email, user.firstName || 'there');
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }
    }

    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        isAdmin: user.isAdmin,
        subscriptionTier: user.subscriptionTier,
      }
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ==================== EMAIL/PASSWORD AUTHENTICATION ====================

// POST /api/auth/signup - Create account with email/password
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    
    if (existingUser.length > 0) {
      // Check if they have a password (email/password user) or just OAuth
      if (existingUser[0].passwordHash) {
        return res.status(400).json({ error: "An account with this email already exists. Please sign in." });
      } else {
        // User exists via OAuth, add password to their account
        const passwordHash = await bcrypt.hash(password, 12);
        await db.update(users)
          .set({ 
            passwordHash,
            firstName: firstName || existingUser[0].firstName,
            lastName: lastName || existingUser[0].lastName,
          })
          .where(eq(users.id, existingUser[0].id));
        
        // Set session
        (req as any).session.userId = existingUser[0].id;
        
        return res.json({ 
          success: true, 
          message: "Password added to your account",
          emailVerified: existingUser[0].emailVerified,
          user: { 
            id: existingUser[0].id, 
            email: existingUser[0].email,
            firstName: existingUser[0].firstName,
            lastName: existingUser[0].lastName,
          }
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateToken();
    const tokenHash = await bcrypt.hash(verificationToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const [newUser] = await db.insert(users).values({
      email: normalizedEmail,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      emailVerified: false,
      emailVerificationToken: tokenHash,
      emailVerificationExpires: expiresAt,
    }).returning();

    // Set session (user can use site but with limited access until verified)
    (req as any).session.userId = newUser.id;

    // Send verification email
    try {
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : (process.env.BASE_URL || 'https://washbizhub.com');
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
            <p style="color: #666; margin-top: 5px;">The #1 Laundromat Industry Platform</p>
          </div>
          
          <h2 style="color: #333;">Welcome to WashBizHub, ${firstName || 'there'}!</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for creating an account. Please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #C8A661; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            This link expires in 24 hours. After verification, you'll have full access to:
          </p>
          <ul style="color: #555; font-size: 14px; line-height: 1.8;">
            <li>CLEANBI location analysis</li>
            <li>ROI & valuation calculators</li>
            <li>Laundromat marketplace</li>
            <li>Community forum</li>
            <li>Educational courses</li>
          </ul>
          
          <p style="color: #888; font-size: 14px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} WashBizHub. All rights reserved.
          </p>
        </div>
      `;
      
      await sendEmail(normalizedEmail, "Verify your WashBizHub email", emailHtml);
      console.log(`✅ Verification email sent to ${normalizedEmail}`);
    } catch (emailError: any) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }

    res.json({ 
      success: true, 
      message: "Account created! Please check your email to verify your account.",
      emailVerified: false,
      user: { 
        id: newUser.id, 
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login - Login with email/password
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ 
        error: "This account was created with Google. Click 'Continue with Google' below, or set a password in Settings after signing in.",
        code: "SOCIAL_LOGIN_REQUIRED",
        canSetPassword: true
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Set session
    (req as any).session.userId = user.id;

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        subscriptionTier: user.subscriptionTier,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/user - Get current user (supports multiple auth methods)
router.get("/user", async (req: Request, res: Response) => {
  try {
    // Check for user ID from multiple sources:
    // 1. Session-based auth (email/password, OTP, magic link)
    // 2. Passport-based auth (Replit OIDC, Google OAuth)
    const passportUser = (req as any).user;
    let userId = (req as any).session?.userId;
    
    // If no session userId, try passport auth (Replit OIDC)
    if (!userId && passportUser?.claims?.sub) {
      userId = passportUser.claims.sub;
    }
    
    // Also check if passport isAuthenticated (Google OAuth)
    if (!userId && typeof (req as any).isAuthenticated === 'function' && (req as any).isAuthenticated()) {
      userId = passportUser?.id || passportUser?.claims?.sub;
    }
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Return consistent user object
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      subscriptionTier: user.subscriptionTier,
      cleanbiTier: user.cleanbiTier,
      role: user.role,
      hasPassword: !!user.passwordHash,
      // Add claims for backwards compatibility
      claims: { sub: user.id, email: user.email },
      sub: user.id,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// POST /api/auth/logout - Logout and clear session
router.post("/logout", (req: Request, res: Response) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// ==================== MAGIC LINK AUTHENTICATION ====================

// POST /api/auth/magic-link - Send magic link email
router.post("/magic-link", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return res.status(429).json({ 
        error: "Too many requests. Please wait 15 minutes before trying again." 
      });
    }

    // Generate secure token
    const token = generateToken();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Check if user exists
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      // Create new user with magic link token
      [user] = await db.insert(users).values({
        email: normalizedEmail,
        emailVerificationToken: tokenHash,
        emailVerificationExpires: expiresAt,
        emailVerified: false,
      }).returning();
    } else {
      // Update existing user with magic link token
      await db.update(users)
        .set({
          emailVerificationToken: tokenHash,
          emailVerificationExpires: expiresAt,
        })
        .where(eq(users.id, user.id));
    }

    // Build magic link URL
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : (process.env.BASE_URL || 'https://washbizhub.com');
    const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email via Resend
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
            <p style="color: #666; margin-top: 5px;">The #1 Laundromat Industry Platform</p>
          </div>
          
          <h2 style="color: #333;">Sign in to your account</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Click the button below to securely sign in to WashBizHub. This link expires in 15 minutes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #C8A661; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Sign In to WashBizHub
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} WashBizHub. All rights reserved.
          </p>
        </div>
      `;
      
      await sendEmail(normalizedEmail, "Sign in to WashBizHub", emailHtml);

      res.json({ 
        success: true, 
        message: "Magic link sent! Check your email to sign in." 
      });
    } catch (emailError: any) {
      console.error("Failed to send magic link email:", emailError);
      res.status(500).json({ error: emailError.message || "Failed to send email. Please try again." });
    }
  } catch (error: any) {
    console.error("Magic link request error:", error);
    res.status(500).json({ error: "Failed to send magic link. Please try again." });
  }
});

// ==================== FORGOT PASSWORD ====================

// Request password reset
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return res.status(429).json({ 
        error: "Too many requests. Please wait 15 minutes before trying again." 
      });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    // Generate reset token
    const token = generateToken();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await db.update(users)
      .set({
        passwordResetToken: tokenHash,
        passwordResetExpires: expiresAt,
      })
      .where(eq(users.id, user.id));

    // Build reset URL
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : (process.env.BASE_URL || 'https://washbizhub.com');
    const resetLink = `${baseUrl}/forgot-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
            <p style="color: #666; margin-top: 5px;">The #1 Laundromat Industry Platform</p>
          </div>
          
          <h2 style="color: #333;">Reset Your Password</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You requested to reset your password. Click the button below to create a new password. This link expires in 1 hour.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #C8A661; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} WashBizHub. All rights reserved.
          </p>
        </div>
      `;
      
      await sendEmail(normalizedEmail, "Reset Your WashBizHub Password", emailHtml);

      res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    } catch (emailError: any) {
      console.error("Failed to send password reset email:", emailError);
      res.status(500).json({ error: emailError.message || "Failed to send email. Please try again." });
    }
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request. Please try again." });
  }
});

// Password complexity validation
function validatePasswordComplexity(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }
  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  return { valid: true };
}

// Reset password with token
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Enhanced password validation
    const passwordCheck = validatePasswordComplexity(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid reset link" });
    }

    // Check if token exists and hasn't expired
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.passwordResetToken);
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid reset link" });
    }

    // Hash new password and clear reset token
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Clear all tokens (magic link and password reset) to invalidate prior auth attempts
    await db.update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true, // Also verify email since they clicked the link
      })
      .where(eq(users.id, user.id));

    // Note: Session invalidation is handled client-side by redirecting to login
    // For enhanced security, consider adding session token invalidation in production

    res.json({ 
      success: true, 
      message: "Password reset successful. You can now sign in with your new password."
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
});

// POST /api/auth/set-password - Set password for social login users (requires authentication)
// This allows Google users to add email/password as an additional login method
router.post("/set-password", async (req: Request, res: Response) => {
  try {
    // Get authenticated user
    const passportUser = (req as any).user;
    let userId = (req as any).session?.userId;
    
    if (!userId && passportUser?.claims?.sub) {
      userId = passportUser.claims.sub;
    }
    if (!userId && passportUser?.id) {
      userId = passportUser.id;
    }
    
    if (!userId) {
      return res.status(401).json({ error: "Please sign in first to set a password" });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Password and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate password complexity
    const passwordCheck = validatePasswordComplexity(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash and save password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));

    res.json({ 
      success: true, 
      message: "Password set successfully! You can now sign in with email and password."
    });
  } catch (error: any) {
    console.error("Set password error:", error);
    res.status(500).json({ error: "Failed to set password. Please try again." });
  }
});

// GET /api/auth/verify-magic-link?token=xxx&email=xxx - Verify magic link token
router.get("/verify-magic-link", async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email || typeof token !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    // Check if token exists and hasn't expired
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({ error: "Magic link has expired. Please request a new one." });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Magic link has expired. Please request a new one." });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.emailVerificationToken);
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    // Clear the token (single use) and mark email as verified
    await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Set session
    (req as any).session.userId = user.id;

    res.json({ 
      success: true, 
      message: "Successfully signed in!",
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error: any) {
    console.error("Magic link verify error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/verify-magic-link - Verify magic link token (legacy POST support)
router.post("/verify-magic-link", async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    // Check if token exists and hasn't expired
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({ error: "Magic link has expired. Please request a new one." });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Magic link has expired. Please request a new one." });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.emailVerificationToken);
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid magic link" });
    }

    // Clear the token (single use) and mark email as verified
    await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Set session
    (req as any).session.userId = user.id;

    res.json({ 
      success: true, 
      message: "Successfully signed in!",
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error: any) {
    console.error("Magic link verify error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ==================== EMAIL VERIFICATION ====================

// GET /api/auth/verify-email?token=xxx&email=xxx - Verify email address
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email || typeof token !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    if (user.emailVerified) {
      return res.json({ 
        success: true, 
        message: "Email already verified! You can sign in.",
        alreadyVerified: true
      });
    }

    // Check if token exists and hasn't expired
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.emailVerificationToken);
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    // Mark email as verified and clear token
    await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Set session if not already logged in
    (req as any).session.userId = user.id;

    // Send welcome email for FREE tier users (async, don't block response)
    sendFreeWelcomeEmail({
      email: user.email,
      firstName: user.firstName || undefined,
    }).catch(err => console.error("Failed to send welcome email:", err));

    res.json({ 
      success: true, 
      message: "Email verified successfully! Welcome to WashBizHub.",
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: true,
      }
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/verify-email - Verify email address (legacy POST support)
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    if (user.emailVerified) {
      return res.json({ 
        success: true, 
        message: "Email already verified! You can sign in.",
        alreadyVerified: true
      });
    }

    // Check if token exists and hasn't expired
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.emailVerificationToken);
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    // Mark email as verified and clear token
    await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Set session if not already logged in
    (req as any).session.userId = user.id;

    // Send welcome email for FREE tier users (async, don't block response)
    sendFreeWelcomeEmail({
      email: user.email,
      firstName: user.firstName || undefined,
    }).catch(err => console.error("Failed to send welcome email:", err));

    res.json({ 
      success: true, 
      message: "Email verified successfully! Welcome to WashBizHub.",
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: true,
      }
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/send-verification - Send/resend verification email
router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const { email } = req.body;
    
    let userEmail = email;
    
    // If user is logged in, get their email
    if (userId) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user) {
        if (user.emailVerified) {
          return res.json({ success: true, message: "Email already verified!" });
        }
        userEmail = user.email;
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();

    // Rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return res.status(429).json({ 
        error: "Too many requests. Please wait 15 minutes before trying again." 
      });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: "If this email exists, a verification link will be sent." });
    }

    if (user.emailVerified) {
      return res.json({ success: true, message: "Email already verified!" });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const tokenHash = await bcrypt.hash(verificationToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.update(users)
      .set({
        emailVerificationToken: tokenHash,
        emailVerificationExpires: expiresAt,
      })
      .where(eq(users.id, user.id));

    // Send verification email
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : (process.env.BASE_URL || 'https://washbizhub.com');
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
          <p style="color: #666; margin-top: 5px;">The #1 Laundromat Industry Platform</p>
        </div>
        
        <h2 style="color: #333;">Verify Your Email Address</h2>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Click the button below to verify your email address and unlock full access to WashBizHub.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #C8A661; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #888; font-size: 14px;">
          This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} WashBizHub. All rights reserved.
        </p>
      </div>
    `;
    
    await sendEmail(normalizedEmail, "Verify your WashBizHub email", emailHtml);

    res.json({ 
      success: true, 
      message: "Verification email sent! Please check your inbox." 
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to send verification email. Please try again." });
  }
});

// ==================== GOOGLE ONE-TAP / ID TOKEN AUTH ====================

// POST /api/auth/google/token - Verify Google ID token from frontend (One-Tap, @react-oauth/google)
router.post("/google/token", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: "Google credential token required" });
    }
    
    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }
    
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: profileImageUrl } = payload;
    const normalizedEmail = email.toLowerCase();
    
    // Check if user exists
    let existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    
    let userId: string;
    let isNewUser = false;
    
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      
      // Update googleId if not set
      if (!existingUser[0].googleId) {
        await db.update(users)
          .set({ 
            googleId,
            profileImageUrl: existingUser[0].profileImageUrl || profileImageUrl,
            emailVerified: true,
          })
          .where(eq(users.id, userId));
      }
    } else {
      // Create new user
      userId = googleId!;
      isNewUser = true;
      
      await db.insert(users).values({
        id: userId,
        email: normalizedEmail,
        firstName: firstName || "",
        lastName: lastName || "",
        profileImageUrl,
        googleId,
        emailVerified: true,
        subscriptionTier: "free",
      });
      
      // Send welcome email for new users
      try {
        await sendFreeWelcomeEmail(normalizedEmail, firstName || "");
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }
    }
    
    // Set session
    const sessionUser = {
      id: userId,
      sub: userId,
      email: normalizedEmail,
      claims: {
        sub: userId,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
    
    (req as any).login(sessionUser, (err: any) => {
      if (err) {
        console.error("Session login error:", err);
        return res.status(500).json({ error: "Failed to create session" });
      }
      
      res.json({
        success: true,
        user: {
          id: userId,
          email: normalizedEmail,
          firstName,
          lastName,
          profileImageUrl,
        },
        isNewUser,
      });
    });
  } catch (error: any) {
    console.error("Google token verification error:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;
