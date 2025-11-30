import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  CheckCircle2, AlertTriangle, Star, DollarSign, Wrench, Zap,
  Shield, Factory, Award, ArrowRight, ExternalLink, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Link } from "wouter";

interface BrandGuide {
  id: string;
  name: string;
  tagline: string;
  founded: string;
  headquarters: string;
  warranty: string;
  avgLifespan: string;
  priceRange: string;
  rating: number;
  overview: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  popularModels: { name: string; type: string; capacity: string; price: string }[];
  serviceNotes: string;
  color: string;
}

const BRAND_GUIDES: BrandGuide[] = [
  {
    id: "speed-queen",
    name: "Speed Queen",
    tagline: "The Gold Standard of Commercial Laundry",
    founded: "1908",
    headquarters: "Ripon, Wisconsin, USA",
    warranty: "7 years parts, 3 years labor",
    avgLifespan: "30+ years",
    priceRange: "$7,500 - $15,000",
    rating: 4.9,
    overview: "Speed Queen has been the undisputed leader in commercial laundry equipment for over a century. Built in Wisconsin with a focus on durability over features, their machines are the benchmark against which all others are measured. The phrase 'built like a tank' was practically invented for Speed Queen.",
    pros: [
      "Industry-leading 30+ year lifespan",
      "Best resale value of any brand",
      "Made entirely in the USA",
      "Simple, proven technology that any tech can service",
      "Parts readily available nationwide",
      "Outstanding build quality with steel construction",
      "7-year warranty sets industry standard"
    ],
    cons: [
      "Higher utility costs than newer technology",
      "Basic user interface and controls",
      "Slower cycle times than competitors",
      "Premium pricing reflects quality",
      "Less energy efficient than Dexter or Electrolux"
    ],
    bestFor: "Operators who prioritize longevity, reliability, and resale value over energy efficiency and modern features.",
    popularModels: [
      { name: "SC40", type: "Washer", capacity: "40 lb", price: "$8,500-$10,500" },
      { name: "SC60", type: "Washer", capacity: "60 lb", price: "$12,000-$14,500" },
      { name: "ST40", type: "Dryer", capacity: "40 lb", price: "$7,500-$9,000" },
      { name: "ST80 Stack", type: "Stack Dryer", capacity: "80 lb", price: "$14,000-$17,000" },
    ],
    serviceNotes: "Any qualified technician can service Speed Queen equipment. Parts are stocked by virtually every distributor. This is the easiest brand to maintain.",
    color: "#1E3A5F"
  },
  {
    id: "dexter",
    name: "Dexter Laundry",
    tagline: "Innovation Meets Durability",
    founded: "1894",
    headquarters: "Fairfield, Iowa, USA",
    warranty: "5 years parts, 2 years labor",
    avgLifespan: "25-30 years",
    priceRange: "$7,500 - $18,000",
    rating: 4.8,
    overview: "Dexter represents the best of both worlds: Speed Queen-level durability combined with modern efficiency and technology. Their Express Wash and Express Dry technologies significantly reduce cycle times while maintaining build quality. Made in Iowa, Dexter has quietly become the choice of sophisticated operators.",
    pros: [
      "Excellent balance of durability and efficiency",
      "Express technology reduces cycle times by 30%",
      "High G-force extraction reduces dry times",
      "DexterLive app for remote monitoring",
      "Made in the USA with premium materials",
      "Strong resale value",
      "Lower utility costs than Speed Queen"
    ],
    cons: [
      "Higher upfront cost than entry-level brands",
      "Proprietary parts for some components",
      "Dexter-trained technicians preferred",
      "Technology learning curve for traditional operators",
      "Not as widely distributed as Speed Queen"
    ],
    bestFor: "Operators who want premium build quality with modern efficiency and are willing to invest more upfront for lower operating costs.",
    popularModels: [
      { name: "T-400", type: "Washer", capacity: "40 lb", price: "$7,500-$9,500" },
      { name: "T-600", type: "Washer", capacity: "60 lb", price: "$12,000-$15,000" },
      { name: "T-900", type: "Dryer", capacity: "90 lb", price: "$15,000-$18,000" },
      { name: "C-Series", type: "Express Washer", capacity: "30 lb", price: "$8,000-$11,000" },
    ],
    serviceNotes: "While any qualified tech can service basic maintenance, complex repairs benefit from Dexter-trained technicians. Parts availability is good but not as universal as Speed Queen.",
    color: "#2563EB"
  },
  {
    id: "maytag",
    name: "Maytag Commercial",
    tagline: "Dependable Value",
    founded: "1893",
    headquarters: "Benton Harbor, Michigan, USA",
    warranty: "5 years parts",
    avgLifespan: "15-20 years",
    priceRange: "$5,500 - $10,000",
    rating: 4.2,
    overview: "Maytag Commercial offers solid, dependable equipment at a lower price point than Speed Queen or Dexter. While not built to the same 30-year standard, Maytag provides good value for operators on a budget. The familiar brand name and widespread parts availability make them a practical choice.",
    pros: [
      "Lower upfront investment",
      "Familiar, trusted brand name",
      "Parts available everywhere",
      "Any technician can service",
      "Good value for budget-conscious buyers",
      "Solid performance for the price"
    ],
    cons: [
      "Shorter lifespan (15-20 years vs 30+)",
      "More frequent repairs needed",
      "Less extraction power",
      "Lower resale value",
      "Not as robust as premium brands",
      "Higher long-term cost of ownership"
    ],
    bestFor: "New owners with limited capital, smaller operations, or those planning to sell within 10-15 years.",
    popularModels: [
      { name: "MHN33", type: "Washer", capacity: "33 lb", price: "$6,500-$8,500" },
      { name: "MAH21", type: "Washer", capacity: "21 lb", price: "$5,500-$7,000" },
      { name: "MDG28", type: "Dryer", capacity: "28 lb", price: "$5,500-$7,000" },
      { name: "MDG35", type: "Dryer", capacity: "35 lb", price: "$6,500-$8,000" },
    ],
    serviceNotes: "Easy to service with widely available parts. Any appliance technician can work on Maytag commercial equipment.",
    color: "#DC2626"
  },
  {
    id: "huebsch",
    name: "Huebsch",
    tagline: "Speed Queen DNA at a Better Price",
    founded: "1907",
    headquarters: "Ripon, Wisconsin, USA",
    warranty: "5 years parts, 2 years labor",
    avgLifespan: "25-30 years",
    priceRange: "$7,000 - $13,000",
    rating: 4.6,
    overview: "Here's the industry's best-kept secret: Huebsch equipment is manufactured in the same Ripon, Wisconsin factory as Speed Queen, by the same parent company (Alliance Laundry Systems). You get essentially the same build quality at a slightly lower price point. The trade-off? Less brand recognition and a smaller service network.",
    pros: [
      "Same factory and quality as Speed Queen",
      "10-15% lower price than Speed Queen",
      "Excellent build quality and durability",
      "Galaxy controls are user-friendly",
      "Strong extraction performance",
      "Good warranty coverage"
    ],
    cons: [
      "Less brand recognition with customers",
      "Smaller service technician network",
      "Limited resale market compared to Speed Queen",
      "Fewer distributors carry the brand",
      "Parts slightly harder to source quickly"
    ],
    bestFor: "Savvy operators who know Huebsch = Speed Queen DNA and want to save 10-15% on equipment costs.",
    popularModels: [
      { name: "HC40", type: "Washer", capacity: "40 lb", price: "$8,000-$10,000" },
      { name: "HC60", type: "Washer", capacity: "60 lb", price: "$11,000-$13,000" },
      { name: "HD30", type: "Dryer", capacity: "30 lb", price: "$6,500-$8,000" },
      { name: "HD50", type: "Dryer", capacity: "50 lb", price: "$9,000-$11,000" },
    ],
    serviceNotes: "Same technology as Speed Queen means most Speed Queen techs can service Huebsch. Parts are available through Alliance Laundry Systems distributors.",
    color: "#059669"
  },
  {
    id: "electrolux",
    name: "Electrolux Professional",
    tagline: "European Engineering, Maximum Efficiency",
    founded: "1919",
    headquarters: "Stockholm, Sweden",
    warranty: "3 years parts",
    avgLifespan: "20-25 years",
    priceRange: "$12,000 - $20,000",
    rating: 4.5,
    overview: "Electrolux Professional represents the pinnacle of laundry technology. Their machines offer the lowest utility costs, quietest operation, and most advanced features. The trade-off is higher complexity, higher upfront costs, and the need for specialized service. Best suited for premium locations.",
    pros: [
      "Industry-leading energy efficiency",
      "Quietest operation available",
      "Advanced IoT connectivity and diagnostics",
      "Automatic chemical dosing",
      "Premium customer experience",
      "Fastest cycle times with Compass Pro"
    ],
    cons: [
      "Highest upfront cost",
      "Complex technology requires specialized techs",
      "Parts can be expensive and slow to arrive",
      "Steep learning curve for operators",
      "Shorter warranty than American brands",
      "Service network is limited in some areas"
    ],
    bestFor: "Premium stores in upscale areas targeting customers who will pay more for a better experience.",
    popularModels: [
      { name: "W4180", type: "Washer", capacity: "40 lb", price: "$14,000-$17,000" },
      { name: "W4240", type: "Washer", capacity: "55 lb", price: "$16,000-$19,000" },
      { name: "T4300", type: "Dryer", capacity: "67 lb", price: "$12,000-$15,000" },
      { name: "T4450", type: "Dryer", capacity: "99 lb", price: "$15,000-$18,000" },
    ],
    serviceNotes: "Requires Electrolux-certified technicians for most repairs. Parts sourced through Electrolux Professional distributors. Service response time may be longer in rural areas.",
    color: "#7C3AED"
  },
  {
    id: "continental",
    name: "Continental Girbau",
    tagline: "European Quality, American Service",
    founded: "1960",
    headquarters: "Vic, Spain / Oshkosh, Wisconsin (US)",
    warranty: "5 years parts, 2 years labor",
    avgLifespan: "20-25 years",
    rating: 4.4,
    overview: "Continental Girbau combines European engineering with American-style service through their Wisconsin headquarters. Known for exceptional extraction (up to 450 G-force), their machines significantly reduce drying time. A solid middle ground between American workhorses and European tech.",
    pros: [
      "Excellent high-speed extraction",
      "Reduces drying time significantly",
      "Good energy efficiency",
      "US-based parts and service center",
      "Solid build quality",
      "Strong performance in wash-fold operations"
    ],
    cons: [
      "Less common in the US market",
      "Parts can take longer to source",
      "Fewer local technicians familiar with brand",
      "Higher price than Maytag",
      "Not as recognized by customers"
    ],
    bestFor: "Operators near Continental service centers who want European quality with American support, especially wash-fold focused stores.",
    popularModels: [
      { name: "EH040", type: "Washer", capacity: "40 lb", price: "$11,000-$14,000" },
      { name: "EH055", type: "Washer", capacity: "55 lb", price: "$13,000-$16,000" },
      { name: "ED050", type: "Dryer", capacity: "50 lb", price: "$9,000-$11,000" },
      { name: "ED070", type: "Dryer", capacity: "70 lb", price: "$11,000-$13,000" },
    ],
    serviceNotes: "US headquarters in Wisconsin provides good parts support. Finding local techs familiar with Continental can be challenging outside major metros.",
    color: "#EA580C"
  },
];

export default function EquipmentGuides() {
  const [selectedBrand, setSelectedBrand] = useState<string>(BRAND_GUIDES[0].id);
  const brand = BRAND_GUIDES.find(b => b.id === selectedBrand) || BRAND_GUIDES[0];

  return (
    <>
      <SEO 
        title="Commercial Laundry Equipment Guides | Brand Comparisons | WashBizHub"
        description="Comprehensive guides to commercial laundry equipment brands. Compare Speed Queen, Dexter, Maytag, Huebsch, Electrolux and Continental with honest pros and cons."
        canonicalUrl="/equipment-guides"
        keywords={["Speed Queen review", "Dexter laundry", "commercial washer comparison", "laundromat equipment guide"]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
            <Breadcrumb items={[
              { name: "Resources", url: "/resources" },
              { name: "Equipment Guides", url: "/equipment-guides" }
            ]} />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#001F3F] to-[#002B5C] text-white py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <Badge className="mb-4 bg-[#39CCCC] text-[#001F3F]">Expert Knowledge</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Commercial Laundry Equipment Guides
            </h1>
            <p className="text-white/80 max-w-3xl mx-auto text-lg">
              Honest, unbiased reviews of every major brand. Pros, cons, and who each brand is best for - no sales pitch, just facts.
            </p>
            <div className="mt-6">
              <Link href="/equipment-wizard">
                <Button className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8]">
                  <Zap className="w-4 h-4 mr-2" />
                  Try Equipment Wizard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-semibold mb-4 text-lg">Select Brand</h3>
                <div className="space-y-2">
                  {BRAND_GUIDES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      data-testid={`button-brand-${b.id}`}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedBrand === b.id 
                          ? "border-[#39CCCC] bg-[#39CCCC]/10" 
                          : "border-border hover:border-[#39CCCC]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{b.name}</span>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {b.rating}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{b.priceRange}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <div 
                  className="h-32 sm:h-40 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)` }}
                >
                  <div className="text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold">{brand.name}</h2>
                    <p className="text-white/80 mt-1">{brand.tagline}</p>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8">
                  <div className="grid sm:grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-[#39CCCC]">{brand.rating}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Rating
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{brand.avgLifespan}</div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Lifespan</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{brand.warranty}</div>
                      <div className="text-xs text-muted-foreground mt-1">Warranty</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm font-bold">{brand.priceRange}</div>
                      <div className="text-xs text-muted-foreground mt-1">Price Range</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-3">Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">{brand.overview}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
                        <ThumbsUp className="w-5 h-5" />
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {brand.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
                        <ThumbsDown className="w-5 h-5" />
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {brand.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Card className="bg-[#001F3F]/5 border-[#001F3F]/20 mb-8">
                    <CardContent className="p-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-[#39CCCC]" />
                        Best For
                      </h4>
                      <p className="text-sm text-muted-foreground">{brand.bestFor}</p>
                    </CardContent>
                  </Card>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Popular Models</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {brand.popularModels.map((model, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{model.name}</h4>
                              <p className="text-sm text-muted-foreground">{model.type} • {model.capacity}</p>
                            </div>
                            <Badge variant="secondary">{model.price}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Wrench className="w-5 h-5 text-blue-500" />
                        Service Notes
                      </h4>
                      <p className="text-sm text-muted-foreground">{brand.serviceNotes}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card className="mt-6 bg-gradient-to-r from-[#001F3F] to-[#002B5C] text-white">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-bold mb-2">Not Sure Which Brand is Right?</h4>
                  <p className="text-white/80 mb-4">Our Equipment Wizard analyzes your specific needs and recommends the best equipment for your situation.</p>
                  <Link href="/equipment-wizard">
                    <Button className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8]">
                      Start Equipment Wizard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
