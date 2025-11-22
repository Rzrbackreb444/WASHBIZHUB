import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Download, CheckCircle2, Mail, 
  Home, ChevronRight, BookOpen, Star, Shield
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BuyersGuide {
  id: string;
  title: string;
  category: string;
  description: string;
  pages: number;
  topics: string[];
  previewUrl?: string;
  downloadUrl?: string;
}

const BUYERS_GUIDES: BuyersGuide[] = [
  {
    id: "commercial-washers",
    title: "Commercial Washers Buying Guide 2025",
    category: "Equipment",
    description: "Complete guide to selecting commercial washers for your laundromat. Compare top brands, capacity options, and ROI calculations.",
    pages: 24,
    topics: ["Brand Comparison", "Capacity Planning", "Energy Efficiency", "ROI Calculator", "Installation Requirements", "Maintenance Tips"]
  },
  {
    id: "commercial-dryers",
    title: "Commercial Dryers Buying Guide 2025",
    category: "Equipment",
    description: "Essential guide for choosing the right commercial dryers. Gas vs electric, capacity sizing, and energy cost analysis.",
    pages: 20,
    topics: ["Gas vs Electric", "BTU Requirements", "Venting Solutions", "Energy Costs", "Best Brands", "Stack vs Single"]
  },
  {
    id: "laundromat-startup",
    title: "New Laundromat Startup Guide",
    category: "Business",
    description: "Step-by-step guide to starting a successful laundromat from scratch. Location analysis, equipment selection, and financial planning.",
    pages: 45,
    topics: ["Market Research", "Location Selection", "Equipment Package", "Financing Options", "Marketing Strategy", "First Year Roadmap"]
  },
  {
    id: "equipment-maintenance",
    title: "Equipment Maintenance Best Practices",
    category: "Operations",
    description: "Comprehensive maintenance guide to maximize equipment life and minimize downtime. Preventive schedules and troubleshooting.",
    pages: 32,
    topics: ["Preventive Maintenance", "Common Issues", "DIY vs Professional", "Parts Inventory", "Maintenance Schedule", "Cost Tracking"]
  },
  {
    id: "maximizing-roi",
    title: "Maximizing Laundromat ROI",
    category: "Finance",
    description: "Proven strategies to increase revenue and profitability. Pricing optimization, add-on services, and expense management.",
    pages: 28,
    topics: ["Pricing Strategies", "Add-On Services", "Expense Reduction", "Utility Management", "Labor Optimization", "Marketing ROI"]
  },
  {
    id: "equipment-financing",
    title: "Equipment Financing Guide",
    category: "Finance",
    description: "Navigate financing options for laundromat equipment. Loans, leasing, vendor financing, and approval strategies.",
    pages: 18,
    topics: ["Loan Options", "Lease vs Buy", "Vendor Financing", "SBA Loans", "Application Process", "Approval Tips"]
  }
];

export default function BuyersGuides() {
  const [selectedGuide, setSelectedGuide] = useState<BuyersGuide | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; source: string }) => {
      return await apiRequest("POST", "/api/newsletter/subscribe", data);
    },
    onSuccess: () => {
      toast({
        title: "Success! Check your email",
        description: "Your buyer's guide is on its way. Check your inbox for the download link.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscribers'] });
      setEmail("");
      setFirstName("");
      setSelectedGuide(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: error.message || "Please try again or contact support.",
      });
    },
  });

  const handleDownload = (guide: BuyersGuide) => {
    setSelectedGuide(guide);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide) return;
    
    subscribeMutation.mutate({
      email,
      firstName,
      source: `buyers-guide-${selectedGuide.id}`,
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Free Laundromat Buyer's Guides",
    "description": "Download free comprehensive buyer's guides for laundromat equipment, startup, operations, and financing. Expert insights and actionable advice.",
    "url": "https://washbizhub.com/buyers-guides"
  };

  return (
    <>
      <Helmet>
        <title>Free Laundromat Buyer's Guides - Equipment, Startup & Operations | WashBizHub</title>
        <meta name="description" content="Download free comprehensive buyer's guides for commercial laundry equipment, laundromat startup, operations, and financing. Expert insights, comparison charts, ROI calculators." />
        <meta name="keywords" content="laundromat buying guide, commercial washer guide, dryer buying guide, laundromat startup guide, equipment financing guide, maintenance guide" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Laundromat Buyer's Guides - WashBizHub" />
        <meta property="og:description" content="Download expert buyer's guides for laundromat equipment and operations. Free comprehensive resources." />
        <meta property="og:url" content="https://washbizhub.com/buyers-guides" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/"><a className="hover:text-primary flex items-center"><Home className="h-4 w-4" /></a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Buyer's Guides</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b">
          <div className="container mx-auto px-4 py-16 text-center">
            <Badge variant="secondary" className="mb-4">Free Resources</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Expert Laundromat Buyer's Guides</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Download comprehensive guides to make informed decisions about equipment, operations, and business growth. 100% free, no credit card required.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Expert Insights</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Actionable Advice</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Instant Download</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {BUYERS_GUIDES.map((guide) => (
              <Card key={guide.id} className="flex flex-col hover-elevate" data-testid={`card-guide-${guide.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{guide.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      {guide.pages} pages
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {guide.topics.slice(0, 3).map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                      ))}
                      {guide.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{guide.topics.length - 3} more</Badge>
                      )}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleDownload(guide)}
                        data-testid={`button-download-${guide.id}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Free
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Get Your Free Guide</DialogTitle>
                        <DialogDescription>
                          Enter your email to receive {guide.title}. We'll send you the download link instantly.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">First Name</label>
                          <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            required
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email Address</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            data-testid="input-email"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={subscribeMutation.isPending}
                          data-testid="button-submit-email"
                        >
                          {subscribeMutation.isPending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Me The Guide
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          By downloading, you'll also get exclusive laundromat tips and industry insights. Unsubscribe anytime.
                        </p>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Why Download Our Guides?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-3 bg-background rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Industry Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    Written by laundromat owners with 20+ years combined experience
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-background rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Actionable Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step instructions, checklists, and decision frameworks
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-background rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Always Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    Regular updates with latest equipment, pricing, and best practices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
