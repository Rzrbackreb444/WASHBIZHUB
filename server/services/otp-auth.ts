/**
 * OTP Authentication Service
 * Simple email-based passwordless authentication
 */

import crypto from 'crypto';
import { db } from '../db';
import { otpTokens, users } from '@shared/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

interface OtpResult {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
}

class OtpAuthService {
  
  /**
   * Generate a 6-digit OTP code
   */
  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash an OTP code for secure storage
   */
  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Request an OTP code - generates and stores the code, returns it for sending
   */
  async requestOtp(email: string): Promise<{ success: boolean; code?: string; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, message: 'Invalid email address' };
    }

    // Invalidate any existing unused OTP tokens for this email
    await db.update(otpTokens)
      .set({ usedAt: new Date() })
      .where(and(
        eq(otpTokens.email, normalizedEmail),
        isNull(otpTokens.usedAt)
      ));

    // Generate new OTP
    const code = this.generateCode();
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Check if user exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Store the OTP token
    await db.insert(otpTokens).values({
      email: normalizedEmail,
      userId: existingUser?.id || null,
      codeHash,
      purpose: 'login',
      channel: 'email',
      expiresAt,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    });

    console.log(`📧 OTP requested for ${normalizedEmail} (expires in ${OTP_EXPIRY_MINUTES} min)`);
    
    return { success: true, code, message: 'OTP generated successfully' };
  }

  /**
   * Verify an OTP code and authenticate the user
   */
  async verifyOtp(email: string, code: string): Promise<OtpResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const codeHash = this.hashCode(code);

    // Find valid, unused OTP token
    const [token] = await db.select()
      .from(otpTokens)
      .where(and(
        eq(otpTokens.email, normalizedEmail),
        isNull(otpTokens.usedAt),
        gt(otpTokens.expiresAt, new Date())
      ))
      .orderBy(otpTokens.createdAt)
      .limit(1);

    if (!token) {
      return { success: false, message: 'No valid OTP found. Please request a new code.' };
    }

    // Check attempts
    if (token.attempts >= token.maxAttempts) {
      await db.update(otpTokens)
        .set({ usedAt: new Date() })
        .where(eq(otpTokens.id, token.id));
      return { success: false, message: 'Too many attempts. Please request a new code.' };
    }

    // Increment attempts
    await db.update(otpTokens)
      .set({ attempts: token.attempts + 1 })
      .where(eq(otpTokens.id, token.id));

    // Verify code
    if (token.codeHash !== codeHash) {
      const remaining = token.maxAttempts - token.attempts - 1;
      return { 
        success: false, 
        message: `Invalid code. ${remaining} attempts remaining.` 
      };
    }

    // Mark token as used
    await db.update(otpTokens)
      .set({ usedAt: new Date() })
      .where(eq(otpTokens.id, token.id));

    // Get or create user
    let user = await this.getOrCreateUser(normalizedEmail);

    console.log(`✅ OTP verified for ${normalizedEmail}, user ID: ${user.id}`);

    return {
      success: true,
      message: 'Authentication successful',
      userId: user.id,
      email: user.email!,
    };
  }

  /**
   * Get existing user or create new one
   */
  private async getOrCreateUser(email: string) {
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const [newUser] = await db.insert(users)
      .values({
        email,
        emailVerified: true,
        subscriptionTier: 'free',
      })
      .returning();

    console.log(`👤 New user created via OTP: ${email}`);
    return newUser;
  }

  /**
   * Clean up expired OTP tokens (call periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await db.delete(otpTokens)
      .where(gt(new Date(), otpTokens.expiresAt));
    return 0; // Drizzle doesn't return count easily
  }
}

export const otpAuth = new OtpAuthService();
