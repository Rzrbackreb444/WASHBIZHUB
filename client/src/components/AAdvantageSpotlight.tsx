import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  MapPin, 
  Wrench, 
  Users, 
  ExternalLink,
  Star,
  Building2,
  MessageCircle
} from "lucide-react";
import type { BlogPost } from "@shared/schema";

const AFFILIATE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";
const FACEBOOK_GROUP = "https://facebook.com/groups/thelaundromat";

const STATE_COLORS: Record<string, string> = {
  "TX": "from-red-600 to-orange-600",
  "LA": "from-purple-600 to-pink-600",
  "OK": "from-green-600 to-teal-600",
  "AR": "from-blue-600 to-indigo-600",
};

const BRAND_ICONS: Record<string, string> = {
  "dexter": "DX",
  "continental_girbau": "CG",
  "maytag": "MY",
  "whirlpool": "WP",
  "econ_o": "EO",
  "lg": "LG",
  "bc_technologies": "BC",
};

function extractStateFromSubcategory(subcategory?: string): string {
  if (!subcategory) return "";
  const match = subcategory.match(/state-([a-z]{2})/i);
  return match ? match[1].toUpperCase() : "";
}

function extractBrandFromSubcategory(subcategory?: string): string {
  if (!subcategory) return "";
  const parts = subcategory.split("-");
  return parts.length > 2 ? parts.slice(2).join("_") : "";
}

export function AAdvantageSpotlight() {
  const { data: blogs = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/aadvantage/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" data-testid="section-aadvantage-spotlight">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Star className="w-3 h-3 mr-1" />
            Featured Partner
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AAdvantage Laundry Equipment Guides
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Expert resources for laundromat owners in Texas, Louisiana, Oklahoma, and Arkansas. 
            Featuring Dexter, Continental Girbau, Maytag, and more top brands.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <a 
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            data-testid="link-aadvantage-cta"
          >
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 border-blue-500/30 hover:border-yellow-500/50 transition-all hover:scale-[1.02]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Get Equipment Quotes</h3>
                  <p className="text-white/70">Request pricing from AAdvantage Laundry Systems</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </a>
          
          <a 
            href={FACEBOOK_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            data-testid="link-facebook-group-cta"
          >
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 border-indigo-500/30 hover:border-yellow-500/50 transition-all hover:scale-[1.02]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Join 10,000+ Owners</h3>
                  <p className="text-white/70">Connect with the laundromat community</p>
                </div>
                <ExternalLink className="w-6 h-6 text-white/50 group-hover:text-yellow-400 transition-all" />
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {blogs.slice(0, 6).map((blog) => {
              const state = extractStateFromSubcategory(blog.subcategory ?? undefined);
              const brand = extractBrandFromSubcategory(blog.subcategory ?? undefined);
              const isForum = blog.subcategory === "forum-community";
              const gradientClass = isForum 
                ? "from-purple-600 to-pink-600" 
                : STATE_COLORS[state] || "from-gray-600 to-gray-700";

              return (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card 
                    className="h-full hover:border-primary/50 transition-all hover:scale-[1.02] cursor-pointer overflow-hidden group"
                    data-testid={`card-blog-${blog.id}`}
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {isForum ? (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Community
                          </Badge>
                        ) : (
                          <>
                            {state && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <MapPin className="w-3 h-3 mr-1" />
                                {state}
                              </Badge>
                            )}
                            {brand && BRAND_ICONS[brand] && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                                <Wrench className="w-3 h-3 mr-1" />
                                {BRAND_ICONS[brand]}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="px-5 pb-5 pt-0">
                      <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl mb-10">
            <Wrench className="w-12 h-12 mx-auto text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Explore Equipment Resources</h3>
            <p className="text-white/60 mb-6">
              Browse our comprehensive equipment guides and interactive wizard to find the perfect machines for your laundromat.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/equipment-guides">
                <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                  Equipment Guides
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/equipment-wizard">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90">
                  Equipment Wizard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* View All / CTA */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/blog?category=laundromat">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-view-all-blogs">
              View All Equipment Guides
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a 
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90" data-testid="button-get-quotes">
              Get Free Equipment Quote
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        {/* SEO Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/50 max-w-3xl mx-auto">
            AAdvantage Laundry Systems is the leading commercial laundry equipment distributor serving 
            Texas, Oklahoma, Louisiana, and the Southern United States. Featuring Dexter, Continental Girbau, 
            Maytag Commercial, Whirlpool, LG, Econ-O-Wash, and B&C Technologies.
          </p>
        </div>
      </div>
    </section>
  );
}
