import type { Express, Request, Response } from "express";
import { db } from "./db";
import { blogPosts, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { isAdmin } from "./replitAuth";

const BLOG_CATEGORIES = [
  "Industry News",
  "Guides", 
  "Case Studies",
  "Tools",
  "Equipment",
  "Operations",
  "Marketing",
  "Finance",
  "Growth"
] as const;

export default function blogRoutes(app: Express) {
  
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    try {
      const { 
        page = "1", 
        limit = "12", 
        category, 
        search,
        featured
      } = req.query;
      
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
      const offset = (pageNum - 1) * limitNum;
      
      let conditions = [eq(blogPosts.published, true)];
      
      if (category && category !== "all") {
        conditions.push(eq(blogPosts.category, category as string));
      }
      
      if (featured === "true") {
        conditions.push(eq(blogPosts.featured, true));
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          or(
            ilike(blogPosts.title, searchTerm),
            ilike(blogPosts.excerpt, searchTerm),
            ilike(blogPosts.content, searchTerm)
          )!
        );
      }
      
      const whereClause = conditions.length > 1 
        ? and(...conditions) 
        : conditions[0];
      
      const [posts, totalResult] = await Promise.all([
        db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          metaTitle: blogPosts.metaTitle,
          metaDescription: blogPosts.metaDescription,
          featuredImage: blogPosts.featuredImage,
          featuredImageAlt: blogPosts.featuredImageAlt,
          category: blogPosts.category,
          subcategory: blogPosts.subcategory,
          authorName: blogPosts.authorName,
          authorImage: blogPosts.authorImage,
          datePublished: blogPosts.datePublished,
          dateModified: blogPosts.dateModified,
          views: blogPosts.views,
          featured: blogPosts.featured,
          seoScore: blogPosts.seoScore,
          readabilityScore: blogPosts.readabilityScore,
        })
          .from(blogPosts)
          .where(whereClause)
          .orderBy(desc(blogPosts.datePublished))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: count() })
          .from(blogPosts)
          .where(whereClause)
      ]);
      
      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limitNum);
      
      res.json({
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const [post] = await db.select()
        .from(blogPosts)
        .where(and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.published, true)
        ))
        .limit(1);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      await db.update(blogPosts)
        .set({ views: (post.views || 0) + 1 })
        .where(eq(blogPosts.id, post.id));
      
      let relatedPosts: any[] = [];
      if (post.relatedPosts && Array.isArray(post.relatedPosts)) {
        relatedPosts = await db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          category: blogPosts.category,
          datePublished: blogPosts.datePublished,
        })
          .from(blogPosts)
          .where(and(
            sql`${blogPosts.id} = ANY(${post.relatedPosts})`,
            eq(blogPosts.published, true)
          ))
          .limit(3);
      }
      
      if (relatedPosts.length < 3) {
        const additionalPosts = await db.select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          category: blogPosts.category,
          datePublished: blogPosts.datePublished,
        })
          .from(blogPosts)
          .where(and(
            eq(blogPosts.category, post.category),
            eq(blogPosts.published, true),
            sql`${blogPosts.id} != ${post.id}`
          ))
          .orderBy(desc(blogPosts.datePublished))
          .limit(3 - relatedPosts.length);
        
        relatedPosts = [...relatedPosts, ...additionalPosts];
      }
      
      res.json({ 
        ...post, 
        relatedPosts,
        views: (post.views || 0) + 1
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.get("/api/blog/categories", async (_req: Request, res: Response) => {
    try {
      const categoryStats = await db.select({
        category: blogPosts.category,
        count: count()
      })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .groupBy(blogPosts.category)
        .orderBy(desc(count()));
      
      const categories = BLOG_CATEGORIES.map(cat => {
        const stat = categoryStats.find(s => s.category === cat);
        return {
          name: cat,
          count: stat?.count ?? 0,
          slug: cat.toLowerCase().replace(/\s+/g, "-")
        };
      });
      
      res.json({ 
        categories,
        total: categoryStats.reduce((sum, s) => sum + (s.count || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/blog/featured", async (_req: Request, res: Response) => {
    try {
      const posts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        featuredImageAlt: blogPosts.featuredImageAlt,
        category: blogPosts.category,
        authorName: blogPosts.authorName,
        datePublished: blogPosts.datePublished,
      })
        .from(blogPosts)
        .where(and(
          eq(blogPosts.published, true),
          eq(blogPosts.featured, true)
        ))
        .orderBy(desc(blogPosts.datePublished))
        .limit(6);
      
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ error: "Failed to fetch featured posts" });
    }
  });

  app.post("/api/blog/posts", isAdmin, async (req: Request, res: Response) => {
    try {
      const {
        title,
        content,
        excerpt,
        slug,
        category = "Guides",
        subcategory,
        featuredImage,
        featuredImageAlt,
        metaTitle,
        metaDescription,
        metaKeywords,
        focusKeyphrases,
        ogImage,
        authorName = "WashBizHub Research Team",
        authorImage,
        schemaMarkup,
        relatedPosts,
        internalLinks,
        featured = false,
        published = false,
        market = "us",
        language = "en",
        type = "manual"
      } = req.body;
      
      if (!title || !content || !excerpt) {
        return res.status(400).json({ 
          error: "Title, content, and excerpt are required" 
        });
      }
      
      const generatedSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      const [existingPost] = await db.select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, generatedSlug))
        .limit(1);
      
      if (existingPost) {
        return res.status(400).json({ error: "A post with this slug already exists" });
      }
      
      const [newPost] = await db.insert(blogPosts)
        .values({
          title,
          content,
          excerpt,
          slug: generatedSlug,
          category,
          subcategory,
          featuredImage,
          featuredImageAlt,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          metaKeywords: metaKeywords || [],
          focusKeyphrases: focusKeyphrases || [title],
          ogImage,
          ogTitle: title,
          ogDescription: excerpt,
          authorName,
          authorImage,
          schemaMarkup,
          relatedPosts,
          internalLinks,
          featured,
          published,
          status: published ? "published" : "draft",
          market,
          language,
          type,
          linkToCleanbi: true,
          cleanbiAnchorText: "Try our free CLEANBI property analysis tool",
        })
        .returning();
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.dateModified === undefined) {
        updates.dateModified = new Date();
      }
      if (updates.updatedAt === undefined) {
        updates.updatedAt = new Date();
      }
      
      const [updatedPost] = await db.update(blogPosts)
        .set(updates)
        .where(eq(blogPosts.id, id))
        .returning();
      
      if (!updatedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [deletedPost] = await db.delete(blogPosts)
        .where(eq(blogPosts.id, id))
        .returning({ id: blogPosts.id });
      
      if (!deletedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json({ success: true, id: deletedPost.id });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  app.get("/api/blog/search", async (req: Request, res: Response) => {
    try {
      const { q, limit = "10" } = req.query;
      
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json({ results: [] });
      }
      
      const searchTerm = `%${q}%`;
      const results = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        category: blogPosts.category,
        featuredImage: blogPosts.featuredImage,
      })
        .from(blogPosts)
        .where(and(
          eq(blogPosts.published, true),
          or(
            ilike(blogPosts.title, searchTerm),
            ilike(blogPosts.excerpt, searchTerm)
          )
        ))
        .orderBy(desc(blogPosts.datePublished))
        .limit(Math.min(20, parseInt(limit as string) || 10));
      
      res.json({ results });
    } catch (error) {
      console.error("Error searching blog posts:", error);
      res.status(500).json({ error: "Failed to search posts" });
    }
  });

  // Bulk optimization endpoint - enhances EEAT, randomizes images, adds CTAs
  app.post("/api/blog/bulk-optimize", isAdmin, async (req: Request, res: Response) => {
    try {
      // Image variants for random assignment (keyed by category patterns)
      const imageVariants = {
        equipment: [
          { image: '/assets/dexterRows', alt: 'Rows of Dexter commercial washing machines in modern laundromat with blue accent trim' },
          { image: '/assets/dexterStock', alt: 'Professional Dexter laundromat interior with stacked washers and dryers' },
          { image: '/assets/dexterCorner', alt: 'Commercial Dexter washing machines in action with clothes tumbling' },
          { image: '/assets/dexterPremium', alt: 'Large Dexter laundromat with sunset mural and island configuration' }
        ],
        facility: [
          { image: '/assets/modernFacility', alt: 'Modern commercial laundromat with rows of stacked stainless steel equipment' },
          { image: '/assets/brightModern', alt: 'Bright modern laundromat with natural sunlight and commercial equipment' },
          { image: '/assets/largeFacility', alt: 'Large laundromat facility with extensive washer and dryer wall' },
          { image: '/assets/twinCities', alt: 'Tumble Fresh coin laundry with blue LED lighting and Giant Load machines' }
        ],
        location: [
          { image: '/assets/aerialSpringClean', alt: 'Aerial drone view of Spring Clean Laundry building for location analysis' },
          { image: '/assets/aerialCatoosa', alt: 'Aerial view of Catoosa Laundromat building with drop-off service signage' },
          { image: '/assets/genAerialProperty', alt: 'Aerial drone view of commercial laundromat building for real estate analysis' },
          { image: '/assets/genLocationIntelligence', alt: 'Location pin marker on city map for CLEANBI site selection' }
        ],
        business: [
          { image: '/assets/businessAnalytics', alt: 'Business professionals analyzing charts for laundromat marketing strategy' },
          { image: '/assets/genInvestmentAnalysis', alt: 'Business professional analyzing laundromat financial data on tablet' },
          { image: '/assets/moneyBasket', alt: 'Modern laundromat with stacked washers and basket full of cash' },
          { image: '/assets/marketingAnalytics', alt: 'Business people analyzing charts and graphs for laundromat marketing' }
        ],
        operations: [
          { image: '/assets/clothesSpinning', alt: 'Colorful clothes spinning inside commercial washer drum during wash cycle' },
          { image: '/assets/colorfulWash', alt: 'Vibrant clothes tumbling in washing machine with water droplets' },
          { image: '/assets/customerExperience', alt: 'Woman loading clothes into commercial washer at modern laundromat' },
          { image: '/assets/funLaundryDay', alt: 'Person playfully diving into commercial dryers with laundry cart' }
        ],
        premium: [
          { image: '/assets/modernDesign', alt: 'Modern designer laundromat with spiral lighting and wooden accents' },
          { image: '/assets/genPremiumInterior', alt: 'Premium modern laundromat interior with sleek stainless steel washers' },
          { image: '/assets/dexterColorful', alt: 'Dexter Laundry branded commercial washers with colorful decor' }
        ],
        default: [
          { image: '/assets/washBizHubBranded', alt: 'WashBizHub branded laundromat corridor with commercial washers' },
          { image: '/assets/neonSign', alt: 'Glowing neon laundromat sign with red hanger icon' },
          { image: '/assets/colorfulWash', alt: 'Vibrant clothes tumbling in washing machine' }
        ]
      };

      // EEAT author enhancements
      const authorEnhancements = {
        name: "Nick @ WashBizHub",
        credentials: "Founder & Laundromat Industry Expert",
        bio: "Nick is the founder of WashBizHub and creator of the CLEANBI location intelligence system. With years of experience in the laundromat industry, he helps investors make data-driven decisions.",
      };

      // CTA templates for injection
      const ctaTemplates = {
        cleanbi: `<div class="cta-box bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 p-6 rounded-lg my-8 shadow-lg">
          <h3 class="text-xl font-bold mb-2">Analyze Any Location with CLEANBI Explorer</h3>
          <p class="mb-4">Get instant A-F grades, competitor mapping, and demographic analysis for any laundromat address.</p>
          <a href="/cleanbi-explorer" class="inline-block bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">Try CLEANBI Explorer Free →</a>
        </div>`,
        consultation: `<div class="cta-box bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg my-8">
          <h3 class="text-xl font-bold mb-2">Need Expert Guidance?</h3>
          <p class="mb-4">Book a consultation with our laundromat industry experts for personalized advice.</p>
          <a href="/consultation" class="inline-block bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors">Schedule Consultation →</a>
        </div>`,
        funding: `<div class="cta-box bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg my-8">
          <h3 class="text-xl font-bold mb-2">Looking for Financing?</h3>
          <p class="mb-4">Connect with our verified funding partners for SBA loans, equipment financing, and more.</p>
          <a href="/funding-matcher" class="inline-block bg-white text-green-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">Find Funding Options →</a>
        </div>`
      };

      // Get all blog posts
      const allPosts = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        category: blogPosts.category,
        featuredImage: blogPosts.featuredImage,
        authorName: blogPosts.authorName
      }).from(blogPosts);

      let updatedCount = 0;
      const updates = [];

      for (let i = 0; i < allPosts.length; i++) {
        const post = allPosts[i];
        const updateData: Record<string, any> = {};
        
        // 1. Randomize image based on category and post index
        const categoryKey = (post.category || 'default').toLowerCase();
        const variants = imageVariants[categoryKey as keyof typeof imageVariants] || imageVariants.default;
        const variantIndex = i % variants.length; // Deterministic rotation
        const selectedVariant = variants[variantIndex];
        
        // Only update image if not already set to a specific URL
        if (!post.featuredImage || post.featuredImage.startsWith('/assets/')) {
          updateData.featuredImage = selectedVariant.image;
          updateData.featuredImageAlt = selectedVariant.alt;
        }
        
        // 2. Enhance EEAT - set author if not specific
        if (!post.authorName || post.authorName === 'WashBizHub Research Team') {
          updateData.authorName = authorEnhancements.name;
        }
        
        // 3. Add CTAs if not present (inject mid-article CTA)
        let content = post.content || '';
        let ctaInjected = false;
        
        // Check if CTAs already exist
        const hasCleanbiBCTA = content.includes('cleanbi-explorer') || content.includes('CLEANBI Explorer');
        const hasConsultCTA = content.includes('/consultation');
        const hasFundingCTA = content.includes('/funding');
        
        // Inject appropriate CTA based on category
        if (!hasCleanbiBCTA && !content.includes('cta-box')) {
          // Add CLEANBI CTA for location/investment related content
          if (categoryKey.includes('location') || categoryKey.includes('invest') || categoryKey.includes('cleanbi')) {
            content = injectCTAAfterFirstSection(content, ctaTemplates.cleanbi);
            ctaInjected = true;
          } else if (categoryKey.includes('finance') || categoryKey.includes('fund')) {
            content = injectCTAAfterFirstSection(content, ctaTemplates.funding);
            ctaInjected = true;
          } else {
            // Default to CLEANBI CTA for most content
            content = injectCTAAfterFirstSection(content, ctaTemplates.cleanbi);
            ctaInjected = true;
          }
        }
        
        if (ctaInjected) {
          updateData.content = content;
        }
        
        // 4. Update dateModified to now for freshness signals
        updateData.dateModified = new Date();
        
        if (Object.keys(updateData).length > 0) {
          updates.push(
            db.update(blogPosts)
              .set(updateData)
              .where(eq(blogPosts.id, post.id))
          );
          updatedCount++;
        }
      }
      
      // Execute all updates in parallel batches
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        await Promise.all(batch);
      }
      
      res.json({ 
        success: true, 
        message: `Optimized ${updatedCount} blog posts`,
        details: {
          totalPosts: allPosts.length,
          updatedPosts: updatedCount,
          optimizations: ['image_rotation', 'eeat_enhancement', 'cta_injection', 'freshness_update']
        }
      });
    } catch (error) {
      console.error("Error in bulk optimization:", error);
      res.status(500).json({ error: "Failed to optimize blog posts" });
    }
  });
}

// Helper function to inject CTA after first major section
function injectCTAAfterFirstSection(content: string, cta: string): string {
  // Find first </h2> or </p> after significant content
  const h2Match = content.match(/<\/h2>/);
  const pMatch = content.match(/<\/p>/);
  
  let insertPosition = -1;
  
  if (h2Match && h2Match.index) {
    // Find the next </p> after the h2
    const afterH2 = content.substring(h2Match.index);
    const nextP = afterH2.match(/<\/p>/);
    if (nextP && nextP.index) {
      insertPosition = h2Match.index + nextP.index + 4;
    }
  } else if (pMatch && pMatch.index) {
    // Find second paragraph
    const firstPEnd = pMatch.index + 4;
    const afterFirstP = content.substring(firstPEnd);
    const secondP = afterFirstP.match(/<\/p>/);
    if (secondP && secondP.index) {
      insertPosition = firstPEnd + secondP.index + 4;
    }
  }
  
  if (insertPosition > 0 && insertPosition < content.length) {
    return content.slice(0, insertPosition) + '\n\n' + cta + '\n\n' + content.slice(insertPosition);
  }
  
  // Fallback: add at end before closing tag
  return content + '\n\n' + cta;
}
