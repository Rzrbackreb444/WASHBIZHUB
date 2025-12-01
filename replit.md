# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
This project is a multi-tenant SaaS platform serving two distinct verticals: **WashBizHub.com** (laundromat industry intelligence) and **StrokeRecoveryAcademy.com** (healthcare education and support).

**WashBizHub.com** provides business intelligence, market analysis, AI consulting, valuation tools, and industry resources. It features the "CLEANBI System" for global property analysis using Google Maps API, a Chrome extension ("CLEANBI Anywhere"), and aims for global market leadership in the laundromat sector.

**StrokeRecoveryAcademy.com** offers AI-powered educational courses, a community forum, tracking tools with an AI companion, and peer-to-peer knowledge sharing for stroke recovery.

The platform leverages multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) to deliver personalized experiences and expert insights across both verticals, aiming for market leadership.

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
The frontend uses React 18, TypeScript, Wouter for routing, Radix UI and shadcn/ui for components, and Tailwind CSS for styling. It features responsive dashboards with Chart.js/Recharts, dark-theme styling for maps, and an emphasis on a Chrome Web Store-like grading system for CLEANBI. The design prioritizes clear, positive language for opportunity levels.

### Technical Implementations
The frontend uses Vite for development, TanStack Query for state management, and supports PWA. The backend is Node.js/Express in TypeScript, offering RESTful JSON APIs and WebSockets. It uses Drizzle ORM with PostgreSQL (Neon serverless) and is event-driven with Redis pub/sub. Replit Auth (OIDC) handles authentication and role-based access control.

### Feature Specifications
- **Multi-tenancy:** Supports distinct platforms like WashBizHub and StrokeRecoveryAcademy.
- **AI Orchestration:** Integrates multiple AI models (OpenAI, Anthropic, Gemini, Perplexity, Grok) for personalized content and analysis, utilizing RAG pipelines and pgvector.
- **CLEANBI Intelligence System:** A multi-source property intelligence tool scoring addresses globally (businesses/residential). It includes a 6-factor weighted scoring system, tiered access, confidence scoring, and an industry-calibrated algorithm using demographics, competition, and quality. It features an immersive map explorer (`/cleanbi-explorer`) with real-time scoring, competitor mapping, and shareable links, including an email capture gate for first-time users.
- **POS Command Center:** An enterprise dashboard (`/pos`) for laundromat operations, including KPIs, order management (Stripe), CRM, IoT machine status, route planning, analytics, and inventory.
- **IoT & Diagnostics:** Ingests sensor data for predictive maintenance.
- **Route Optimization:** Utilizes Google Maps and OR-Tools, integrated with Twilio.
- **Website Hosting:** Provides multi-tenant provisioning, custom domains, and CDN integration.
- **SEO & Marketing:** Includes an "Ultimate SEO Blog Suite" (multi-AI generated), a "Global Email Capture Suite" (Resend integration), and "Global SEO/AEO Tracking" (SERP API).
- **Regional Pricing System:** PPP-adjusted pricing for 220+ countries with multi-currency support and Stripe integration.
- **Deal Flow & Funding:** Features a "Deal Flow Dashboard" (`/laundromat-listings`) and a "Funding Marketplace" (`/funding-matcher`) with 7 integrated partners.
- **Business Directory:** A "Verified Directory" (`/directory`) for service providers with tiered subscriptions.
- **Advertising & Promotions:** Includes a Facebook Group Advertising System with various ad products and a Stripe-powered invoice generator, plus a Promo Code System for campaigns.
- **Revenue Funnel Tools:** "SBA Loan Readiness Checker" (`/sba-readiness`) and an "AI Business Plan Generator" (`/business-plan-generator`) with Stripe integration for payment verification.
- **Calculator & Formula Ecosystem:** Over 80 unique formulas across standalone pages and integrated within CLEANBI, covering valuation, financial analysis, operations, real estate, and more. Includes a core algorithm library for advanced simulations.

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
- **Google APIs:** Places, Reviews, Distance Matrix, Geocoding, Search Console, SERP, Workspace, Cloud APIs, Indexing API.
- **IndexNow:** Search engine indexing (Bing, Yahoo, Yandex, DuckDuckGo).