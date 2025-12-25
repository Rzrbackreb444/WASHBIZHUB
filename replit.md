# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform serving the laundromat industry with **WashBizHub.com** and healthcare education with **StrokeRecoveryAcademy.com**. WashBizHub.com offers business intelligence, market analysis, AI consulting, valuation tools, and the "CLEANBI System" for global property analysis. StrokeRecoveryAcademy.com provides AI-powered courses, community features, tracking tools with an AI companion, and peer-to-peer knowledge sharing for stroke recovery. The platform leverages multi-AI orchestration to deliver personalized experiences and expert insights across both verticals.

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

**CLEANBI™ Grading System:**
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
- All AI chat widget messages trigger instant SMS + email notifications to owner (Nick Kremers, 479-883-4314, nick@washbizhub.com).

Laundromat Consultation Council:
- Human oversight by Nick Kremers on every consultation.
- All consultation requests sent to consult@washbizhub.com.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, Wouter, Radix UI, shadcn/ui, and Tailwind CSS. It features responsive dashboards, Chart.js/Recharts for data visualization, dark-theme maps, and a Chrome Web Store-like grading system for CLEANBI. The premium homepage design includes specific brand colors (Navy, Gold), Bebas Neue typography, Framer Motion animations, and mega-menus.

### Technical Implementations
The frontend is built with Vite, TanStack Query, and PWA support. The backend uses Node.js/Express in TypeScript, providing RESTful JSON APIs and WebSockets. Data persistence is handled by Drizzle ORM with PostgreSQL (Neon serverless). Redis is used for pub/sub and caching. Authentication and RBAC are managed via Replit Auth (OIDC).

### Feature Specifications
- **Multi-tenancy:** Supports distinct platforms like WashBizHub and StrokeRecoveryAcademy.
- **AI Orchestration:** Integrates multiple AI models (OpenAI, Anthropic, Gemini, Perplexity, Grok) for personalized content, analysis, and RAG.
- **CLEANBI Explorer 3.0 (Next Gen Vision):** Evolving from location intelligence to full real-time equipment monitoring + competitive intelligence. Current: 17-factor weighted location scoring with Google Maps, demographics, competition mapping. Next: Real-time equipment monitoring across ALL brands (Dexter, Speed Queen, Continental, Huebsch), revenue by machine, market share analysis, ROI projections with equipment lifecycle/repair costs, and expansion recommendations. The platform differentiator: Dexter Live only works with Dexter. CLEANBI works with everyone. True ROI calculations including demographics, competition, and equipment performance.
- **What-If Analysis Engine:** 10-variable scenario modeling tool for financial projections with real-time calculations, baseline comparison mode, scenario saving, and valuation impact analysis.
- **POS Command Center:** Enterprise dashboard for laundromat operations with KPIs, order management, CRM, IoT machine status, and route planning.
- **IoT & Diagnostics:** Ingests sensor data for predictive maintenance and includes an IoT Dashboard for real-time machine monitoring and dynamic pricing.
- **Route Optimization:** Integrates Google Maps and OR-Tools with Twilio.
- **Website Hosting:** Provides multi-tenant provisioning, custom domains, and CDN.
- **SEO & Marketing:** Includes an AI-generated blog, global email capture, and SEO/AEO tracking.
- **Regional Pricing System:** PPP-adjusted pricing for 220+ countries with multi-currency support.
- **Deal Flow & Funding:** Features a "Deal Flow Dashboard" and a "Funding Marketplace."
- **Persona-Based Navigation:** Homepage PersonaSelector component with 3 tailored paths (Buyer/Investor, Owner/Operator, Seller/Broker). Each persona shows relevant tools, stats, and feature links.
- **Industry Benchmarks:** IndustryBenchmarks component displaying real-time market data with data provenance badges (2025 data from IBISWorld, CLA, BizBuySell). Shows $6.8-7.1B market size, $200K-$400K avg revenue, 3-5x SDE multiple, 94% survival rate.
- **Funding Wizard:** 5-step multi-step intake wizard (/funding-wizard) that matches users with 7 pre-vetted funding partners based on their profile (funding type, amount, timeline, business stage, credit score, state). Partners include Preferred Funding Group, GoKapital, South End Capital, ROK Financial, AAdvantage Laundry Systems, and National Business Capital.
- **Laundromat Marketplace:** Enhanced US marketplace with advanced search features, faceted filters, geo-radius search, and CLEANBI integration.
- **Broker Directory & Seller Assistance:** Features a directory of verified brokers and a dedicated page for selling laundromats.
- **Business Directory:** A "Verified Directory" for service providers.
- **Advertising & Promotions:** Includes a Facebook Group Advertising System and a Promo Code System.
- **WordPress-Style AdminBar:** Fixed top navigation for authenticated admin users.
- **Admin Analytics Dashboard:** Live analytics for revenue, user, and CLEANBI usage.
- **Revenue Funnel Tools:** "SBA Loan Readiness Checker" and an "AI Business Plan Generator."
- **Calculator & Formula Ecosystem:** Over 80 unique formulas and algorithms for valuation, financial analysis, and operations.
- **Service Guy AI:** A protected diagnostic field tool for laundromat equipment repair with tiered subscriptions, voice input, photo diagnosis via Gemini Vision AI, job tracking, parts ordering, and invoice/quote generation.
- **Distributor Command Center:** Enterprise AI hub for equipment distributors featuring Fleet Health Dashboard (real-time multi-brand equipment monitoring), Parts Intelligence (predictive ordering and recommendations), AI Receptionist Console (24/7 call handling and scheduling), and Technician Dispatch (route optimization). Designed for enterprise deals with distributors like EVI Industries.
- **Unified Operator Dashboard:** Command center for laundromat operations with KPI cards, revenue charts, machine status, quick actions, activity feed, and schedule.
- **Machine Booking System:** Time-slot reservation system with customer booking flow, real-time availability, Stripe payment, and operator management.
- **QR Code Generator:** Reusable component for loyalty cards, coupons, tracking URLs, and custom text with WashBizHub branding.
- **POS Suite:** Complete point-of-sale system with transaction register, WDF pricing calculator, cash drawer, daily summary, customer lookup, and shift management.
- **Template Vault:** Monetized template marketplace with tiered access (free preview, one-time purchase, subscription-included). Features AI Business Plan Generator, Lease Red Flag Checklist (Larry's 50+ trap alerts), Due Diligence Checklist, LOI Template, Financial Model, Employee Handbook, Marketing Plan, and Operational Plan. Includes lead capture for free users, Stripe checkout for purchases, and downloadable PDFs for subscribers.
- **User Library:** Unified asset management page for purchased templates, calculator history, and course progress. Session-based storage for resuming work.
- **Book Studio (Illustrated Books):** Professional-grade book creation with AI-powered illustrated children's book support. Features 8 art styles (watercolor, cartoon, digital painting, pencil sketch, flat design, storybook classic, whimsical, anime), age range selection (0-3 through adult), character management for visual consistency, page-by-page illustration generation via DALL-E 3, storyboard planning with Gemini AI, text positioning controls, and KDP-ready export. Supports both traditional text-based chapters and fully illustrated picture books.
- **AI Consultation Council:** Multi-expert AI panel on Products page with 7 interactive demos. Features Larry Larsen (laundromat expert), market analysts, and financial experts for comprehensive deal analysis with tiered subscriptions (Free: 10 msgs/mo, Pro: 500/mo, Enterprise: unlimited).
- **Power Tools Hub (/tools):** Unified showcase of ALL platform tools organized into 6 categories: Location Intelligence, Financial Calculators, Templates & Documents, Education & Training, Operator Tools, and Marketplace & Funding. Features tier badges (Free/Pro/Enterprise), tool descriptions, and clear upgrade paths.
- **Smart Feature Gating System:** Value-first "give the taste, gate the meal" approach with 4 tiers:
  - **Teaser (anonymous):** 1 try, partial/blurred results, upgrade prompts
  - **Free (signed in):** 3-5 uses/month per feature, full results, monthly reset
  - **Pro ($29/mo):** Unlimited access, exports, saves, advanced features
  - **Enterprise ($99/mo):** API access, team features, white-label options
  - Implementation: `useSmartGating` hook, `SmartFeatureGate` component, localStorage usage tracking
- **Cross-Sell Integration (RelatedTools):** Context-aware component suggesting related tools based on current page. Three variants: card (full), inline (compact), minimal (links). Mapped relationships for 15+ tools.
- **StickyUpgradeBanner:** Persistent bottom banner for teaser/free users showing usage limits and gold CTA button. Dismissible with 24-hour reset, framer-motion animations.
- **Larry's Content Empire:** Comprehensive premium content creation and monetization platform for Larry Larsen to drive traffic and revenue. Features:
  - **Unified Dashboard:** All content types (blogs, courses, books, documents, products, landing pages, consultations) in one command center
  - **AI Enhancement Suite:** Content Polisher (grammar, tone, professionalism), SEO/AEO Analyzer (scores + actionable suggestions), E-E-A-T Checker (Google quality signals)
  - **Content Types:** Blog posts, video courses, illustrated books, downloadable PDFs/sheets, digital products, landing pages
  - **Consultation Booking:** Phone call ($149/30min), Video call ($249/45min), Deep Dive ($499/90min), VIP Day ($1997/4hrs) with scheduling and payment tracking
  - **Monetization Matrix:** Free, Free Preview, One-Time Purchase, Subscription-Only tiers per content item
  - **Revenue Analytics:** Track views, conversions, revenue per content type with performance leaderboards
  - **Quick Create:** Direct links to Blog Editor, Book Studio, Larry's Academy, Template Vault, Website Builder
  - **Larry writes manually, AI makes it flawless** - Philosophy of human expertise enhanced by AI polish
  - Routes: /larrys-content-empire, /content-empire
  - Backend: /api/ai/polish-content (professional, seo, concise modes), /api/ai/analyze-seo (SEO/AEO/E-E-A-T scoring)

### System Design Choices
- **Data Storage:** PostgreSQL (Neon Serverless) with Drizzle ORM.
- **Caching & Messaging:** Redis for pub/sub, sessions, and caching.
- **Background Jobs:** BullMQ.
- **IoT Messaging:** EMQX (MQTT broker).
- **Authentication:** Replit Auth (OIDC) with PostgreSQL for sessions and RBAC.

## External Dependencies

### Payment Processing
- **Stripe:** Subscriptions, one-time payments, webhooks.
- **PayPal:** Alternative payments, international transactions.

### AI Services
- **OpenAI:** GPT-4o/4o-mini for deal scoring, content, RAG embeddings.
- **Anthropic Claude:** Complex reasoning, long-form analysis.
- **Google Gemini:** Research, data analysis, layout, equipment appraisal.
- **Perplexity:** Fact-based article generation.
- **Grok:** Trending topic content.

### UI Component Libraries
- **Radix UI:** Accessible, unstyled primitives.
- **Lucide React:** Icon library.
- **React Konva:** Canvas-based 2D design studio.
- **Chart.js / Recharts:** Data visualization.
- **React Hook Form + Zod:** Form validation.
- **@vis.gl/react-google-maps:** Google Maps integration.

### Third-Party Integrations
- **Amazon Affiliate Program:** Product Advertising API 5.0.
- **ATTOM Data:** Real estate and demographic data.
- **US Census Bureau:** Demographic data.
- **Mapbox:** Location mapping and analysis.
- **Resend/SendGrid:** Email services.
- **Twilio:** Two-way SMS for route optimization.
- **Google APIs:** Maps (JavaScript, Places, Geocoding, Distance Matrix), AI/ML (Vision AI, Natural Language, Speech-to-Text), Data (Solar API, Air Quality), Workspace (Sheets, Docs, Drive), Analytics (GA4, Search Console), Indexing API.
- **IndexNow:** Search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).