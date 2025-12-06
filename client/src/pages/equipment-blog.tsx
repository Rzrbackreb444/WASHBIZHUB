import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { equipmentBlogs, getBlogBySlug, AFFILIATE_LINK } from "@/data/equipment-blogs";
import { AFFILIATE_LINK as CATALOG_AFFILIATE_LINK } from "@/data/equipment-catalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock, ExternalLink, BookOpen, Wrench, Building2, DollarSign, MapPin } from "lucide-react";

// Blog listing page
export function EquipmentBlogList() {
  const categoryIcons: Record<string, any> = {
    retool: Wrench,
    comparison: BookOpen,
    hospitality: Building2,
    pricing: DollarSign,
    regional: MapPin,
  };

  const categoryLabels: Record<string, string> = {
    retool: "Retool Guide",
    comparison: "Brand Comparison",
    hospitality: "Hospitality",
    pricing: "Pricing Guide",
    regional: "Regional Guide",
  };

  return (
    <>
      <Helmet>
        <title>Commercial Laundry Equipment Blog | Expert Guides & Analysis | WashBizHub</title>
        <meta name="description" content="Expert guides on commercial laundry equipment. Retool costs, brand comparisons, pricing guides, and ROI analysis. Dexter, Continental Girbau, and more." />
        <meta property="og:title" content="Commercial Laundry Equipment Blog | WashBizHub" />
        <meta property="og:description" content="Expert guides on commercial laundry equipment including retool costs, brand comparisons, and pricing guides." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://washbizhub.com/equipment/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1628] via-[#1a3a5c] to-[#0A1628] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-[#C8A661] text-[#0A1628] hover:bg-[#B8964F]">
                Expert Equipment Guides
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Commercial Laundry Equipment Blog
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                In-depth guides, pricing analysis, and expert insights to help you make the right equipment decisions
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                  <a href={CATALOG_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-quote-hero">
                    Get Equipment Quote <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/equipment" data-testid="link-equipment-hub">
                    Equipment Hub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipmentBlogs.map((blog, index) => {
                const IconComponent = categoryIcons[blog.subcategory] || BookOpen;
                return (
                  <Card 
                    key={blog.slug} 
                    className="hover-elevate transition-all duration-300 border-2 hover:border-[#C8A661]/50 overflow-hidden"
                    data-testid={`card-blog-${index}`}
                  >
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-3 left-3 flex items-center gap-1 bg-[#C8A661] text-[#0A1628]"
                      >
                        <IconComponent className="h-3 w-3" />
                        {categoryLabels[blog.subcategory] || blog.subcategory}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl leading-tight">
                        <Link 
                          href={`/equipment/blog/${blog.slug}`}
                          className="hover:text-[#C8A661] transition-colors"
                          data-testid={`link-blog-title-${index}`}
                        >
                          {blog.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {blog.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          8 min read
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.focusKeyphrases.slice(0, 2).map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild className="w-full bg-[#0A1628] hover:bg-[#1a3a5c]">
                        <Link href={`/equipment/blog/${blog.slug}`} data-testid={`button-read-more-${index}`}>
                          Read Full Guide
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#0A1628] to-[#1a3a5c]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Upgrade Your Equipment?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get expert consultation and competitive pricing on Dexter and Continental Girbau commercial laundry equipment
            </p>
            <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
              <a href={CATALOG_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-free-quote">
                Get Your Free Quote <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

// Individual blog post page
export function EquipmentBlogPost() {
  const params = useParams<{ slug: string }>();
  const blog = getBlogBySlug(params.slug || "");

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/equipment/blog">Back to Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate structured data with image for Google indexing
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.metaDescription,
    "image": {
      "@type": "ImageObject",
      "url": blog.featuredImage,
      "width": 1200,
      "height": 675
    },
    "author": {
      "@type": "Organization",
      "name": blog.authorName,
      "url": "https://washbizhub.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://washbizhub.com/logo.png"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": "2025-01-01",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://washbizhub.com/equipment/blog/${blog.slug}`
    },
    "keywords": blog.focusKeyphrases.join(", ")
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does a laundromat retool cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A typical laundromat retool costs $250,000-$680,000 depending on store size, with equipment ranging from $4,000-$20,000 per washer and $2,500-$8,000 per dryer."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between Dexter and Continental Girbau?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dexter offers 200G extraction with a 10-year warranty and Made in USA manufacturing, best for vended laundromats. Continental Girbau offers 400G extraction with soft-mount technology, best for high-volume OPL operations."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle}</title>
        <meta name="description" content={blog.metaDescription} />
        <meta name="keywords" content={blog.focusKeyphrases.join(", ")} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://washbizhub.com/equipment/blog/${blog.slug}`} />
        <meta property="og:image" content={blog.featuredImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.metaDescription} />
        <meta name="twitter:image" content={blog.featuredImage} />
        <link rel="canonical" href={`https://washbizhub.com/equipment/blog/${blog.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumb & Back Button */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/equipment/blog" data-testid="link-back-to-blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
              <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                  <li>/</li>
                  <li><Link href="/equipment" className="hover:text-foreground">Equipment</Link></li>
                  <li>/</li>
                  <li><Link href="/equipment/blog" className="hover:text-foreground">Blog</Link></li>
                  <li>/</li>
                  <li className="text-foreground font-medium truncate max-w-[200px]">{blog.title}</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Article Header with Featured Image */}
        <header className="relative text-white py-16 md:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/60" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-[#C8A661] text-[#0A1628]">
                {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg" data-testid="text-blog-title">
                {blog.title}
              </h1>
              <p className="text-xl text-gray-200 mb-6 drop-shadow-md">
                {blog.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {blog.authorName}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  January 2025
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  8 min read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-li:text-muted-foreground
                  prose-a:text-[#C8A661] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-table:border prose-table:border-border
                  prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
                  prose-td:p-3 prose-td:border prose-td:border-border
                "
                dangerouslySetInnerHTML={{ __html: blog.content }}
                data-testid="content-blog-article"
              />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Related Equipment Guides</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {equipmentBlogs
                .filter(b => b.slug !== blog.slug)
                .slice(0, 3)
                .map((relatedBlog, index) => (
                  <Card key={relatedBlog.slug} className="hover-elevate" data-testid={`card-related-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <Link 
                          href={`/equipment/blog/${relatedBlog.slug}`}
                          className="hover:text-[#C8A661]"
                        >
                          {relatedBlog.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-[#0A1628] to-[#1a3a5c]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get expert consultation and competitive pricing on commercial laundry equipment
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                <a href={CATALOG_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-quote-bottom">
                  Get Your Free Quote <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/equipment" data-testid="link-equipment-hub-bottom">
                  Browse Equipment
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EquipmentBlogList;
