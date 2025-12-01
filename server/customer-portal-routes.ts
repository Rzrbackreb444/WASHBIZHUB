/**
 * CUSTOMER SELF-SERVICE PORTAL API ROUTES
 * Industry-leading customer experience for WashBizHub POS system
 * 
 * Features:
 * - Secure authentication with bcrypt + JWT
 * - Email verification and password reset via Resend
 * - Loyalty program management
 * - Order history and tracking
 * - Laundry preferences
 * - Stripe payment methods
 * - Referral program
 */

import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import {
  customerPortalAccounts,
  customerPreferences,
  loyaltyTransactions,
  posTransactions,
  posItems,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Stripe from "stripe";
import { getResendClient } from "./resend-client";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20" as any,
});

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const registerSchema = z.object({
  laundromatId: z.string().min(1, "Laundromat ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  laundromatId: z.string().min(1, "Laundromat ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  laundromatId: z.string().min(1, "Laundromat ID is required"),
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  smsNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

const updatePreferencesSchema = z.object({
  detergentType: z.enum(["standard", "hypoallergenic", "scent_free", "eco_friendly"]).optional(),
  detergentBrand: z.string().optional(),
  fabricSoftener: z.boolean().optional(),
  fabricSoftenerType: z.string().optional(),
  waterTemperature: z.enum(["cold", "warm", "hot"]).optional(),
  dryerHeat: z.enum(["low", "medium", "high", "air_dry"]).optional(),
  foldingStyle: z.enum(["standard", "military", "hung", "rolled"]).optional(),
  hangDelicates: z.boolean().optional(),
  separateColors: z.boolean().optional(),
  allergies: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  starchShirts: z.boolean().optional(),
  starchLevel: z.enum(["light", "medium", "heavy"]).optional(),
  packagingPreference: z.enum(["folded_in_bag", "on_hangers", "box"]).optional(),
});

const redeemPointsSchema = z.object({
  points: z.number().min(1, "Must redeem at least 1 point"),
  rewardType: z.enum(["discount", "free_service", "merchandise"]),
  rewardDescription: z.string().optional(),
});

const applyReferralSchema = z.object({
  referralCode: z.string().min(1, "Referral code is required"),
});

// ============================================================================
// TYPES
// ============================================================================

interface JwtPayload {
  customerId: string;
  email: string;
  laundromatId: string;
}

interface AuthenticatedRequest extends Request {
  customer?: {
    id: string;
    email: string;
    laundromatId: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateReferralCode(): string {
  return `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function calculateLoyaltyTier(lifetimePoints: number): string {
  if (lifetimePoints >= 10000) return "platinum";
  if (lifetimePoints >= 5000) return "gold";
  if (lifetimePoints >= 1000) return "silver";
  return "bronze";
}

function getPointsForTier(tier: string): { earnRate: number; redeemRate: number } {
  const rates: Record<string, { earnRate: number; redeemRate: number }> = {
    bronze: { earnRate: 1, redeemRate: 100 },
    silver: { earnRate: 1.25, redeemRate: 90 },
    gold: { earnRate: 1.5, redeemRate: 80 },
    platinum: { earnRate: 2, redeemRate: 70 },
  };
  return rates[tier] || rates.bronze;
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

async function authenticateCustomer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.customer_token;
    
    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const [customer] = await db
      .select()
      .from(customerPortalAccounts)
      .where(eq(customerPortalAccounts.id, decoded.customerId));
    
    if (!customer || customer.status !== "active") {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    
    req.customer = {
      id: customer.id,
      email: customer.email,
      laundromatId: customer.laundromatId,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Session expired" });
      return;
    }
    res.status(401).json({ error: "Invalid authentication" });
  }
}

// ============================================================================
// EMAIL HELPERS
// ============================================================================

async function sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
  try {
    const { client, fromEmail } = await getResendClient();
    const verifyUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://washbizhub.com'}/api/customer/verify-email/${token}`;
    
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verify Your Email - WashBizHub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a5f;">Welcome to WashBizHub, ${firstName}!</h1>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
          <p style="color: #666;">This link expires in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}

async function sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
  try {
    const { client, fromEmail } = await getResendClient();
    const resetUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://washbizhub.com'}/reset-password/${token}`;
    
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset Your Password - WashBizHub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a5f;">Password Reset Request</h1>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this reset, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to WashBizHub!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a5f;">Welcome aboard, ${firstName}!</h1>
          <p>Your email has been verified and your account is now active.</p>
          <h2 style="color: #b8860b;">What you can do now:</h2>
          <ul>
            <li>View your order history</li>
            <li>Set your laundry preferences</li>
            <li>Earn and redeem loyalty points</li>
            <li>Refer friends and earn rewards</li>
            <li>Manage your payment methods</li>
          </ul>
          <p>Thank you for choosing us!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

// ============================================================================
// REGISTER CUSTOMER PORTAL ROUTES
// ============================================================================

export function registerCustomerPortalRoutes(app: Express) {
  
  // ========================================
  // AUTHENTICATION ROUTES
  // ========================================
  
  /**
   * POST /api/customer/register
   * Register a new customer account
   */
  app.post("/api/customer/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const [existingCustomer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(
          and(
            eq(customerPortalAccounts.email, data.email),
            eq(customerPortalAccounts.laundromatId, data.laundromatId)
          )
        );
      
      if (existingCustomer) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      const verificationToken = generateToken();
      const referralCode = generateReferralCode();
      
      const [customer] = await db
        .insert(customerPortalAccounts)
        .values({
          laundromatId: data.laundromatId,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          referralCode,
          status: "pending",
        })
        .returning();
      
      await sendVerificationEmail(data.email, verificationToken, data.firstName);
      
      res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        customerId: customer.id,
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  /**
   * POST /api/customer/verify-email/:token
   * Verify email address
   */
  app.post("/api/customer/verify-email/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.emailVerificationToken, token));
      
      if (!customer) {
        return res.status(400).json({ error: "Invalid verification token" });
      }
      
      if (customer.emailVerificationExpires && new Date() > customer.emailVerificationExpires) {
        return res.status(400).json({ error: "Verification token has expired" });
      }
      
      await db
        .update(customerPortalAccounts)
        .set({
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(customerPortalAccounts.id, customer.id));
      
      await sendWelcomeEmail(customer.email, customer.firstName);
      
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });
  
  /**
   * POST /api/customer/login
   * Login and receive JWT token in httpOnly cookie
   */
  app.post("/api/customer/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(
          and(
            eq(customerPortalAccounts.email, data.email),
            eq(customerPortalAccounts.laundromatId, data.laundromatId)
          )
        );
      
      if (!customer || !customer.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      if (customer.status === "pending") {
        return res.status(401).json({ error: "Please verify your email before logging in" });
      }
      
      if (customer.status === "suspended") {
        return res.status(401).json({ error: "Your account has been suspended" });
      }
      
      const isValidPassword = await bcrypt.compare(data.password, customer.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const token = jwt.sign(
        {
          customerId: customer.id,
          email: customer.email,
          laundromatId: customer.laundromatId,
        } as JwtPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      await db
        .update(customerPortalAccounts)
        .set({
          lastLoginAt: new Date(),
          loginCount: sql`${customerPortalAccounts.loginCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(customerPortalAccounts.id, customer.id));
      
      res.cookie('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.json({
        message: "Login successful",
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          loyaltyTier: customer.loyaltyTier,
          loyaltyPoints: customer.loyaltyPoints,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  /**
   * POST /api/customer/logout
   * Clear the authentication cookie
   */
  app.post("/api/customer/logout", (req: Request, res: Response) => {
    res.clearCookie('customer_token');
    res.json({ message: "Logged out successfully" });
  });
  
  /**
   * POST /api/customer/forgot-password
   * Send password reset email
   */
  app.post("/api/customer/forgot-password", async (req: Request, res: Response) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(
          and(
            eq(customerPortalAccounts.email, data.email),
            eq(customerPortalAccounts.laundromatId, data.laundromatId)
          )
        );
      
      if (customer) {
        const resetToken = generateToken();
        
        await db
          .update(customerPortalAccounts)
          .set({
            passwordResetToken: resetToken,
            passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, customer.id));
        
        await sendPasswordResetEmail(customer.email, resetToken, customer.firstName);
      }
      
      res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process request" });
    }
  });
  
  /**
   * POST /api/customer/reset-password/:token
   * Reset password using token
   */
  app.post("/api/customer/reset-password/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const data = resetPasswordSchema.parse(req.body);
      
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.passwordResetToken, token));
      
      if (!customer) {
        return res.status(400).json({ error: "Invalid reset token" });
      }
      
      if (customer.passwordResetExpires && new Date() > customer.passwordResetExpires) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
      
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      
      await db
        .update(customerPortalAccounts)
        .set({
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(customerPortalAccounts.id, customer.id));
      
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  
  // ========================================
  // PROFILE ROUTES (Authenticated)
  // ========================================
  
  /**
   * GET /api/customer/profile
   * Get current customer profile
   */
  app.get("/api/customer/profile", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [customer] = await db
        .select({
          id: customerPortalAccounts.id,
          email: customerPortalAccounts.email,
          firstName: customerPortalAccounts.firstName,
          lastName: customerPortalAccounts.lastName,
          phone: customerPortalAccounts.phone,
          profileImage: customerPortalAccounts.profileImage,
          address: customerPortalAccounts.address,
          city: customerPortalAccounts.city,
          state: customerPortalAccounts.state,
          zip: customerPortalAccounts.zip,
          deliveryInstructions: customerPortalAccounts.deliveryInstructions,
          loyaltyPoints: customerPortalAccounts.loyaltyPoints,
          loyaltyTier: customerPortalAccounts.loyaltyTier,
          lifetimePoints: customerPortalAccounts.lifetimePoints,
          lifetimeSpend: customerPortalAccounts.lifetimeSpend,
          hasSubscription: customerPortalAccounts.hasSubscription,
          smsNotifications: customerPortalAccounts.smsNotifications,
          emailNotifications: customerPortalAccounts.emailNotifications,
          marketingEmails: customerPortalAccounts.marketingEmails,
          referralCode: customerPortalAccounts.referralCode,
          referralCount: customerPortalAccounts.referralCount,
          createdAt: customerPortalAccounts.createdAt,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json({ profile: customer });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  
  /**
   * PATCH /api/customer/profile
   * Update customer profile
   */
  app.patch("/api/customer/profile", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      
      const [customer] = await db
        .update(customerPortalAccounts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(customerPortalAccounts.id, req.customer!.id))
        .returning();
      
      res.json({
        message: "Profile updated successfully",
        profile: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zip: customer.zip,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  
  /**
   * GET /api/customer/preferences
   * Get laundry preferences
   */
  app.get("/api/customer/preferences", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [preferences] = await db
        .select()
        .from(customerPreferences)
        .where(eq(customerPreferences.customerPortalId, req.customer!.id));
      
      if (!preferences) {
        return res.json({
          preferences: {
            detergentType: "standard",
            fabricSoftener: true,
            waterTemperature: "warm",
            dryerHeat: "medium",
            foldingStyle: "standard",
            hangDelicates: true,
            separateColors: true,
            starchShirts: false,
            starchLevel: "light",
            packagingPreference: "folded_in_bag",
          },
        });
      }
      
      res.json({ preferences });
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });
  
  /**
   * PUT /api/customer/preferences
   * Update laundry preferences
   */
  app.put("/api/customer/preferences", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = updatePreferencesSchema.parse(req.body);
      
      const [existing] = await db
        .select()
        .from(customerPreferences)
        .where(eq(customerPreferences.customerPortalId, req.customer!.id));
      
      let preferences;
      
      if (existing) {
        [preferences] = await db
          .update(customerPreferences)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(customerPreferences.customerPortalId, req.customer!.id))
          .returning();
      } else {
        [preferences] = await db
          .insert(customerPreferences)
          .values({
            customerPortalId: req.customer!.id,
            ...data,
          })
          .returning();
      }
      
      res.json({ message: "Preferences updated successfully", preferences });
    } catch (error) {
      console.error("Update preferences error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });
  
  // ========================================
  // ORDERS ROUTES (Authenticated)
  // ========================================
  
  /**
   * GET /api/customer/orders
   * Get order history with pagination
   */
  app.get("/api/customer/orders", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, startDate, endDate, limit = "20", offset = "0" } = req.query;
      
      const conditions: any[] = [
        eq(posTransactions.laundromatId, req.customer!.laundromatId),
        eq(posTransactions.customerEmail, req.customer!.email),
      ];
      
      if (status) {
        conditions.push(eq(posTransactions.status, status as string));
      }
      if (startDate) {
        conditions.push(gte(posTransactions.createdAt, new Date(startDate as string)));
      }
      if (endDate) {
        conditions.push(lte(posTransactions.createdAt, new Date(endDate as string)));
      }
      
      const orders = await db
        .select({
          id: posTransactions.id,
          transactionNumber: posTransactions.transactionNumber,
          orderType: posTransactions.orderType,
          status: posTransactions.status,
          paymentStatus: posTransactions.paymentStatus,
          subtotal: posTransactions.subtotal,
          tax: posTransactions.tax,
          total: posTransactions.total,
          totalWeight: posTransactions.totalWeight,
          pickupDate: posTransactions.pickupDate,
          deliveryDate: posTransactions.deliveryDate,
          createdAt: posTransactions.createdAt,
        })
        .from(posTransactions)
        .where(and(...conditions))
        .orderBy(desc(posTransactions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ orders, count: orders.length });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  /**
   * GET /api/customer/orders/:id
   * Get single order details
   */
  app.get("/api/customer/orders/:id", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const [order] = await db
        .select()
        .from(posTransactions)
        .where(
          and(
            eq(posTransactions.id, id),
            eq(posTransactions.laundromatId, req.customer!.laundromatId),
            eq(posTransactions.customerEmail, req.customer!.email)
          )
        );
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await db
        .select()
        .from(posItems)
        .where(eq(posItems.transactionId, id));
      
      res.json({ order, items });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  
  // ========================================
  // LOYALTY ROUTES (Authenticated)
  // ========================================
  
  /**
   * GET /api/customer/loyalty
   * Get loyalty points, tier, and program info
   */
  app.get("/api/customer/loyalty", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [customer] = await db
        .select({
          loyaltyPoints: customerPortalAccounts.loyaltyPoints,
          loyaltyTier: customerPortalAccounts.loyaltyTier,
          lifetimePoints: customerPortalAccounts.lifetimePoints,
          lifetimeSpend: customerPortalAccounts.lifetimeSpend,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const tierInfo = getPointsForTier(customer.loyaltyTier || "bronze");
      const nextTierPoints = {
        bronze: 1000,
        silver: 5000,
        gold: 10000,
        platinum: null,
      }[customer.loyaltyTier || "bronze"];
      
      res.json({
        loyalty: {
          ...customer,
          earnRate: tierInfo.earnRate,
          redeemRate: tierInfo.redeemRate,
          nextTierPoints,
          pointsToNextTier: nextTierPoints ? Math.max(0, nextTierPoints - (customer.lifetimePoints || 0)) : 0,
        },
      });
    } catch (error) {
      console.error("Get loyalty error:", error);
      res.status(500).json({ error: "Failed to fetch loyalty info" });
    }
  });
  
  /**
   * GET /api/customer/loyalty/transactions
   * Get points transaction history
   */
  app.get("/api/customer/loyalty/transactions", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, limit = "50", offset = "0" } = req.query;
      
      const conditions: any[] = [
        eq(loyaltyTransactions.customerPortalId, req.customer!.id),
      ];
      
      if (type) {
        conditions.push(eq(loyaltyTransactions.transactionType, type as string));
      }
      
      const transactions = await db
        .select()
        .from(loyaltyTransactions)
        .where(and(...conditions))
        .orderBy(desc(loyaltyTransactions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json({ transactions, count: transactions.length });
    } catch (error) {
      console.error("Get loyalty transactions error:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  
  /**
   * POST /api/customer/loyalty/redeem
   * Redeem loyalty points
   */
  app.post("/api/customer/loyalty/redeem", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = redeemPointsSchema.parse(req.body);
      
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      if ((customer.loyaltyPoints || 0) < data.points) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      const tierInfo = getPointsForTier(customer.loyaltyTier || "bronze");
      const rewardValue = (data.points / tierInfo.redeemRate).toFixed(2);
      
      const newBalance = (customer.loyaltyPoints || 0) - data.points;
      
      await db.transaction(async (tx) => {
        await tx
          .update(customerPortalAccounts)
          .set({
            loyaltyPoints: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, req.customer!.id));
        
        await tx
          .insert(loyaltyTransactions)
          .values({
            customerPortalId: req.customer!.id,
            laundromatId: req.customer!.laundromatId,
            transactionType: "redeemed",
            points: -data.points,
            balanceAfter: newBalance,
            referenceType: data.rewardType,
            description: data.rewardDescription || `Redeemed for $${rewardValue} ${data.rewardType}`,
          });
      });
      
      res.json({
        message: "Points redeemed successfully",
        redeemed: data.points,
        rewardValue: `$${rewardValue}`,
        newBalance,
      });
    } catch (error) {
      console.error("Redeem points error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to redeem points" });
    }
  });
  
  // ========================================
  // REFERRAL ROUTES (Authenticated)
  // ========================================
  
  /**
   * GET /api/customer/referral
   * Get referral code and stats
   */
  app.get("/api/customer/referral", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [customer] = await db
        .select({
          referralCode: customerPortalAccounts.referralCode,
          referralCount: customerPortalAccounts.referralCount,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const referrals = await db
        .select({
          id: customerPortalAccounts.id,
          firstName: customerPortalAccounts.firstName,
          createdAt: customerPortalAccounts.createdAt,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.referredBy, customer.referralCode || ""));
      
      res.json({
        referral: {
          code: customer.referralCode,
          totalReferrals: customer.referralCount || 0,
          referrals: referrals.map(r => ({
            id: r.id,
            name: r.firstName,
            joinedAt: r.createdAt,
          })),
        },
      });
    } catch (error) {
      console.error("Get referral error:", error);
      res.status(500).json({ error: "Failed to fetch referral info" });
    }
  });
  
  /**
   * POST /api/customer/referral/apply
   * Apply a referral code
   */
  app.post("/api/customer/referral/apply", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = applyReferralSchema.parse(req.body);
      
      const [currentCustomer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (currentCustomer?.referredBy) {
        return res.status(400).json({ error: "You have already applied a referral code" });
      }
      
      if (currentCustomer?.referralCode === data.referralCode) {
        return res.status(400).json({ error: "You cannot use your own referral code" });
      }
      
      const [referrer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(
          and(
            eq(customerPortalAccounts.referralCode, data.referralCode),
            eq(customerPortalAccounts.laundromatId, req.customer!.laundromatId)
          )
        );
      
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      const REFERRAL_BONUS_POINTS = 500;
      
      await db.transaction(async (tx) => {
        await tx
          .update(customerPortalAccounts)
          .set({
            referredBy: data.referralCode,
            loyaltyPoints: sql`${customerPortalAccounts.loyaltyPoints} + ${REFERRAL_BONUS_POINTS}`,
            lifetimePoints: sql`${customerPortalAccounts.lifetimePoints} + ${REFERRAL_BONUS_POINTS}`,
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, req.customer!.id));
        
        await tx
          .update(customerPortalAccounts)
          .set({
            referralCount: sql`${customerPortalAccounts.referralCount} + 1`,
            loyaltyPoints: sql`${customerPortalAccounts.loyaltyPoints} + ${REFERRAL_BONUS_POINTS}`,
            lifetimePoints: sql`${customerPortalAccounts.lifetimePoints} + ${REFERRAL_BONUS_POINTS}`,
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, referrer.id));
        
        await tx.insert(loyaltyTransactions).values([
          {
            customerPortalId: req.customer!.id,
            laundromatId: req.customer!.laundromatId,
            transactionType: "bonus",
            points: REFERRAL_BONUS_POINTS,
            balanceAfter: (currentCustomer?.loyaltyPoints || 0) + REFERRAL_BONUS_POINTS,
            referenceType: "referral",
            description: `Referral bonus for using code ${data.referralCode}`,
          },
          {
            customerPortalId: referrer.id,
            laundromatId: referrer.laundromatId,
            transactionType: "bonus",
            points: REFERRAL_BONUS_POINTS,
            balanceAfter: (referrer.loyaltyPoints || 0) + REFERRAL_BONUS_POINTS,
            referenceType: "referral",
            description: `Referral bonus for new customer signup`,
          },
        ]);
      });
      
      res.json({
        message: "Referral code applied successfully",
        bonusPoints: REFERRAL_BONUS_POINTS,
      });
    } catch (error) {
      console.error("Apply referral error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to apply referral code" });
    }
  });
  
  // ========================================
  // PAYMENT METHODS ROUTES (Authenticated)
  // ========================================
  
  /**
   * GET /api/customer/payment-methods
   * List saved payment methods
   */
  app.get("/api/customer/payment-methods", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [customer] = await db
        .select({
          stripeCustomerId: customerPortalAccounts.stripeCustomerId,
          defaultPaymentMethodId: customerPortalAccounts.defaultPaymentMethodId,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer?.stripeCustomerId) {
        return res.json({ paymentMethods: [], defaultPaymentMethodId: null });
      }
      
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.stripeCustomerId,
        type: 'card',
      });
      
      const methods = paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === customer.defaultPaymentMethodId,
      }));
      
      res.json({
        paymentMethods: methods,
        defaultPaymentMethodId: customer.defaultPaymentMethodId,
      });
    } catch (error) {
      console.error("Get payment methods error:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });
  
  /**
   * POST /api/customer/payment-methods/setup-intent
   * Create Stripe SetupIntent for adding a new payment method
   */
  app.post("/api/customer/payment-methods/setup-intent", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [customer] = await db
        .select()
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      let stripeCustomerId = customer.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone || undefined,
          metadata: {
            customerPortalId: customer.id,
            laundromatId: customer.laundromatId,
          },
        });
        
        stripeCustomerId = stripeCustomer.id;
        
        await db
          .update(customerPortalAccounts)
          .set({
            stripeCustomerId,
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, customer.id));
      }
      
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        metadata: {
          customerPortalId: customer.id,
        },
      });
      
      res.json({
        clientSecret: setupIntent.client_secret,
      });
    } catch (error) {
      console.error("Create setup intent error:", error);
      res.status(500).json({ error: "Failed to create setup intent" });
    }
  });
  
  /**
   * DELETE /api/customer/payment-methods/:id
   * Remove a payment method
   */
  app.delete("/api/customer/payment-methods/:id", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const [customer] = await db
        .select({
          stripeCustomerId: customerPortalAccounts.stripeCustomerId,
          defaultPaymentMethodId: customerPortalAccounts.defaultPaymentMethodId,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer?.stripeCustomerId) {
        return res.status(400).json({ error: "No payment methods on file" });
      }
      
      const paymentMethod = await stripe.paymentMethods.retrieve(id);
      
      if (paymentMethod.customer !== customer.stripeCustomerId) {
        return res.status(403).json({ error: "Payment method not found" });
      }
      
      await stripe.paymentMethods.detach(id);
      
      if (customer.defaultPaymentMethodId === id) {
        await db
          .update(customerPortalAccounts)
          .set({
            defaultPaymentMethodId: null,
            updatedAt: new Date(),
          })
          .where(eq(customerPortalAccounts.id, req.customer!.id));
      }
      
      res.json({ message: "Payment method removed successfully" });
    } catch (error) {
      console.error("Delete payment method error:", error);
      res.status(500).json({ error: "Failed to remove payment method" });
    }
  });
  
  /**
   * PUT /api/customer/payment-methods/:id/default
   * Set a payment method as default
   */
  app.put("/api/customer/payment-methods/:id/default", authenticateCustomer, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const [customer] = await db
        .select({
          stripeCustomerId: customerPortalAccounts.stripeCustomerId,
        })
        .from(customerPortalAccounts)
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      if (!customer?.stripeCustomerId) {
        return res.status(400).json({ error: "No payment methods on file" });
      }
      
      const paymentMethod = await stripe.paymentMethods.retrieve(id);
      
      if (paymentMethod.customer !== customer.stripeCustomerId) {
        return res.status(403).json({ error: "Payment method not found" });
      }
      
      await db
        .update(customerPortalAccounts)
        .set({
          defaultPaymentMethodId: id,
          updatedAt: new Date(),
        })
        .where(eq(customerPortalAccounts.id, req.customer!.id));
      
      res.json({ message: "Default payment method updated" });
    } catch (error) {
      console.error("Set default payment method error:", error);
      res.status(500).json({ error: "Failed to set default payment method" });
    }
  });
  
  console.log("✅ Customer Portal routes registered");
}
