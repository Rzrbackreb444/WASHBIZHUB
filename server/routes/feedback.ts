import { Router } from 'express';
import { z } from 'zod';
import { getResendClient } from '../resend-client';
import { db } from '../db';
import { feedbackSubmissions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

const feedbackSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  category: z.enum(['feature-request', 'improvement', 'bug-report', 'general-feedback', 'other']),
  subject: z.string().min(5),
  message: z.string().min(20),
  page: z.string().optional(),
});

const categoryLabels: Record<string, string> = {
  'feature-request': '🚀 New Feature Request',
  'improvement': '💡 Improvement Suggestion',
  'bug-report': '🐛 Bug Report',
  'general-feedback': '📝 General Feedback',
  'other': '📌 Other',
};

router.post('/submit', async (req, res) => {
  try {
    const data = feedbackSchema.parse(req.body);
    const categoryLabel = categoryLabels[data.category] || data.category;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0A1628 0%, #1a2a4a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; color: #C8A661; }
    .content { background: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #0A1628; margin-bottom: 5px; }
    .field-value { background: white; padding: 12px; border-radius: 4px; border: 1px solid #ddd; }
    .message-box { background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #C8A661; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .category-badge { display: inline-block; background: #C8A661; color: #0A1628; padding: 6px 12px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WashBizHub Feedback</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">User Submission</p>
    </div>
    <div class="content">
      <div class="category-badge">${categoryLabel}</div>
      
      <div class="field">
        <div class="field-label">From</div>
        <div class="field-value">${data.name} &lt;${data.email}&gt;</div>
      </div>
      
      <div class="field">
        <div class="field-label">Subject</div>
        <div class="field-value">${data.subject}</div>
      </div>
      
      ${data.page ? `
      <div class="field">
        <div class="field-label">Page/Feature</div>
        <div class="field-value">${data.page}</div>
      </div>
      ` : ''}
      
      <div class="message-box">
        <div class="field-label" style="margin-bottom: 10px;">Message</div>
        <div style="white-space: pre-wrap;">${data.message}</div>
      </div>
    </div>
    <div class="footer">
      <p>Submitted via WashBizHub Feedback Form</p>
      <p>${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
    
    const plainText = `
${categoryLabel}

From: ${data.name} <${data.email}>
Subject: ${data.subject}
${data.page ? `Page/Feature: ${data.page}` : ''}

Message:
${data.message}

---
Submitted via WashBizHub Feedback Form
${new Date().toLocaleString()}
    `;
    
    // Save to database
    let savedFeedback;
    try {
      const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
      [savedFeedback] = await db.insert(feedbackSubmissions).values({
        userId: userId || null,
        name: data.name,
        email: data.email,
        category: data.category,
        subject: data.subject,
        message: data.message,
        page: data.page || null,
        status: 'new',
      }).returning();
      console.log(`✅ Feedback saved to database: ${savedFeedback.id}`);
    } catch (dbError: any) {
      console.error(`⚠️ Failed to save feedback to database: ${dbError.message}`);
    }
    
    // Send email notification
    try {
      const resend = getResendClient();
      await resend.emails.send({
        from: 'WashBizHub Feedback <notifications@washbizhub.com>',
        to: ['info@washbizhub.com'],
        replyTo: data.email,
        subject: `[${data.category.toUpperCase()}] ${data.subject}`,
        html: emailHtml,
        text: plainText,
      });
      console.log(`✅ Feedback email sent to info@washbizhub.com from ${data.email}`);
    } catch (emailError: any) {
      console.error(`⚠️ Failed to send feedback email: ${emailError.message}`);
    }
    
    res.json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      feedbackId: savedFeedback?.id || 'feedback-' + Date.now(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

// Admin: Get all feedback submissions
router.get('/admin/list', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user is admin (simple check by email for now)
    const adminEmails = ['nick@washbizhub.com', 'thelaundromatfb@gmail.com', 'rzrbackreb444@gmail.com'];
    const { users } = await import('@shared/schema');
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || (!user.isAdmin && !adminEmails.includes(user.email.toLowerCase()))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const feedbacks = await db
      .select()
      .from(feedbackSubmissions)
      .orderBy(desc(feedbackSubmissions.createdAt))
      .limit(100);
    
    res.json(feedbacks);
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Admin: Update feedback status
router.patch('/admin/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user is admin
    const adminEmails = ['nick@washbizhub.com', 'thelaundromatfb@gmail.com', 'rzrbackreb444@gmail.com'];
    const { users } = await import('@shared/schema');
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || (!user.isAdmin && !adminEmails.includes(user.email.toLowerCase()))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const [updated] = await db
      .update(feedbackSubmissions)
      .set({
        status: status || undefined,
        adminNotes: adminNotes || undefined,
        respondedAt: status === 'resolved' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(feedbackSubmissions.id, id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Admin: Get feedback stats
router.get('/admin/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const adminEmails = ['nick@washbizhub.com', 'thelaundromatfb@gmail.com', 'rzrbackreb444@gmail.com'];
    const { users } = await import('@shared/schema');
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || (!user.isAdmin && !adminEmails.includes(user.email.toLowerCase()))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { sql } = await import('drizzle-orm');
    
    const [totalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(feedbackSubmissions);
    const [newCount] = await db.select({ count: sql<number>`count(*)::int` }).from(feedbackSubmissions).where(eq(feedbackSubmissions.status, 'new'));
    const [resolvedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(feedbackSubmissions).where(eq(feedbackSubmissions.status, 'resolved'));
    
    // Category breakdown
    const categoryStats = await db
      .select({
        category: feedbackSubmissions.category,
        count: sql<number>`count(*)::int`
      })
      .from(feedbackSubmissions)
      .groupBy(feedbackSubmissions.category);
    
    res.json({
      total: totalCount?.count || 0,
      new: newCount?.count || 0,
      resolved: resolvedCount?.count || 0,
      byCategory: Object.fromEntries(categoryStats.map(c => [c.category, c.count])),
    });
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
