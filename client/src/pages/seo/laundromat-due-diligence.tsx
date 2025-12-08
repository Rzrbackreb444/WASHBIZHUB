/**
 * SEO Landing Page: Laundromat Due Diligence
 * Target Keywords: laundromat due diligence, laundromat due diligence checklist, buying laundromat checklist
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, FileText, CheckCircle2, AlertTriangle, Wrench, DollarSign, Building2, Users, ClipboardCheck } from "lucide-react";

const config = getSEOPageConfig("/laundromat-due-diligence")!;

const stats = [
  { value: "100+", label: "Checklist Items" },
  { value: "30-60", label: "Days Average" },
  { value: "$50K+", label: "Mistakes Avoided" },
  { value: "2,400+", label: "Buyers Helped" }
];

const features = [
  {
    icon: "fileText",
    title: "Complete Checklist",
    description: "100+ verification items covering financials, equipment, lease, utilities, and legal compliance."
  },
  {
    icon: "calculator",
    title: "Financial Verification",
    description: "Cross-reference revenue with utility usage and coin collection records."
  },
  {
    icon: "wrench",
    title: "Equipment Inspection",
    description: "Assess age, condition, maintenance history, and remaining useful life."
  },
  {
    icon: "building",
    title: "Lease Analysis",
    description: "Review terms, transferability, renewal options, and rent escalations."
  },
  {
    icon: "mapPin",
    title: "Location Assessment",
    description: "Analyze demographics, competition, and growth potential with CLEANBI."
  },
  {
    icon: "shield",
    title: "Red Flag Detection",
    description: "Identify deal-breakers before you commit to purchase."
  }
];

const testimonials = [
  {
    quote: "The due diligence checklist helped me uncover $3,000/month in hidden expenses. Saved me from a bad deal.",
    author: "Michael R.",
    role: "Buyer, Orlando FL",
    rating: 5
  },
  {
    quote: "Used the utility verification method - revenue didn't match water usage. Seller reduced price by $60K.",
    author: "Lisa T.",
    role: "Investor, Seattle WA",
    rating: 5
  },
  {
    quote: "As a first-time buyer, the checklist gave me confidence to negotiate like a pro.",
    author: "James C.",
    role: "New Owner, Denver CO",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "CLEANBI Explorer",
    description: "Automated location and competition analysis.",
    href: "/cleanbi-explorer",
    icon: "mapPin"
  },
  {
    name: "Valuation Calculator",
    description: "Verify asking price against market value.",
    href: "/valuation-calculator",
    icon: "calculator"
  },
  {
    name: "SBA Readiness Checker",
    description: "Prepare for financing approval.",
    href: "/sba-readiness",
    icon: "dollarSign"
  }
];

const checklistCategories = [
  {
    title: "Financial Documentation",
    icon: DollarSign,
    items: [
      "3 years of tax returns",
      "Monthly P&L statements",
      "Bank statements (12 months)",
      "Coin collection logs",
      "Card transaction reports",
      "Vending income records"
    ]
  },
  {
    title: "Equipment Assessment",
    icon: Wrench,
    items: [
      "Equipment age and condition",
      "Maintenance records",
      "Repair history and costs",
      "Remaining useful life",
      "Replacement cost estimates",
      "Manufacturer warranties"
    ]
  },
  {
    title: "Lease & Property",
    icon: Building2,
    items: [
      "Lease term remaining",
      "Renewal options",
      "Rent escalation clauses",
      "Transferability provisions",
      "CAM charges breakdown",
      "Landlord contact verification"
    ]
  },
  {
    title: "Utilities & Operations",
    icon: ClipboardCheck,
    items: [
      "Water bills (24 months)",
      "Electric bills (24 months)",
      "Gas bills (24 months)",
      "Sewer/waste charges",
      "Insurance costs",
      "Payroll records"
    ]
  }
];

const redFlags = [
  "Seller refuses to provide financial documents",
  "Revenue doesn't match utility consumption",
  "Hidden or undisclosed expenses",
  "Short lease remaining (under 3 years)",
  "Equipment needs immediate major repairs",
  "Declining neighborhood or new competition",
  "Outstanding legal issues or code violations",
  "Seller rushing the closing process"
];

export default function LaundromatDueDiligenceSEO() {
  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Get Free Checklist", href: "/resources" },
        secondary: { text: "Talk to Expert", href: "/consultation" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-checklist">
            Complete Due Diligence Checklist
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Everything you need to verify before buying a laundromat
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {checklistCategories.map((category, idx) => (
              <Card key={idx} className="border shadow-md" data-testid={`checklist-${idx}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-red-50/50 dark:bg-red-950/10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-red-700 dark:text-red-400" data-testid="heading-red-flags">
            <AlertTriangle className="inline w-8 h-8 mr-2" />
            Red Flags to Watch For
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Walk away if you encounter any of these warning signs
          </p>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {redFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-3" data-testid={`red-flag-${idx}`}>
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{flag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-timeline">
            Due Diligence Timeline
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            A typical 30-60 day due diligence period
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                { week: "Week 1-2", title: "Document Collection", tasks: ["Request financial records", "Get utility bills", "Review lease agreement", "Obtain equipment list"] },
                { week: "Week 2-3", title: "Financial Analysis", tasks: ["Verify revenue vs. utilities", "Calculate NOI and SDE", "Compare to asking price", "Identify hidden expenses"] },
                { week: "Week 3-4", title: "Physical Inspection", tasks: ["Inspect all equipment", "Test machines and systems", "Review maintenance records", "Assess property condition"] },
                { week: "Week 4-6", title: "Verification & Negotiation", tasks: ["Contact vendors/suppliers", "Verify lease transferability", "Negotiate based on findings", "Finalize financing"] }
              ].map((phase, idx) => (
                <Card key={idx} className="border-l-4 border-l-[#C8A661]" data-testid={`timeline-${idx}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#C8A661] text-[#0A1628]">{phase.week}</Badge>
                      <CardTitle>{phase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {phase.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/cleanbi-explorer">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-analyze">
                Analyze Location with CLEANBI
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
