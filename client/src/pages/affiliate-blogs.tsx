import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { Search, BookOpen, Filter } from "lucide-react";

const BLOGS = [
  {
    id: "sbx-laundromat-financing-guide",
    title: "SBA Financing for Laundromats: Complete 2025 Guide to SBA 7(a) Loans",
    slug: "sba-laundromat-financing-guide",
    category: "SBA Financing",
    industry: "Laundromat",
    length: "Long",
    excerpt: "SBA financing is the most accessible path to owning a laundromat. Discover how to get approved for SBA 7(a) loans with lower rates and longer terms than traditional bank loans.",
    readTime: "15 min"
  },
  {
    id: "laundromat-acquisition-financing",
    title: "Laundromat Acquisition Financing: How to Finance Your First Laundromat Purchase",
    slug: "laundromat-acquisition-financing",
    category: "Acquisition",
    industry: "Laundromat",
    length: "Long",
    excerpt: "Acquiring an existing laundromat requires strategic financing. Learn how to structure your acquisition, negotiate terms, and maximize profitability.",
    readTime: "18 min"
  },
  {
    id: "equipment-financing-dexter-girbau",
    title: "Equipment Financing for Dexter & Continental Girbau Laundromat Equipment",
    slug: "equipment-financing-dexter-girbau",
    category: "Equipment",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Guide to financing Dexter and Continental Girbau commercial laundry equipment. Compare financing options, lease vs. buy, and ROI calculations.",
    readTime: "10 min"
  },
  {
    id: "atm-machine-financing-laundromat",
    title: "ATM Machine Financing for Laundromats: Boost Revenue & Cash Flow",
    slug: "atm-machine-financing-laundromat",
    category: "Equipment",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Learn how to add ATM machines to your laundromat using flexible financing. Increase revenue by 3-5% without upfront capital investment.",
    readTime: "8 min"
  },
  {
    id: "car-wash-sba-financing",
    title: "SBA Financing for Car Washes: Complete Guide to Car Wash Business Loans",
    slug: "car-wash-sba-financing",
    category: "SBA Financing",
    industry: "Car Wash",
    length: "Long",
    excerpt: "Complete guide to financing a car wash business with SBA loans. Learn rates, terms, and how to qualify for up to $5M in funding.",
    readTime: "16 min"
  },
  {
    id: "dry-cleaning-sba-financing",
    title: "SBA Financing for Dry Cleaning: Start or Expand Your Dry Cleaning Business",
    slug: "dry-cleaning-sba-financing",
    category: "SBA Financing",
    industry: "Dry Cleaner",
    length: "Long",
    excerpt: "Guide to SBA financing for dry cleaning businesses. Learn how to combine dry cleaning with laundromat operations for maximum revenue.",
    readTime: "17 min"
  },
  {
    id: "dallas-laundromat-financing-guide",
    title: "Dallas Laundromat Financing Guide: Local Lenders & SBA Programs",
    slug: "dallas-laundromat-financing",
    category: "Regional",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Dallas-specific guide to laundromat financing. Connect with local SBA lenders, explore Texas business programs.",
    readTime: "9 min",
    location: "Dallas, TX"
  },
  {
    id: "arkansas-laundromat-financing",
    title: "Arkansas Laundromat Financing: Local Resources & State Programs",
    slug: "arkansas-laundromat-financing",
    category: "Regional",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Arkansas-specific laundromat financing guide. Discover local lenders, state programs, and opportunities.",
    readTime: "9 min",
    location: "Arkansas"
  },
  {
    id: "oklahoma-laundromat-financing",
    title: "Oklahoma Laundromat Financing: How to Start Your Laundromat Business",
    slug: "oklahoma-laundromat-financing",
    category: "Regional",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Complete Oklahoma laundromat financing guide. Find local lenders, state incentives, and proven strategies.",
    readTime: "9 min",
    location: "Oklahoma"
  },
  {
    id: "cleanbi-score-financing-impact",
    title: "How Your CLEANBI™ Score Affects Laundromat Financing & Loan Approval",
    slug: "cleanbi-score-financing-impact",
    category: "Business Intelligence",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Understand how CLEANBI™ scores impact your ability to secure laundromat financing. Optimize business metrics before applying.",
    readTime: "10 min"
  },
  {
    id: "laundromat-valuation-financing",
    title: "Laundromat Valuation & Financing: Understand Your Business Worth",
    slug: "laundromat-valuation-financing",
    category: "Valuation",
    industry: "Laundromat",
    length: "Medium",
    excerpt: "Learn how laundromats are valued for financing purposes. Use valuation methods to understand your business worth.",
    readTime: "11 min"
  }
];

const CATEGORIES = ["All", ...Array.from(new Set(BLOGS.map(b => b.category)))];
const INDUSTRIES = ["All", ...Array.from(new Set(BLOGS.map(b => b.industry)))];
const LENGTHS = ["All", "Short", "Medium", "Long"];

export default function AffiliateBlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedLength, setSelectedLength] = useState("All");

  const filteredBlogs = useMemo(() => {
    return BLOGS.filter(blog => {
      const matchesSearch = searchQuery === "" || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
      const matchesIndustry = selectedIndustry === "All" || blog.industry === selectedIndustry;
      const matchesLength = selectedLength === "All" || blog.length === selectedLength;
      return matchesSearch && matchesCategory && matchesIndustry && matchesLength;
    });
  }, [searchQuery, selectedCategory, selectedIndustry, selectedLength]);

  return (
    <>
      <SEO 
        title="Laundromat & Business Financing Guides | WashBizHub Blog" 
        description="20+ comprehensive guides on SBA financing, equipment loans, and expansion strategies for laundromats, car washes, and dry cleaners. Learn from experts."
        canonicalUrl="/affiliate-blogs"
        keywords={["laundromat financing", "SBA loans", "business financing guides", "equipment financing"]}
        ogType="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <BookOpen className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Financing Guides & Resources</h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
              20+ expert guides on laundromat, car wash, and dry cleaning financing. Learn SBA loans, equipment financing, and expansion strategies.
            </p>
            
            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border border-accent/30 rounded-lg p-6 max-w-3xl mx-auto">
              <p className="text-white text-lg mb-4 font-semibold">Ready to move forward with financing? Our experts are here to help.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link 
                  href="/consultation"
                  className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-lg transition-colors inline-block"
                  data-testid="button-schedule-consultation"
                >
                  Schedule Expert Consultation
                </Link>
                <a 
                  href="mailto:consult@washbizhub.com" 
                  className="px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition-colors"
                  data-testid="link-email-consultation"
                  aria-label="Email our consultation team at consult@washbizhub.com"
                >
                  Email consult@washbizhub.com
                </a>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 mb-8">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                <Input 
                  placeholder="Search financing guides..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                />
              </div>
            </div>

            {/* Filter Tags */}
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <Badge 
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Industry</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map(ind => (
                    <Badge 
                      key={ind}
                      variant={selectedIndustry === ind ? "default" : "outline"}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedIndustry(ind)}
                    >
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Length</label>
                <div className="flex flex-wrap gap-2">
                  {LENGTHS.map(len => (
                    <Badge 
                      key={len}
                      variant={selectedLength === len ? "default" : "outline"}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setSelectedLength(len)}
                    >
                      {len}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-white/70 mb-6">Showing {filteredBlogs.length} of {BLOGS.length} guides</p>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <Card key={blog.id} className="bg-white/10 backdrop-blur border-white/20 hover-elevate transition-all">
                <CardHeader>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{blog.category}</Badge>
                    <Badge variant="outline" className="text-xs">{blog.industry}</Badge>
                    <Badge variant="outline" className="text-xs">{blog.length}</Badge>
                  </div>
                  <CardTitle className="text-white text-lg">{blog.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-white/70">{blog.excerpt}</CardDescription>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{blog.readTime} read</span>
                    {blog.location && <span className="text-accent">{blog.location}</span>}
                  </div>
                  <Link href={`/blog/${blog.slug}`}>
                    <Button className="w-full" size="sm">Read Guide</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No guides found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
