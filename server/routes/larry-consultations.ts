/**
 * Larry's Consulting Command Center API Routes
 * Handles consultations, leads, notifications, and revenue tracking
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { larryConsultations, sessionRecordings, revenueSplitPayouts, larryEmailTemplates, leads, leadActivities, socialMediaConnections } from "@shared/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { sendEmail } from "../resend-client";
// Twilio disabled - too expensive. Using email notifications only for now.

const router = Router();

// Owner emails for access control (from environment or defaults)
const OWNER_EMAILS = (process.env.OWNER_EMAILS || "nick@washbizhub.com,larry@washbizhub.com,nickkremers@gmail.com").split(",").map(e => e.trim().toLowerCase());

// Middleware to check if user is owner
function requireOwner(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  if (!user || !user.email) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const userEmail = user.email.toLowerCase();
  if (!OWNER_EMAILS.includes(userEmail)) {
    return res.status(403).json({ error: "Owner access required" });
  }
  
  next();
}

// Check if current user is owner
router.get("/check-owner", (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.email) {
    return res.json({ isOwner: false });
  }
  
  const userEmail = user.email.toLowerCase();
  const isOwner = OWNER_EMAILS.includes(userEmail);
  res.json({ isOwner });
});

// ============================================================================
// CONSULTATIONS
// ============================================================================

// Get all consultations (owner only)
router.get("/consultations", requireOwner, async (req: Request, res: Response) => {
  try {
    const consultations = await db.select().from(larryConsultations)
      .orderBy(desc(larryConsultations.scheduledAt))
      .limit(100);
    
    res.json(consultations);
  } catch (error) {
    console.error("[Consultations] Error fetching:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

// Book a consultation (public)
router.post("/consultations/book", async (req: Request, res: Response) => {
  try {
    const { 
      clientName, clientEmail, clientPhone, 
      consultationType, scheduledAt, 
      notes, source = "website"
    } = req.body;

    // Validate required fields
    if (!clientName || !clientEmail || !consultationType || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get pricing based on type
    const PRICES: Record<string, { price: number; duration: number }> = {
      "phone": { price: 149, duration: 30 },
      "video": { price: 249, duration: 45 },
      "deep-dive": { price: 499, duration: 90 },
      "vip-day": { price: 1997, duration: 240 }
    };

    const typeInfo = PRICES[consultationType];
    if (!typeInfo) {
      return res.status(400).json({ error: "Invalid consultation type" });
    }

    const price = typeInfo.price;
    const duration = typeInfo.duration;
    const larryShare = price / 2;
    const nickShare = price / 2;

    // Create consultation
    const [consultation] = await db.insert(larryConsultations).values({
      clientName,
      clientEmail,
      clientPhone,
      consultationType,
      duration,
      price: price.toString(),
      larryShare: larryShare.toString(),
      nickShare: nickShare.toString(),
      scheduledAt: new Date(scheduledAt),
      status: "scheduled",
      sessionNotes: notes,
    }).returning();

    // Create/update lead
    const existingLead = await db.select().from(leads).where(eq(leads.email, clientEmail)).limit(1);
    
    if (existingLead.length === 0) {
      await db.insert(leads).values({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        source,
        consultationInterest: true,
        preferredConsultationType: consultationType,
        smsSubscribed: !!clientPhone,
      });
    } else {
      await db.update(leads)
        .set({ 
          consultationInterest: true,
          preferredConsultationType: consultationType,
          lastActivityAt: new Date(),
          phone: clientPhone || existingLead[0].phone,
        })
        .where(eq(leads.email, clientEmail));
    }

    // Send confirmation email to client
    const consultationDate = new Date(scheduledAt);
    const dateStr = consultationDate.toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const timeStr = consultationDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });

    const typeNames: Record<string, string> = {
      "phone": "Phone Call",
      "video": "Video Call",
      "deep-dive": "Deep Dive Session",
      "vip-day": "VIP Day Experience"
    };

    await sendEmail({
      to: clientEmail,
      subject: `Your ${typeNames[consultationType]} with Larry Larsen is Confirmed!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #fff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
            <p style="color: #94a3b8;">The #1 Laundromat Resource</p>
          </div>
          
          <h2 style="color: #C8A661;">Your Consultation is Confirmed!</h2>
          
          <p>Hi ${clientName},</p>
          
          <p>Thank you for booking a consultation with Larry Larsen, a 50+ year veteran of the laundromat industry!</p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #C8A661; margin-top: 0;">Session Details</h3>
            <p><strong>Type:</strong> ${typeNames[consultationType]}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Time:</strong> ${timeStr}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Investment:</strong> $${price}</p>
          </div>
          
          <p>We'll send you a meeting link 24 hours before your session.</p>
          
          <p style="margin-top: 30px;">Looking forward to helping you succeed!</p>
          
          <p>Best,<br/>
          <strong>Larry Larsen & Nick Kremers</strong><br/>
          WashBizHub</p>
        </div>
      `
    });

    // Send notification emails to owners
    await sendEmail({
      to: ["nick@washbizhub.com", "larry@washbizhub.com"],
      subject: `New ${typeNames[consultationType]} Booked: ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Consultation Booked!</h2>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Phone:</strong> ${clientPhone || 'Not provided'}</p>
          <p><strong>Type:</strong> ${typeNames[consultationType]}</p>
          <p><strong>Date:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Revenue:</strong> $${price} (Larry: $${larryShare}, Nick: $${nickShare})</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p><a href="https://washbizhub.com/larrys-command-center">View in Command Center</a></p>
        </div>
      `
    });

    // SMS disabled - Twilio too expensive. Using email notifications only.

    res.json({ 
      success: true, 
      consultation,
      message: "Consultation booked successfully!" 
    });
  } catch (error) {
    console.error("[Consultations] Booking error:", error);
    res.status(500).json({ error: "Failed to book consultation" });
  }
});

// Update consultation status (owner only)
router.patch("/consultations/:id", requireOwner, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await db.update(larryConsultations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(larryConsultations.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Consultations] Update error:", error);
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// ============================================================================
// LEADS / SUBSCRIBERS
// ============================================================================

// Subscribe a new lead (public)
router.post("/leads/subscribe", async (req: Request, res: Response) => {
  try {
    const { 
      name, email, phone, 
      source = "website", 
      interests = [],
      persona,
      smsSubscribed = false,
      utmSource, utmMedium, utmCampaign, referrer
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Check if lead exists
    const existing = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
    
    if (existing.length > 0) {
      // Update existing lead
      await db.update(leads)
        .set({ 
          lastActivityAt: new Date(),
          smsSubscribed: smsSubscribed || existing[0].smsSubscribed,
          phone: phone || existing[0].phone,
          interests: interests.length > 0 ? interests : existing[0].interests,
        })
        .where(eq(leads.email, email));

      return res.json({ success: true, message: "Subscription updated!" });
    }

    // Create new lead
    const [lead] = await db.insert(leads).values({
      name,
      email,
      phone,
      source,
      interests,
      persona,
      smsSubscribed,
      utmSource,
      utmMedium,
      utmCampaign,
      referrer,
    }).returning();

    // Log activity
    await db.insert(leadActivities).values({
      leadId: lead.id,
      activityType: "subscribed",
      activityData: { source, interests },
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to WashBizHub - The #1 Laundromat Resource!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #fff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #C8A661; margin: 0;">WashBizHub</h1>
            <p style="color: #94a3b8;">The #1 Laundromat Resource</p>
          </div>
          
          <h2 style="color: #C8A661;">Welcome, ${name}!</h2>
          
          <p>You've just joined the most comprehensive laundromat resource on the web, powered by Larry Larsen's 50+ years of industry expertise.</p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #C8A661; margin-top: 0;">What You'll Get:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">✓ Industry insights from a 50-year veteran</li>
              <li style="margin: 10px 0;">✓ CLEANBI location analysis tools</li>
              <li style="margin: 10px 0;">✓ Valuation & ROI calculators</li>
              <li style="margin: 10px 0;">✓ Market trends & opportunities</li>
              <li style="margin: 10px 0;">✓ Exclusive consulting access</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://washbizhub.com/consult-with-larry" 
               style="background: #C8A661; color: #0A1628; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Book a Consultation with Larry
            </a>
          </div>
          
          <p>Welcome aboard!</p>
          
          <p>Best,<br/>
          <strong>Larry Larsen & Nick Kremers</strong><br/>
          WashBizHub</p>
        </div>
      `
    });

    // SMS disabled - using email only

    // Alert owners
    await sendEmail({
      to: ["nick@washbizhub.com"],
      subject: `New Subscriber: ${name}`,
      html: `
        <h2>New Lead Captured!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>SMS Opted In:</strong> ${smsSubscribed ? 'Yes' : 'No'}</p>
      `
    });

    res.json({ success: true, message: "Welcome to WashBizHub!" });
  } catch (error) {
    console.error("[Leads] Subscribe error:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Get all leads (owner only)
router.get("/leads", requireOwner, async (req: Request, res: Response) => {
  try {
    const allLeads = await db.select().from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(500);
    
    res.json(allLeads);
  } catch (error) {
    console.error("[Leads] Error fetching:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// ============================================================================
// REVENUE TRACKING
// ============================================================================

// Get revenue summary (owner only)
router.get("/revenue/summary", requireOwner, async (req: Request, res: Response) => {
  try {
    // Get all completed consultations
    const consultations = await db.select().from(larryConsultations)
      .where(eq(larryConsultations.status, "completed"));

    const totalRevenue = consultations.reduce((sum, c) => sum + parseFloat(c.price || "0"), 0);
    const larryTotal = consultations.reduce((sum, c) => sum + parseFloat(c.larryShare || "0"), 0);
    const nickTotal = consultations.reduce((sum, c) => sum + parseFloat(c.nickShare || "0"), 0);

    // This month's revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthConsultations = consultations.filter(c => 
      c.completedAt && new Date(c.completedAt) >= startOfMonth
    );
    const thisMonth = thisMonthConsultations.reduce((sum, c) => sum + parseFloat(c.price || "0"), 0);

    // Last month's revenue
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthConsultations = consultations.filter(c => 
      c.completedAt && 
      new Date(c.completedAt) >= startOfLastMonth && 
      new Date(c.completedAt) <= endOfLastMonth
    );
    const lastMonth = lastMonthConsultations.reduce((sum, c) => sum + parseFloat(c.price || "0"), 0);

    // Growth percentage
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Revenue by type
    const byType = ["phone", "video", "deep-dive", "vip-day"].map(type => {
      const typeConsultations = consultations.filter(c => c.consultationType === type);
      return {
        type,
        amount: typeConsultations.reduce((sum, c) => sum + parseFloat(c.price || "0"), 0),
        count: typeConsultations.length
      };
    });

    res.json({
      totalRevenue,
      larryTotal,
      nickTotal,
      thisMonth,
      lastMonth,
      growth,
      byType,
      totalConsultations: consultations.length
    });
  } catch (error) {
    console.error("[Revenue] Error fetching summary:", error);
    res.status(500).json({ error: "Failed to fetch revenue summary" });
  }
});

// ============================================================================
// RECORDINGS
// ============================================================================

// Get all recordings (owner only)
router.get("/recordings", requireOwner, async (req: Request, res: Response) => {
  try {
    const recordings = await db.select().from(sessionRecordings)
      .orderBy(desc(sessionRecordings.recordedAt))
      .limit(100);
    
    res.json(recordings);
  } catch (error) {
    console.error("[Recordings] Error fetching:", error);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

// Save a new recording (owner only)
router.post("/recordings", requireOwner, async (req: Request, res: Response) => {
  try {
    const [recording] = await db.insert(sessionRecordings)
      .values(req.body)
      .returning();
    
    res.json(recording);
  } catch (error) {
    console.error("[Recordings] Error saving:", error);
    res.status(500).json({ error: "Failed to save recording" });
  }
});

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

// Get email templates (owner only)
router.get("/email-templates", requireOwner, async (req: Request, res: Response) => {
  try {
    const templates = await db.select().from(larryEmailTemplates)
      .where(eq(larryEmailTemplates.isActive, true))
      .orderBy(larryEmailTemplates.name);
    
    res.json(templates);
  } catch (error) {
    console.error("[Templates] Error fetching:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Send templated email (owner only)
router.post("/email/send", requireOwner, async (req: Request, res: Response) => {
  try {
    const { to, subject, body, templateId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await sendEmail({
      to,
      subject,
      html: body.replace(/\n/g, '<br/>')
    });

    if (templateId) {
      await db.update(larryEmailTemplates)
        .set({ 
          timesUsed: sql`${larryEmailTemplates.timesUsed} + 1`,
          lastUsedAt: new Date()
        })
        .where(eq(larryEmailTemplates.id, templateId));
    }

    res.json(result);
  } catch (error) {
    console.error("[Email] Error sending:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ============================================================================
// SOCIAL MEDIA
// ============================================================================

// Get social connections (owner only)
router.get("/social/connections", requireOwner, async (req: Request, res: Response) => {
  try {
    const connections = await db.select().from(socialMediaConnections);
    res.json(connections);
  } catch (error) {
    console.error("[Social] Error fetching:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

export default router;
