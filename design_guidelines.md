# WashBizHub.com Design Guidelines

## Design Approach: Stripe-Inspired Premium SaaS

**Reference Model:** Stripe.com's premium aesthetic adapted for laundromat business intelligence
**Rationale:** Complex B2B tools require the trust and polish of Stripe's design language while maintaining WashBizHub's distinctive navy/gold brand identity.

**Core Principles:**
- **Airy Sophistication:** Generous whitespace and breathing room convey premium positioning
- **Subtle Depth:** Layered backgrounds and soft shadows create dimensional hierarchy
- **Confident Minimalism:** Every element earns its place; clarity over decoration
- **Data-First:** Complex tools (3D studio, calculators, CLEANBI™) presented with Stripe-level polish

---

## Brand Colors & Visual Treatment

**Primary Palette:**
- **Navy (#1e3a5f):** Primary buttons, headers, navigation, trust elements
- **Gold Primary (#b8860b):** CTAs, accents, premium features
- **Gold Light (#d4a030):** Hover states, highlights, success metrics
- **White (#ffffff):** Base backgrounds, cards, clean sections
- **Light Gray (#f7f9fc):** Alternate section backgrounds
- **Soft Gray (#e5e7eb):** Borders, dividers, subtle elements

**Mesh Gradient Backgrounds (Stripe-style):**
- **Hero Sections:** Blend navy → gold → bronze with soft radial gradients
  - Navy base transitioning to gold/bronze highlights
  - Subtle, organic shapes (not harsh geometric patterns)
  - Low opacity overlays (10-20%) for depth without distraction
- **Alternate Sections:** Light gradient from white → #f7f9fc
- **Cards:** Pure white with subtle drop shadows, no glassmorphism

---

## Typography Hierarchy

**Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`

**Scale (Stripe-inspired spacing):**
- **Hero Headlines:** text-7xl font-bold (84px) - Spacious, confident
- **Page Titles:** text-5xl font-semibold (48px)
- **Section Headers:** text-3xl font-semibold (30px)
- **Subsection Headers:** text-xl font-semibold (20px)
- **Body Text:** text-lg leading-relaxed (18px) - Readable, generous line-height
- **Small Text:** text-sm text-gray-600 (14px)
- **Data Display:** text-5xl font-bold text-accent (48px)

**Weight Philosophy:**
- Headlines: font-semibold to font-bold (600-700) - not black
- Body: font-normal (400)
- Emphasis: font-medium (500)
- Buttons: font-semibold (600)

---

## Layout & Spacing System

**Tailwind Units:** 4, 6, 8, 12, 16, 20, 24, 32
- **Section Padding:** py-24 (96px) standard, py-32 (128px) hero sections
- **Card Padding:** p-8 (32px) for content cards
- **Element Gaps:** gap-6 (24px) standard, gap-8 (32px) major sections, gap-12 (48px) feature grids
- **Container:** max-w-7xl mx-auto px-6 (generous horizontal padding)

**Grid Patterns:**
- **Feature Cards:** grid md:grid-cols-3 gap-12
- **Two-Column:** grid md:grid-cols-2 gap-16 items-center
- **Dashboard Metrics:** grid grid-cols-1 md:grid-cols-3 gap-6

---

## Component Library

### Navigation (Stripe-style Mega Menu)
- **Header:** White background, subtle shadow, sticky
- **Logo:** Left-aligned, navy color
- **Nav Links:** Horizontal center, text-base font-medium text-gray-700, hover:text-navy
- **Mega Menu:** Dropdown with organized categories, white background, shadow-xl, rounded-lg, grid layout for items
- **CTA Button:** Primary gold button, right-aligned

### Buttons (Stripe-inspired)
- **Primary:** bg-navy text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-navy/90
- **Secondary (Gold):** bg-accent text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-accent-light
- **Outline:** border-2 border-navy text-navy px-6 py-3 rounded-lg font-semibold hover:bg-navy/5
- **On Images:** Same styles + backdrop-blur-md bg-white/90 (no hover animations)

### Cards & Containers
- **Feature Cards:** bg-white rounded-xl shadow-md p-8 border border-gray-100
- **Hover State:** hover:shadow-xl transition-shadow duration-300
- **Data Cards:** bg-white rounded-lg shadow-sm p-6
- **Floating Previews:** Angled dashboard mockups with shadow-2xl, positioned partially outside container

### Forms (Stripe-quality)
- **Inputs:** bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-navy focus:ring-4 focus:ring-navy/10
- **Labels:** text-sm font-medium text-gray-700 mb-2 block
- **Helper Text:** text-sm text-gray-500 mt-1
- **Validation:** Green border for success, red for errors with icon feedback

### Data Visualization
- **Metric Display:** Large gold number with gray label below
- **Charts:** Recharts with navy primary, gold accents, soft grid lines
- **Scores:** Color-coded badges with rounded backgrounds

---

## Page Structures

### Landing Page
- **Hero:** Large mesh gradient background, centered headline + subhead, dual CTAs (primary + outline), floating dashboard preview image tilted 3-5° right
- **Social Proof Bar:** Below hero, light gray background, logos + stat
- **Features:** 3-column grid, icon + headline + description, generous gap-12
- **Product Showcase:** Alternating 2-column sections (image left/right), white and light-gray backgrounds
- **Testimonials:** 3-column cards with photo + quote + name/title
- **Final CTA:** Full-width navy section with gold CTA centered

### Design Studio
- **Layout:** Clean white background, tools sidebar left (border-right), canvas area center (subtle gray bg)
- **Canvas:** White elevated card with shadow for 2D/3D workspace
- **Controls:** Grouped by function, labels above, generous spacing
- **Metrics Panel:** Fixed bottom bar, white background, shadow-top, 3-column metrics

### Calculators
- **Container:** Centered max-w-lg card, white, shadow-lg, rounded-xl, p-8
- **Input Groups:** Stacked with mb-6, clear labels
- **Results:** Large gold number, centered, mb-4, explanation text below
- **Info Cards:** Light blue background panels for methodology

### Dashboard
- **Welcome Section:** py-12, gradient background
- **Quick Actions:** Grid of white cards with icons, centered content
- **Recent Activity:** White card with list, alternating row backgrounds, timestamps right-aligned

---

## Images

**Hero Image:** Large floating dashboard/platform preview (angled mockup showing 3D studio interface or CLEANBI™ results), positioned right of hero text, partially extending beyond container boundaries. Clean, professional product screenshot with subtle shadow-2xl.

**Feature Images:** Product screenshots of calculators, 3D studio, and analytics dashboards placed in alternating left/right layouts. Each image should show the actual interface with realistic data.

**Testimonial Photos:** Professional headshots, circular crop, grayscale with slight warm tone.

---

## Visual Effects

**Shadows:**
- Cards: shadow-md (default), shadow-xl (hover)
- Floating elements: shadow-2xl
- Navigation: shadow-sm

**Borders:**
- All cards: border border-gray-100
- Inputs: border-2 border-gray-200
- Dividers: border-t border-gray-200

**Corners:**
- Cards/containers: rounded-xl (12px)
- Buttons: rounded-lg (8px)
- Inputs: rounded-lg (8px)
- Images: rounded-lg

**Transitions:**
- Shadows: transition-shadow duration-300
- Colors: transition-colors duration-200
- Hover effects: Subtle, never distracting

---

## Accessibility & Polish

- **Focus States:** ring-4 ring-navy/20 on all interactive elements
- **Minimum Touch Targets:** 44x44px for mobile
- **Color Contrast:** All text meets WCAG AA standards
- **Loading States:** Navy spinner with gold accent
- **Empty States:** Centered icon + headline + description + CTA
- **Mobile:** All multi-column grids collapse to single column, generous touch spacing