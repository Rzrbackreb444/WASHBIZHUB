import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
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

// Rate limiting for magic links (in-memory, simple)
const magicLinkAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAGIC_LINK_RATE_LIMIT = 3; // max attempts per email
const MAGIC_LINK_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = magicLinkAttempts.get(email);
  
  if (!attempts || now - attempts.lastAttempt > MAGIC_LINK_WINDOW) {
    magicLinkAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempts.count >= MAGIC_LINK_RATE_LIMIT) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

// Register with email/password
router.post("/register", async (req: Request, res: Response) => {
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

// Login with email/password
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
        error: "This account uses social login. Please sign in with Replit or set a password." 
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

// Get current user (for email/password sessions)
router.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

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
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Logout
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

// Request magic link - sends email with login link
router.post("/magic-link/request", async (req: Request, res: Response) => {
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

// Verify magic link - validates token and logs user in
router.post("/magic-link/verify", async (req: Request, res: Response) => {
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

// Verify email address (from registration link)
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

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response) => {
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

export default router;
