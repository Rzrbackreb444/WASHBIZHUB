# WashBizHub - The Bloomberg of Laundromats

## Overview
WashBizHub is a **world-class enterprise SaaS platform** for the laundromat industry serving **72,000+ potential customers**. It integrates: full POS system with per-pound pricing, IoT machine monitoring, preventive maintenance, pickup/delivery with route optimization, AI-powered consultant, **WYSIWYG website builder with SEO automation**, business intelligence, **Bloomberg Terminal-grade D3.js visualizations**, **50+ interactive calculators**, professional design tools, financial analysis, educational content, and multi-vendor marketplace. **User requirement: "COMPLETE means COMPLETE" - absolute enterprise-grade quality, no shortcuts, maximum ambition.**

The platform combines: 2D/3D design studio, 17-factor CLEANBI™ scoring, buying/selling marketplace, multi-AI content generation (OpenAI, Anthropic, Gemini, Perplexity, Grok), **D3.js + Chart.js hybrid visualization system**, Google Search Console + SERP API integration, Google Maps APIs (33 endpoints), real-time dashboards, and comprehensive SEO/AEO optimization. Vision: Modernize the laundromat industry through IoT, AI-powered dynamic pricing, predictive maintenance, marketing automation, and **professional web presence**.

## User Preferences
Preferred communication style: Simple, everyday language.

## Contact Information
- **Primary Contact:** Nick - SMS/WhatsApp: 1-479-883-4314
- **Email Addresses:**
  - nick@washbizhub.com (primary contact)
  - info@washbizhub.com (auto/manual hybrid newsletter)
  - consult@washbizhub.com (consultation inquiries)
  - funding@washbizhub.com (financing inquiries)
- **Email Service Providers:** Resend, SendGrid

## System Architecture

### Frontend Architecture
React 18 + TypeScript, Wouter routing, TanStack Query state management, Radix UI + shadcn/ui components. Tailwind CSS with Bloomberg-inspired aesthetic (navy #1a2332, gold #C8A661, glassmorphism). Real-time updates via WebSockets (socket.io), responsive dashboards with Chart.js/Recharts, PWA support for driver mobile app. Vite for development.

### Backend Architecture
Node.js + Express (TypeScript), RESTful JSON + WebSockets, Drizzle ORM + PostgreSQL (Neon). **Event-driven architecture** with Redis pub/sub for real-time updates. Service domains: POS, Operations, Logistics, Analytics, AI, Hosting. Role-based access control (owner/manager/attendant/driver/accountant). Multi-tenant architecture with location-based data partitioning.

**Core Services:**
- **POS System:** Per-pound pricing ($1.25-$2.25/lb), order lifecycle, Stripe settlement reconciliation, scale integration, multi-location support
- **IoT & Diagnostics:** MQTT/HTTPS sensor ingestion, machine telemetry (temperature, vibration, water flow, energy), predictive maintenance alerts, repair logs
- **Route Optimization:** Google Maps Distance Matrix + OR-Tools, GPS tracking, geofencing, DoorDash integration, two-way SMS (Twilio)
- **AI Consultant:** Multi-model orchestration (OpenAI, Anthropic, Gemini, Perplexity), RAG pipeline with pgvector embeddings, trained on full Laundromat Bible + templates + calculators + 2,800+ diagnostic codes
- **Analytics:** Materialized views (daily_revenue_fact, machine_turn_fact, driver_route_fact, customer_ltv_fact), scheduled aggregation jobs
- **Website Hosting:** Multi-tenant provisioning, custom domains, SSL via ACME, CDN (Cloudflare), automated SEO optimization
- **Google Integrations:** Search Console API, SERP API, Workspace APIs, Cloud APIs

### Data Storage Solutions
PostgreSQL (Neon Serverless) with Drizzle ORM. **78+ tables** across domains:

**POS & Operations:** pos_transactions, pos_items, weigh_events, payment_settlements, household_accounts, service_orders, order_items, subscriptions, scale_calibrations

**IoT & Maintenance:** machine_assets, telemetry_events, sensor_thresholds, maintenance_plans, repair_tickets, parts_inventory, warranty_records, vendor_purchase_orders, diagnostic_codes

**Logistics:** routes, route_stops, driver_sessions, proof_of_delivery, geofence_zones, delivery_windows, mileage_logs

**Analytics:** daily_revenue_fact, machine_turn_fact, driver_route_fact, customer_ltv_fact, conversion_funnels, cohort_analysis

**AI & Content:** vector_embeddings (pgvector), conversation_logs, knowledge_sources, agent_configs, blog_posts, courses, templates, calculators

**Platform:** users, laundromats, designs, cleanbi_scores, marketplace, forum, website_builder, logo_builder, seo_keywords, competitor_analysis

Redis for pub/sub, session storage, caching. BullMQ for background jobs. MQTT broker (EMQX) for IoT ingestion.

### Authentication and Authorization
The system uses Replit Auth (OIDC) for user authentication, with sessions stored in PostgreSQL via `connect-pg-simple`. Role-based access control is implemented through an `isAdmin` field on the users table. The `isAdmin` middleware protects sensitive administrative operations (creating/updating/deleting resources, vendors, benchmarks). Regular users can view public resources but cannot modify the ecosystem data.

**Security Implementation (November 2025):**
- **getCurrentUser Helper**: Standardized authentication helper that validates `req.user.claims.sub`, fetches user from storage, and returns null for unauthorized requests
- **Zod Validation**: All POST/PATCH routes validate request bodies using insert schemas from `@shared/schema.ts` before database operations
- **Authorization Pattern**: Vendor marketplace routes verify ownership (`store.ownerId === userId`) or admin access (`user.isAdmin`) before updates/deletes
- **Protected Field Enforcement**: PATCH routes use allowlists to prevent client override of server-controlled fields (ownerId, status, views, sales, reviewCount, featured, verified, etc.)
- **Slug Collision Prevention**: storeName, storeSlug, and product slug removed from PATCH allowlists to enforce server-side slug management
- **Equipment Inquiry Security**: Server-controlled fields (assignedTo, status, commissionRate, commissionStatus) enforced for affiliate tracking integrity

### Resources Hub Implementation (November 2025)
A comprehensive industry resource ecosystem with three core modules:

1. **Resources Module** (`resources` table):
   - Calculators, guides, templates, checklists, contracts, case studies
   - Target audience segmentation (owner, investor, broker, technician, customer, etc.)
   - Difficulty levels, ratings, use count tracking
   - Premium content gating via `isPro` flag
   - Full-text search across title/description/tags
   - Secure filtering with SQL injection protection via Drizzle's immutable query builders

2. **Vendor Directory** (`vendors` table):
   - Equipment manufacturers, service providers, suppliers
   - Category-based organization, contact information, certifications
   - Parts inventory tracking via `parts` table with cross-references
   - Geographic reach and specialization tracking
   - Verified vendor badge system

3. **Industry Benchmarks** (`industry_benchmarks` table):
   - Metric tracking (revenue per sqft, utility costs, labor costs, etc.)
   - Location and business size segmentation
   - Industry standards and regional comparisons
   - Data source attribution and credibility tracking

**Technical Implementation:**
- **Backend**: DbStorage class with secure filtering (conditions array + `and()` pattern to prevent SQL injection)
- **API Routes**: RESTful endpoints (`/api/resources`, `/api/vendors`, `/api/benchmarks`) with Zod validation
- **Frontend**: TanStack Query integration with correct React Query pattern (queryFn extracts URL from queryKey to avoid stale closures)
- **Security**: Admin-only mutations protected by `isAdmin` middleware, public read access for all users
- **Null Safety**: All nullable fields (rating, useCount, difficulty, url) have proper guards in rendering

**Critical Fixes Applied:**
1. Drizzle query builders are immutable - must use conditions array with single `.where(and(...conditions))` call
2. React Query queryFn must extract URL from queryKey parameter to avoid stale closure bugs
3. Empty filter arrays must be handled before calling `and()` to prevent SQL errors
4. Admin operations require `isAdmin=true` flag verification on user records

### Newsletter Subscription System (November 2025)
Email capture and subscriber management system for marketing automation:

**Features:**
- Three component variants: hero (full-featured), default (standard form), compact (minimal footer version)
- Email validation and duplicate prevention
- Source tracking (home_page, footer, resources_page, etc.)
- Admin dashboard for subscriber management with status filtering

**Technical Implementation:**
- **Backend Routes**: POST /api/newsletter/subscribe, GET /api/newsletter/subscribers (admin-only), POST /api/newsletter/unsubscribe
- **Database Table**: `email_subscribers` with email, firstName, source, status, subscribedAt, tags
- **Component**: NewsletterSignup.tsx with React Hook Form + Zod validation, TanStack Query mutations
- **Integration**: Deployed on home page hero section, ready for site-wide footer/sidebar placement
- **Email Service**: Configured for Resend/SendGrid integration via info@washbizhub.com

**Deployment:**
- Home page hero section (variant="hero")
- Site-wide footer placement (pending)
- Resources/templates pages (pending)

## External Dependencies

### Payment Processing
- **Stripe:** Used for subscription management, one-time purchases, and webhook handling for products like Pro subscriptions, courses, and book access.

### AI Services
- **OpenAI GPT-4:** For structured professional content.
- **Anthropic Claude:** For long-form writing and detailed analysis.
- **Google Gemini:** For research, data analysis, and layout optimization.
- **Perplexity:** For fact-based article generation.
- **Grok:** For trending topic content.
This multi-provider strategy ensures flexibility, cost optimization, and redundancy.

### UI Component Library
- **Radix UI:** Accessible, unstyled primitives.
- **Lucide React:** Icon library.
- **React Konva:** Canvas-based 2D design studio.
- **Chart.js / Recharts:** Data visualization.
- **React Hook Form + Zod:** Form validation.

### Third-Party Integrations
- **Amazon Affiliate Program:** Product marketplace links using nicholaskreme-20 storefront API
- **ATTOM Data:** For real estate and demographic data
- **Mapbox:** For location mapping and analysis
- **Email Services (Resend/SendGrid):** For user notifications and marketing
- **Admin Notifications:** Email-to-SMS gateway (AT&T) for instant alerts to 4798834314@txt.att.net + nick@washbizhub.com
  - NOTE: Twilio integration was dismissed by user - using free email-to-SMS gateway instead

## Recent Feature Requests (November 21, 2025)

### AI Agents That Learn
- Conversation memory system: agents remember and improve from every interaction
- Context tracking across sessions
- Learning loops: agents get smarter over time
- Knowledge graph building from user conversations

### Template System
- Website builder: save designs as reusable templates
- Template library with community sharing
- Version control for templates
- Template marketplace

### Canva-Style Logo Builder
- Drag-and-drop interface
- Shapes, text, icons library
- SVG export and PNG download
- Brand kit integration

### Platform-Wide Advertising
- Banner ad placement system
- Logo ad management
- Analytics dashboard for ad performance
- Advertiser portal

### Featured Listings & SEO
- Homepage featured content carousel
- Blog integration for listings
- Rich meta tags and social sharing
- Search engine optimization throughout

### Global Platform Search
- Unified search across all content types
- Autocomplete with suggestions
- Search analytics and trending queries
- Quick search in header

### POS System Enhancements
- Integrated calculators (all 50+)
- Template library access
- AI diagnostics with parts ordering
- Predictive maintenance alerts

### UGC & Affiliate Enhancements
- User-generated content moderation
- Viral sharing mechanisms
- 20% commission tracking
- Influencer program management

### Book & Course Interactivity
- Interactive exercises
- Progress tracking
- Quizzes and assessments
- Certificate generation
- Discussion forums per lesson

### Amazon Storefront Integration (✅ IMPLEMENTED November 21, 2025)
- **One-Click Parts Ordering**: Integrated Amazon Product Advertising API 5.0
- **POS System Integration**: PartsOrderWidget available in POS for instant part ordering
- **Platform-Wide Access**: Parts ordering widget can be embedded anywhere
- **Smart Search**: Category-based quick searches (Washer, Dryer, Commercial, Maintenance)
- **Affiliate Tracking**: All orders go through nicholaskreme-20 associate tag
- **Analytics Dashboard**: Track clicks, conversions, and revenue
- **Real-Time Pricing**: Live Amazon pricing with Prime eligibility
- **Auto-Generated Links**: Automatic affiliate link generation for all products

**Technical Implementation:**
- Backend: `server/amazon-api.ts` with AWS Signature V4 authentication
- API Routes: `/api/amazon/search`, `/api/amazon/product/:asin`, `/api/amazon/track-click`
- Frontend: `PartsOrderWidget.tsx` with compact and full modes
- Laundromat Parts Catalog: Pre-configured searches for common parts
- Security: AWS Access Key ID, Secret Access Key stored as secrets