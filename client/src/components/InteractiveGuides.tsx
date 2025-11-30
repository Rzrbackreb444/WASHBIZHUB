import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Guide {
  id: string;
  title: string;
  category: "strategy" | "operational" | "financial";
  difficulty: "beginner" | "intermediate" | "advanced";
  readTime: number;
  content: string;
  keyTakeaways: string[];
}

const SAMPLE_GUIDES: Guide[] = [
  {
    id: "1",
    title: "Location Evaluation Framework: The C.L.E.A.N. Method",
    category: "strategy",
    difficulty: "beginner",
    readTime: 12,
    content: `The most important decision in laundromat success is location. 80% of your success is determined before you even sign the lease.

**C.L.E.A.N. Framework:**

**C - Community Fit**
- 1,500+ renter-occupied households within 1 mile
- Median household income $30K-$65K (laundromat sweet spot)
- Population density 3,000+ per square mile
- Growing or stable demographics

**L - Lease Logic**
- Rent should not exceed 15% of projected revenue
- Triple net lease terms (landlord covers CAM)
- 10+ year term with renewal options
- Low occupancy percentage requirement

**E - Equipment Mix**
- 30% washers, 70% dryers (typical ratio)
- Speed Queen or Electrolux tier equipment
- Average age under 8 years
- Underutilized capacity in location

**A - Accessibility**
- 1.5 parking spaces per washer minimum
- Easy in-and-out from main road
- Visible from street (no hidden back units)
- No steep hills or difficult entry

**N - Numbers**
- Revenue potential $150K-$400K annually
- CLEANBI score 70+ before purchasing
- Owner has financial reserves for 6 months
- 4-7 year payback period`,
    keyTakeaways: [
      "Location determines 80% of success before day one",
      "Use C.L.E.A.N. framework for systematic evaluation",
      "Rent under 15% of revenue is the golden rule",
      "Parking, visibility, and accessibility are non-negotiable"
    ]
  },
  {
    id: "2",
    title: "POS System Setup for Per-Pound Pricing",
    category: "operational",
    difficulty: "intermediate",
    readTime: 15,
    content: `Modern laundromat operators are shifting from coin-only to hybrid systems that support per-pound pricing, subscriptions, and digital payments.

**Per-Pound Pricing Strategy:**
- Standard: $1.25-$2.25 per pound depending on location
- Premium service: $2.50+ for whites/delicates
- Subscribe & save: 10% discount for monthly members
- Loyalty programs: Every $100 spent = $10 credit

**Implementation Steps:**
1. Install digital scales at each wash station
2. Set up cloud-based POS (Revel, Toast, or Square)
3. Train staff on weight capture process
4. Test with 2-3 weeks of dual pricing (old + new)
5. Soft launch to loyalty members first
6. Full rollout with signage and training

**Expected Results:**
- Revenue increase: 15-25%
- Higher AOV (average order value)
- Better customer data collection
- Reduced payment processing time`,
    keyTakeaways: [
      "Per-pound pricing increases revenue 15-25%",
      "Hybrid payment systems reduce coin collection burden",
      "Digital scales and POS integration is key",
      "Loyalty programs create recurring revenue"
    ]
  },
  {
    id: "3",
    title: "Equipment Maintenance Schedule: Maximize Uptime",
    category: "operational",
    difficulty: "beginner",
    readTime: 10,
    content: `Equipment downtime directly costs revenue. A systematic maintenance schedule prevents 80% of breakdowns.

**Daily Checks (10 minutes):**
- Walk through and spot check all machines
- Empty soap dispensers if needed
- Remove lint from dryer vents
- Check for water leaks or unusual sounds

**Weekly Maintenance (30 minutes):**
- Deep clean of all surfaces
- Inspect door seals and hinges
- Check water supply connections
- Test all payment systems

**Monthly Inspections (1-2 hours):**
- Professional cleaning of all machines
- Lubricate door mechanisms
- Replace worn gaskets and seals
- Calibrate scales

**Quarterly Service:**
- Schedule professional technician visit
- Replace filters and hoses
- Deep descale machines
- Update firmware on digital systems

**Annual Maintenance:**
- Full equipment audit
- Replacement parts budget allocation
- Review maintenance logs for patterns
- Plan upgrades for next year`,
    keyTakeaways: [
      "Daily checks prevent 80% of breakdowns",
      "Proactive maintenance costs less than reactive repairs",
      "Document everything for warranty and insurance",
      "Budget 10-15% of revenue for annual maintenance"
    ]
  },
];

export function InteractiveGuides() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Interactive Learning Guides</h2>
        <p className="text-muted-foreground">Master proven strategies with detailed step-by-step guides</p>
      </div>

      <div className="grid gap-6">
        {SAMPLE_GUIDES.map((guide) => (
          <Card key={guide.id} className="hover-elevate transition-all" data-testid={`guide-${guide.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {guide.category === "strategy" && "Strategy"}
                      {guide.category === "operational" && "Operations"}
                      {guide.category === "financial" && "Financial"}
                    </Badge>
                    <Badge variant={guide.difficulty === "beginner" ? "secondary" : guide.difficulty === "intermediate" ? "outline" : "default"}>
                      {guide.difficulty}
                    </Badge>
                    <Badge variant="outline" className="gap-1 ml-auto">
                      <span className="text-xs">{guide.readTime} min read</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                </div>
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 ml-4" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview of content */}
              <div className="text-sm leading-relaxed line-clamp-4 text-muted-foreground prose prose-sm dark:prose-invert prose-headings:text-foreground prose-strong:text-primary prose-p:text-muted-foreground max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {guide.content}
                </ReactMarkdown>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Key Takeaways:</p>
                <ul className="space-y-1">
                  {guide.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button className="w-full gap-2" data-testid={`button-read-guide-${guide.id}`}>
                <BookOpen className="w-4 h-4" />
                Read Full Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pro Tips Card */}
      <Card className="bg-accent/10 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Pro Tips for Maximum Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">✓ Read guides in order (Strategy → Operations → Financial) for best results</p>
          <p className="text-sm">✓ Take notes on specific actions you'll implement</p>
          <p className="text-sm">✓ Reference these guides when making business decisions</p>
          <p className="text-sm">✓ Share insights with your team during training</p>
        </CardContent>
      </Card>
    </div>
  );
}
