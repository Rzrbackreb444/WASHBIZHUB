import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";
import multer from "multer";
import { randomUUID } from "crypto";

const multerUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

const businessProfileSchema = z.object({
  businessName: z.string().min(1),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().default('#C8A661'),
  secondaryColor: z.string().default('#1a2332'),
  accentColor: z.string().default('#ffffff'),
  fontFamily: z.string().default('Inter'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().default('USA'),
  businessHours: z.any().optional().nullable(),
  timezone: z.string().default('America/New_York'),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  googleMapsUrl: z.string().optional().nullable(),
  yelpUrl: z.string().optional().nullable(),
  services: z.array(z.any()).optional().nullable(),
  pricingMode: z.string().default('per_pound'),
  pricePerPound: z.string().optional().nullable(),
  minimumWeight: z.number().optional().nullable(),
  rushSurcharge: z.number().optional().nullable(),
  flatRatePrices: z.any().optional().nullable(),
  pickupDeliveryFee: z.string().optional().nullable(),
});

const aiAgentSchema = z.object({
  name: z.string().default('Store Assistant'),
  personality: z.string().default('friendly'),
  avatarUrl: z.string().optional().nullable(),
  knowledgeBase: z.string().optional().nullable(),
  businessContext: z.string().optional().nullable(),
  canTakeOrders: z.boolean().default(false),
  canSchedulePickups: z.boolean().default(false),
  canAnswerPricing: z.boolean().default(true),
  canProvideFaq: z.boolean().default(true),
  welcomeMessage: z.string().default('Hi! How can I help you today?'),
  awayMessage: z.string().default("We're currently closed. Leave a message and we'll get back to you!"),
  commonQuestions: z.array(z.any()).optional().nullable(),
  primaryColor: z.string().default('#C8A661'),
  position: z.string().default('bottom-right'),
  isEnabled: z.boolean().default(true),
  businessProfileId: z.string().optional().nullable(),
});

const serviceCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  pricingNote: z.string().optional().nullable(),
  ctaText: z.string().default('Learn More'),
  ctaLink: z.string().optional().nullable(),
  order: z.number().default(0),
  isHighlighted: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  projectId: z.string().optional().nullable(),
  businessProfileId: z.string().optional().nullable(),
});

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  videoType: z.enum(['upload', 'youtube', 'vimeo']).default('upload'),
  videoUrl: z.string().min(1),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  muted: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  order: z.number().default(0),
  projectId: z.string().optional().nullable(),
});

const calculatorThemeSchema = z.object({
  name: z.string().min(1),
  calculatorId: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().default('#C8A661'),
  secondaryColor: z.string().default('#1a2332'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#1a2332'),
  fontFamily: z.string().default('Inter'),
  headingFont: z.string().default('Inter'),
  customCss: z.string().optional().nullable(),
  showPoweredBy: z.boolean().default(true),
  allowedDomains: z.array(z.string()).optional().nullable(),
  businessProfileId: z.string().optional().nullable(),
});

const integrationSchema = z.object({
  integrationType: z.string().min(1),
  integrationName: z.string().optional().nullable(),
  isConnected: z.boolean().default(false),
  externalAccountId: z.string().optional().nullable(),
  externalAccountName: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
  scopes: z.array(z.string()).optional().nullable(),
  businessProfileId: z.string().optional().nullable(),
});

export function createWhiteLabelRoutes() {
  const router = Router();

  router.get("/business-profile", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(
        sql`SELECT * FROM business_profiles WHERE user_id = ${userId} LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        return res.json(null);
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/business-profile", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = businessProfileSchema.parse(req.body);
      
      const existingResult = await db.execute(
        sql`SELECT id FROM business_profiles WHERE user_id = ${userId} LIMIT 1`
      );
      
      const businessHoursJson = JSON.stringify(data.businessHours || {});
      const servicesJson = JSON.stringify(data.services || []);
      const flatRatePricesJson = JSON.stringify(data.flatRatePrices || null);
      
      if (existingResult.rows.length > 0) {
        const existingId = existingResult.rows[0].id;
        await db.execute(sql`
          UPDATE business_profiles SET
            business_name = ${data.businessName}, tagline = ${data.tagline}, description = ${data.description},
            logo_url = ${data.logoUrl}, favicon_url = ${data.faviconUrl}, primary_color = ${data.primaryColor},
            secondary_color = ${data.secondaryColor}, accent_color = ${data.accentColor}, font_family = ${data.fontFamily},
            phone = ${data.phone}, email = ${data.email}, address = ${data.address}, city = ${data.city},
            state = ${data.state}, zip_code = ${data.zipCode}, country = ${data.country},
            business_hours = ${businessHoursJson}::jsonb, timezone = ${data.timezone},
            facebook_url = ${data.facebookUrl}, instagram_url = ${data.instagramUrl},
            google_maps_url = ${data.googleMapsUrl}, yelp_url = ${data.yelpUrl},
            services = ${servicesJson}::jsonb, pricing_mode = ${data.pricingMode},
            price_per_pound = ${data.pricePerPound || '1.75'}, minimum_weight = ${data.minimumWeight || 10},
            rush_surcharge = ${data.rushSurcharge || 50}, flat_rate_prices = ${flatRatePricesJson}::jsonb,
            pickup_delivery_fee = ${data.pickupDeliveryFee || '5.00'}, updated_at = NOW()
          WHERE id = ${existingId}
        `);
        
        const updated = await db.execute(
          sql`SELECT * FROM business_profiles WHERE id = ${existingId}`
        );
        return res.json(updated.rows[0]);
      }
      
      const id = randomUUID();
      await db.execute(sql`
        INSERT INTO business_profiles (id, user_id, business_name, tagline, description, logo_url, favicon_url,
          primary_color, secondary_color, accent_color, font_family, phone, email, address, city, state, zip_code,
          country, business_hours, timezone, facebook_url, instagram_url, google_maps_url, yelp_url, services,
          pricing_mode, price_per_pound, minimum_weight, rush_surcharge, flat_rate_prices, pickup_delivery_fee)
        VALUES (${id}, ${userId}, ${data.businessName}, ${data.tagline}, ${data.description},
          ${data.logoUrl}, ${data.faviconUrl}, ${data.primaryColor}, ${data.secondaryColor},
          ${data.accentColor}, ${data.fontFamily}, ${data.phone}, ${data.email},
          ${data.address}, ${data.city}, ${data.state}, ${data.zipCode},
          ${data.country}, ${businessHoursJson}::jsonb, ${data.timezone},
          ${data.facebookUrl}, ${data.instagramUrl}, ${data.googleMapsUrl},
          ${data.yelpUrl}, ${servicesJson}::jsonb, ${data.pricingMode},
          ${data.pricePerPound || '1.75'}, ${data.minimumWeight || 10}, ${data.rushSurcharge || 50},
          ${flatRatePricesJson}::jsonb, ${data.pickupDeliveryFee || '5.00'})
      `);
      
      const newProfile = await db.execute(
        sql`SELECT * FROM business_profiles WHERE id = ${id}`
      );
      res.json(newProfile.rows[0]);
    } catch (error: any) {
      console.error("Error saving business profile:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/upload-asset", multerUpload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const category = req.body.category || 'general';
      const ext = req.file.originalname.split('.').pop();
      const filename = `${category}/${userId}/${Date.now()}-${randomUUID()}.${ext}`;
      
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(filename);
      
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: userId,
        }
      });
      
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucketId}/${filename}`;
      
      res.json({ url: publicUrl, filename: req.file.originalname, size: req.file.size });
    } catch (error: any) {
      console.error("Error uploading asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/ai-agent", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(
        sql`SELECT * FROM ai_agent_configs WHERE user_id = ${userId} LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        return res.json(null);
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error fetching AI agent config:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/ai-agent", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = aiAgentSchema.parse(req.body);
      
      const existingResult = await db.execute(
        sql`SELECT id FROM ai_agent_configs WHERE user_id = ${userId} LIMIT 1`
      );
      
      const commonQuestionsJson = JSON.stringify(data.commonQuestions || []);
      
      if (existingResult.rows.length > 0) {
        const existingId = existingResult.rows[0].id;
        await db.execute(sql`
          UPDATE ai_agent_configs SET
            name = ${data.name}, personality = ${data.personality}, avatar_url = ${data.avatarUrl},
            knowledge_base = ${data.knowledgeBase}, business_context = ${data.businessContext},
            can_take_orders = ${data.canTakeOrders}, can_schedule_pickups = ${data.canSchedulePickups},
            can_answer_pricing = ${data.canAnswerPricing}, can_provide_faq = ${data.canProvideFaq},
            welcome_message = ${data.welcomeMessage}, away_message = ${data.awayMessage},
            common_questions = ${commonQuestionsJson}::jsonb, primary_color = ${data.primaryColor},
            position = ${data.position}, is_enabled = ${data.isEnabled},
            business_profile_id = ${data.businessProfileId}, updated_at = NOW()
          WHERE id = ${existingId}
        `);
        
        const updated = await db.execute(
          sql`SELECT * FROM ai_agent_configs WHERE id = ${existingId}`
        );
        return res.json(updated.rows[0]);
      }
      
      const id = randomUUID();
      await db.execute(sql`
        INSERT INTO ai_agent_configs (id, user_id, business_profile_id, name, personality, avatar_url,
          knowledge_base, business_context, can_take_orders, can_schedule_pickups, can_answer_pricing, can_provide_faq,
          welcome_message, away_message, common_questions, primary_color, position, is_enabled)
        VALUES (${id}, ${userId}, ${data.businessProfileId}, ${data.name}, ${data.personality}, ${data.avatarUrl},
          ${data.knowledgeBase}, ${data.businessContext}, ${data.canTakeOrders}, ${data.canSchedulePickups},
          ${data.canAnswerPricing}, ${data.canProvideFaq}, ${data.welcomeMessage}, ${data.awayMessage},
          ${commonQuestionsJson}::jsonb, ${data.primaryColor}, ${data.position}, ${data.isEnabled})
      `);
      
      const newConfig = await db.execute(
        sql`SELECT * FROM ai_agent_configs WHERE id = ${id}`
      );
      res.json(newConfig.rows[0]);
    } catch (error: any) {
      console.error("Error saving AI agent config:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/service-cards", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(
        sql`SELECT * FROM service_cards WHERE user_id = ${userId} ORDER BY "order" ASC`
      );
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching service cards:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/service-cards", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = serviceCardSchema.parse(req.body);
      
      const id = randomUUID();
      await db.execute(sql`
        INSERT INTO service_cards (id, user_id, project_id, business_profile_id, title, description, icon,
          image_url, price, pricing_note, cta_text, cta_link, "order", is_highlighted, is_featured)
        VALUES (${id}, ${userId}, ${data.projectId}, ${data.businessProfileId}, ${data.title}, ${data.description},
          ${data.icon}, ${data.imageUrl}, ${data.price}, ${data.pricingNote},
          ${data.ctaText}, ${data.ctaLink}, ${data.order}, ${data.isHighlighted}, ${data.isFeatured})
      `);
      
      const newCard = await db.execute(
        sql`SELECT * FROM service_cards WHERE id = ${id}`
      );
      res.json(newCard.rows[0]);
    } catch (error: any) {
      console.error("Error creating service card:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.put("/service-cards/:id", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { id } = req.params;
      const data = serviceCardSchema.parse(req.body);
      
      await db.execute(sql`
        UPDATE service_cards SET
          title = ${data.title}, description = ${data.description}, icon = ${data.icon},
          image_url = ${data.imageUrl}, price = ${data.price}, pricing_note = ${data.pricingNote},
          cta_text = ${data.ctaText}, cta_link = ${data.ctaLink}, "order" = ${data.order},
          is_highlighted = ${data.isHighlighted}, is_featured = ${data.isFeatured}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
      `);
      
      const updated = await db.execute(
        sql`SELECT * FROM service_cards WHERE id = ${id}`
      );
      res.json(updated.rows[0]);
    } catch (error: any) {
      console.error("Error updating service card:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/service-cards/:id", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { id } = req.params;
      
      await db.execute(
        sql`DELETE FROM service_cards WHERE id = ${id} AND user_id = ${userId}`
      );
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting service card:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/videos", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(
        sql`SELECT * FROM website_videos WHERE user_id = ${userId} ORDER BY "order" ASC`
      );
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/videos", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = videoSchema.parse(req.body);
      
      const id = randomUUID();
      await db.execute(sql`
        INSERT INTO website_videos (id, user_id, project_id, title, description, video_type,
          video_url, thumbnail_url, duration, file_size, autoplay, loop, muted, is_published, "order")
        VALUES (${id}, ${userId}, ${data.projectId}, ${data.title}, ${data.description}, ${data.videoType},
          ${data.videoUrl}, ${data.thumbnailUrl}, ${data.duration}, ${data.fileSize},
          ${data.autoplay}, ${data.loop}, ${data.muted}, ${data.isPublished}, ${data.order})
      `);
      
      const newVideo = await db.execute(
        sql`SELECT * FROM website_videos WHERE id = ${id}`
      );
      res.json(newVideo.rows[0]);
    } catch (error: any) {
      console.error("Error creating video:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/videos/:id", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { id } = req.params;
      
      await db.execute(
        sql`DELETE FROM website_videos WHERE id = ${id} AND user_id = ${userId}`
      );
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/calculator-themes", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(
        sql`SELECT * FROM calculator_themes WHERE user_id = ${userId}`
      );
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching calculator themes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/calculator-themes", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = calculatorThemeSchema.parse(req.body);
      
      const id = randomUUID();
      const embedToken = randomUUID();
      const allowedDomainsJson = JSON.stringify(data.allowedDomains || []);
      
      await db.execute(sql`
        INSERT INTO calculator_themes (id, user_id, calculator_id, business_profile_id, name, logo_url,
          primary_color, secondary_color, background_color, text_color, font_family, heading_font,
          custom_css, show_powered_by, embed_token, allowed_domains)
        VALUES (${id}, ${userId}, ${data.calculatorId}, ${data.businessProfileId}, ${data.name}, ${data.logoUrl},
          ${data.primaryColor}, ${data.secondaryColor}, ${data.backgroundColor}, ${data.textColor},
          ${data.fontFamily}, ${data.headingFont}, ${data.customCss}, ${data.showPoweredBy}, ${embedToken},
          ${allowedDomainsJson}::jsonb)
      `);
      
      const newTheme = await db.execute(
        sql`SELECT * FROM calculator_themes WHERE id = ${id}`
      );
      res.json(newTheme.rows[0]);
    } catch (error: any) {
      console.error("Error creating calculator theme:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/integrations", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const result = await db.execute(sql`
        SELECT id, user_id, business_profile_id, integration_type, integration_name, is_connected,
          last_synced_at, connection_error, external_account_id, external_account_name, metadata, scopes, created_at
        FROM user_integrations WHERE user_id = ${userId}
      `);
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/integrations", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const data = integrationSchema.parse(req.body);
      
      const id = randomUUID();
      const metadataJson = JSON.stringify(data.metadata || {});
      const scopesJson = JSON.stringify(data.scopes || []);
      
      await db.execute(sql`
        INSERT INTO user_integrations (id, user_id, business_profile_id, integration_type, integration_name,
          is_connected, external_account_id, external_account_name, metadata, scopes)
        VALUES (${id}, ${userId}, ${data.businessProfileId}, ${data.integrationType}, ${data.integrationName},
          ${data.isConnected}, ${data.externalAccountId}, ${data.externalAccountName},
          ${metadataJson}::jsonb, ${scopesJson}::jsonb)
      `);
      
      const newIntegration = await db.execute(
        sql`SELECT * FROM user_integrations WHERE id = ${id}`
      );
      res.json(newIntegration.rows[0]);
    } catch (error: any) {
      console.error("Error creating integration:", error);
      res.status(400).json({ error: error.message });
    }
  });

  router.delete("/integrations/:id", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      const { id } = req.params;
      
      await db.execute(
        sql`DELETE FROM user_integrations WHERE id = ${id} AND user_id = ${userId}`
      );
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/online-orders", async (req: any, res) => {
    try {
      const userId = req.user?.sub || (req.user as any)?.claims?.sub;
      
      const profileResult = await db.execute(
        sql`SELECT id FROM business_profiles WHERE user_id = ${userId} LIMIT 1`
      );
      
      if (profileResult.rows.length === 0) {
        return res.json([]);
      }
      
      const businessProfileId = profileResult.rows[0].id;
      const result = await db.execute(
        sql`SELECT * FROM online_orders WHERE business_profile_id = ${businessProfileId} ORDER BY created_at DESC LIMIT 100`
      );
      
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching online orders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.put("/online-orders/:id/status", async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await db.execute(
        sql`UPDATE online_orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
      );
      
      const updated = await db.execute(
        sql`SELECT * FROM online_orders WHERE id = ${id}`
      );
      
      res.json(updated.rows[0]);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== AI CHATBOT ENDPOINT ====================
  router.post("/chat", async (req: any, res) => {
    try {
      const { message, tenantId, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const { 
        businessName, 
        services, 
        businessHours, 
        businessPhone, 
        businessEmail, 
        businessAddress,
        commonQuestions,
        canTakeOrders,
        canSchedulePickups,
        canAnswerPricing,
      } = context || {};

      // Build knowledge base context
      let knowledgeContext = `You are a helpful store assistant for ${businessName || 'a laundromat'}. `;
      knowledgeContext += `You should be friendly, helpful, and professional. `;
      
      if (businessPhone) {
        knowledgeContext += `Store phone: ${businessPhone}. `;
      }
      if (businessEmail) {
        knowledgeContext += `Store email: ${businessEmail}. `;
      }
      if (businessAddress) {
        knowledgeContext += `Store location: ${businessAddress}. `;
      }
      if (businessHours) {
        knowledgeContext += `Business hours: ${JSON.stringify(businessHours)}. `;
      }
      if (services && services.length > 0) {
        knowledgeContext += `Services offered: ${services.map((s: any) => `${s.title}${s.price ? ` (${s.price})` : ''}`).join(', ')}. `;
      }
      if (commonQuestions && commonQuestions.length > 0) {
        knowledgeContext += `Common Q&A: ${commonQuestions.map((q: any) => `Q: ${q.question} A: ${q.answer}`).join('; ')}. `;
      }

      // Detect intent
      const lowerMessage = message.toLowerCase();
      let quickReplies: string[] = [];
      let captureEmail = false;
      let responseText = "";

      // Handle common intents locally for speed
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        if (canAnswerPricing && services && services.length > 0) {
          responseText = `Here are our services and pricing:\n\n${services.map((s: any) => `• **${s.title}**: ${s.price || 'Contact us for pricing'}${s.description ? ` - ${s.description}` : ''}`).join('\n')}\n\nWould you like to know more about any specific service?`;
          quickReplies = ["Schedule Pickup", "Hours", "Location"];
        } else {
          responseText = `For pricing information, please call us at ${businessPhone || 'our store'} or email ${businessEmail || 'us'}. We'd be happy to provide a quote!`;
          quickReplies = ["Hours", "Location"];
        }
      } else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
        if (businessHours) {
          const hoursDisplay = Object.entries(businessHours)
            .map(([day, hours]: [string, any]) => `• ${day}: ${hours.open} - ${hours.close}`)
            .join('\n');
          responseText = `Our business hours are:\n\n${hoursDisplay}\n\nIs there anything else I can help you with?`;
        } else {
          responseText = `Please call us at ${businessPhone || 'our store'} for our current hours. We're happy to help!`;
        }
        quickReplies = ["Pricing", "Location", "Schedule Pickup"];
      } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('find')) {
        if (businessAddress) {
          responseText = `We're located at:\n\n📍 ${businessAddress}\n\nNeed directions? Just search for "${businessName}" in your maps app!`;
        } else {
          responseText = `Please call us at ${businessPhone || 'our store'} for directions. We'd love to see you!`;
        }
        quickReplies = ["Pricing", "Hours", "Schedule Pickup"];
      } else if (lowerMessage.includes('pickup') || lowerMessage.includes('delivery') || lowerMessage.includes('schedule')) {
        if (canSchedulePickups) {
          responseText = `Great! I'd be happy to help schedule a pickup. To get started, could you share your email address? We'll send you a confirmation and pickup details.`;
          captureEmail = true;
          quickReplies = [];
        } else {
          responseText = `For pickup and delivery service, please call us at ${businessPhone || 'our store'} or email ${businessEmail || 'us'} to schedule.`;
          quickReplies = ["Pricing", "Hours", "Location"];
        }
      } else if (lowerMessage.includes('order') || lowerMessage.includes('place order')) {
        if (canTakeOrders) {
          responseText = `Awesome! I can help you place an order. First, could you share your email address so we can send you a confirmation?`;
          captureEmail = true;
          quickReplies = [];
        } else {
          responseText = `To place an order, please visit us in store or call ${businessPhone || 'our store'}. We look forward to serving you!`;
          quickReplies = ["Pricing", "Hours", "Location"];
        }
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        responseText = `Hello! Welcome to ${businessName || 'our store'}! How can I help you today? I can answer questions about our services, hours, pricing, and more.`;
        quickReplies = ["Pricing", "Hours", "Location"];
      } else if (lowerMessage.includes('thank')) {
        responseText = `You're welcome! Is there anything else I can help you with?`;
        quickReplies = ["Pricing", "Hours", "Location"];
      } else {
        // Check common questions first
        if (commonQuestions && commonQuestions.length > 0) {
          const matchedQuestion = commonQuestions.find((q: any) => 
            lowerMessage.includes(q.question.toLowerCase().slice(0, 20)) ||
            q.question.toLowerCase().includes(lowerMessage.slice(0, 20))
          );
          if (matchedQuestion) {
            responseText = matchedQuestion.answer;
            quickReplies = ["Pricing", "Hours", "Location"];
          }
        }
        
        // Use AI for complex questions that don't match patterns
        if (!responseText) {
          try {
            const OpenAI = (await import("openai")).default;
            const openai = new OpenAI({
              baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
              apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
            });
            
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { 
                  role: "system", 
                  content: `You are a friendly store assistant for ${businessName || 'a laundromat'}. Keep responses brief (2-3 sentences max).
                  
Store Information:
- Phone: ${businessPhone || 'not provided'}
- Email: ${businessEmail || 'not provided'}
- Address: ${businessAddress || 'not provided'}
- Hours: ${businessHours ? JSON.stringify(businessHours) : 'not provided'}
- Services: ${services && services.length > 0 ? services.map((s: any) => s.title).join(', ') : 'wash-dry-fold, self-service'}
${commonQuestions && commonQuestions.length > 0 ? `FAQs: ${commonQuestions.map((q: any) => `Q: ${q.question} A: ${q.answer}`).join('; ')}` : ''}

Be helpful, warm, and direct. If you don't have specific information, guide them to contact the store. Never make up information.`
                },
                { role: "user", content: message }
              ],
              max_completion_tokens: 150,
            });
            
            responseText = completion.choices[0]?.message?.content || 
              `Thanks for your message! I'm here to help with questions about our services, hours, location, and pricing. What would you like to know?`;
            quickReplies = ["Pricing", "Hours", "Location"];
          } catch (aiError) {
            console.error("AI fallback error:", aiError);
            responseText = `Thanks for your message! I'm here to help with questions about our services, hours, location, and pricing. What would you like to know?`;
            quickReplies = ["Pricing", "Hours", "Location", "Schedule Pickup"];
          }
        }
      }

      res.json({ 
        response: responseText, 
        quickReplies,
        captureEmail,
      });
    } catch (error: any) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ========================================
  // WEBSITE BUILDER PROJECT MANAGEMENT
  // ========================================

  // Get user's site project (or create one if it doesn't exist)
  router.get("/api/website-builder/project", async (req, res) => {
    try {
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Find existing project or create one
      let result = await db.execute(sql`
        SELECT * FROM site_projects WHERE user_id = ${userId} LIMIT 1
      `);

      if (result.rows.length === 0) {
        // Create a new project for this user
        const projectId = randomUUID();
        const subdomain = `site-${userId.slice(0, 8)}`;
        await db.execute(sql`
          INSERT INTO site_projects (id, user_id, name, subdomain, is_published, created_at, updated_at)
          VALUES (${projectId}, ${userId}, 'My Website', ${subdomain}, false, NOW(), NOW())
        `);
        result = await db.execute(sql`
          SELECT * FROM site_projects WHERE id = ${projectId}
        `);
      }

      const project = result.rows[0] as any;
      res.json({
        id: project.id,
        name: project.name,
        subdomain: project.subdomain,
        isPublished: project.is_published,
        publishedUrl: project.is_published ? `https://${project.subdomain}.washbizhub.com` : null,
        publishedAt: project.published_at,
      });
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update project subdomain
  router.patch("/api/website-builder/project/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { subdomain, name } = req.body;

      // Check if subdomain is already taken
      if (subdomain) {
        const existing = await db.execute(sql`
          SELECT id FROM site_projects WHERE subdomain = ${subdomain} AND id != ${projectId}
        `);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: "Subdomain is already taken" });
        }
      }

      await db.execute(sql`
        UPDATE site_projects 
        SET subdomain = COALESCE(${subdomain}, subdomain),
            name = COALESCE(${name}, name),
            updated_at = NOW()
        WHERE id = ${projectId} AND user_id = ${userId}
      `);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ========================================
  // CUSTOM DOMAIN MANAGEMENT
  // ========================================

  // Get domains for a project
  router.get("/api/website-builder/domains/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM custom_domains
        WHERE project_id = ${projectId} AND user_id = ${userId}
        ORDER BY created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add a custom domain
  router.post("/api/website-builder/domains", async (req, res) => {
    try {
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { projectId, domain } = req.body;
      
      if (!projectId || !domain) {
        return res.status(400).json({ error: "Missing projectId or domain" });
      }
      
      // Normalize domain
      const normalizedDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      
      // Check if domain already exists
      const existing = await db.execute(sql`
        SELECT id FROM custom_domains WHERE domain = ${normalizedDomain}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Domain already registered" });
      }
      
      // Import Cloudflare service
      const { cloudflareSaaS } = await import('./services/cloudflare-saas');
      
      let cloudflareHostnameId: string | null = null;
      let verificationRecord: any = null;
      
      // Try to add to Cloudflare if configured
      if (cloudflareSaaS.isConfigured()) {
        try {
          const cfResult = await cloudflareSaaS.addCustomHostname(normalizedDomain);
          cloudflareHostnameId = cfResult.id;
          
          if (cfResult.ssl?.validation_records?.length) {
            verificationRecord = {
              type: 'TXT',
              name: cfResult.ssl.validation_records[0].txt_name,
              value: cfResult.ssl.validation_records[0].txt_value,
            };
          }
        } catch (cfError: any) {
          console.error("Cloudflare error:", cfError);
          // Continue without Cloudflare - user can verify manually later
        }
      }
      
      // Insert into database
      const result = await db.execute(sql`
        INSERT INTO custom_domains (
          id, project_id, user_id, domain, cloudflare_hostname_id,
          status, verification_record, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${projectId}, ${userId}, ${normalizedDomain},
          ${cloudflareHostnameId}, 'pending',
          ${verificationRecord ? JSON.stringify(verificationRecord) : null}::jsonb,
          NOW(), NOW()
        )
        RETURNING *
      `);
      
      res.json({
        ...result.rows[0],
        dnsInstructions: {
          type: 'CNAME',
          name: normalizedDomain,
          value: process.env.MAIN_DOMAIN || 'washbizhub.com',
          note: 'Point your domain to our servers. SSL will be provisioned automatically.',
        },
        verificationRecord: verificationRecord,
      });
    } catch (error: any) {
      console.error("Error adding domain:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a custom domain
  router.delete("/api/website-builder/domains/:domainId", async (req, res) => {
    try {
      const { domainId } = req.params;
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Get domain to check ownership and get Cloudflare ID
      const domainResult = await db.execute(sql`
        SELECT * FROM custom_domains 
        WHERE id = ${domainId} AND user_id = ${userId}
      `);
      
      if (domainResult.rows.length === 0) {
        return res.status(404).json({ error: "Domain not found" });
      }
      
      const domain = domainResult.rows[0] as any;
      
      // Remove from Cloudflare if configured
      if (domain.cloudflare_hostname_id) {
        const { cloudflareSaaS } = await import('./services/cloudflare-saas');
        if (cloudflareSaaS.isConfigured()) {
          try {
            await cloudflareSaaS.deleteCustomHostname(domain.cloudflare_hostname_id);
          } catch (cfError) {
            console.error("Failed to remove from Cloudflare:", cfError);
          }
        }
      }
      
      // Delete from database
      await db.execute(sql`
        DELETE FROM custom_domains WHERE id = ${domainId}
      `);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check domain verification status
  router.post("/api/website-builder/domains/:domainId/verify", async (req, res) => {
    try {
      const { domainId } = req.params;
      const userId = (req as any).userId || (req as any).session?.passport?.user;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const domainResult = await db.execute(sql`
        SELECT * FROM custom_domains 
        WHERE id = ${domainId} AND user_id = ${userId}
      `);
      
      if (domainResult.rows.length === 0) {
        return res.status(404).json({ error: "Domain not found" });
      }
      
      const domain = domainResult.rows[0] as any;
      
      // Check with Cloudflare
      if (domain.cloudflare_hostname_id) {
        const { cloudflareSaaS } = await import('./services/cloudflare-saas');
        if (cloudflareSaaS.isConfigured()) {
          try {
            const cfStatus = await cloudflareSaaS.getCustomHostname(domain.cloudflare_hostname_id);
            
            let status = 'pending';
            let sslStatus = 'pending';
            
            if (cfStatus.status === 'active') {
              status = 'active';
            } else if (cfStatus.status === 'pending') {
              status = 'verifying';
            }
            
            if (cfStatus.ssl?.status === 'active') {
              sslStatus = 'active';
            } else if (cfStatus.ssl?.status === 'pending_validation') {
              sslStatus = 'pending';
            }
            
            // Update database
            await db.execute(sql`
              UPDATE custom_domains 
              SET status = ${status}, 
                  ssl_status = ${sslStatus},
                  last_verification_check = NOW(),
                  verified_at = CASE WHEN ${status} = 'active' THEN NOW() ELSE verified_at END,
                  updated_at = NOW()
              WHERE id = ${domainId}
            `);
            
            return res.json({
              status,
              sslStatus,
              cloudflareStatus: cfStatus.status,
              message: status === 'active' ? 'Domain verified and active!' : 'Verification in progress...',
            });
          } catch (cfError: any) {
            console.error("Cloudflare verification error:", cfError);
          }
        }
      }
      
      // Fallback: simple DNS check
      const dns = await import('dns').then(m => m.promises);
      try {
        const records = await dns.resolveCname(domain.domain);
        const mainDomain = process.env.MAIN_DOMAIN || 'washbizhub.com';
        
        if (records.some((r: string) => r.includes(mainDomain))) {
          await db.execute(sql`
            UPDATE custom_domains 
            SET status = 'active', 
                last_verification_check = NOW(),
                verified_at = NOW(),
                updated_at = NOW()
            WHERE id = ${domainId}
          `);
          
          return res.json({
            status: 'active',
            sslStatus: 'pending',
            message: 'Domain verified! SSL will be provisioned shortly.',
          });
        }
      } catch (dnsError) {
        // DNS not configured yet
      }
      
      res.json({
        status: 'pending',
        sslStatus: 'pending',
        message: 'DNS not yet configured. Please add the CNAME record.',
      });
    } catch (error: any) {
      console.error("Error verifying domain:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ========================================
  // LIVE SITE SERVING
  // ========================================

  // Preview endpoint (authenticated, for unpublished sites)
  router.get("/api/website-builder/preview/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = (req as any).userId || req.session?.passport?.user;
      
      // Verify ownership
      const projectResult = await db.execute(sql`
        SELECT * FROM site_projects WHERE id = ${projectId} AND user_id = ${userId}
      `);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { renderFullPage } = await import('./services/site-renderer');
      
      const project = projectResult.rows[0] as any;
      const pagesResult = await db.execute(sql`
        SELECT * FROM site_pages WHERE project_id = ${projectId} ORDER BY "order" ASC
      `);
      const pages = pagesResult.rows as any[];
      
      const sections: Record<string, any[]> = {};
      for (const page of pages) {
        const sectionsResult = await db.execute(sql`
          SELECT * FROM page_sections WHERE page_id = ${page.id} ORDER BY "order" ASC
        `);
        sections[page.id] = sectionsResult.rows as any[];
      }
      
      const profileResult = await db.execute(sql`
        SELECT * FROM business_profiles WHERE project_id = ${projectId} LIMIT 1
      `);
      
      const siteData = {
        project,
        pages,
        sections,
        businessProfile: profileResult.rows[0] || null,
      };
      
      const pageSlug = req.query.page as string || 'home';
      const html = renderFullPage(siteData, pageSlug);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      console.error("Error generating preview:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Publish/unpublish a site
  router.post("/api/website-builder/publish/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { publish } = req.body;
      const userId = (req as any).userId || req.session?.passport?.user;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify ownership
      const projectResult = await db.execute(sql`
        SELECT * FROM site_projects WHERE id = ${projectId} AND user_id = ${userId}
      `);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const project = projectResult.rows[0] as any;
      const mainDomain = process.env.MAIN_DOMAIN || 'washbizhub.com';
      const publishedUrl = project.subdomain ? `https://${project.subdomain}.${mainDomain}` : null;
      
      await db.execute(sql`
        UPDATE site_projects 
        SET is_published = ${publish === true},
            published_url = ${publish ? publishedUrl : null},
            published_at = ${publish ? sql`NOW()` : null},
            updated_at = NOW()
        WHERE id = ${projectId}
      `);
      
      res.json({ 
        success: true, 
        isPublished: publish === true,
        publishedUrl: publish ? publishedUrl : null,
      });
    } catch (error: any) {
      console.error("Error publishing site:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve tenant websites via subdomain path
  router.get("/s/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
      
      const projectResult = await db.execute(sql`
        SELECT * FROM site_projects WHERE subdomain = ${subdomain} AND is_published = true
      `);
      
      if (projectResult.rows.length === 0) {
        const { renderSiteNotFound } = await import('./services/site-renderer');
        return res.send(renderSiteNotFound());
      }
      
      const project = projectResult.rows[0] as any;
      const { loadSiteData, renderFullPage } = await import('./services/site-renderer');
      const siteData = await loadSiteData(project.id);
      
      if (!siteData) {
        const { renderSiteNotFound } = await import('./services/site-renderer');
        return res.send(renderSiteNotFound());
      }
      
      const html = renderFullPage(siteData, 'home');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      console.error("Error serving site:", error);
      res.status(500).send('<h1>Error loading site</h1>');
    }
  });

  // Serve tenant page via subdomain path
  router.get("/s/:subdomain/:pageSlug", async (req, res) => {
    try {
      const { subdomain, pageSlug } = req.params;
      
      const projectResult = await db.execute(sql`
        SELECT * FROM site_projects WHERE subdomain = ${subdomain} AND is_published = true
      `);
      
      if (projectResult.rows.length === 0) {
        const { renderSiteNotFound } = await import('./services/site-renderer');
        return res.send(renderSiteNotFound());
      }
      
      const project = projectResult.rows[0] as any;
      const { loadSiteData, renderFullPage } = await import('./services/site-renderer');
      const siteData = await loadSiteData(project.id);
      
      if (!siteData) {
        const { renderSiteNotFound } = await import('./services/site-renderer');
        return res.send(renderSiteNotFound());
      }
      
      const html = renderFullPage(siteData, pageSlug);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      console.error("Error serving site page:", error);
      res.status(500).send('<h1>Error loading page</h1>');
    }
  });

  return router;
}
