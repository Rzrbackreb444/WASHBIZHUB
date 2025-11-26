/**
 * FIX ALL BLOG SCHEMAS FOR MAXIMUM AEO
 * 
 * Ensures every single blog has:
 * - FAQPage schema with 5+ questions
 * - Article schema with full metadata
 * - HowTo schema where applicable
 */

import { db } from "./db";
import { blogPosts } from "@shared/schema";
import { eq, like, or, isNull } from "drizzle-orm";

function generateBlogFAQSchema(title: string, slug: string, category: string) {
  // Extract location and business/property type from slug
  const isResidential = category === 'real_estate' || slug.includes('home') || slug.includes('condo') || slug.includes('townhouse') || slug.includes('investment-property') || slug.includes('rental-property');
  const isBusiness = !isResidential;
  
  // Parse location from slug (e.g., cleanbi-score-restaurant-new-york-city-ny-2025)
  const parts = slug.replace('cleanbi-score-', '').replace('-2025', '').split('-');
  const locationParts = parts.slice(1); // Remove business type
  const location = locationParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
  const businessType = parts[0]?.replace(/-/g, ' ') || 'business';

  if (isBusiness) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is a CLEANBI score for ${businessType}s?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `A CLEANBI score is a 0-100 rating that evaluates ${businessType} locations based on Google data including foot traffic, competition, reviews, location quality, and visibility. Scores 90+ receive A grade, 80-89 B grade, 70-79 C grade, and below 70 is 'Needs Work'. It works for any ${businessType} worldwide.`
          }
        },
        {
          "@type": "Question",
          "name": `Is CLEANBI free for ${businessType}s in ${location}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes! The basic CLEANBI score is 100% free with unlimited searches for any ${businessType} address in ${location} or anywhere globally. No login required. Premium $97 reports available for deep analysis.`
          }
        },
        {
          "@type": "Question",
          "name": `What data does CLEANBI use for ${businessType} scoring?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `CLEANBI uses real-time Google Places API data including customer reviews, ratings, foot traffic estimates from Popular Times, competitor density within 5 miles, and location characteristics specific to ${businessType}s.`
          }
        },
        {
          "@type": "Question",
          "name": `How accurate is CLEANBI for ${location} ${businessType}s?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `CLEANBI accuracy depends on available Google data. ${location} ${businessType}s typically have excellent data coverage in urban areas. Each score includes a confidence percentage indicating data quality.`
          }
        },
        {
          "@type": "Question",
          "name": `Can I score any ${businessType} globally?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Absolutely! CLEANBI works for any ${businessType} address in 220+ countries worldwide including USA, UK, Australia, Philippines, Japan, Canada, Germany, France, and anywhere with Google Maps coverage.`
          }
        }
      ]
    };
  } else {
    // Residential FAQ
    const propertyType = parts[0]?.replace(/-/g, ' ') || 'property';
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is a CLEANBI score for ${propertyType}s?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `A CLEANBI score is a 0-100 rating that evaluates ${propertyType} locations based on neighborhood quality, walkability, nearby amenities, schools, safety, and investment potential. Scores 90+ receive A grade, 80-89 B grade, 70-79 C grade, and below 70 is 'Needs Work'.`
          }
        },
        {
          "@type": "Question",
          "name": `Is CLEANBI free for ${propertyType}s in ${location}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes! The basic CLEANBI score is 100% free with unlimited searches for any ${propertyType} address in ${location} or anywhere globally. No login required. Premium $97 reports available for deep investment analysis.`
          }
        },
        {
          "@type": "Question",
          "name": `What data does CLEANBI use for ${propertyType} scoring?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `CLEANBI uses Google data including nearby amenities, schools, parks, transit access, shops, restaurants, and neighborhood characteristics to evaluate ${propertyType} locations for investment potential.`
          }
        },
        {
          "@type": "Question",
          "name": `How can CLEANBI help me buy a ${propertyType}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `CLEANBI helps ${propertyType} buyers by providing instant neighborhood intelligence, comparing multiple properties objectively, identifying undervalued opportunities, and validating listing prices with data-driven scores.`
          }
        },
        {
          "@type": "Question",
          "name": `Does CLEANBI work for ${propertyType}s worldwide?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes! CLEANBI works for any ${propertyType} address in 220+ countries including USA, UK, Australia, Philippines, Japan, Canada, and anywhere with Google Maps data coverage.`
          }
        }
      ]
    };
  }
}

function generateArticleSchema(title: string, slug: string, excerpt: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": excerpt || title,
    "author": {
      "@type": "Organization",
      "name": "WashBizHub Research Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://washbizhub.com/washbizhub-logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://washbizhub.com/blog/${slug}`
    }
  };
}

function generateHowToSchema(title: string, businessType: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Get a CLEANBI Score for ${businessType}`,
    "description": `Step-by-step guide to score any ${businessType} location using CLEANBI`,
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Visit CLEANBI",
        "text": "Go to washbizhub.com/cleanbi-auto to access the free scoring tool"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Enter Address",
        "text": `Type any ${businessType} address including street, city, state, and country`
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Click Calculate",
        "text": "Press 'Calculate CLEANBI Score' to analyze the location with Google data"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "View Results",
        "text": "Receive your 0-100 score with A-F grade and category breakdown"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Get Premium Report",
        "text": "Optionally upgrade to $97 premium report for deep analysis and valuations"
      }
    ],
    "totalTime": "PT30S"
  };
}

async function fixAllBlogSchemas() {
  console.log("🔧 Fixing ALL blog schemas for maximum AEO...\n");

  // Get all CLEANBI blogs
  const blogs = await db.select({
    id: blogPosts.id,
    title: blogPosts.title,
    slug: blogPosts.slug,
    excerpt: blogPosts.excerpt,
    category: blogPosts.category,
    schemaMarkup: blogPosts.schemaMarkup,
  }).from(blogPosts)
    .where(like(blogPosts.slug, '%cleanbi%'));

  console.log(`📊 Found ${blogs.length} CLEANBI blogs to update\n`);

  let updated = 0;
  let errors = 0;

  for (const blog of blogs) {
    try {
      const faqSchema = generateBlogFAQSchema(blog.title || '', blog.slug || '', blog.category || '');
      const articleSchema = generateArticleSchema(blog.title || '', blog.slug || '', blog.excerpt || '');
      
      // Extract business/property type from slug
      const parts = (blog.slug || '').replace('cleanbi-score-', '').replace('-2025', '').split('-');
      const businessType = parts[0]?.replace(/-/g, ' ') || 'business';
      const howToSchema = generateHowToSchema(blog.title || '', businessType);

      // Update with all 3 schemas
      await db.update(blogPosts)
        .set({
          schemaMarkup: [faqSchema, articleSchema, howToSchema],
        })
        .where(eq(blogPosts.id, blog.id));

      updated++;
      if (updated % 50 === 0) {
        console.log(`   ✅ Updated ${updated}/${blogs.length} blogs`);
      }
    } catch (error: any) {
      console.error(`   ❌ Error updating ${blog.slug}:`, error.message);
      errors++;
    }
  }

  console.log(`\n🎉 Schema update complete!`);
  console.log(`   ✅ Updated: ${updated} blogs`);
  console.log(`   ❌ Errors: ${errors} blogs`);
  console.log(`   📊 Each blog now has: FAQPage + Article + HowTo schemas`);

  return { updated, errors, total: blogs.length };
}

// Run
fixAllBlogSchemas()
  .then((result) => {
    console.log(`\n✅ Successfully updated ${result.updated} blogs with maximum AEO schemas!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Schema fix failed:", error);
    process.exit(1);
  });
