import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { referrals, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendReferralInviteEmail, sendReferralSuccessEmail } from '../subscription-emails';
import { randomBytes } from 'crypto';

const router = Router();

function generateReferralCode(): string {
  return 'WBH-' + randomBytes(4).toString('hex').toUpperCase();
}

const inviteSchema = z.object({
  email: z.string().email(),
});

router.get('/my-code', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to access referrals' });
    }
    
    const [user] = await db.select({
      referralCode: users.referralCode,
      firstName: users.firstName,
      email: users.email,
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.referralCode) {
      const newCode = generateReferralCode();
      await db.update(users)
        .set({ referralCode: newCode })
        .where(eq(users.id, userId));
      
      return res.json({
        referralCode: newCode,
        referralLink: `https://washbizhub.com/signup?ref=${newCode}`,
      });
    }
    
    res.json({
      referralCode: user.referralCode,
      referralLink: `https://washbizhub.com/signup?ref=${user.referralCode}`,
    });
  } catch (error: any) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

router.get('/my-referrals', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to access referrals' });
    }
    
    const userReferrals = await db
      .select({
        id: referrals.id,
        referredEmail: referrals.referredEmail,
        status: referrals.status,
        referrerReward: referrals.referrerReward,
        invitedAt: referrals.invitedAt,
        signedUpAt: referrals.signedUpAt,
        convertedAt: referrals.convertedAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.invitedAt))
      .limit(50);
    
    const stats = {
      total: userReferrals.length,
      signedUp: userReferrals.filter(r => r.status !== 'pending').length,
      converted: userReferrals.filter(r => r.status === 'converted' || r.status === 'rewarded').length,
    };
    
    res.json({
      referrals: userReferrals,
      stats,
    });
  } catch (error: any) {
    console.error('Error getting referrals:', error);
    res.status(500).json({ error: 'Failed to get referrals' });
  }
});

router.post('/invite', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Please log in to invite friends' });
    }
    
    const data = inviteSchema.parse(req.body);
    
    const [user] = await db.select({
      referralCode: users.referralCode,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.email.toLowerCase() === data.email.toLowerCase()) {
      return res.status(400).json({ error: "You can't refer yourself" });
    }
    
    const [existingUser] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);
    
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered' });
    }
    
    const [existingInvite] = await db.select({ id: referrals.id })
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, userId),
        eq(referrals.referredEmail, data.email.toLowerCase())
      ))
      .limit(1);
    
    if (existingInvite) {
      return res.status(400).json({ error: 'Already invited this email' });
    }
    
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await db.update(users)
        .set({ referralCode })
        .where(eq(users.id, userId));
    }
    
    const [newReferral] = await db.insert(referrals).values({
      referrerId: userId,
      referrerEmail: user.email,
      referredEmail: data.email.toLowerCase(),
      status: 'pending',
      referredReward: 'extra_analysis',
    }).returning();
    
    const referrerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'A WashBizHub member';
    sendReferralInviteEmail({
      toEmail: data.email,
      referrerName,
      referralCode,
    }).catch(err => console.error('Failed to send referral invite:', err));
    
    res.json({
      success: true,
      message: 'Invitation sent successfully!',
      referralId: newReferral.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error sending invite:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

router.post('/process-signup', async (req, res) => {
  try {
    const { referralCode, newUserId, newUserEmail } = req.body;
    
    if (!referralCode || !newUserId || !newUserEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [referrer] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
    }).from(users).where(eq(users.referralCode, referralCode)).limit(1);
    
    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }
    
    await db.update(users)
      .set({ referredBy: referralCode })
      .where(eq(users.id, newUserId));
    
    const [existingReferral] = await db.select({ id: referrals.id })
      .from(referrals)
      .where(and(
        eq(referrals.referrerId, referrer.id),
        eq(referrals.referredEmail, newUserEmail.toLowerCase())
      ))
      .limit(1);
    
    if (existingReferral) {
      await db.update(referrals)
        .set({
          referredId: newUserId,
          status: 'signed_up',
          signedUpAt: new Date(),
          referrerReward: 'bonus_analysis',
        })
        .where(eq(referrals.id, existingReferral.id));
    } else {
      await db.insert(referrals).values({
        referrerId: referrer.id,
        referrerEmail: referrer.email,
        referredId: newUserId,
        referredEmail: newUserEmail.toLowerCase(),
        status: 'signed_up',
        signedUpAt: new Date(),
        referrerReward: 'bonus_analysis',
        referredReward: 'extra_analysis',
      });
    }
    
    const [newUser] = await db.select({ firstName: users.firstName })
      .from(users)
      .where(eq(users.id, newUserId))
      .limit(1);
    
    sendReferralSuccessEmail({
      email: referrer.email,
      firstName: referrer.firstName || undefined,
      referredName: newUser?.firstName || newUserEmail.split('@')[0],
      reward: '1 bonus CLEANBI analysis added to your account',
    }).catch(err => console.error('Failed to send referral success email:', err));
    
    res.json({ success: true, message: 'Referral processed' });
  } catch (error: any) {
    console.error('Error processing referral signup:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

export default router;
