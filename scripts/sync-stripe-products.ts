/**
 * STRIPE PRODUCT SYNC SCRIPT
 * 
 * Run this script to create/sync all CLEANBI subscription products in Stripe.
 * Usage: npx tsx scripts/sync-stripe-products.ts
 * 
 * This will:
 * 1. Create products for each tier (Starter, Pro, Enterprise)
 * 2. Create monthly and annual prices for each
 * 3. Output the price IDs to add to your environment
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY environment variable is required");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

interface ProductConfig {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // in dollars
  annualPrice: number; // in dollars
  features: string[];
}

const PRODUCTS: ProductConfig[] = [
  {
    id: "cleanbi_starter",
    name: "CLEANBI Starter",
    description: "Unlimited CLEANBI analyses with full category breakdowns, AI recommendations, and PDF exports",
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      "Unlimited CLEANBI analyses",
      "Full 6-factor category breakdowns",
      "AI-powered recommendations",
      "3D Aerial View flyovers",
      "Walk Score & Transit Score",
      "Solar potential analysis",
      "Property value estimates",
      "PDF report exports",
      "Save up to 100 reports",
      "Priority email support"
    ]
  },
  {
    id: "cleanbi_pro",
    name: "CLEANBI Pro",
    description: "Advanced analytics with ROI calculators, Monte Carlo simulations, and API access for power users",
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      "Everything in Starter",
      "ROI & Valuation calculators",
      "Monte Carlo simulations",
      "Utility rate analysis",
      "Drive-time catchment maps",
      "Revenue projections",
      "Bulk location analysis",
      "API access (500 calls/month)",
      "Unlimited saved reports",
      "Priority phone support"
    ]
  },
  {
    id: "cleanbi_enterprise",
    name: "CLEANBI Enterprise",
    description: "Full platform access with ownership data, motivated seller detection, white-label reports, and dedicated support",
    monthlyPrice: 699,
    annualPrice: 6990,
    features: [
      "Everything in Pro",
      "Ownership & lien data",
      "Motivated seller score",
      "Property tax records",
      "White-label reports",
      "Unlimited API access",
      "Team collaboration",
      "Dedicated account manager",
      "Slack support channel",
      "Custom integrations"
    ]
  }
];

async function findOrCreateProduct(config: ProductConfig): Promise<Stripe.Product> {
  // Search for existing product by metadata
  const existingProducts = await stripe.products.search({
    query: `metadata['product_id']:'${config.id}'`,
    limit: 1
  });

  if (existingProducts.data.length > 0) {
    console.log(`  📦 Found existing product: ${config.name}`);
    return existingProducts.data[0];
  }

  // Create new product (features added via marketing_features)
  const product = await stripe.products.create({
    name: config.name,
    description: config.description,
    metadata: {
      product_id: config.id,
      tier: config.id.replace("cleanbi_", ""),
      features: config.features.slice(0, 5).join(", ")
    },
    default_price_data: {
      currency: "usd",
      unit_amount: config.monthlyPrice * 100,
      recurring: { interval: "month" }
    }
  });

  console.log(`  ✅ Created product: ${config.name} (${product.id})`);
  return product;
}

async function findOrCreatePrice(
  product: Stripe.Product,
  amount: number,
  interval: "month" | "year",
  config: ProductConfig
): Promise<Stripe.Price> {
  const nickname = `${config.name} (${interval === "month" ? "Monthly" : "Annual"})`;
  
  // Search for existing price
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100
  });

  const existingPrice = existingPrices.data.find(
    p => p.recurring?.interval === interval && p.unit_amount === amount * 100
  );

  if (existingPrice) {
    console.log(`    💰 Found existing price: ${nickname} = $${amount}/${interval}`);
    return existingPrice;
  }

  // Create new price
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount * 100,
    recurring: { interval },
    nickname,
    metadata: {
      tier: config.id.replace("cleanbi_", ""),
      billing_period: interval
    }
  });

  console.log(`    ✅ Created price: ${nickname} = $${amount}/${interval} (${price.id})`);
  return price;
}

async function main() {
  console.log("\n🚀 STRIPE PRODUCT SYNC\n");
  console.log("=".repeat(60));

  const results: Record<string, { productId: string; monthlyPriceId: string; annualPriceId: string }> = {};

  for (const config of PRODUCTS) {
    console.log(`\n📦 Processing ${config.name}...`);
    
    try {
      // Create/find product
      const product = await findOrCreateProduct(config);
      
      // Create/find monthly price
      const monthlyPrice = await findOrCreatePrice(product, config.monthlyPrice, "month", config);
      
      // Create/find annual price
      const annualPrice = await findOrCreatePrice(product, config.annualPrice, "year", config);
      
      results[config.id] = {
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        annualPriceId: annualPrice.id
      };
    } catch (error: any) {
      console.error(`  ❌ Error processing ${config.name}: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ SYNC COMPLETE");
  console.log("=".repeat(60));

  console.log("\n📋 ADD THESE TO YOUR ENVIRONMENT VARIABLES:\n");
  console.log("# CLEANBI Stripe Price IDs");
  
  for (const [key, value] of Object.entries(results)) {
    const tierName = key.replace("cleanbi_", "").toUpperCase();
    console.log(`STRIPE_PRICE_${tierName}_MONTHLY=${value.monthlyPriceId}`);
    console.log(`STRIPE_PRICE_${tierName}_ANNUAL=${value.annualPriceId}`);
  }

  console.log("\n📋 PRODUCT IDs FOR REFERENCE:\n");
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}: ${value.productId}`);
  }

  console.log("\n✨ Done! Add the price IDs above to your Replit Secrets.\n");
}

main().catch(console.error);
