# WashBizHub.com Design Guidelines

## Design Approach: Clean Professional Premium

**Core Identity:** Pure professionalism with navy (#0A1628) and gold (#C8A661) brand colors
**Philosophy:** Clean, readable, and trustworthy - every element serves a purpose

**Core Principles:**
- **Clean & Professional:** White cards on muted backgrounds, no distracting gradients
- **Easy to Read:** High contrast text, spacious layouts, clear hierarchy
- **Trust Through Simplicity:** Subtle shadows and borders, not flashy effects
- **Mobile-First:** All designs optimized for desktop, tablet, and mobile

---

## Brand Colors

**Primary Palette:**
- **Navy Primary (#0A1628):** Headers, icon containers, primary buttons, footer
- **Gold Primary (#C8A661):** Accents, highlights, secondary CTAs, stat numbers
- **Gold Hover (#B8964F):** Button hover states

**Surface Colors:**
- **White (#ffffff):** Card backgrounds, primary surfaces
- **Muted Background (bg-muted/30):** Section backgrounds, alternating rows
- **Muted Surface (bg-muted/50):** Stat boxes, input backgrounds, subtle containers
- **Border (border):** Card borders, dividers

**Text Colors:**
- **Foreground (text-foreground):** Primary text, headings
- **Muted Foreground (text-muted-foreground):** Secondary text, descriptions
- **On Navy (text-white):** Text on navy backgrounds
- **Gold Text (text-[#C8A661]):** Accent numbers, highlighted stats

---

## Card System (Core Component)

### Standard Content Card
```
Card: bg-card border shadow-sm overflow-hidden
Gold Top Accent: h-1 bg-[#C8A661] (optional for emphasis)
Padding: p-8 (CardContent)
```

### Card with Icon Header
```jsx
<Card className="bg-card border shadow-sm overflow-hidden">
  <div className="h-1 bg-[#C8A661]" /> {/* Gold accent bar */}
  <CardContent className="p-8">
    <div className="flex items-start gap-4 mb-6">
      <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
        <Icon className="h-6 w-6 text-[#C8A661]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Title</h3>
        <p className="text-sm text-muted-foreground">Subtitle</p>
      </div>
    </div>
    <p className="text-muted-foreground mb-6">Description...</p>
    <Button>Action</Button>
  </CardContent>
</Card>
```

### Stat Box (Inside Cards)
```jsx
<div className="bg-muted/50 rounded-lg p-4 text-center">
  <div className="text-2xl font-bold text-[#C8A661]">$500K+</div>
  <div className="text-xs text-muted-foreground mt-1">Label</div>
</div>
```

---

## Section Layouts

### Standard Section
```jsx
<section className="py-20 bg-muted/30">
  <div className="max-w-6xl mx-auto px-6 lg:px-8">
    {/* Section Header */}
    <div className="text-center mb-14">
      <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
        <Icon className="w-3 h-3 mr-1.5" />
        Section Label
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Section Title
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Section description text
      </p>
    </div>
    
    {/* Content Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Navy Section (Dark Background)
```jsx
<section className="py-20 bg-[#0A1628]">
  <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
      Title
    </h2>
    <p className="text-gray-300 max-w-2xl mx-auto mb-8">
      Description
    </p>
    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
      CTA
    </Button>
  </div>
</section>
```

---

## Button Hierarchy

### Primary (Navy)
```jsx
<Button className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white">
  Primary Action
</Button>
```

### Secondary (Gold)
```jsx
<Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
  Secondary Action
</Button>
```

### Outline
```jsx
<Button variant="outline" className="border-[#0A1628] text-[#0A1628]">
  Tertiary Action
</Button>
```

### On Dark Background
```jsx
<Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
  CTA on Navy
</Button>
```

---

## Typography

**Headings:**
- Hero: text-4xl md:text-5xl lg:text-6xl font-bold
- Section: text-3xl md:text-4xl font-bold
- Card Title: text-xl font-bold
- Subsection: text-lg font-semibold

**Body:**
- Primary: text-base text-foreground
- Secondary: text-muted-foreground
- Description: text-muted-foreground leading-relaxed

**Stats/Numbers:**
- Large: text-4xl font-bold text-[#C8A661]
- Medium: text-2xl font-bold text-[#C8A661]
- Label: text-xs text-muted-foreground

---

## Icon Containers

### Navy Container (Primary)
```jsx
<div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
  <Icon className="h-6 w-6 text-[#C8A661]" />
</div>
```

### Muted Container (Secondary)
```jsx
<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
  <Icon className="h-5 w-5 text-foreground" />
</div>
```

### Gold Accent Container (On Dark)
```jsx
<div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
  <Icon className="h-5 w-5 text-[#C8A661]" />
</div>
```

---

## Badge Styles

### Section Label Badge
```jsx
<Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]">
  <Icon className="w-3 h-3 mr-1.5" />
  Label
</Badge>
```

### Feature Badge
```jsx
<Badge className="bg-[#C8A661] text-[#0A1628]">
  Featured
</Badge>
```

### Status Badge
```jsx
<Badge variant="secondary">Status</Badge>
```

---

## Responsive Design

### Breakpoints
- Mobile: Default (< 768px)
- Tablet: md: (≥ 768px)
- Desktop: lg: (≥ 1024px)

### Grid Patterns
```
Single column → 2 columns → 3 columns
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8
```

### Container Widths
- Standard sections: max-w-6xl
- Wide sections: max-w-7xl
- Narrow content: max-w-4xl
- Forms: max-w-lg

### Mobile Adjustments
- Stack cards vertically on mobile
- Reduce padding: p-6 on mobile, p-8 on desktop
- Smaller text: text-2xl md:text-3xl lg:text-4xl
- Full-width buttons on mobile

---

## Spacing Rhythm

**Section Padding:**
- Standard: py-16 md:py-20
- Hero: py-20 md:py-24
- Compact: py-12 md:py-16

**Element Gaps:**
- Cards in grid: gap-6 md:gap-8
- Items in list: space-y-4
- Icon to text: gap-3 or gap-4
- Section header to content: mb-12 md:mb-14

**Card Padding:**
- Standard: p-6 md:p-8
- Compact: p-4 md:p-6
- Stat boxes: p-4

---

## Checklist for New Components

1. ✅ Use bg-card border shadow-sm for cards
2. ✅ Use bg-muted/30 for section backgrounds
3. ✅ Use navy (#0A1628) for icon containers
4. ✅ Use gold (#C8A661) for accent numbers and highlights
5. ✅ Ensure text contrast is readable
6. ✅ Test on mobile, tablet, desktop
7. ✅ Add data-testid attributes for testing
8. ✅ Use semantic HTML structure
