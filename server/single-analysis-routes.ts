/**
 * Single Analysis Purchase Routes
 * 
 * One-time purchase endpoints for individual location analyses:
 * - Demographic Reports
 * - Competition Assessments  
 * - Full CLEANBI Valuations
 * - Complete Bundle
 */

import { Router, Request, Response } from "express";
import express from "express";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { generateEnhancedReport } from "./enhanced-report-generator";

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

// Product definitions with pricing
export const ANALYSIS_PRODUCTS = {
  demographic: {
    id: "demographic",
    name: "Demographic Report",
    description: "Comprehensive population, income, and market analysis",
    price: 2900, // $29
    stripePriceData: {
      currency: "usd",
      product_data: {
        name: "WashBizHub Demographic Report",
        description: "Population, income, age distribution, housing analysis for any US location",
        images: ["https://washbizhub.com/demographic-report-preview.png"],
      },
    },
  },
  competition: {
    id: "competition",
    name: "Competition Assessment",
    description: "Deep-dive competitor analysis with market gaps",
    price: 4900, // $49
    stripePriceData: {
      currency: "usd",
      product_data: {
        name: "WashBizHub Competition Assessment",
        description: "Competitor mapping, pricing analysis, and market opportunity identification",
        images: ["https://washbizhub.com/competition-report-preview.png"],
      },
    },
  },
  valuation: {
    id: "valuation",
    name: "Full CLEANBI Valuation",
    description: "Complete 6-factor location intelligence report",
    price: 9900, // $99
    stripePriceData: {
      currency: "usd",
      product_data: {
        name: "WashBizHub CLEANBI Valuation",
        description: "Complete location intelligence with revenue projections and investment analysis",
        images: ["https://washbizhub.com/cleanbi-report-preview.png"],
      },
    },
  },
  bundle: {
    id: "bundle",
    name: "Complete Analysis Bundle",
    description: "All three reports at 25% discount",
    price: 12900, // $129 (saves $28)
    stripePriceData: {
      currency: "usd",
      product_data: {
        name: "WashBizHub Complete Analysis Bundle",
        description: "Demographic + Competition + CLEANBI Valuation (Save $28)",
        images: ["https://washbizhub.com/bundle-report-preview.png"],
      },
    },
  },
};

type ProductId = keyof typeof ANALYSIS_PRODUCTS;

const checkoutSchema = z.object({
  address: z.string().min(5, "Address is required"),
  productId: z.enum(["demographic", "competition", "valuation", "bundle"]),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

// Get available products
router.get("/products", async (req: Request, res: Response) => {
  res.json({
    products: Object.values(ANALYSIS_PRODUCTS).map((product) => ({
      ...product,
      priceDisplay: `$${(product.price / 100).toFixed(0)}`,
    })),
  });
});

// Create checkout session
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing unavailable" });
    }

    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { address, productId, successUrl, cancelUrl } = result.data;
    const product = ANALYSIS_PRODUCTS[productId as ProductId];

    if (!product) {
      return res.status(400).json({ error: "Invalid product" });
    }

    const userId = (req as any).user?.claims?.sub;

    // Create report record in pending state
    const report = await storage.createCleanbiReport({
      userId: userId || null,
      address,
      reportType: productId,
      status: "pending",
      price: product.price,
    });

    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : req.headers.origin || "https://washbizhub.com";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            ...product.stripePriceData,
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${baseUrl}/report-success?report_id=${report.id}&product=${productId}`,
      cancel_url: cancelUrl || `${baseUrl}/single-analysis?canceled=true`,
      metadata: {
        reportId: report.id,
        address,
        productId,
        userId: userId || "anonymous",
        source: "single_analysis",
      },
      customer_email: (req as any).user?.claims?.email || undefined,
    });

    // Update report with Stripe session ID
    await storage.updateCleanbiReport(report.id, {
      stripeSessionId: session.id,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      reportId: report.id,
    });
  } catch (error: any) {
    console.error("Single analysis checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Webhook handler for payment completion
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
      
      if (session.metadata?.source === "single_analysis" && session.metadata?.reportId) {
        const reportId = session.metadata.reportId;
        const productId = session.metadata.productId as ProductId;
        const address = session.metadata.address;

        // Update report status to processing
        await storage.updateCleanbiReport(reportId, {
          status: "processing",
          paymentStatus: "paid",
        });

        // Trigger report generation (async)
        generateEnhancedReport(reportId, productId, address).catch(console.error);
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Get report status and download link
router.get("/report/:reportId", async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = await storage.getCleanbiReport(reportId);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({
      id: report.id,
      status: report.status,
      reportType: report.reportType,
      address: report.address,
      downloadUrl: report.pdfUrl,
      googleSheetsUrl: report.googleSheetsUrl,
      googleSlidesUrl: report.googleSlidesUrl,
      createdAt: report.createdAt,
    });
  } catch (error: any) {
    console.error("Get report error:", error);
    res.status(500).json({ error: "Failed to get report" });
  }
});

export default router;
