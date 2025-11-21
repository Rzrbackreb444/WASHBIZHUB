/**
 * FORUM SEED DATA - 50+ Realistic Laundromat Community Posts
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
  // BUY/SELL/TRADE
  {
    categorySlug: "buy-sell-trade",
    title: "Newport Beach, CA - Established Laundromat $495K",
    content: `Prime location laundromat in Newport Beach now available!

**Business Highlights:**
- Gross Revenue: $18,500/month ($222K annually)
- SDE (Seller's Discretionary Earnings): $132K
- Square Footage: 2,200 sq ft
- Equipment: 32 washers (20-80lb), 28 dryers, all Speed Queen <5 years old
- Lease: 5 years remaining, $4,500/month
- Hours: Unattended 24/7 with card system

**Location Benefits:**
- High-traffic plaza with Trader Joe's anchor
- Dense apartment complex neighborhood (60%+ renters)
- Median household income $68K
- 15,000+ cars/day traffic count

Listed at $495K (3.75x SDE). Motivated seller, all equipment serviced and under warranty. Serious inquiries only, NDA required.

Contact Larry Larsen at (949) 555-0123`,
    tags: ["California", "for-sale", "turnkey", "attended"],
    replies: [
      {
        content: "What's the breakdown of revenue? How much from self-serve vs pickup/delivery?",
      },
      {
        content: "95% self-serve, 5% wash-dry-fold. We do about $900/month in WDF but haven't really marketed it. Huge growth opportunity there.",
        isAnswer: true,
      },
      {
        content: "That's a solid 3.75x multiple for Newport Beach! Equipment age is great. Any deferred maintenance I should know about?",
      },
      {
        content: "Water/sewer included in rent or separate? That's a dealbreaker for me.",
      },
    ],
  },
  {
    categorySlug: "buy-sell-trade",
    title: "Looking to buy my first laundromat - What's a fair price?",
    content: `I'm looking at a laundromat in Phoenix, AZ. Owner is asking $400K. Here are the numbers:

- Monthly gross: $14,500 ($174K/year)
- Rent: $3,200/month
- Utilities: ~$2,800/month (included in rent)
- Equipment: Mix of Dexter and Maytag, 3-8 years old
- Size: 1,800 sq ft
- 24 front-loaders, 18 dryers

Owner claims $95K in SDE but won't show me tax returns yet. Is 4.2x SDE too high for Phoenix market? What should I be looking for in due diligence?`,
    tags: ["Arizona", "valuation", "first-time-buyer", "due-diligence"],
    replies: [
      {
        content: "4.2x is reasonable IF the numbers are real. Get 3 years of tax returns, P&Ls, and utility bills. Don't trust 'owner claims' - verify everything.",
        isAnswer: true,
      },
      {
        content: "Phoenix market typically trades at 3.5-4x SDE. Make sure you understand what's included in that SDE number. Some sellers inflate it by excluding personal expenses they shouldn't.",
      },
      {
        content: "Red flag that he won't show tax returns. Walk away or demand full financials before making an offer. Also get lease details - you don't want a 1-year lease on a $400K purchase.",
      },
      {
        content: "I bought in Phoenix last year. My advice: hire a laundromat broker to review the deal. Cost me $3K but saved me from overpaying $80K. DM me if you want a referral.",
      },
    ],
  },

  // EQUIPMENT & MAINTENANCE
  {
    categorySlug: "equipment-maintenance",
    title: "Speed Queen top-loaders vs front-loaders - Which is better ROI?",
    content: `I'm planning a new build and trying to decide on washer configuration. Speed Queen reps are pushing front-loaders (better efficiency, customers love them) but I'm hearing mixed feedback.

**Top-Loaders:**
- Lower upfront cost ($1,200-$1,500 each)
- Customers know how to use them
- Faster cycle times (28-32 min)
- Easier maintenance

**Front-Loaders:**
- Higher cost ($2,500-$3,500 each)
- Better water/energy efficiency
- Higher vend price potential ($4-$8 vs $2.50-$5)
- More repair issues?

What's everyone's experience? Which gives better ROI over 10 years?`,
    tags: ["equipment", "speed-queen", "roi", "new-build"],
    replies: [
      {
        content: "I have both. Front-loaders bring in 60% more revenue per machine BUT maintenance costs are 2x higher. Bearings, door seals, and computer boards fail. Top-loaders are bulletproof.",
      },
      {
        content: "Go 70/30 front-loaders to top-loaders. Best of both worlds. Customers who want premium will pay for front-loaders. Budget customers use top-loaders. I'm doing $18K/month in 2,000 sq ft with this mix.",
        isAnswer: true,
      },
      {
        content: "Front-loaders all day. Yes they cost more but customers prefer them and you can charge premium prices. My 80lb machines get $8/load and they're always full. ROI is way better.",
      },
    ],
  },
  {
    categorySlug: "equipment-maintenance",
    title: "Dryer not heating - Dexter T-600 troubleshooting help!",
    content: `One of my Dexter T-600 gas dryers stopped heating mid-day. Everything else works (drum turns, coin mech, timer) but zero heat.

I checked:
- Gas valve is open
- Pilot light is OFF (won't stay lit)
- No error codes on display

Is this likely the thermocouple or igniter? I have basic tools but never replaced these parts. Can I DIY or should I call a tech? Located in Austin, TX if anyone knows a good repair company.`,
    tags: ["troubleshooting", "dryer", "dexter", "repair"],
    replies: [
      {
        content: "Probably the igniter. They last 3-5 years with heavy use. Part is $40-60, takes 20 minutes to replace. YouTube has tons of videos. Save yourself the $200 service call.",
        isAnswer: true,
      },
      {
        content: "Before you replace anything, check the sail switch. If lint is blocking airflow it won't heat even if igniter works. Clean the exhaust vent completely.",
      },
      {
        content: "I had this exact issue last month. It was the gas valve solenoid. $85 part, easy install. But try cleaning the burner assembly first - sometimes it's just carbon buildup.",
      },
      {
        content: "Call Austin Laundry Service - (512) 555-4321. They're honest and fair. Saved me hours of headache on my Dexter repairs. Worth the service call to diagnose it correctly first time.",
      },
    ],
  },

  // BUSINESS STRATEGIES
  {
    categorySlug: "business-strategies",
    title: "Wash-Dry-Fold pricing strategy - What are you charging per pound?",
    content: `I want to add wash-dry-fold service to boost revenue. Currently 100% self-serve. My market research shows:

- Competitor A: $1.35/lb (established 10+ years)
- Competitor B: $1.75/lb (premium positioning, 24hr turnaround)
- Competitor C: $1.50/lb (my closest location, 1 mile away)

My costs:
- Labor: $15/hr attendant
- Utilities: ~$0.30/lb (water, gas, electric)
- Supplies: $0.10/lb (detergent, bags, hangers)

I'm thinking $1.65/lb to compete on quality not price. Is this realistic? What are your WDF margins? Any tips for marketing this service?`,
    tags: ["wash-dry-fold", "pricing", "revenue", "services"],
    replies: [
      {
        content: "$1.65 is solid. I charge $1.75 and do $12K/month in WDF. Key is convenience - free pickup/delivery within 3 miles. Market it hard on Facebook and Google. 40% gross margin.",
        isAnswer: true,
      },
      {
        content: "Don't underestimate labor costs. $15/hr seems low unless you're in a cheap market. I pay $18/hr and struggle to keep quality staff. Factor in payroll taxes and benefits too.",
      },
      {
        content: "I started at $1.50/lb and raised to $1.85/lb over 2 years. Lost maybe 5% of customers but revenue went up 25%. People paying for WDF aren't price sensitive - they're buying time back.",
      },
      {
        content: "Pro tip: Minimum order of 15-20 lbs. Otherwise you're losing money on small orders. Also add $10 express fee for same-day service. That's where the real money is.",
      },
    ],
  },
  {
    categorySlug: "business-strategies",
    title: "Card system vs coin - Worth the investment in 2024?",
    content: `My laundromat is 100% coin-operated (built in 2008). I'm considering upgrading to card system + mobile app. 

**Card System Quote:**
- FasCard system: $28K installed (32 washers, 28 dryers)
- Monthly fee: $150/month software + processing
- Break-even: ~2.5 years at current volume

**Benefits I see:**
- Higher revenue (customers spend 15-25% more per manufacturer)
- No more cash handling/theft risk
- Remote monitoring and pricing changes
- Loyalty programs

**Concerns:**
- Losing customers who prefer cash?
- Technology issues/downtime?
- Monthly fees eating into profits?

Anyone made this switch recently? Was it worth it?`,
    tags: ["payment-systems", "fascard", "technology", "modernization"],
    replies: [
      {
        content: "Made the switch 2 years ago. Revenue up 18%, cash handling time down 90%. Best investment I ever made. Yes some customers complained but they adapted within a month. Do it.",
        isAnswer: true,
      },
      {
        content: "Keep ONE coin machine as backup. I went full card and had a system outage for 8 hours. Lost $600 in revenue that day. Customers were PISSED. Lesson learned.",
      },
      {
        content: "Check your demographics first. If you're in an area with lots of unbanked customers, you'll lose significant business going cashless. I kept coin and added card. Both options win.",
      },
      {
        content: "FasCard is solid but look at CCI and Setomatic too. Get 3 quotes. I negotiated my monthly fee down to $99/month and got free installation. Don't pay retail.",
      },
    ],
  },

  // NEW OWNER Q&A
  {
    categorySlug: "new-owner-qa",
    title: "First-time buyer - How much cash do I need beyond purchase price?",
    content: `I'm about to make an offer on my first laundromat ($350K asking price). I have $100K down payment saved. 

Beyond the 25-30% down payment, what other cash reserves should I have? I've heard:

- Working capital (3-6 months expenses)
- Emergency equipment fund
- Closing costs (?)
- First few months might be rough

I don't want to drain my savings and be house-poor (laundromat-poor?). What's realistic?`,
    tags: ["financing", "first-time-buyer", "cash-reserves", "planning"],
    replies: [
      {
        content: "Budget 40% of purchase price in cash minimum. $140K on a $350K deal. That covers 30% down ($105K), closing costs ($15K), and $20K working capital. You'll sleep better.",
        isAnswer: true,
      },
      {
        content: "Don't forget: Business license, insurance deposits, professional fees (lawyer, accountant), utility deposits, signage, cleaning supplies, initial change fund. Add $10-15K for all the 'stuff.'",
      },
      {
        content: "If SBA loan, they'll require you to inject 10-15% equity beyond the down payment. So on $350K you need about $122K-140K total cash to close. Call an SBA lender ASAP to get pre-qualified.",
      },
      {
        content: "Pro tip: Keep 6 months of expenses in reserve. Murphy's Law says the water heater will die and 3 washers will break in month 2. Been there. Had to scramble for $8K in repairs. Don't let that be you.",
      },
    ],
  },
  {
    categorySlug: "new-owner-qa",
    title: "Attended vs Unattended - Which is better for new owners?",
    content: `I'm buying my first laundromat and trying to decide on operating model:

**Unattended:**
- Lower labor costs (just cleaning/maintenance)
- Can run 24/7
- Less stress/time commitment
- But: vandalism risk, machine issues, customer service?

**Attended:**
- Better customer experience
- Offer wash-dry-fold for extra revenue
- Monitor equipment/prevent damage
- But: payroll is 15-20% of revenue

I have a full-time W2 job (for now) so attended seems hard. But I keep hearing attended stores make 30-40% more revenue. What should a new owner do?`,
    tags: ["operating-model", "attended", "unattended", "new-owner"],
    replies: [
      {
        content: "Start unattended, add attendant later. Learn the business first, fix any issues, get systems in place. Then when you're profitable, add attendant to boost revenue. Don't bite off too much at once.",
        isAnswer: true,
      },
      {
        content: "I went attended from day 1 and never regretted it. Yes payroll hurts but revenue is 2x what previous (unattended) owner did. Customers love having help. Worth every penny.",
      },
      {
        content: "Depends on location. High-income area? Go attended. Working-class neighborhood? Unattended is fine. Also depends on your goals - passive income or active business?",
      },
      {
        content: "Hybrid model: Attended 9am-6pm, unattended overnight and early morning. Best of both worlds. I do this with 2 part-time staff. Revenue is solid and I'm not tied to the store 24/7.",
      },
    ],
  },

  // REGIONAL FORUMS  
  {
    categorySlug: "regional",
    title: "California Owners - How are you dealing with new water restrictions?",
    content: `Anyone else in CA dealing with the new tiered water pricing and conservation mandates? Our utility bill jumped 35% in Q1 2024.

Looking at:
- Ozone wash systems (30-40% water savings)
- Low-water front-loaders
- Water recycling systems ($$$$)

What solutions are working for you? The margins are getting crushed by utilities.`,
    tags: ["California", "utilities", "water", "costs"],
    replies: [
      {
        content: "San Diego here. Installed Continental Girbau's water-saver washers last year. Water bill down 28%, gas down 15%. ROI will be 4-5 years but helps the margin pain. Worth looking into.",
      },
      {
        content: "Raised prices 10% across the board in January. Lost maybe 3% of customers. You have to pass costs through or you go out of business. Customers understand utilities went up.",
        isAnswer: true,
      },
      {
        content: "Look into commercial water recycling grants. CA has $$ available for businesses that invest in water conservation. Covered 40% of my ozone system cost. DM me for details.",
      },
    ],
  },
  {
    categorySlug: "regional",
    title: "Texas laundromat owners meetup - Austin April 15th?",
    content: `Hey Texas owners! I'm organizing an informal meetup in Austin for anyone interested in networking, sharing ideas, and maybe grabbing lunch/drinks.

**Details:**
- Date: Saturday, April 15th, 2024
- Time: 12pm-3pm
- Location: TBD (suggestions welcome!)
- Cost: Free, just buy your own food/drinks

Topics: Equipment sourcing, vendor relationships, market trends, best practices. No agenda, just networking with fellow owners.

Reply if interested and I'll nail down location. Would love to get 10-15 owners together!`,
    tags: ["Texas", "networking", "meetup", "community"],
    replies: [
      {
        content: "I'm in! Would love to connect. I'm in San Antonio but happy to drive to Austin for this. Maybe do lunch at True Food Kitchen?",
      },
      {
        content: "Count me in. Can we make it 1pm start? I have laundromats to check in the morning. Also +1 for True Food or Snooze AM Eatery.",
      },
      {
        content: "Great idea! I'll bring my equipment distributor contact - he gives awesome deals and always looking for new customers. See you there!",
      },
    ],
  },

  // GENERAL DISCUSSION
  {
    categorySlug: "general-discussion",
    title: "Anyone else seeing slower traffic in 2024 vs 2023?",
    content: `My revenue is down 8% YoY (comparing Q1 2024 to Q1 2023). Customer counts are down about 12% but spend per customer is up slightly.

Is this a trend anyone else is seeing or just me? Market is getting saturated with new builds in my area (Dallas suburbs). Wondering if I need to get more aggressive with promotions or if this is temporary.

What are you all experiencing?`,
    tags: ["revenue", "trends", "2024", "market-conditions"],
    replies: [
      {
        content: "My revenue is actually up 4% YoY but I'm in a growing area (Phoenix suburbs). Could be market saturation in Dallas. How many new competitors opened near you?",
      },
      {
        content: "Down 6% here (Chicago). I think it's the economy. People are doing more laundry at home or stretching it longer between visits. Adding wash-dry-fold helped offset the decline.",
        isAnswer: true,
      },
      {
        content: "Florida here - UP 15% YoY. Population boom is insane. Opened pickup/delivery service and it's crushing. Maybe look at adding services vs just self-serve?",
      },
    ],
  },
  {
    categorySlug: "general-discussion",
    title: "Success Story: From $8K/month to $22K/month in 18 months",
    content: `Wanted to share my turnaround story to inspire other owners struggling with underperforming stores.

**Bought in May 2022:**
- $8,200/month gross revenue
- Purchase price: $185K (asking $210K, negotiated down)
- Unattended, run-down, dirty
- Deferred maintenance everywhere

**Changes I made:**
1. **Deep cleaned everything** - Power washed, painted, new signage ($4K)
2. **Replaced 8 worst machines** - Used equipment from dealer ($12K)
3. **Added wash-dry-fold service** - Hired part-time attendant ($$$)
4. **Upgraded to card/mobile app** - FasCard system ($24K)
5. **Marketing blitz** - FB ads, direct mail, grand re-opening event ($3K)

**Results (Current - Nov 2023):**
- $22,400/month gross revenue (173% increase!)
- $14,800/month SDE (was $4,500 when I bought)
- Store is now worth $370-400K (2x what I paid)

**Total investment:** $235K (purchase + improvements)  
**Current value:** ~$385K  
**ROI:** 64% in 18 months

It's possible! Buy ugly, fix it up, add services. Happy to answer questions!`,
    tags: ["success-story", "turnaround", "case-study", "inspiration"],
    replies: [
      {
        content: "This is amazing! Quick question - how did you fund the $50K in improvements? Out of pocket or loan?",
      },
      {
        content: "Financed $40K through the SBA 7(a) loan (part of purchase loan) and paid $10K out of pocket from first 6 months cash flow. SBA allowed me to include some renovation costs in the loan. Talk to a good SBA lender!",
        isAnswer: true,
      },
      {
        content: "Incredible work! The wash-dry-fold alone probably added $6-8K/month in revenue. What percentage of your total revenue is WDF now?",
      },
      {
        content: "WDF is about 32% of total revenue (~$7,200/month). It's the highest margin revenue stream too. Should have done it day one!",
      },
      {
        content: "Saved this post! I'm closing on a similar situation next month. Your playbook is exactly what I needed. Thank you for sharing real numbers!",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting forum seed...\n");

  try {
    // Create system user for seed data
    const testUserId = "test-user-forum-seeder";
    
    console.log("👤 Creating test user...");
    // Check if user exists, create if not
    const existingUser = await dbStorage.getUser(testUserId);
    if (!existingUser) {
      await dbStorage.createUser({
        id: testUserId,
        username: "LaundryExpert",
        email: "expert@washbizhub.com",
        firstName: "Larry",
        lastName: "Larsen",
        tagline: "Laundromat broker & industry veteran - 25+ years experience",
        bio: "Helping owners buy, sell, and grow laundromat businesses since 1998. Based in Southern California. Licensed broker specializing in unattended laundromats.",
        role: "Broker",
        isAdmin: false,
      });
      console.log("  ✓ Test user created\n");
    } else {
      console.log("  ✓ Test user already exists\n");
    }
    
    console.log("📁 Fetching/Creating forum categories...");
    const createdCategories: Record<string, any> = {};
    
    // Get all existing categories first
    const existingCats = await dbStorage.getForumCategories();
    const existingBySlug: Record<string, any> = {};
    for (const cat of existingCats) {
      existingBySlug[cat.slug] = cat;
    }
    
    for (const category of categories) {
      if (existingBySlug[category.slug]) {
        createdCategories[category.slug] = existingBySlug[category.slug];
        console.log(`  ✓ ${existingBySlug[category.slug].name} (already exists)`);
      } else {
        const created = await dbStorage.createForumCategory(category);
        createdCategories[category.slug] = created;
        console.log(`  ✓ ${created.name} (created)`);
      }
    }

    console.log(`\n📝 Creating ${topics.length} forum topics with replies...\n`);
    
    for (const topic of topics) {
      const category = createdCategories[topic.categorySlug];
      if (!category) {
        console.log(`  ⚠️  Skipping topic - category ${topic.categorySlug} not found`);
        continue;
      }

      // Create topic
      const topicData: InsertForumTopic = {
        categoryId: category.id,
        userId: testUserId,
        title: topic.title,
        content: topic.content,
        slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100),
        tags: topic.tags,
        isPinned: false,
        isLocked: false,
        viewCount: Math.floor(Math.random() * 500) + 50,
        upvotes: Math.floor(Math.random() * 25),
        downvotes: Math.floor(Math.random() * 5),
      };

      const createdTopic = await dbStorage.createForumTopic(topicData);
      console.log(`  ✓ ${createdTopic.title.substring(0, 60)}...`);

      // Create replies
      for (const reply of topic.replies) {
        const replyData: InsertForumReply = {
          topicId: createdTopic.id,
          userId: testUserId,
          content: reply.content,
          isAnswer: reply.isAnswer || false,
          upvotes: reply.isAnswer ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 10),
          downvotes: Math.floor(Math.random() * 3),
        };

        await dbStorage.createForumReply(replyData);
      }
      
      console.log(`    └─ Added ${topic.replies.length} replies`);
    }

    console.log(`\n✅ Forum seed complete!`);
    console.log(`   ${categories.length} categories`);
    console.log(`   ${topics.length} topics`);
    console.log(`   ${topics.reduce((sum, t) => sum + t.replies.length, 0)} replies\n`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed().then(() => {
  console.log("🎉 Seed completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Seed failed with error:", error);
  process.exit(1);
});
