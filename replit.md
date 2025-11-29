# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform with two main focuses: **WashBizHub.com** and **StrokeRecoveryAcademy.com**.

**WashBizHub.com** is a professional SaaS platform for the laundromat industry, providing business intelligence, market analysis, AI consulting, valuation tools, and industry resources. It has undergone a strategic pivot to the "UNIVERSAL CLEANBI System," expanding its backend to analyze any address globally (businesses and residential properties) across 220+ countries using the Google Maps API. This expansion targets a global market of over 120 million users, with significant revenue potential through reports and subscriptions. Distribution is enhanced via a Chrome extension, "CLEANBI Anywhere," targeting business marketplaces and real estate sites.

**StrokeRecoveryAcademy.com** is a healthcare platform offering educational courses with AI-powered curricula, a community forum, tracking tools (medication, appointments, exercise) with an AI companion, and peer-to-peer knowledge sharing. Satellite domains (StrokeLyfe.app, StrokeLyfe.org) support marketing and non-profit initiatives.

The platform aims for market leadership by leveraging multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) to deliver personalized experiences and authentic expertise across both verticals.

## User Preferences
Preferred communication style: Simple, everyday language.

Branding Guidelines:
- Do NOT use "Bloomberg of Laundromats" terminology - this branding has been retired
- WashBizHub is the #1 laundromat resource and educational hub
- CLEANBI is the universal property intelligence scoring system

Owner Contact & Notifications:
- Owner phone: 479-883-4314 (AT&T)
- SMS notifications enabled for AI chat messages via AT&T email-to-SMS gateway (4798834314@txt.att.net)
- All AI chat widget messages trigger instant SMS + email notifications to owner
- Backup notifications sent to nick@washbizhub.com

## System Architecture

### Frontend Architecture
The frontend uses React 18, TypeScript, Wouter for routing, and TanStack Query for state management. It leverages Radix UI and shadcn/ui for components, styled with Tailwind CSS. Key features include real-time updates via WebSockets, responsive dashboards with Chart.js/Recharts, and PWA support. Development is managed with Vite.

### Backend Architecture
The backend is built with Node.js and Express in TypeScript, offering RESTful JSON APIs and WebSockets. It uses Drizzle ORM with PostgreSQL (Neon serverless) and is event-driven with Redis pub/sub. Core services include POS, IoT & Diagnostics, Route Optimization, AI Consultant, Analytics, Website Hosting, and Google Integrations. It supports role-based access control and a multi-tenant design.

**Core Services & Features:**
-   **POS Command Center:** Professional enterprise dashboard at `/pos` with 7 integrated modules:
    *   **Dashboard:** Real-time KPIs (revenue, orders, customers, machines) with glassmorphism design
    *   **Orders:** WDF/PUD/Self-Service order management with Stripe integration
    *   **Customers:** CRM with LTV tracking, order history, and customer cards
    *   **Machines:** IoT status indicators, maintenance alerts, and equipment tracking
    *   **Routes:** Pickup/Delivery route planning with stop tracking
    *   **Analytics:** Professional BI with revenue trends, order charts, service breakdowns, and heat maps
    *   **Inventory:** Parts tracking, stock alerts, and vendor management
    *   API routes at `/api/pos/*` with full CRUD operations
-   **IoT & Diagnostics:** Ingests sensor data for machine telemetry and predictive maintenance.
-   **Route Optimization:** Uses Google Maps and OR-Tools for logistics, GPS tracking, and Twilio.
-   **AI Consultant:** Orchestrates multiple AI models (Anthropic, Gemini, Perplexity, Grok) with a RAG pipeline and pgvector for contextual responses.
-   **Analytics:** Provides materialized views and scheduled aggregations for business metrics.
-   **Website Hosting:** Offers multi-tenant provisioning, custom domains, and CDN integration (Cloudflare).
-   **Google Integrations:** Connects with various Google APIs for search, workspace, and cloud services.
-   **Resources Hub:** Provides industry-specific resources with secure filtering.
-   **ULTIMATE SEO BLOG SUITE:** Multi-AI orchestration system generating 300+ SEO-optimized blogs across three markets (business buying, real estate, laundromat), with comprehensive metadata and internal linking to the CLEANBI tool.
-   **GLOBAL EMAIL CAPTURE SUITE:** Industry-segmented newsletter system with Resend integration for automated campaigns, tracking engagement, lead scoring, and conversion attribution.
-   **GLOBAL SEO/AEO TRACKING:** Comprehensive system for tracking keyword rankings (SERP API), organic traffic, Answer Engine Optimization performance, and competitor analysis, linking blog performance to conversions.
-   **REGIONAL PRICING SYSTEM:** PPP-adjusted pricing for 220+ countries with multi-currency support, tracking Stripe price IDs and supporting phased market rollouts.
-   **CLEANBI Intelligence System:** A Google-powered tool for scoring any address globally (businesses and residential properties), including an auto-calculator and a Chrome extension for viral distribution.
-   **CLEANBI Optimization Infrastructure:** Production-grade optimization stack including:
    *   **Shared Metrics Service:** Regional baselines with PPP-adjusted normalization and reusable calculations.
    *   **Tiered Subscription System:** Seven revenue tiers with Stripe webhook synchronization, usage tracking, quota enforcement, and overage billing.
    *   **Redis Caching Layer:** Primary Redis cache with memory fallback, aiming for high hit rates and API call reduction.
    *   **Redis Infrastructure:** Robust connection manager and atomic sliding-window rate limiter using Lua scripts for cross-instance quota protection and graceful degradation.
    *   **Batched API Pipeline:** Reduces sequential API calls to parallel batched calls, integrated with Redis caching and rate limiting.
    *   **Integration Wrapper:** Production entry point for the CLEANBI system, handling usage tracking and quota enforcement.
    *   **Database Migrations:** Automated system ensuring critical tables and indexes are in place on server startup.
-   **Affiliate Blog Systems (AADVANTAGE, DAVID ALLEN CAPITAL, SOUTH END CAPITAL):** Bulk generation systems for SEO-optimized blogs featuring affiliate links for laundry equipment financing, general business financing across diverse industries, and SBA loans/commercial financing, respectively.
-   **Business Directory System:** Freemium vendor/service provider directory with tiered subscriptions:
    *   **Free Tier:** Basic listing with business info, contact details, services
    *   **Boost ($99/mo):** Featured spots, analytics dashboard
    *   **Spotlight ($249/mo):** Homepage hero placement, calculator sidebars
    *   **Pro Bundle ($499/mo):** Newsletter features, marketplace banners
    *   Routes: `/directory`, `/directory/:slug`, `/list-business`
    *   Email routing: listings@washbizhub.com (submissions), sales@washbizhub.com (upgrades)

## Strategic Partnerships

### Larry "Laundromat Larry" Larsen - Featured Consultant
- **Experience:** 50+ years in laundromat industry
- **Location:** Orange County, California
- **Platform Email:** larry@washbizhub.com
- **Revenue Split:** 50/50 on consulting referrals
- **Services:** Due Diligence, Buyer Consulting, Insurance Education, Expert Witness, Store Design, Equipment Evaluation, Lease Analysis, Broker Services
- **Status:** Featured Pro listing, verified badge, homepage hero placement
- **IMPORTANT:** All consultations route through WashBizHub platform (/consultation) - do NOT display external phone or website to preserve lead capture

## Competitive Strategy

### Primary Competitor: LaundryWizard.com (Brad Pollack)
- Brad Pollack pays to advertise in our Facebook group - we control his distribution
- LaundryWizard has 24+ years industry presence but dated 2001 technology
- Their model: FREE listings → lead gen → affiliate commissions from suppliers

### Our Unfair Advantages:
1. **We own the 72K+ Facebook group** - the distribution channel Brad pays for
2. **CLEANBI** - AI-powered property intelligence (no competitor has this)
3. **Service Guy AI** - 2,200+ error code diagnostics
4. **Larry Larsen partnership** - 50+ years experience, exclusive to WashBizHub
5. **Modern AI stack** - Multi-model orchestration vs. Brad's 2001 tech

### Strategic Positioning:
- Don't compete on equipment classifieds (Brad's strength)
- Own the "intelligence" layer - CLEANBI for due diligence, Service Guy AI for diagnostics
- Target the pre-purchase journey before buyers need equipment
- See COMPETITIVE_STRATEGY.md for full battle plan

### Email Routing (9 addresses configured):
- info@washbizhub.com - General inquiries
- contact@washbizhub.com - Contact form submissions
- support@washbizhub.com - Customer support
- consult@washbizhub.com - Consulting inquiries
- funding@washbizhub.com - Financing/funding inquiries
- partner@washbizhub.com - Partnership opportunities
- sales@washbizhub.com - Premium upgrades, advertising
- insurance@washbizhub.com - Insurance inquiries (routed to Larry)
- listings@washbizhub.com - Directory listing submissions

### Data Storage Solutions
PostgreSQL (Neon Serverless) is the primary data store via Drizzle ORM. Redis is used for pub/sub, sessions, and caching. BullMQ manages background jobs, and EMQX serves as the MQTT broker for IoT.

### Authentication and Authorization
Replit Auth (OIDC) handles authentication, with sessions stored in PostgreSQL. Role-based access control is implemented using an `isAdmin` field. Security includes Zod validation and robust authorization patterns.

## External Dependencies

### Payment Processing
-   **Stripe:** For subscriptions, one-time purchases, and webhooks.

### AI Services
-   **OpenAI GPT-4:** For structured professional content.
-   **Anthropic Claude:** For long-form writing and analysis.
-   **Google Gemini:** For research, data analysis, and layout.
-   **Perplexity:** For fact-based article generation.
-   **Grok:** For trending topic content.

### UI Component Library
-   **Radix UI:** Accessible, unstyled primitives.
-   **Lucide React:** Icon library.
-   **React Konva:** Canvas-based 2D design studio.
-   **Chart.js / Recharts:** Data visualization.
-   **React Hook Form + Zod:** Form validation.
-   **@vis.gl/react-google-maps:** Google Maps integration.

### Third-Party Integrations
-   **Amazon Affiliate Program:** Product marketplace links via Product Advertising API 5.0.
-   **ATTOM Data:** Real estate and demographic data.
-   **Mapbox:** Location mapping and analysis.
-   **Resend/SendGrid:** Email services for notifications and marketing.
-   **Twilio:** Two-way SMS for route optimization.
-   **Google APIs:** Places, Reviews, Distance Matrix, Geocoding, Search Console, SERP, Workspace, Cloud APIs, Indexing API.
-   **IndexNow:** For search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).