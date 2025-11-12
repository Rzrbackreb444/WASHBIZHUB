# WashBizHub - The Bloomberg of Laundromats

## Overview

WashBizHub is a comprehensive SaaS platform for laundromat business intelligence, combining professional design tools, financial analysis, AI-powered insights, educational content, and marketplace functionality. The platform serves as a one-stop solution for laundromat owners, operators, and investors to design layouts, analyze business performance, access funding, purchase equipment/supplies, and grow their operations.

**Core Value Proposition:** Professional-grade business intelligence platform that transforms laundromat operations through data-driven insights, automated design tools, and integrated marketplace services.

**Target Users:**
- Laundromat owners and operators
- Prospective investors and entrepreneurs
- Equipment vendors and service providers
- Industry consultants and affiliates

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with custom shadcn/ui components
- **Styling:** Tailwind CSS with custom design system following Bloomberg-inspired professional aesthetics
- **Build Tool:** Vite for fast development and optimized production builds

**Design System:**
- Navy blue (#1e3a5f) for primary trust elements
- Gold (#b8860b) for CTAs and premium features
- Glassmorphism patterns with backdrop-blur effects
- Typography hierarchy using system fonts for performance
- Professional color palette balancing enterprise credibility with premium positioning

**Key UI Patterns:**
- Card-based layouts with glassmorphism effects
- Gradient backgrounds (gray-900 → gray-800 → black)
- Consistent spacing and border radius system
- Mobile-responsive with sticky navigation
- Toast notifications for user feedback

### Backend Architecture

**Runtime:** Node.js with Express
- **Language:** TypeScript throughout
- **API Style:** RESTful JSON endpoints
- **Database ORM:** Drizzle ORM with PostgreSQL (Neon serverless)
- **File Structure:** Modular routes with separated storage layer

**Core Services:**
1. **Design Management** - CRUD for 2D/3D laundromat layouts
2. **CLEANBI™ Scoring** - 17-factor business intelligence analysis
3. **Calculator Services** - ROI, revenue, funding scenarios
4. **Content Management** - Blog posts, courses, book chapters
5. **Marketplace** - Vendors, parts, affiliates
6. **AI Integration** - Multiple provider support (OpenAI, Anthropic, Gemini, Perplexity, Grok)

**Data Models:**
- Users with Stripe subscription integration
- Designs with equipment placement and room dimensions (JSON storage)
- CLEANBI scores with 7-category breakdown
- Calculator scenarios with financial projections
- Blog posts with type classification (manual/AI/UGC)
- Courses with lessons and enrollment tracking
- Book chapters with access control
- Vendor/affiliate marketplace data
- SEO keywords and competitor analysis

**API Design Pattern:**
- Consistent error handling with descriptive messages
- Type-safe request/response using Zod schemas
- Query parameters for filtering (userId, category, type)
- RESTful resource naming conventions

### Data Storage Solutions

**Primary Database:** PostgreSQL via Neon Serverless
- **ORM:** Drizzle ORM for type-safe queries
- **Schema Management:** Centralized in `shared/schema.ts`
- **Migrations:** Managed via `drizzle-kit`

**Storage Strategy:**
- Structured data (users, designs, scores) in PostgreSQL tables
- JSON fields for flexible nested data (equipment placements, room dimensions)
- File uploads handled separately (design exports, course materials)

**Key Tables:**
1. `users` - Authentication and subscription status
2. `designs` - 2D/3D layout data with equipment library
3. `cleanbi_scores` - Business intelligence assessments
4. `calculator_scenarios` - Saved financial projections
5. `blog_posts` - Content with categorization
6. `courses` / `lessons` / `enrollments` - Educational platform
7. `book_chapters` / `book_access` - Digital book platform
8. `vendors` / `parts` / `affiliates` - Marketplace data
9. `ai_blog_tasks` - Automated content generation queue
10. `seo_keywords` / `competitor_analysis` - SEO optimization

### Authentication and Authorization

**Current Implementation:** Basic user management structure
- User records with username, email, password fields
- Pro tier tracking via `isPro` boolean flag
- Stripe customer/subscription ID fields for payment integration

**Authorization Pattern:**
- User ID query parameters for filtering resources
- Pro features gated by subscription status
- Vendor/affiliate-specific access controls

**Future Considerations:**
- Session management and JWT tokens
- Role-based access control (RBAC)
- OAuth integration for social login

### External Dependencies

**Payment Processing:**
- **Stripe:** Subscription management, one-time purchases, webhook handling
  - Products: Pro subscription, courses, book access
  - Webhook endpoint at `/api/webhooks/stripe` with raw body parsing
  - Customer portal integration for subscription management

**AI Services (Multi-Provider Strategy):**
- **OpenAI GPT-4:** Structured professional content generation
- **Anthropic Claude:** Long-form writing and detailed analysis
- **Google Gemini:** Research, data analysis, layout optimization
- **Perplexity:** Fact-based article generation
- **Grok:** Trending topic content

**Purpose:** Flexibility to choose optimal AI provider per use case, cost optimization, redundancy

**UI Component Library:**
- **Radix UI:** Accessible, unstyled primitives for complex components
- **Lucide React:** Icon library for consistent visual language
- **React Konva:** Canvas-based 2D design studio
- **React Three Fiber:** 3D design studio (planned/referenced)
- **Chart.js / Recharts:** Data visualization for analytics
- **React Hook Form + Zod:** Form validation

**Development Tools:**
- **Vite:** Development server with HMR
- **ESBuild:** Production bundling
- **TypeScript:** Type safety across stack
- **Replit-specific plugins:** Runtime error overlay, cartographer, dev banner

**Third-Party Integrations (Planned/Referenced):**
- **Amazon Affiliate Program:** Product marketplace links
- **ATTOM Data:** Real estate and demographic data
- **Mapbox:** Location mapping and analysis
- **Email Services:** User notifications and marketing

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API authentication
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `GEMINI_API_KEY` - Google AI access
- `OPENAI_API_KEY` - OpenAI access (optional)
- `ANTHROPIC_API_KEY` - Claude access (optional)
- `PERPLEXITY_API_KEY` - Perplexity access (optional)
- `GROK_API_KEY` - Grok access (optional)

**Build and Deployment:**
- Development: `npm run dev` (Vite + tsx for backend)
- Production: `npm run build` (Vite frontend + esbuild backend bundle)
- Database: `npm run db:push` (Drizzle schema sync)
- Hosting: Configured for Replit deployment with automatic provisioning