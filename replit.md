# Multi-Tenant SaaS Platform: Enterprise & Healthcare

## Overview
Multi-tenant SaaS platform powering TWO distinct markets:

**1. WashBizHub.com** - "Bloomberg Terminal for Laundromats" (B2B Enterprise SaaS)
Enterprise resource planning, IoT integration, POS system, route optimization, AI consultant, website builder, analytics dashboard for laundromat industry.

**2. STROKE RECOVERY ECOSYSTEM** - ONE MAIN PLATFORM with satellite domains:
- **StrokeRecoveryAcademy.com** ⭐ **[MAIN PLATFORM - WHERE EVERYTHING HAPPENS]**
  - Educational courses with AI-powered Stroke Recovery Mastery curriculum
  - World-class forum for stroke survivor community engagement (8 categories, voting, reputation system)
  - Medication/appointment/exercise tracking with AI recovery companion
  - Daily check-ins, progress visualization, hydration reminders
  - Peer-to-peer knowledge sharing and mentorship

- **StrokeLyfe.app** - Mobile landing page redirect to StrokeRecoveryAcademy.com (URL only, no separate functionality)

- **StrokeLyfe.org** - Nonprofit donation platform for mission-driven funding (Stripe donations integrated, tax receipts, shares knowledge base with Academy)

All stroke recovery features consolidated at StrokeRecoveryAcademy.com. StrokeLyfe.app and .org serve as marketing/nonprofit entry points redirecting to the main platform.

Core ambition: Partner with industry leaders (Ryan Smith for laundromats), leverage multi-AI orchestration (OpenAI, Anthropic, Gemini, Perplexity, Grok) for personalized experiences, establish market leadership through authentic expertise (Nick Kremers' 7-year 0%→90% recovery journey).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing Wouter for routing and TanStack Query for state management. UI components are sourced from Radix UI and shadcn/ui, styled with Tailwind CSS to achieve a Bloomberg-inspired aesthetic (navy, gold, glassmorphism). It supports real-time updates via WebSockets (socket.io), features responsive dashboards with Chart.js/Recharts, and includes PWA support for mobile applications. Vite is used for development.

### Backend Architecture
The backend is powered by Node.js and Express in TypeScript, providing RESTful JSON APIs and WebSockets. It employs a Drizzle ORM with PostgreSQL (Neon serverless) for data persistence. The architecture is event-driven, leveraging Redis pub/sub for real-time capabilities. Key services include POS, Operations, Logistics, Analytics, AI, and Hosting. It features role-based access control and a multi-tenant design with location-based data partitioning.

**Core Services & Features:**
-   **POS System:** Manages per-pound pricing, order lifecycle, Stripe settlements, scale integration, and multi-location support.
-   **IoT & Diagnostics:** Handles MQTT/HTTPS sensor data ingestion, machine telemetry, predictive maintenance, and repair logs.
-   **Route Optimization:** Utilizes Google Maps Distance Matrix and OR-Tools for logistics, GPS tracking, geofencing, and two-way SMS via Twilio.
-   **AI Consultant:** Orchestrates multiple AI models (OpenAI, Anthropic, Gemini, Perplexity) with a RAG pipeline and pgvector embeddings for specialized knowledge.
-   **Analytics:** Provides materialized views and scheduled aggregation jobs for key business metrics.
-   **Website Hosting:** Offers multi-tenant provisioning, custom domains, SSL, and CDN integration (Cloudflare).
-   **Google Integrations:** Connects with Google Search Console API, SERP API, Workspace APIs, and Cloud APIs.
-   **Resources Hub:** Comprehensive industry resource ecosystem including calculators, guides, vendor directory, and industry benchmarks with secure filtering and admin-only mutations.
-   **Newsletter System:** Manages email capture and subscriber management with multiple component variants, email validation, and source tracking.

### Data Storage Solutions
Primary data storage is PostgreSQL (Neon Serverless) managed by Drizzle ORM, with over 78 tables covering various domains (POS, IoT, Logistics, Analytics, AI, Platform). Redis is used for pub/sub, session storage, and caching. BullMQ handles background jobs, and EMQX serves as the MQTT broker for IoT ingestion.

### Authentication and Authorization
Authentication uses Replit Auth (OIDC), with sessions stored in PostgreSQL. Role-based access control is implemented via an `isAdmin` field. Security measures include standardized `getCurrentUser` helper, Zod validation for all API requests, robust authorization patterns verifying ownership or admin access, and protection of server-controlled fields to prevent client overrides.

## External Dependencies

### Payment Processing
-   **Stripe:** For subscription management, one-time purchases, and webhook handling.

### AI Services
-   **OpenAI GPT-4:** For structured professional content.
-   **Anthropic Claude:** For long-form writing and detailed analysis.
-   **Google Gemini:** For research, data analysis, and layout optimization.
-   **Perplexity:** For fact-based article generation.
-   **Grok:** For trending topic content.

### UI Component Library
-   **Radix UI:** Accessible, unstyled primitives.
-   **Lucide React:** Icon library.
-   **React Konva:** Canvas-based 2D design studio.
-   **Chart.js / Recharts:** Data visualization.
-   **React Hook Form + Zod:** Form validation.

### Third-Party Integrations
-   **Amazon Affiliate Program:** For product marketplace links and one-click parts ordering, integrated via Product Advertising API 5.0 with affiliate tracking.
-   **ATTOM Data:** For real estate and demographic data.
-   **Mapbox:** For location mapping and analysis.
-   **Email Services (Resend/SendGrid):** For user notifications and marketing campaigns.
-   **Admin Notifications:** Email-to-SMS gateway for instant alerts to administrators.