import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

const FEATURED_BLOGS = [
  {
    id: "sbx-laundromat-financing",
    title: "SBA Financing for Laundromats: Complete 2025 Guide",
    category: "SBA Financing",
    excerpt: "Get approved for SBA 7(a) loans with lower rates and longer terms.",
    slug: "sba-laundromat-financing-guide"
  },
  {
    id: "equipment-financing-dexter",
    title: "Equipment Financing for Dexter & Continental Girbau",
    category: "Equipment",
    excerpt: "Upgrade equipment without large upfront capital investment.",
    slug: "equipment-financing-dexter-girbau"
  },
  {
    id: "atm-machine-financing",
    title: "ATM Machine Financing: Boost Revenue & Cash Flow",
    category: "Revenue",
    excerpt: "Generate $300-800/month per ATM with flexible financing options.",
    slug: "atm-machine-financing-laundromat"
  },
  {
    id: "multi-unit-expansion",
    title: "Multi-Unit Laundromat Expansion Financing",
    category: "Growth",
    excerpt: "Scale from single-unit to multi-unit operations strategically.",
    slug: "multi-unit-laundromat-expansion"
  }
];

export function FeaturedBlogsCarousel() {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Expert Financing Guides</h2>
            <p className="text-white/70">Learn proven strategies for laundromat, car wash, and dry cleaning financing</p>
          </div>
          <Link href="/affiliate-blogs">
            <Button variant="outline" className="gap-2">
              View All Guides <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_BLOGS.map(blog => (
            <Card key={blog.id} className="bg-white/10 backdrop-blur border-white/20 hover-elevate transition-all group">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2 text-xs">{blog.category}</Badge>
                <CardTitle className="text-base text-white group-hover:text-accent transition-colors">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-white/70">{blog.excerpt}</CardDescription>
                <Link href="/consultation">
                  <Button size="sm" variant="default" className="w-full">Book Expert Consultation</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
