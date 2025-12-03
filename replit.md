# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform featuring **WashBizHub.com** for the laundromat industry and **StrokeRecoveryAcademy.com** for healthcare education.

**WashBizHub.com** offers business intelligence, market analysis, AI consulting, valuation tools, and the "CLEANBI System" for global property analysis, aiming for market leadership in the laundromat sector.

**StrokeRecoveryAcademy.com** provides AI-powered educational courses, a community forum, tracking tools with an AI companion, and peer-to-peer knowledge sharing for stroke recovery.

The platform uses multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) to deliver personalized experiences and expert insights across both verticals.

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

### UI/UX Decisions
The frontend utilizes React 18, TypeScript, Wouter, Radix UI, shadcn/ui, and Tailwind CSS. It features responsive dashboards with Chart.js/Recharts, dark-theme maps, and a Chrome Web Store-like grading system for CLEANBI, emphasizing clear, positive language. Premium homepage design includes specific brand colors (Navy, Gold), Bebas Neue typography, Framer Motion animations, and mega-menus.

### Technical Implementations
The frontend uses Vite, TanStack Query, and PWA support. The backend is Node.js/Express in TypeScript, providing RESTful JSON APIs and WebSockets. It employs Drizzle ORM with PostgreSQL (Neon serverless), Redis for pub/sub, and Replit Auth (OIDC) for authentication and RBAC.

### Feature Specifications
- **Multi-tenancy:** Supports distinct platforms like WashBizHub and StrokeRecoveryAcademy.
- **AI Orchestration:** Integrates multiple AI models (OpenAI, Anthropic, Gemini, Perplexity, Grok) for personalized content, analysis, and RAG pipelines.
- **CLEANBI Explorer (Flagship Product):** The centerpiece of WashBizHub - a full-page location intelligence system at /cleanbi-explorer. Features:
  - Google Maps integration with competitor mapping and 3D flyover
  - 6-factor weighted scoring (Demographics, Competition, Traffic, Accessibility, Economic, Location Quality)
  - Real-time quota tracking via useUsageQuota hook → UsageLimitBanner → UpgradeModal → Stripe checkout
  - Premium feature gating: Transit/Walk Score (Starter+), Utility Costs/Catchment (Pro+), PDF/Sheets Export (Starter+)
  - "Analyze with CLEANBI" button appears on every listing card across the platform
  - Gold pulsing gradient navigation button (first position in header, full-width mobile CTA)
  - All navigation links point to /cleanbi-explorer (backward-compatible /cleanbi-auto still works)
- **POS Command Center:** An enterprise dashboard for laundromat operations, including KPIs, order management, CRM, IoT machine status, and route planning.
- **IoT & Diagnostics:** Ingests sensor data for predictive maintenance.
- **Route Optimization:** Integrates Google Maps and OR-Tools with Twilio.
- **Website Hosting:** Provides multi-tenant provisioning, custom domains, and CDN.
- **SEO & Marketing:** Includes an AI-generated blog suite, global email capture, and global SEO/AEO tracking.
- **Regional Pricing System:** PPP-adjusted pricing for 220+ countries with multi-currency support.
- **Deal Flow & Funding:** Features a "Deal Flow Dashboard" and a "Funding Marketplace" with integrated partners.
- **Business Directory:** A "Verified Directory" for service providers.
- **Advertising & Promotions:** Includes a Facebook Group Advertising System and a Promo Code System.
- **WordPress-Style AdminBar:** Fixed top navigation for authenticated admin users, offering quick access, content editing, and user management.
- **Admin Analytics Dashboard:** Live analytics dashboard pulling data from Stripe and the database, showing revenue, user, and CLEANBI usage metrics, with an activity feed.
- **Revenue Funnel Tools:** "SBA Loan Readiness Checker" and an "AI Business Plan Generator."
- **Calculator & Formula Ecosystem:** Over 80 unique formulas for valuation, financial analysis, operations, and real estate, including core algorithm libraries.
- **Utility Cost Calculator & UPG Tracker:** Calculates cost per load and tracks Utilities as % of Gross.
- **Labor Cost Calculator & Staffing Optimizer:** Calculates labor cost as % of revenue and optimizes staffing.
- **Key Industry Benchmarks & Formulas:** Includes detailed metrics for revenue, profitability, operational KPIs, cost ratios, customer metrics, equipment depreciation, and valuation multiples.
- **Master Algorithms:** Includes 9 standalone calculators, 8 scoring algorithms (CLEANBI, WASHBI, etc.), and 10 Google Cloud combined algorithms for advanced functionalities like Utility Bill Scanning, Smart Location Scouting, Equipment Photo Appraising, and Due Diligence Document Verification.

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

### UI Component Library
- **Radix UI:** Accessible, unstyled primitives.
- **Lucide React:** Icon library.
- **React Konva:** Canvas-based 2D design studio.
- **Chart.js / Recharts:** Data visualization.
- **React Hook Form + Zod:** Form validation.
- **@vis.gl/react-google-maps:** Google Maps integration.

### Third-Party Integrations
- **Amazon Affiliate Program:** Product Advertising API 5.0.
- **ATTOM Data:** Real estate and demographic data.
- **US Census Bureau:** Demographic data (ACS 5-Year).
- **Mapbox:** Location mapping and analysis.
- **Resend/SendGrid:** Email services.
- **Twilio:** Two-way SMS for route optimization.
- **Google APIs:** Maps (JavaScript, Places, Geocoding, Distance Matrix, etc.), AI/ML (Vision AI, Natural Language, Speech-to-Text), Data (Solar API, Air Quality), Workspace (Sheets, Docs, Drive), Analytics (GA4, Search Console), Indexing API.
- **IndexNow:** Search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).