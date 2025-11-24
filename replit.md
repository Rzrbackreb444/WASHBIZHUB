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
-   **AI Consultant:** Orchestrates multiple AI models (OpenAI, Anthropic, Gemini, Perplexity) with a RAG pipeline and pgvector.
-   **Analytics:** Provides materialized views and scheduled aggregations for business metrics.
-   **Website Hosting:** Offers multi-tenant provisioning, custom domains, and CDN integration (Cloudflare).
-   **Google Integrations:** Connects with Google Search Console, SERP API, Workspace, and Cloud APIs.
-   **Resources Hub:** Provides industry-specific resources with secure filtering.
-   **Newsletter System:** Manages email capture, validation, and subscriber management.
-   **CLEANBI Intelligence System:** Google-powered tool for scoring laundromats, including an auto-calculator and a Chrome extension for viral distribution.
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