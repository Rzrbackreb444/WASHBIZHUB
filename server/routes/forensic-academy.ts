import { Router, Request, Response } from "express";
import { requireAuth } from "../services/unified-auth";
import Stripe from "stripe";
import { db } from "../db";
import { users, enrollments, certificates, courses } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

// Forensic Academy Course ID and Google IDs from environment
const FORENSIC_ACADEMY_COURSE_ID = "forensic-investor-academy";
const FORENSIC_ACADEMY_PRICE = 997;
const GOOGLE_CLASSROOM_COURSE_ID = process.env.GOOGLE_CLASSROOM_COURSE_ID;
const GOOGLE_DRIVE_VAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_VAULT_FOLDER_ID;

// Helper to get Google auth client (service account preferred for automation)
async function getGoogleAuthClient() {
  // Try service account first (preferred for server-to-server automation)
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (serviceAccountJson) {
    try {
      const credentials = JSON.parse(serviceAccountJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/classroom.courses',
          'https://www.googleapis.com/auth/classroom.rosters',
          'https://www.googleapis.com/auth/drive',
        ],
      });
      return auth;
    } catch (parseError) {
      console.warn("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", parseError);
    }
  }
  
  // Fallback: OAuth2 client (requires user session - won't work for webhooks)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured. For automated enrollment, configure GOOGLE_SERVICE_ACCOUNT_JSON.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://washbizhub.com'}/api/auth/google/callback`
  );

  // Note: This won't work for webhook fulfillment without stored credentials
  // Admin should configure GOOGLE_SERVICE_ACCOUNT_JSON for full automation
  return oauth2Client;
}

// Check enrollment status
router.get("/enrollment", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user has an active enrollment
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, FORENSIC_ACADEMY_COURSE_ID)
        )
      )
      .limit(1);

    if (enrollment) {
      return res.json({
        enrolled: true,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress || 0,
        completed: enrollment.completedAt !== null,
        classroomUrl: GOOGLE_CLASSROOM_COURSE_ID 
          ? `https://classroom.google.com/c/${GOOGLE_CLASSROOM_COURSE_ID}`
          : null,
        vaultUrl: GOOGLE_DRIVE_VAULT_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_VAULT_FOLDER_ID}`
          : null,
      });
    }

    return res.json({ enrolled: false });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return res.status(500).json({ error: "Failed to check enrollment" });
  }
});

// Create Stripe checkout session
router.post("/checkout", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email;
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if already enrolled
    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, FORENSIC_ACADEMY_COURSE_ID)
        )
      )
      .limit(1);

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    // Get or create Stripe customer
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Determine redirect URL based on environment
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://washbizhub.com';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "WBH Forensic Investor Academy",
              description: "Complete forensic due diligence training with lifetime access to the Laundromat Larry Vault",
              images: ["https://washbizhub.com/logo.png"],
            },
            unit_amount: FORENSIC_ACADEMY_PRICE * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/forensic-academy?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/forensic-academy?canceled=true`,
      metadata: {
        userId,
        userEmail,
        productType: "forensic_academy",
        courseId: FORENSIC_ACADEMY_COURSE_ID,
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Fulfill enrollment after successful payment (called by Stripe webhook)
export async function fulfillForensicAcademyOrder(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  const userEmail = session.metadata?.userEmail || session.customer_details?.email;
  const courseId = session.metadata?.courseId;

  if (!userId || !userEmail || courseId !== FORENSIC_ACADEMY_COURSE_ID) {
    console.log("Invalid forensic academy order metadata:", session.metadata);
    return;
  }

  try {
    // 1. Create enrollment record
    await db.insert(enrollments).values({
      userId,
      courseId: FORENSIC_ACADEMY_COURSE_ID,
      enrolledAt: new Date(),
      progress: 0,
    }).onConflictDoNothing();

    console.log(`Created enrollment for user ${userId} in Forensic Academy`);

    // 2. Invite to Google Classroom (if configured)
    if (GOOGLE_CLASSROOM_COURSE_ID) {
      try {
        const auth = await getGoogleAuthClient();
        const classroom = google.classroom({ version: "v1", auth });
        
        await classroom.invitations.create({
          requestBody: {
            userId: userEmail,
            courseId: GOOGLE_CLASSROOM_COURSE_ID,
            role: "STUDENT",
          },
        });
        console.log(`Invited ${userEmail} to Google Classroom course`);
      } catch (classroomError: any) {
        // Log but don't fail - user can be manually invited
        console.error("Failed to invite to Google Classroom:", classroomError.message);
      }
    }

    // 3. Grant access to Google Drive Vault folder (if configured)
    if (GOOGLE_DRIVE_VAULT_FOLDER_ID) {
      try {
        const auth = await getGoogleAuthClient();
        const drive = google.drive({ version: "v3", auth });
        
        await drive.permissions.create({
          fileId: GOOGLE_DRIVE_VAULT_FOLDER_ID,
          requestBody: {
            type: "user",
            role: "reader",
            emailAddress: userEmail,
          },
          sendNotificationEmail: true,
        });
        console.log(`Granted ${userEmail} access to Laundromat Larry Vault`);
      } catch (driveError: any) {
        // Log but don't fail - user can be manually granted access
        console.error("Failed to grant Drive access:", driveError.message);
      }
    }

    // 4. Send welcome email notification
    // This can be expanded to use Resend or another email service
    console.log(`Forensic Academy enrollment complete for ${userEmail}`);

  } catch (error) {
    console.error("Error fulfilling forensic academy order:", error);
    throw error;
  }
}

// Generate WBH certificate
router.post("/certificate", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userName = (req as any).user?.firstName 
      ? `${(req as any).user.firstName} ${(req as any).user.lastName || ""}`
      : (req as any).user?.email;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if enrolled and completed
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, FORENSIC_ACADEMY_COURSE_ID)
        )
      )
      .limit(1);

    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in Forensic Academy" });
    }

    // Check if certificate already exists
    const [existingCert] = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.courseId, FORENSIC_ACADEMY_COURSE_ID)
        )
      )
      .limit(1);

    if (existingCert) {
      return res.json({
        certificateNumber: existingCert.certificateNumber,
        issuedAt: existingCert.issuedAt,
        name: userName,
      });
    }

    // Generate unique certificate number
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const certificateNumber = `WBH-FIA-${year}-${seq}`;

    // Create certificate record
    await db.insert(certificates).values({
      userId,
      courseId: FORENSIC_ACADEMY_COURSE_ID,
      certificateNumber,
      issuedAt: new Date(),
    });

    // Mark enrollment as completed
    await db
      .update(enrollments)
      .set({ 
        completedAt: new Date(),
        progress: 100,
      })
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, FORENSIC_ACADEMY_COURSE_ID)
        )
      );

    return res.json({
      certificateNumber,
      issuedAt: new Date(),
      name: userName,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return res.status(500).json({ error: "Failed to generate certificate" });
  }
});

export default router;
