import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import Stripe from "stripe";
import { storage } from "./storage";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// CRITICAL: Stripe webhook MUST use raw body BEFORE global JSON parsing
// This route is registered FIRST to intercept before express.json() middleware
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    return res.status(400).send("No signature");
  }

  let event;
  try {
    // req.body is now a Buffer because of express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata) {
      return res.status(200).json({ received: true });
    }

    const paymentIntentId = session.payment_intent as string;

    // Create enrollment for course purchase (with idempotency check)
    if (metadata.type === "course_purchase") {
      try {
        const existing = await storage.getEnrollment(metadata.userId, metadata.courseId);
        if (existing) {
          console.log(`⚠️  Enrollment already exists for user ${metadata.userId} in course ${metadata.courseId} (idempotent)`);
          return res.json({ received: true });
        }

        await storage.createEnrollment({
          userId: metadata.userId,
          courseId: metadata.courseId,
          stripePaymentId: paymentIntentId,
          progress: 0,
          currentLessonId: null,
          completedLessons: [],
          lastAccessedAt: null,
        });
        console.log(`✅ Enrollment created for user ${metadata.userId} in course ${metadata.courseId}`);
      } catch (error: any) {
        console.error(`❌ Failed to create enrollment: ${error.message}`);
      }
    }

    // Create book access for book purchase (with idempotency check)
    if (metadata.type === "book_purchase") {
      try {
        const existing = await storage.getUserBookAccess(metadata.userId);
        if (existing) {
          console.log(`⚠️  Book access already exists for user ${metadata.userId} (idempotent)`);
          return res.json({ received: true });
        }

        await storage.createBookAccess({
          userId: metadata.userId,
          stripePaymentId: paymentIntentId,
        });
        console.log(`✅ Book access granted to user ${metadata.userId}`);
      } catch (error: any) {
        console.error(`❌ Failed to grant book access: ${error.message}`);
      }
    }
  }

  res.json({ received: true });
});

// Now apply global JSON parsing for all other routes
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
