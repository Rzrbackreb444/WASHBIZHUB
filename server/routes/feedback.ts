import { Router } from 'express';
import { z } from 'zod';
import { getResendClient } from '../resend-client';

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
      feedbackId: 'feedback-' + Date.now(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

export default router;
