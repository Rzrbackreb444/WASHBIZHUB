/**
 * OTP Authentication Routes
 * Simple email-based passwordless login
 */

import { Router, Request, Response } from 'express';
import { otpAuth } from './services/otp-auth';
import { emailSender } from './services/email-sender';
import { z } from 'zod';

const router = Router();

// Rate limiting map (simple in-memory, replace with Redis for production)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 requests per minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

/**
 * POST /api/auth/otp/request
 * Request an OTP code to be sent via email
 */
router.post('/request', async (req: Request, res: Response) => {
  try {
    const body = requestOtpSchema.parse(req.body);
    const email = body.email.toLowerCase().trim();
    
    // Rate limit by email
    if (!checkRateLimit(`otp:${email}`)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a minute before trying again.',
      });
    }

    // Generate OTP
    const result = await otpAuth.requestOtp(email);
    
    if (!result.success || !result.code) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Send email
    const emailResult = await emailSender.sendOtpEmail(email, result.code);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      // Still return success - don't reveal if email exists
    }

    res.json({
      success: true,
      message: 'If an account exists, a login code has been sent to your email.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
});

/**
 * POST /api/auth/otp/verify
 * Verify an OTP code and log the user in
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const email = body.email.toLowerCase().trim();
    
    // Rate limit by email
    if (!checkRateLimit(`verify:${email}`)) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please wait a minute.',
      });
    }

    // Verify OTP
    const result = await otpAuth.verifyOtp(email, body.code);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // Set up session
    const session = (req as any).session;
    if (session) {
      session.userId = result.userId;
      session.email = result.email;
      session.authProvider = 'otp';
      session.otpAuth = true;
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.userId,
        email: result.email,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
});

/**
 * GET /api/auth/otp/status
 * Check if OTP auth is configured
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    configured: true,
    provider: 'email-otp',
    emailConfigured: emailSender.isConfigured(),
  });
});

export default router;
