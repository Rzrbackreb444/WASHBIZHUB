# WashBizHub.com Design Guidelines

## Design Approach: Professional SaaS Platform with Premium Branding

**Rationale:** WashBizHub is a data-intensive business intelligence platform requiring clarity, trust, and professional credibility. The design balances enterprise-grade functionality with the premium, growth-focused brand identity established by the logo.

**Core Principles:**
- **Professional Authority:** Bloomberg-inspired data presentation with clean hierarchy
- **Premium Positioning:** Gold accents signal high-value insights, not decorative flair
- **Functional Clarity:** Complex tools (3D studio, CLEANBI™, calculators) prioritize usability over visual complexity

---

## Brand Identity & Color System

**Primary Palette:**
- **Navy Blue (#1e3a5f):** Headers, navigation, primary buttons, trust elements
- **Deep Black (#0a0a0a):** Base backgrounds for contrast
- **Gold (#b8860b):** CTAs, highlights, success metrics, premium features
- **White (#ffffff):** Text, data displays, clean sections

**Gradient Backgrounds:**
- Main sections: `bg-gradient-to-br from-gray-900 via-gray-800 to-black`
- Hero overlays: `bg-gradient-to-br from-primary/20 to-accent/20`

**Glassmorphism Pattern:**
- Cards/panels: `bg-white/10 backdrop-blur rounded-xl` with subtle shadows
- Inputs: `bg-white/20` for visual hierarchy within cards

---

## Typography Hierarchy

**Font Stack:** System fonts for performance and clarity
- Primary: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

**Scale:**
- **Hero Headlines:** `text-6xl font-black` (72px) - Platform name, main value props
- **Page Titles:** `text-5xl font-black` (48px) - Feature pages
- **Section Headers:** `text-2xl font-bold` (24px) - Card titles, subsections
- **Body Text:** `text-base` (16px) - Descriptions, labels
- **Data Display:** `text-4xl font-black` (36px) - Metrics, calculator results
- **Small Text:** `text-sm opacity-80` (14px) - Helper text, metadata

**Emphasis:**
- `font-black` for headlines and data
- `font-bold` for labels and buttons
- `font-medium` for body emphasis

---

## Layout & Spacing System

**Tailwind Units (Consistent Set):** 4, 6, 8, 12, 20, 32
- **Component Padding:** `p-6` (24px) for cards, `p-8` (32px) for larger containers
- **Section Spacing:** `py-20` (80px) standard, `py-32` (128px) for hero sections
- **Element Gaps:** `gap-4` (16px) buttons, `gap-6` (24px) cards, `gap-8` (32px) grid layouts
- **Container:** `max-w-7xl mx-auto px-4` for all content sections

**Grid Patterns:**
- **Sidebar + Canvas:** `grid md:grid-cols-4 gap-8` (1 sidebar, 3 content)
- **Feature Cards:** `grid md:grid-cols-3 gap-8` (equal columns)
- **Metrics Dashboard:** `grid grid-cols-3 gap-4` (compact data)

---

## Component Library

### Navigation
- **Header:** Sticky navy background, logo left, horizontal nav center, Pro CTA right (gold button)
- **Mobile:** Hamburger menu expanding to full overlay with navy/90 background
- **Logo Placement:** Always visible, 2xl size in header, clickable to home

### Buttons
- **Primary (Gold):** `bg-accent text-primary px-8 py-4 rounded-full font-bold`
- **Secondary (Navy):** `bg-primary text-white px-8 py-4 rounded-full font-bold`
- **Outline:** `border-2 border-accent text-accent px-8 py-4 rounded-full font-bold`
- **Icon Buttons:** `bg-white/20 p-3 rounded-lg` for tools/actions

### Cards & Panels
- **Standard Card:** `bg-white/10 backdrop-blur rounded-xl p-6 shadow-lg`
- **Data Cards (Metrics):** `bg-white/10 p-4 rounded-lg` with label + large number
- **Interactive Cards:** Hover state `hover:bg-white/20 transition-colors`

### Form Elements
- **Inputs:** `bg-white/20 rounded-lg p-4 w-full text-white placeholder-white/50`
- **Selects:** Same as inputs with dropdown arrow
- **Labels:** `text-sm font-medium mb-2 block`

### Data Visualization
- **Calculator Results:** Large gold numbers `text-4xl font-black text-accent`
- **Scores/Grades:** Color-coded (A=green, B=yellow, C=orange, Needs Work=red)
- **Charts:** Use Recharts with navy/gold color scheme, white text labels

### 3D Canvas Specific
- **Canvas Container:** `bg-white/10 backdrop-blur rounded-xl p-6` with toolbar controls
- **Toolbar:** Vertical sidebar `bg-white/10 p-6` with add item buttons
- **Metrics Row:** 3-column grid below canvas showing Cost, TPD, AI Score

---

## Page-Specific Guidelines

### Landing Page
- **Hero:** Full-width gradient overlay, centered text, logo subtle in background
- **CTA Layout:** Two buttons side-by-side (primary gold "Start Designing" + outline "Free Calculator")
- **Sections:** Alternate between full-width backgrounds and contained max-w-7xl content
- **Social Proof:** If added, use `text-sm opacity-80` with stats like "70K+ operators"

### Design Studio (2D/3D)
- **Layout:** 1-column sidebar + 3-column canvas area
- **Canvas Background:** Dark (#1a1a1a) to contrast colored equipment
- **Equipment Items:** Color-coded by type, labeled below, draggable with clear visual feedback
- **Cost Tracker:** Always visible, updated in real-time

### Calculators
- **Layout:** Centered card (max-w-md) with generous padding
- **Input Fields:** Stacked vertically with clear labels
- **Result Display:** Large gold number below inputs, centered
- **Info Text:** Small helper text below results explaining methodology

### Dashboard
- **Grid Layout:** 2-3 column responsive grid for metric cards
- **Quick Actions:** Prominent buttons for "New Design," "Run CLEANBI™," etc.
- **Recent Activity:** List format with timestamps and type icons

---

## Branding Elements

**Logo Usage:**
- **Header:** Full logo with text, 2xl size
- **Footer:** Small logo with copyright
- **Loading States:** Animated logo icon (keyhole rotating)
- **Watermarks:** Subtle logo in exported PDFs/images

**Tagline Integration:**
- Display "STRATEGY • FUNDING • GROWTH" in footer
- Position as "The #1 Laundromat Resource & Educational Hub"

---

## Accessibility & States

- **Focus States:** Gold outline on all interactive elements
- **Disabled States:** `opacity-50 cursor-not-allowed`
- **Loading States:** Spinner with gold accent color
- **Error States:** Red border with error text below
- **Success States:** Green checkmark with confirmation message

---

## Key Quality Standards

- **No Empty Space:** Every viewport section has purposeful content
- **Consistent Blur:** All glass cards use same blur intensity
- **Data Emphasis:** Numbers always larger and bolder than labels
- **Professional Polish:** Rounded corners (xl), subtle shadows, smooth transitions
- **Mobile-First:** All grids collapse to single column, nav to hamburger