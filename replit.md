# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform with two main verticals: **WashBizHub.com** and **StrokeRecoveryAcademy.com**.

**WashBizHub.com** is a professional SaaS platform for the laundromat industry, providing business intelligence, market analysis, AI consulting, valuation tools, and industry resources. It has evolved into the "UNIVERSAL CLEANBI System," capable of analyzing any address globally across 220+ countries using Google Maps API, targeting a global market with revenue potential through reports and subscriptions. A Chrome extension, "CLEANBI Anywhere," enhances distribution.

**StrokeRecoveryAcademy.com** is a healthcare platform offering AI-powered educational courses, a community forum, tracking tools (medication, appointments, exercise) with an AI companion, and peer-to-peer knowledge sharing.

The platform aims for market leadership by leveraging multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) to deliver personalized experiences and authentic expertise across both verticals.

## User Preferences
Preferred communication style: Simple, everyday language.

**Development Philosophy:**
- ENHANCE existing features, don't rebuild from scratch
- NO creating duplicate/new pages when existing ones can be improved
- Keep codebase clean - delete orphaned files immediately
- One homepage, one version of each feature

Branding Guidelines:
- Do NOT use "Bloomberg of Laundromats" terminology - this branding has been retired
- WashBizHub is the #1 laundromat resource and educational hub
- CLEANBI is the universal property intelligence scoring system

**CLEANBI™ Grading System (MANDATORY - Chrome Web Store Style):**
- ONLY A, B, C are positive grades. NEVER use D or F grades.
- Everything below C is labeled "Needs Work" (encouraging, not negative)
- Grade thresholds:
  - A = 85+ (Excellent opportunity)
  - B = 70-84 (Good opportunity)
  - C = 55-69 (Fair opportunity)
  - Needs Work = Below 55 (Requires strategic improvements)
- Colors: A=#22C55E (green), B=#A3E635 (lime), C=#FBBF24 (amber), Needs Work=#C8A661 (gold)
- Opportunity levels should also be positive: "Gold Mine Zone", "High Opportunity", "Good Potential", "Room to Grow", "Strategic Location"

Owner Contact & Notifications:
- Owner phone: 479-883-4314 (AT&T)
- SMS notifications enabled for AI chat messages via AT&T email-to-SMS gateway (4798834314@txt.att.net)
- All AI chat widget messages trigger instant SMS + email notifications to owner
- Backup notifications sent to nick@washbizhub.com

## System Architecture

### Frontend Architecture
The frontend uses React 18, TypeScript, Wouter for routing, and TanStack Query for state management. It leverages Radix UI and shadcn/ui for components, styled with Tailwind CSS. Key features include real-time updates via WebSockets, responsive dashboards with Chart.js/Recharts, and PWA support. Development is managed with Vite.

### Backend Architecture
The backend is built with Node.js and Express in TypeScript, offering RESTful JSON APIs and WebSockets. It uses Drizzle ORM with PostgreSQL (Neon serverless) and is event-driven with Redis pub/sub. It supports role-based access control and a multi-tenant design.

**Core Services & Features:**
- **POS Command Center:** An enterprise dashboard (`/pos`) with modules for real-time KPIs, order management (WDF/PUD/Self-Service with Stripe), CRM, IoT machine status, route planning, analytics, and inventory management.
- **IoT & Diagnostics:** Ingests sensor data for machine telemetry and predictive maintenance.
- **Route Optimization:** Utilizes Google Maps and OR-Tools for logistics, GPS tracking, and Twilio integration.
- **AI Consultant:** Orchestrates multiple AI models (Anthropic, Gemini, Perplexity, Grok) with a RAG pipeline and pgvector for contextual responses.
- **Analytics:** Provides materialized views and scheduled aggregations for business metrics.
- **Website Hosting:** Offers multi-tenant provisioning, custom domains, and CDN integration (Cloudflare).
- **Google Integrations:** Connects with various Google APIs.
- **Resources Hub:** Provides industry-specific resources with secure filtering.
- **Ultimate SEO Blog Suite:** Multi-AI orchestration system for generating SEO-optimized blogs across three markets with internal linking to CLEANBI.
- **Global Email Capture Suite:** Industry-segmented newsletter system with Resend integration for automated campaigns.
- **Global SEO/AEO Tracking:** Comprehensive system for tracking keyword rankings (SERP API), organic traffic, and competitor analysis.
- **Regional Pricing System:** PPP-adjusted pricing for 220+ countries with multi-currency support and Stripe integration.
- **CLEANBI Intelligence System:** A multi-source property intelligence tool for scoring any address globally (businesses and residential properties), including an auto-calculator and a Chrome extension.
    - **CLEANBI Multi-Source Data Enrichment:** Production data pipeline integrating Census Bureau (ACS demographics), ATTOM API (property values), and Google Places (geocoding, competitor search). Features a 6-factor weighted scoring system, tiered access control, and confidence scoring.
    - **CLEANBI 2.0 Scoring Algorithm (Industry-Calibrated):**
        - **Quick Score Weights (Location-Only):** Demographics 45%, Competition 30%, Quality 15%, Confidence 10%
        - **Demographic Scoring:** Renter % (40-70% optimal), Income bell curve to $55K, Density 2000-5000/sq mi
        - **Competition Saturation Formula:** `100 - normalize((competitors × 1000) / household_density)`
        - **Trade Area:** 1-mile radius (87% of laundromat customers live within 1 mile per industry research)
        - **Census Data:** County-level with urban core density estimation for accurate local scoring
        - **ZIP Prefix Mapping (Nationwide):** 752 comprehensive ZIP prefix mappings covering all 50 US states + DC, including:
            - All 100 top Facebook member cities with verified FIPS county codes
            - All top 50 metros by population (NYC, LA, Chicago, Houston, Phoenix, etc.)
            - All state capitals and major regional hubs
            - Arkansas full coverage (Fort Smith, Little Rock, Fayetteville, Bentonville, Jonesboro)
        - **International Demographics (15.5% of members):** 40+ major international cities across top member countries:
            - Nigeria (Lagos, Abuja, Port Harcourt, Ibadan, Kano)
            - Philippines (Manila, Quezon City, Cebu, Davao, Makati)
            - India (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune)
            - Canada (Toronto, Vancouver, Montreal, Calgary, Edmonton, Ottawa)
            - Australia (Sydney, Melbourne, Brisbane, Perth, Adelaide)
            - UK (London, Birmingham, Manchester, Leeds, Glasgow)
            - UAE (Dubai, Abu Dhabi, Sharjah)
            - Plus South Africa, Kenya, Mexico, Ghana with PPP-adjusted income values
        - **Country-Level Defaults:** 30+ countries with demographic fallbacks for global coverage
    - **CLEANBI Optimization Infrastructure:** Includes a shared metrics service, tiered subscription system with Stripe webhook synchronization, Redis caching, Redis rate limiter, and a batched API pipeline.
    - **CLEANBI Explorer (`/cleanbi-explorer`):** Full-screen immersive map experience with 3D aerial views, competition heatmaps, and proprietary AI scoring. Features include:
        - Google Maps integration with dark-theme styling
        - Real-time CLEANBI™ scoring with A-C grades (Chrome Web Store style)
        - Competitor mapping with Google Places API
        - Street View integration
        - Shareable analysis links for viral distribution
        - Multi-tier rate limiting (free: 5/min, 20/day; starter: 20/min, 100/day; pro: 50/min, 500/day; enterprise: 200/min, 5000/day)
        - Aggressive caching strategy (80%+ cost reduction target)
        - **Email Capture Gate:** First-time users prompted for email before seeing full analysis; resilient UX with "Skip for now" option, client-side validation, and graceful error handling; leads stored in newsletterSubscribers table
- **Deal Flow Dashboard (`/laundromat-listings`):** Searchable listings with price range filters, state selection, real estate toggle, CLEANBI integration buttons, and funding quick actions
- **Funding Marketplace (`/funding-matcher`):** 7 integrated funding partners (ARF Financial, Direct Capital, Kabbage, PayPal Working Capital, GreenBox Capital, Credibly, OnDeck) with 3-step lead capture, risk-based matching algorithm, and affiliate tracking
- **Verified Directory (`/directory`):** Industry service provider directory with tiered subscriptions (Free, Premium $499/mo, Featured $1,400/mo), verified/premium badges, and sample data for Brokers, Funders, and Equipment Vendors
- **Affiliate Blog Systems:** Bulk generation systems for SEO-optimized blogs featuring affiliate links for financing.
- **Business Directory System:** Freemium vendor/service provider directory with tiered subscriptions.
- **Revenue Conversion Funnel Tools:**
    - **SBA Loan Readiness Checker (`/sba-readiness`):** Free 2-minute lead magnet quiz with 5 questions about credit score, down payment, experience, collateral, and business plan readiness. Uses CLEANBI grading system (A≥85, B=70-84, C=55-69, Needs Work<55). Captures email before showing results, with upsells to Business Plan Generator and Larry Larsen consultation.
    - **AI Business Plan Generator (`/business-plan-generator`):** $299 premium tool with 3-step wizard form. Generates SBA-ready business plans with 5-year financial projections. Integrates Stripe hosted checkout with server-side payment verification before plan generation. Backend verifies payment status before allowing generation.

### Calculator & Formula Ecosystem (80+ Unique Formulas)
- **Standalone Calculator Pages:** 9 interactive tools including TPD, ROI Analyzer, Equipment Payback, Financing Pro, Water Usage Verifier, Revenue Forecaster Pro, Pricing Optimizer, ROI Pro, and Turns Per Day.
- **CLEANBI Intelligence Suite:** 8 integrated calculators (CLEANBI Score Calculator, Machine Yield Projector, Break-Even Analysis, Energy Cost Analyzer, Dynamic Pricing Optimizer, Expansion Planner, Financing Calculator, Staff Productivity Metrics) with CLEANBI A/B/C/D/F grading.
- **Core Algorithm Library:** Includes the 17-factor weighted CLEANBI™ Score Calculation, Sensitivity Analysis, What-If Simulator, Delta Attribution, Monte Carlo Simulation, Repair or Replace logic, and Saturation Score.
- **Shared Calculator Library:** Comprises 50 functions covering Core Valuation & Financial, Financial Analysis, Operational & Real Estate, Marketing & Growth, Insurance & Startup, Advanced Financial, and Operational Advanced.
- **API-Powered Intelligence:** Integrates with 14 external services, including OpenAI, Anthropic Claude, Google Gemini, Google Vision AI for AI/ML, ATTOM Data, US Census Bureau, Google Maps Platform, Google Aerial View, Mapbox for property/location intelligence, Stripe, PayPal for payments, and SendGrid/PDF Generator for emails/documents.
- **Funding Eligibility System:** Determines SBA loan eligibility and matches partners by risk level based on DSCR, EBITDA margin, business age, and CLEANBI Score.

### Data Storage & Authentication
PostgreSQL (Neon Serverless) is the primary data store via Drizzle ORM. Redis is used for pub/sub, sessions, and caching. BullMQ manages background jobs, and EMQX serves as the MQTT broker for IoT. Replit Auth (OIDC) handles authentication with PostgreSQL for sessions and role-based access control.

## External Dependencies

### Payment Processing
- **Stripe:** For subscriptions, one-time purchases, and webhooks.
- **PayPal:** Alternative processing, international payments.

### AI Services
- **OpenAI GPT-4o/4o-mini:** Deal Scoring, Content Generation, RAG Embeddings.
- **Anthropic Claude:** Complex reasoning, long-form analysis.
- **Google Gemini:** Research, data analysis, layout, equipment appraisal.
- **Perplexity:** Fact-based article generation.
- **Grok:** Trending topic content.

### UI Component Library
- **Radix UI:** Accessible, unstyled primitives.
- **Lucide React:** Icon library.
- **React Konva:** Canvas-based 2D design studio.
- **Chart.js / Recharts:** Data visualization.
- **React Hook Form + Zod:** Form validation.
- **@vis.gl/react-google-maps:** Google Maps integration.

### Third-Party Integrations
- **Amazon Affiliate Program:** Product marketplace links via Product Advertising API 5.0.
- **ATTOM Data:** Real estate and demographic data.
- **US Census Bureau:** Demographic data (ACS 5-Year).
- **Mapbox:** Location mapping and analysis.
- **Resend/SendGrid:** Email services for notifications and marketing.
- **Twilio:** Two-way SMS for route optimization.
- **Google APIs:** Places, Reviews, Distance Matrix, Geocoding, Search Console, SERP, Workspace, Cloud APIs, Indexing API.
- **IndexNow:** For search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).