import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen } from "lucide-react";
import { useBlogPost, useBlogPosts } from "@/hooks/use-blog";
import { SEO } from "@/components/SEO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { defaultBlogImages, laundromatImages } from "@/lib/laundromat-images";

// Nick's author image for EEAT optimization  
const nickAuthorImage = laundromatImages.nickFounder.src;

export default function BlogPost() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading, error } = useBlogPost(params.id || "");
  const { data: allPosts = [] } = useBlogPosts();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  const relatedPosts = allPosts
    .filter(p => p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button variant="outline" className="border-white/30 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const postContent = post.content || "";
  const postExcerpt = post.excerpt || postContent.substring(0, 160);
  const authorName = post.authorName || post.author || "WashBizHub Research Team";
  const metaKeywordsList = Array.isArray(post.metaKeywords) ? post.metaKeywords : [];
  
  // Get default featured image based on category for SEO
  const categoryImage = defaultBlogImages[post.category || ""] || defaultBlogImages.default;
  const featuredImage = post.featuredImage || categoryImage.src;
  const featuredImageAlt = post.featuredImageAlt || categoryImage.alt;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || postExcerpt,
    "image": post.featuredImage || post.ogImage || `${baseUrl}/washbizhub-og.png`,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": `${baseUrl}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/washbizhub-logo.png`
      }
    },
    "datePublished": post.datePublished || post.createdAt,
    "dateModified": post.dateModified || post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug || post.id}`
    },
    "articleSection": post.category || "Industry",
    "keywords": metaKeywordsList.join(", ")
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${baseUrl}/blog/${post.slug || post.id}` }
    ]
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readingTime = Math.ceil(postContent.length / 1500) || 3;

  // Focus keyphrases for enhanced SEO targeting
  const focusKeyphrases = Array.isArray(post.focusKeyphrases) ? post.focusKeyphrases as string[] : [];
  const allKeywords = [...new Set([...metaKeywordsList, ...focusKeyphrases])];

  // EEAT author information for enhanced trust signals
  // Default to Nick (founder) for maximum EEAT credibility
  const isNickAuthor = authorName === "Nick" || authorName === "WashBizHub Research Team" || authorName === "Nick @ WashBizHub";
  const authorInfo = {
    name: isNickAuthor ? "Nick" : authorName,
    expertise: isNickAuthor ? "Founder & Laundromat Industry Expert" : "Laundromat Industry Expert",
    credentials: isNickAuthor 
      ? "Founder of WashBizHub - The #1 laundromat resource hub. Industry veteran with expertise in laundromat valuation, operations, and the CLEANBI property intelligence system."
      : "WashBizHub Research Team - Combining decades of industry experience with data-driven analysis"
  };
  

  return (
    <>
      <SEO
        title={`${post.metaTitle || post.title} | WashBizHub Blog`}
        description={post.metaDescription || postExcerpt}
        keywords={allKeywords.length > 0 ? allKeywords : [post.category || "laundromat", "business"]}
        canonicalUrl={`/blog/${post.slug || post.id}`}
        structuredData={[articleSchema, breadcrumbSchema]}
        ogImage={post.ogImage || post.featuredImage || undefined}
        ogType="article"
        twitterCard="summary_large_image"
        author={authorInfo}
        datePublished={post.datePublished?.toString()}
        dateModified={post.dateModified?.toString()}
        articleSection={post.category}
        speakableSelectors={["h1", "[data-testid='text-post-title']", "[data-testid='content-body']"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug || post.id}` }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <article className="max-w-4xl mx-auto px-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-6" data-testid="button-back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <Badge variant="outline" className="text-accent border-accent/50 mb-4" data-testid="badge-category">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6" data-testid="text-post-title">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span data-testid="text-author">{authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.datePublished?.toString()} data-testid="text-date">
                  {formatDate(post.datePublished || post.createdAt)}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden mb-8">
              <img
                src={featuredImage}
                alt={featuredImageAlt}
                className="w-full h-64 md:h-96 object-cover"
                data-testid="img-featured"
              />
            </div>
          </header>

          <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
            <CardContent className="py-8 px-6 md:px-10">
              <div 
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-p:text-white/80 prose-p:leading-relaxed
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:text-white/80 prose-ol:text-white/80
                  prose-li:marker:text-accent
                  prose-blockquote:border-accent prose-blockquote:text-white/70"
                data-testid="content-body"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {postContent}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10" itemScope itemType="https://schema.org/Person">
            <div className="flex items-start gap-4">
              {isNickAuthor ? (
                <img 
                  src={nickAuthorImage} 
                  alt="Nick - Founder of WashBizHub"
                  className="w-16 h-16 rounded-full object-cover object-[center_25%] flex-shrink-0 border-2 border-accent/30"
                  itemProp="image"
                />
              ) : post.authorImage ? (
                <img 
                  src={post.authorImage} 
                  alt={authorName}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  itemProp="image"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-accent" />
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-lg" data-testid="text-author-name" itemProp="name">
                  {isNickAuthor ? "Nick" : authorName}
                </h3>
                <p className="text-accent text-sm font-medium" itemProp="jobTitle">
                  {isNickAuthor ? "Founder & Laundromat Industry Expert" : "Laundromat Industry Expert"}
                </p>
                <p className="text-white/60 text-sm mt-2" itemProp="description">
                  {isNickAuthor 
                    ? "Founder of WashBizHub - The #1 laundromat resource hub. Industry veteran with expertise in laundromat valuation, operations, and the CLEANBI property intelligence system."
                    : "Expert insights from the #1 laundromat resource hub. Our team combines decades of industry experience with data-driven analysis to help laundromat owners succeed."
                  }
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                  <span>Verified Expert</span>
                  <span>•</span>
                  <span>{isNickAuthor ? "WashBizHub Founder" : "WashBizHub Research Team"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6 mb-12">
            <Button
              variant="outline"
              className="border-white/30 text-white"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Article
            </Button>
            
            <Link href="/cleanbi-explorer">
              <Button className="bg-accent hover:bg-accent/90 text-white" data-testid="button-cta">
                Try CLEANBI Free
              </Button>
            </Link>
          </div>

          {relatedPosts.length > 0 && (
            <section className="border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug || relatedPost.id}`}>
                    <Card 
                      className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2 h-full cursor-pointer"
                      data-testid={`card-related-${relatedPost.id}`}
                    >
                      <CardContent className="p-4">
                        <Badge variant="outline" className="text-white/70 border-white/30 mb-2 text-xs">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="text-white font-semibold line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-2">
                          {(relatedPost.excerpt || relatedPost.content || "").substring(0, 80)}...
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
