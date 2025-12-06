/**
 * FORUM SEED DATA - Minimal SEO-Friendly Starter Posts
 * Encourages community-generated content while establishing forum categories
 * Run with: tsx server/seed-forum.ts
 */

import { dbStorage } from "./db-storage";
import type { InsertForumCategory, InsertForumTopic, InsertForumReply } from "@shared/schema";

const categories: InsertForumCategory[] = [
  {
    name: "General Discussion",
    slug: "general-discussion",
    description: "Industry news, trends, and general laundromat discussions",
    icon: "message-square",
    displayOrder: 1,
  },
  {
    name: "Buy/Sell/Trade",
    slug: "buy-sell-trade",
    description: "Marketplace for laundromat businesses and equipment",
    icon: "shopping-cart",
    displayOrder: 2,
  },
  {
    name: "Equipment & Maintenance",
    slug: "equipment-maintenance",
    description: "Technical support, troubleshooting, and repair tips",
    icon: "wrench",
    displayOrder: 3,
  },
  {
    name: "Business Strategies",
    slug: "business-strategies",
    description: "Marketing, operations, growth, and profit optimization",
    icon: "trending-up",
    displayOrder: 4,
  },
  {
    name: "New Owner Q&A",
    slug: "new-owner-qa",
    description: "Getting started, financing, first-time buyer questions",
    icon: "help-circle",
    displayOrder: 5,
  },
  {
    name: "Regional Forums",
    slug: "regional",
    description: "Connect with laundromat owners in your area",
    icon: "map-pin",
    displayOrder: 6,
  },
];

interface SeedTopic {
  categorySlug: string;
  title: string;
  content: string;
  tags: string[];
  replies: Array<{
    content: string;
    isAnswer?: boolean;
  }>;
}

const topics: SeedTopic[] = [
  {
    categorySlug: "general-discussion",
    title: "Welcome to WashBizHub Community - Introduce Yourself!",
    content: `Welcome to the WashBizHub Community Forum - the largest gathering of laundromat owners, operators, and industry professionals!

**Tell us about yourself:**
- Your location and how long you've been in the industry
- Your current situation (owner, operator, looking to buy, equipment distributor, etc.)
- What you're hoping to learn or share with the community

Whether you own 1 store or 50, are considering your first laundromat purchase, or work in the industry as a supplier or consultant - we're glad you're here!

The WashBizHub community is here to help you succeed. Ask questions, share your experiences, and connect with fellow professionals.

**Quick Tips for New Members:**
- Use the search bar to find existing discussions on your topic
- Choose the right category when posting (Equipment, Buy/Sell, Strategies, etc.)
- Share specific details when asking questions - the more context, the better advice you'll receive
- Upvote helpful answers to recognize great community contributions

Looking forward to hearing from you!`,
    tags: ["welcome", "introductions", "community"],
    replies: [
      {
        content: "Great to be here! I own 3 laundromats in the Houston area and always looking to connect with other owners. Happy to share what's worked for me over 12 years in the business.",
      },
      {
        content: "First-time potential buyer here from Denver, CO. Looking at a 1,800 sq ft store and have so many questions. Glad I found this community!",
      },
    ],
  },
  {
    categorySlug: "new-owner-qa",
    title: "First-Time Laundromat Buyer? Share Your Questions Here",
    content: `Thinking about buying your first laundromat? You're not alone - and you're in the right place.

The laundromat industry is one of the best small business investments, but due diligence is critical. This thread is for first-time buyers to ask questions and for experienced owners to share wisdom.

**Common First-Timer Questions:**
- How do I evaluate a laundromat's true value?
- What should I look for in equipment condition?
- How do I verify the seller's financial claims?
- What's a fair asking price multiple (SDE)?
- Should I buy an existing store or do a new build?
- How much cash reserve do I need?

**Resources to Get Started:**
- Use our CLEANBI Explorer to analyze any location
- Check the Buy/Sell category for marketplace listings
- Browse Equipment & Maintenance for brand comparisons

Post your questions below and let the community help guide your journey into laundromat ownership!`,
    tags: ["new-owner", "buying", "due-diligence", "first-time-buyer"],
    replies: [
      {
        content: "I'm looking at a store in Phoenix asking $380K with claimed $90K SDE. Seller won't show tax returns. Red flag or normal? What documentation should I require before making an offer?",
      },
      {
        content: "Definitely a red flag. Never make an offer without seeing at least 2-3 years of tax returns, utility bills, and lease agreement. The financials need to be verifiable. A legitimate seller should have no problem providing documentation.",
        isAnswer: true,
      },
    ],
  },
  {
    categorySlug: "equipment-maintenance",
    title: "Equipment Troubleshooting Hub - Ask the Experts",
    content: `Having equipment issues? Post your troubleshooting questions here and get help from experienced technicians and owners.

**When posting equipment problems, include:**
- Equipment brand and model (e.g., Speed Queen SC40, Dexter T-600)
- Equipment age
- Symptoms/error codes
- What you've already checked or tried

**Popular Topics:**
- Dryer not heating (gas vs electric issues)
- Washer not draining or spinning
- Payment system problems (coin, card, app)
- Preventive maintenance schedules
- Speed Queen vs Dexter vs other brands

The community includes factory-trained technicians, distributors, and owners with decades of repair experience. Let's help each other keep machines running!

**Pro Tip:** Check out Service Guy AI in the chat widget for instant equipment diagnostics 24/7.`,
    tags: ["equipment", "troubleshooting", "maintenance", "repair"],
    replies: [
      {
        content: "Great resource! I'd add that for anyone with Speed Queen equipment, the diagnostic mode is your best friend. Hold the buttons during power-up and it'll show you error codes that pinpoint most issues.",
        isAnswer: true,
      },
    ],
  },
  {
    categorySlug: "business-strategies",
    title: "Pricing Strategies in 2025 - What Are You Charging?",
    content: `Pricing is one of the most debated topics in our industry. Let's share what's working in different markets.

**Share your pricing strategy:**
- Your market/location
- Top-loader prices
- Front-loader prices (by size if applicable)
- Dryer pricing (per cycle or per minute)
- Any recent price increases and customer reaction

**Key Considerations:**
- Utility costs in your area
- Competition nearby
- Customer demographics
- Card vs coin pricing differences

The goal is to help each other optimize pricing for profitability while staying competitive. What's working in your market?`,
    tags: ["pricing", "vend-prices", "strategy", "revenue"],
    replies: [
      {
        content: "Los Angeles here. We went to $4.50 for top-loaders and $6-9 for front-loaders (by size) last year. Raised dryers to $0.50 per 8 minutes. Minimal customer pushback - turns out we were underpriced for years.",
      },
      {
        content: "Small Midwest town (pop 25K). Still at $2.75 top-loaders, $4-5 front-loaders. We're the only laundromat in town but customers are price-sensitive. Raised 25 cents last month and got complaints for a week, then everyone adjusted.",
      },
    ],
  },
];

async function seedForum() {
  console.log("Starting minimal forum seed...\n");

  try {
    // Check if categories already exist
    const existingCategories = await dbStorage.getForumCategories();
    if (existingCategories && existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories. Skipping category seed.\n`);
    } else {
      // Create categories
      console.log("Creating categories...");
      for (const category of categories) {
        try {
          await dbStorage.createForumCategory(category);
          console.log(`  Created category: ${category.name}`);
        } catch (error: any) {
          if (error.message?.includes("duplicate") || error.code === "23505") {
            console.log(`  Category exists: ${category.name}`);
          } else {
            throw error;
          }
        }
      }
      console.log("");
    }

    // Get fresh categories for reference
    const allCategories = await dbStorage.getForumCategories();
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Check if topics already exist
    const existingTopics = await dbStorage.getForumTopics({});
    if (existingTopics && existingTopics.length >= topics.length) {
      console.log(`Found ${existingTopics.length} existing topics. Skipping topic seed.`);
      console.log("\nForum seed check complete!");
      return;
    }

    // Create a system user for seeded content
    let systemUser;
    try {
      systemUser = await dbStorage.getUserByUsername("WashBizHub");
      if (!systemUser) {
        systemUser = await dbStorage.createUser({
          username: "WashBizHub",
          email: "community@washbizhub.com",
          firstName: "WashBizHub",
          lastName: "Community",
          role: "admin",
        });
      }
    } catch (error) {
      console.log("Using existing system user or creating fallback...");
      systemUser = await dbStorage.getUserByUsername("WashBizHub");
    }

    if (!systemUser) {
      console.error("Could not create or find system user. Exiting.");
      return;
    }

    // Create topics
    console.log("\nCreating starter topics...");
    for (const topicData of topics) {
      const categoryId = categoryMap.get(topicData.categorySlug);
      if (!categoryId) {
        console.log(`  Skipping topic (category not found): ${topicData.title}`);
        continue;
      }

      try {
        const topic = await dbStorage.createForumTopic({
          categoryId,
          authorId: systemUser.id,
          title: topicData.title,
          content: topicData.content,
          slug: topicData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100),
          tags: topicData.tags,
          isPinned: topicData.categorySlug === "general-discussion" && topicData.title.includes("Welcome"),
        });

        console.log(`  Created topic: ${topicData.title.slice(0, 50)}...`);

        // Create sample replies
        for (const replyData of topicData.replies) {
          await dbStorage.createForumReply({
            topicId: topic.id,
            authorId: systemUser.id,
            content: replyData.content,
            isAnswer: replyData.isAnswer || false,
          });
        }
      } catch (error: any) {
        if (error.message?.includes("duplicate") || error.code === "23505") {
          console.log(`  Topic exists: ${topicData.title.slice(0, 40)}...`);
        } else {
          console.error(`  Error creating topic: ${error.message}`);
        }
      }
    }

    console.log("\nMinimal forum seed complete!");
    console.log(`Created ${topics.length} starter topics with community-focused prompts.`);

  } catch (error) {
    console.error("Forum seed error:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || 
    process.argv[1]?.endsWith('seed-forum.ts')) {
  seedForum()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export { seedForum };
