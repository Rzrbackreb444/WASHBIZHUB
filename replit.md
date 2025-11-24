# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform targeting two distinct markets:

1.  **WashBizHub.com**: An enterprise (B2B) SaaS platform for the laundromat industry, offering ERP, IoT integration, POS, route optimization, AI consulting, website building, and analytics. It aims to be the "Bloomberg Terminal for Laundromats."
    
    **MAJOR STRATEGIC PIVOT (Nov 2024)**: 
    - **UNIVERSAL CLEANBI System** launched - backend works for ANY address GLOBALLY (businesses AND residential properties)
    - **Dual Market**: Commercial businesses (laundromats, restaurants, retail, gyms, car washes, gas stations, hotels, salons) + Residential real estate (homes, condos, investment properties)
    - **Global Reach**: Works in 220+ countries via Google Maps API - Philippines, Japan, Australia, UK, EU, Asia, Africa, Americas
    - **Distribution**: Chrome extension "CLEANBI Anywhere" for viral spread across business marketplaces (LoopNet, BizBuySell) + real estate sites (Zillow, Realtor.com, Redfin)
    - **GLOBAL Market Expansion**:
      - **US Market**: 18M business buyers + 10M real estate investors = 28M addresses
      - **Global Market**: 120M+ addressable users across 220+ countries
      - **Revenue Potential**: $18B total addressable market (120M × $150 avg report)
      - **At 1% penetration**: $180M annual revenue
      - **Subscriptions**: 1M global subscribers × $29/mo = $348M ARR potential
    
2.  **STROKE RECOVERY ECOSYSTEM**: A healthcare platform centered around **StrokeRecoveryAcademy.com**, which provides educational courses with AI-powered curricula, a community forum, medication/appointment/exercise tracking with an AI companion, and peer-to-peer knowledge sharing. Satellite domains (StrokeLyfe.app, StrokeLyfe.org) serve as marketing and nonprofit entry points redirecting to the main academy.

The platform's core ambition is to achieve market leadership by leveraging multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) for personalized experiences and authentic expertise.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18, TypeScript, Wouter for routing, and TanStack Query for state management. It uses Radix UI and shadcn/ui for components, styled with Tailwind CSS to achieve a Bloomberg-inspired aesthetic. Features include real-time updates via WebSockets, responsive dashboards with Chart.js/Recharts, and PWA support. Development is handled with Vite.

### Backend Architecture
The backend uses Node.js and Express in TypeScript, providing RESTful JSON APIs and WebSockets. It employs Drizzle ORM with PostgreSQL (Neon serverless) and is event-driven with Redis pub/sub. Key services include POS, IoT & Diagnostics, Route Optimization, AI Consultant, Analytics, Website Hosting, and Google Integrations. It features role-based access control and a multi-tenant design.

**Core Services & Features:**
-   **POS System:** Manages orders, pricing, payments (Stripe), and multi-location support.
-   **IoT & Diagnostics:** Ingests sensor data (MQTT/HTTPS) for machine telemetry and predictive maintenance.
-   **Route Optimization:** Uses Google Maps and OR-Tools for logistics, GPS tracking, and Twilio for SMS.
-   **AI Consultant:** Orchestrates multiple AI models (Anthropic, Gemini, Perplexity, Grok) with a RAG pipeline and pgvector.
-   **Analytics:** Provides materialized views and scheduled aggregations for business metrics.
-   **Website Hosting:** Offers multi-tenant provisioning, custom domains, and CDN integration (Cloudflare).
-   **Google Integrations:** Connects with Google Search Console, SERP API, Workspace, and Cloud APIs.
-   **Resources Hub:** Provides industry-specific resources with secure filtering.
-   **ULTIMATE SEO BLOG SUITE (300+ BLOGS):** Multi-AI orchestration system (Anthropic, Gemini, Perplexity, Grok) generating 300+ SEO-optimized blogs across 3 markets (business buying, real estate, laundromat). Each blog includes perfect meta tags, Open Graph, Twitter Cards, schema.org markup, canonical URLs, breadcrumbs, alt text, PDF export, internal linking to CLEANBI tool, and SERP ranking tracking. Targets 50+ high-value keywords with daily automated content generation using free AI tiers.
-   **GLOBAL EMAIL CAPTURE SUITE:** Industry-segmented newsletter system with 3 tables (subscribers, campaigns, events). Tracks email capture by industry (business_buying, real_estate, laundromat), country (220+ supported), lead source (blog_pdf, cleanbi_tool), and engagement metrics. Integrates with Resend for automated campaigns, tracks opens/clicks/bounces, lead scoring (0-100), and conversion attribution. Supports targeted email blasts by industry, geography, and lead score.
-   **GLOBAL SEO/AEO TRACKING:** Comprehensive system tracking keyword rankings (SERP API), organic traffic analytics by country/source, Answer Engine Optimization performance (Google SGE, Perplexity, ChatGPT citations), and competitor analysis. Links blogs to keyword performance, tracks conversions per blog, and monitors 50+ target keywords across global markets.
-   **REGIONAL PRICING SYSTEM:** PPP-adjusted pricing for 220+ countries with multi-currency support (USD, PHP, JPY, AUD, GBP, EUR). Tracks Stripe price IDs per country, enables/disables markets, and supports phased rollout starting with 6 priority markets.
-   **CLEANBI Intelligence System:** Google-powered tool for scoring ANY address globally (businesses AND residential properties), including an auto-calculator and a Chrome extension for viral distribution.
-   **CLEANBI OPTIMIZATION INFRASTRUCTURE (Nov 2024):** Production-grade optimization stack for global scale + MRR/ARR maximization:
    *   **Shared Metrics Service** (`shared-cleanbi-metrics.ts`): Regional baselines for 220+ countries with PPP-adjusted normalization, reusable calculations (revenue, NOI, ROI, DSCR, valuation), and improved confidence scoring that penalizes imputation (0.95^imputationCount).
    *   **Tiered Subscription System** (`cleanbi-subscription-manager.ts`): 7 revenue tiers (FREE: 3 reports/mo, PRO: $29/mo 50 reports, ENTERPRISE: $149/mo unlimited, WHITE_LABEL: $999/mo, API tiers: $99-$499/mo), usage tracking via cleanbiUsage table with composite indexes, quota enforcement, overage billing ($2/report), Stripe integration, MRR/ARR calculation.
    *   **Redis Caching Layer** (`cleanbi-cache-layer.ts`): Redis primary + memory fallback, initialized on server startup, generic cachedFetch<T>() wrapper, batch operations, TTL recommendations by data type (geocode: 7d, places: 1d, demographics: 30d), cache analytics with hit rate tracking. Target: 85%+ hit rate, 10x API call reduction.
    *   **Rate Limiting System** (`cleanbi-rate-limiter.ts`): Per-API quota protection (Google Maps: 40K/mo, Places: 2.5K/day, SERP: 100/mo), sliding window rate limiter, rateLimitedCall() and rateLimitedBatch() wrappers, quota monitoring with alerts (warning 80%, critical 95%).
    *   **Batched API Pipeline** (`cleanbi-batched-pipeline.ts`): Reduces 10+ sequential API calls to 1-2 parallel batched calls, integrated with caching & rate limiting, parallel batching (geocode + place details + nearby search), bulk processing with automatic backoff, performance measurement.
    *   **Integration Wrapper** (`cleanbi-engine-wrapper.ts`): Production entry point that connects all infrastructure, calculateCLEANBIScore() main function, bulk processing support, usage tracking & quota enforcement.
    *   **Database Optimizations**: cleanbiUsage table with composite indexes (user_id, month, report_type) for fast quota queries, optimized usage tracking using indexed columns.
    *   **Revenue Projections**: Target 165 subscribers = $16,835 MRR = $202K ARR. At 1% global penetration (120M addresses) = $180M ARR potential.
-   **Google Maps Integration:** Server-side geocoding and interactive map components displaying listings and HQ.
-   **Search Engine Indexing:** Admin panel for IndexNow (Bing, etc.) and Google Indexing API integration for dynamic sitemaps and bulk submission.
-   **Affiliate Blogs & Consultation:** Optimized content for financing guides, featured carousels on the homepage, and a consultation landing page with comprehensive SEO.

### Data Storage Solutions
Primary data storage is PostgreSQL (Neon Serverless) via Drizzle ORM. Redis is used for pub/sub, session storage, and caching. BullMQ handles background jobs, and EMQX is the MQTT broker for IoT.

### Authentication and Authorization
Authentication uses Replit Auth (OIDC), with sessions in PostgreSQL. Role-based access control is implemented via an `isAdmin` field. Security includes Zod validation, authorization patterns, and protection of server-controlled fields.

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
-   **Email Services (Resend/SendGrid):** User notifications and marketing.
-   **Twilio:** Two-way SMS for route optimization.
-   **Google APIs:** Places, Reviews, Distance Matrix, Geocoding, Search Console, SERP, Workspace, Cloud APIs, Indexing API.
-   **IndexNow:** For search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).