import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, DollarSign, TrendingUp, Zap, Users, 
  BarChart3, PieChart, LineChart, ArrowRight, Sparkles,
  CheckCircle2, Lock, Download, Mail, FileSpreadsheet,
  Crown, Shield, Star
} from "lucide-react";

const CALCULATORS = [
  {
    id: "valuation",
    title: "Business Valuation",
    subtitle: "4 Proven Methodologies",
    description: "Calculate your laundromat's true market value using Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches.",
    href: "/valuation-calculator",
    icon: DollarSign,
    color: "#22C55E",
    charts: ["Bar", "Pie"],
    features: ["4 valuation methods", "Industry benchmarks", "Seller guidance"],
    popular: true,
  },
  {
    id: "roi",
    title: "ROI Calculator",
    subtitle: "5-Year Projections",
    description: "Analyze return on investment with multi-year cash flow projections and compound growth calculations.",
    href: "/roi-calculator",
    icon: TrendingUp,
    color: "#8B5CF6",
    charts: ["Line", "Bar"],
    features: ["Payback period", "Cash-on-cash return", "Growth modeling"],
    popular: true,
  },
  {
    id: "loan",
    title: "Loan Calculator",
    subtitle: "Amortization Analysis",
    description: "Calculate monthly payments, total interest, and visualize principal vs. interest breakdown for any loan scenario.",
    href: "/loan-calculator",
    icon: BarChart3,
    color: "#F59E0B",
    charts: ["Pie", "Line"],
    features: ["Monthly payments", "Interest breakdown", "Term comparison"],
    popular: false,
  },
  {
    id: "utility",
    title: "Utility Cost Calculator",
    subtitle: "UPG Benchmarking",
    description: "Track utilities as percentage of gross (UPG) and identify cost-saving opportunities across electric, water, and gas.",
    href: "/utility-calculator",
    icon: Zap,
    color: "#06B6D4",
    charts: ["Pie", "Bar"],
    features: ["Cost per load", "UPG tracking", "Savings analysis"],
    popular: false,
  },
  {
    id: "labor",
    title: "Labor Cost Calculator",
    subtitle: "Staffing Optimization",
    description: "Optimize your labor costs with wage breakdown, payroll tax calculations, and industry benchmark comparisons.",
    href: "/labor-calculator",
    icon: Users,
    color: "#EC4899",
    charts: ["Pie", "Bar"],
    features: ["Labor % of revenue", "Shift analysis", "Role allocation"],
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "The valuation calculator helped me price my laundromat correctly. Sold within 60 days!",
    author: "Michael R.",
    role: "Seller, Dallas TX",
    rating: 5,
  },
  {
    quote: "ROI projections were spot-on. Secured SBA financing with the detailed reports.",
    author: "Sarah L.",
    role: "Buyer, Phoenix AZ",
    rating: 5,
  },
  {
    quote: "Finally understand my utility costs. Already saving $400/month after optimizing.",
    author: "James T.",
    role: "Owner, Chicago IL",
    rating: 5,
  },
];

export default function CalculatorsHub() {
  return (
    <>
      <SEO
        title="Professional Laundromat Calculators | WashBizHub"
        description="Free professional calculators for laundromat valuation, ROI analysis, loan amortization, utility costs, and labor optimization. Export to PDF, email, or Google Sheets."
        canonicalUrl="/calculators"
        keywords={["laundromat calculator", "laundry business ROI", "laundromat valuation", "business calculator", "utility calculator"]}
        breadcrumbs={[{ name: "Calculators", url: "/calculators" }]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-gray-900/50 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <Breadcrumb items={[{ name: "Calculator Suite", url: "/calculators" }]} />
          </div>
        </div>

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 px-4 py-1.5">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional-Grade Tools
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Laundromat <span className="text-accent">Calculator Suite</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
              Make data-driven decisions with our industry-leading calculators. 
              Interactive sliders, beautiful charts, and professional export options.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 text-white/60">
                <BarChart3 className="w-5 h-5 text-accent" />
                <span>Bar Charts</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <PieChart className="w-5 h-5 text-accent" />
                <span>Pie Charts</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <LineChart className="w-5 h-5 text-accent" />
                <span>Line Charts</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Download className="w-5 h-5 text-accent" />
                <span>PDF Export</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
                <span>Google Sheets</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/80 to-accent border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-black">
                    {["JT", "MR", "SL", "KW"][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-xs text-white/60">Trusted by 11,250+ professionals</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CALCULATORS.map((calc) => {
                const Icon = calc.icon;
                return (
                  <Link key={calc.id} href={calc.href}>
                    <Card 
                      className="h-full bg-white/5 border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                      data-testid={`card-calculator-${calc.id}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div 
                            className="p-3 rounded-xl transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${calc.color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: calc.color }} />
                          </div>
                          {calc.popular && (
                            <Badge className="bg-accent/20 text-accent border-accent/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                            {calc.title}
                          </h3>
                          <p className="text-sm text-accent/80 font-medium">{calc.subtitle}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {calc.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {calc.charts.map((chart) => (
                            <Badge key={chart} variant="secondary" className="bg-white/5 text-white/60 border-white/10 text-xs">
                              {chart === "Bar" && <BarChart3 className="w-3 h-3 mr-1" />}
                              {chart === "Pie" && <PieChart className="w-3 h-3 mr-1" />}
                              {chart === "Line" && <LineChart className="w-3 h-3 mr-1" />}
                              {chart}
                            </Badge>
                          ))}
                        </div>

                        <ul className="space-y-2 mb-4">
                          {calc.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-white/50">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className="w-full bg-white/10 hover:bg-accent hover:text-black text-white group-hover:bg-accent group-hover:text-black transition-all"
                        >
                          Open Calculator
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Export & Share Your Results
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                All calculators include professional export options for presentations, financing applications, and record-keeping.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">PDF Export</h3>
                  <p className="text-white/60 text-sm">
                    Professional branded reports perfect for lenders, investors, and business records.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Email Results</h3>
                  <p className="text-white/60 text-sm">
                    Send calculations to yourself or collaborators with detailed breakdowns.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Google Sheets</h3>
                  <p className="text-white/60 text-sm">
                    Export to editable spreadsheets for custom analysis and scenario modeling.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-transparent to-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                What Our Users Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-white/80 mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.author}</p>
                      <p className="text-white/50 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <Badge className="mb-4 bg-black/20 text-white border-white/20">
                  <Shield className="w-3 h-3 mr-1" />
                  100% Free to Use
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to Make Smarter Decisions?
                </h2>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  All calculators are free to use. Create an account to save your calculations and unlock export features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/valuation-calculator">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-black font-bold px-8">
                      <Calculator className="w-5 h-5 mr-2" />
                      Start with Valuation
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      View Pro Features
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Data Never Shared</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Industry Verified Formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>4.9/5 User Rating</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
