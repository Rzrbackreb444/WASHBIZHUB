import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Printer, Download, Share2 } from "lucide-react";
import londrLogo from "@assets/Untitled design_1763837488984.png";

export default function BookAdPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-primary" />
              Book Ad Preview
            </h1>
            <p className="text-muted-foreground mt-2">
              Preview how londr.com will appear in The Laundromat Bible
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" data-testid="button-print-preview">
              <Printer className="w-4 h-4 mr-2" />
              Print Preview
            </Button>
            <Button variant="outline" size="sm" data-testid="button-share-preview">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Pricing Info */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-xl font-bold mb-2">Premium Partner Placement</h3>
              <p className="text-muted-foreground">Full-page color advertisement in vendor directory section</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">$5,000</div>
              <div className="text-sm text-muted-foreground">One-time • Permanent placement</div>
            </div>
          </div>
        </Card>

        {/* Book Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Page - Content */}
          <Card className="p-8 bg-white dark:bg-slate-950 shadow-2xl">
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Chapter 12: Equipment & Suppliers
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Trusted Vendor Directory
                </p>
              </div>
              
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p className="text-sm leading-relaxed">
                  Selecting the right equipment supplier is crucial for your laundromat's success. 
                  The vendors featured in this directory have been carefully vetted for quality, 
                  reliability, and customer service.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm mb-2">Key Selection Criteria:</h3>
                  <ul className="text-xs space-y-1.5 list-disc list-inside">
                    <li>Industry experience and reputation</li>
                    <li>Equipment warranty and support</li>
                    <li>Financing options available</li>
                    <li>Installation and maintenance services</li>
                    <li>Customer testimonials and reviews</li>
                  </ul>
                </div>

                <p className="text-sm leading-relaxed">
                  The following pages feature our premium partners who offer comprehensive 
                  solutions for laundromat owners at every stage of business development.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Page 142</span>
                <Badge variant="outline" className="text-[10px]">Vendor Directory</Badge>
              </div>
            </div>
          </Card>

          {/* Right Page - londr Full Page Ad */}
          <Card className="p-0 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
            <div className="relative h-full min-h-[700px]">
              {/* Premium Ad Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
              {/* Content */}
              <div className="relative z-10 p-12 h-full flex flex-col">
                {/* Logo */}
                <div className="text-center mb-8">
                  <img 
                    src={londrLogo} 
                    alt="londr" 
                    className="h-24 mx-auto mb-6 drop-shadow-2xl"
                  />
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                </div>

                {/* Headline */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    Premium Equipment &<br />
                    Flexible Financing
                  </h2>
                  <p className="text-xl text-blue-100">
                    Trusted by 500+ laundromat owners nationwide
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">500+</div>
                    <div className="text-sm text-blue-200">Satisfied Customers</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">$50M+</div>
                    <div className="text-sm text-blue-200">Equipment Sold</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-blue-200">Customer Support</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-sm text-blue-200">Satisfaction Rate</div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-3">Our Services:</h3>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Commercial Washers & Dryers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Parts & Maintenance Solutions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Flexible Equipment Financing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Installation & Training Services
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div className="mt-auto text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-2xl font-bold text-white mb-2">londr.com</div>
                    <div className="text-sm text-blue-200">
                      Visit our website or call for a free consultation
                    </div>
                  </div>
                </div>

                {/* Premium Partner Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                    Premium Partner
                  </Badge>
                </div>
              </div>

              {/* Page Number */}
              <div className="absolute bottom-4 right-8">
                <span className="text-xs text-blue-300/60">Page 143</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Bundled Offer */}
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Bundle & Save</Badge>
                <span className="text-sm text-muted-foreground">Limited Time Offer</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Complete WashBizHub Package</h3>
              <p className="text-muted-foreground">
                Book ad + 6 months website placement + FB group featured post
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground line-through">$22,500 value</div>
              <div className="text-4xl font-bold text-primary">$15,000</div>
              <div className="text-sm text-muted-foreground">Save $7,500</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
