/**
 * CLEANBI Premium Reports API Routes
 * 
 * Endpoints for purchasing and generating CLEANBI PDF reports
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { generateCleanbiReport, REPORT_TIERS, ReportTier } from "./cleanbi-report-generator";
import { insertCleanbiReportSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { isAuthenticated } from "./replitAuth";

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" as any })
  : null;

const checkoutSchema = z.object({
  address: z.string().min(5, "Address is required"),
  tier: z.enum(["standard", "pro", "enterprise"]),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

router.get("/tiers", async (req: Request, res: Response) => {
  res.json({
    tiers: Object.values(REPORT_TIERS).map((tier) => ({
      ...tier,
      price: tier.price / 100,
      priceDisplay: `$${(tier.price / 100).toFixed(0)}`,
    })),
  });
});

router.post("/checkout", async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing unavailable" });
    }

    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { address, tier, successUrl, cancelUrl } = result.data;
    const tierConfig = REPORT_TIERS[tier as ReportTier];

    const userId = (req as any).user?.claims?.sub;

    const report = await storage.createCleanbiReport({
      userId: userId || null,
      address,
      reportType: tier,
      status: "pending",
      price: tierConfig.price,
    });

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : req.headers.origin || "https://washbizhub.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `CLEANBI ${tierConfig.name}`,
              description: `Comprehensive location analysis report for: ${address.substring(0, 100)}`,
              images: ["https://washbizhub.com/cleanbi-report-preview.png"],
            },
            unit_amount: tierConfig.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${baseUrl}/cleanbi/reports/${report.id}?success=true`,
      cancel_url: cancelUrl || `${baseUrl}/cleanbi?canceled=true`,
      metadata: {
        reportId: report.id,
        address,
        tier,
        userId: userId || "anonymous",
      },
    });

    await storage.updateCleanbiReport(report.id, {
      stripeSessionId: session.id,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      reportId: report.id,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing unavailable" });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      event = req.body;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.reportId) {
        const reportId = session.metadata.reportId;
        const address = session.metadata.address;
        const tier = session.metadata.tier as ReportTier;

        await storage.updateCleanbiReport(reportId, {
          stripePaymentId: session.payment_intent as string,
          status: "processing",
        });

        try {
          const result = await generateCleanbiReport(
            address,
            tier,
            session.metadata.userId !== "anonymous" ? session.metadata.userId : undefined
          );

          await storage.updateCleanbiReport(reportId, {
            status: "completed",
            cleanbiScore: result.reportData.cleanbiScore,
            cleanbiGrade: result.reportData.cleanbiGrade,
            reportData: result.reportData as any,
            visionAnalysis: result.reportData.visionAnalysis as any,
            competitorData: result.reportData.competitorData as any,
            demographicData: result.reportData.demographicData as any,
            pdfUrl: result.pdfUrl,
            completedAt: new Date(),
          } as any);

          console.log(`Report ${reportId} generated successfully`);
        } catch (error: any) {
          console.error(`Report generation failed for ${reportId}:`, error);
          await storage.updateCleanbiReport(reportId, {
            status: "failed",
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.post("/generate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ error: "Report ID required" });
    }

    const report = await storage.getCleanbiReport(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.status !== "pending" || !report.stripePaymentId) {
      return res.status(400).json({ error: "Report cannot be generated" });
    }

    await storage.updateCleanbiReport(reportId, {
      status: "processing",
    });

    const result = await generateCleanbiReport(
      report.address,
      report.reportType as ReportTier,
      report.userId || undefined
    );

    await storage.updateCleanbiReport(reportId, {
      status: "completed",
      cleanbiScore: result.reportData.cleanbiScore,
      cleanbiGrade: result.reportData.cleanbiGrade,
      reportData: result.reportData as any,
      visionAnalysis: result.reportData.visionAnalysis as any,
      competitorData: result.reportData.competitorData as any,
      demographicData: result.reportData.demographicData as any,
      pdfUrl: result.pdfUrl,
      completedAt: new Date(),
    } as any);

    const updatedReport = await storage.getCleanbiReport(reportId);

    res.json({
      success: true,
      report: updatedReport,
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.get("/my-reports", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const reports = await storage.getCleanbiReports(userId);
    res.json({ reports });
  } catch (error: any) {
    console.error("Get reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await storage.getCleanbiReport(id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const userId = (req as any).user?.claims?.sub;
    if (report.userId && report.userId !== userId) {
      return res.json({
        id: report.id,
        address: report.address,
        status: report.status,
        reportType: report.reportType,
        cleanbiScore: report.status === "completed" ? report.cleanbiScore : null,
        cleanbiGrade: report.status === "completed" ? report.cleanbiGrade : null,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
      });
    }

    res.json({ report });
  } catch (error: any) {
    console.error("Get report error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

router.get("/:id/pdf", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await storage.getCleanbiReport(id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.status !== "completed" || !report.pdfUrl) {
      return res.status(400).json({ error: "Report PDF not available" });
    }

    const userId = (req as any).user?.claims?.sub;
    if (report.userId && report.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (report.pdfUrl.startsWith("/objects/")) {
      const objectStorage = new ObjectStorageService();
      try {
        const objectFile = await objectStorage.getObjectEntityFile(report.pdfUrl);
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="cleanbi-report-${id}.pdf"`
        );

        await objectStorage.downloadObject(objectFile, res);
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "PDF file not found" });
        }
        throw error;
      }
    } else {
      res.redirect(report.pdfUrl);
    }
  } catch (error: any) {
    console.error("PDF download error:", error);
    res.status(500).json({ error: "Failed to download PDF" });
  }
});

router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const report = await storage.getCleanbiReportByStripeSession(sessionId);
    
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({
      id: report.id,
      status: report.status,
      address: report.address,
      reportType: report.reportType,
      cleanbiScore: report.cleanbiScore,
      cleanbiGrade: report.cleanbiGrade,
      pdfUrl: report.status === "completed" ? `/api/cleanbi/reports/${report.id}/pdf` : null,
      createdAt: report.createdAt,
      completedAt: report.completedAt,
    });
  } catch (error: any) {
    console.error("Get session report error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

export default router;
