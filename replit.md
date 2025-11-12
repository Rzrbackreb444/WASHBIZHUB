# WashBizHub - The Bloomberg of Laundromats

## Overview
WashBizHub is a comprehensive SaaS platform designed for the laundromat industry. It integrates business intelligence, professional design tools, financial analysis, AI-powered insights, educational content, and a marketplace. The platform aims to be a one-stop solution for laundromat owners, operators, investors, brokers, service providers, and customers, offering a unique combination of features like a 2D/3D design studio, a 17-factor AI business scoring system (CLEANBI™), a buying/selling marketplace, multi-AI content generation, and a full SEO suite. Its vision is to modernize the laundromat industry through IoT integration, AI-powered dynamic pricing, predictive maintenance, and marketing automation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Wouter for routing, TanStack Query for state management, and Radix UI primitives with custom shadcn/ui components for the UI. Styling is handled with Tailwind CSS, following a Bloomberg-inspired professional aesthetic with a navy blue and gold color scheme, glassmorphism patterns, and a consistent design system. Vite is used for fast development and optimized builds.

### Backend Architecture
The backend is developed with Node.js and Express, written entirely in TypeScript. It features RESTful JSON endpoints and uses Drizzle ORM with PostgreSQL (Neon serverless) for the database. Core services include Design Management, CLEANBI™ Scoring, Calculator Services, Content Management, Marketplace functionalities, and multi-provider AI Integration (OpenAI, Anthropic, Gemini, Perplexity, Grok). Data models cover users, designs, scores, financial scenarios, blog posts, courses, books, vendor/affiliate data, and SEO metrics.

### Data Storage Solutions
PostgreSQL, provided by Neon Serverless, serves as the primary database, managed with Drizzle ORM for type-safe queries and `drizzle-kit` for schema migrations. Structured data is stored in tables, with JSON fields for flexible nested data. Key tables include `users`, `designs`, `cleanbi_scores`, `calculator_scenarios`, `blog_posts`, `courses`, `lessons`, `enrollments`, `book_chapters`, `book_access`, `vendors`, `parts`, `affiliates`, `ai_blog_tasks`, and `seo_keywords`.

### Authentication and Authorization
The current system includes basic user management with user records, `isPro` flags for tier tracking, and Stripe customer/subscription IDs for payment integration. Authorization relies on user ID query parameters and subscription status to gate access to features.

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
- **Amazon Affiliate Program:** For product marketplace links.
- **ATTOM Data:** For real estate and demographic data.
- **Mapbox:** For location mapping and analysis.
- **Email Services:** For user notifications and marketing.