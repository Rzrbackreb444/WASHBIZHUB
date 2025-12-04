/**
 * Create One-Time Purchase Products in Stripe
 * Run with: npx tsx scripts/create-stripe-one-time-products.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

interface ProductConfig {
  id: string;
  name: string;
  description: string;
  price: number; // in dollars
  category: string;
}

const ONE_TIME_PRODUCTS: ProductConfig[] = [
  // Academy Bundle
  {
    id: 'academy_bundle',
    name: 'Laundry Tech Academy - Complete Bundle',
    description: 'All 4 certification levels: Attendant Essentials, Certified Tech, Advanced Tech, and Master Tech. Save $598!',
    price: 999,
    category: 'course',
  },
  // Vault Bundle
  {
    id: 'vault_bundle',
    name: "The Operator's Vault - Complete Bundle",
    description: 'All 20 premium laundromat business templates ($5,917 value)',
    price: 997,
    category: 'template',
  },
  // CLEANBI Reports
  {
    id: 'cleanbi_quick',
    name: 'CLEANBI Quick Valuation Report',
    description: 'Fast valuation estimate with CLEANBI score for any laundromat location',
    price: 99,
    category: 'report',
  },
  {
    id: 'cleanbi_standard',
    name: 'CLEANBI Standard Report',
    description: 'Essential location analysis with competitor data and demographic insights',
    price: 199,
    category: 'report',
  },
  {
    id: 'cleanbi_pro',
    name: 'CLEANBI Pro Report',
    description: 'Comprehensive analysis with Vision AI insights, traffic patterns, and market scoring',
    price: 349,
    category: 'report',
  },
  {
    id: 'cleanbi_enterprise',
    name: 'CLEANBI Enterprise Report',
    description: 'Full analysis with aerial views, 3D flyover, and 30-min consultation call',
    price: 499,
    category: 'report',
  },
  // Popular Individual Templates
  {
    id: 'template_due_diligence',
    name: 'Due Diligence Master Packet',
    description: 'Complete due diligence checklist and document templates for laundromat acquisitions',
    price: 197,
    category: 'template',
  },
  {
    id: 'template_grand_opening',
    name: 'Grand Opening Marketing Kit',
    description: 'Complete marketing materials for launching your laundromat',
    price: 197,
    category: 'template',
  },
  {
    id: 'template_employee_handbook',
    name: 'Employee Handbook (40+ Pages)',
    description: 'Comprehensive employee handbook template for laundromat operations',
    price: 97,
    category: 'template',
  },
  {
    id: 'template_wdf_manual',
    name: 'WDF Operations Manual',
    description: 'Wash-Dry-Fold service operations manual and procedures',
    price: 127,
    category: 'template',
  },
];

async function createProducts() {
  console.log('\n🚀 CREATING ONE-TIME PURCHASE PRODUCTS IN STRIPE\n');
  console.log('============================================================\n');

  const createdProducts: Record<string, { productId: string; priceId: string }> = {};

  for (const product of ONE_TIME_PRODUCTS) {
    console.log(`📦 Processing ${product.name}...`);

    try {
      // Check if product already exists by metadata
      const existingProducts = await stripe.products.search({
        query: `metadata['washbizhub_id']:'${product.id}'`,
      });

      let stripeProduct: Stripe.Product;

      if (existingProducts.data.length > 0) {
        stripeProduct = existingProducts.data[0];
        console.log(`  ✓ Product already exists: ${stripeProduct.id}`);
      } else {
        // Create new product
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          metadata: {
            washbizhub_id: product.id,
            category: product.category,
          },
        });
        console.log(`  ✅ Created product: ${stripeProduct.id}`);
      }

      // Check for existing price
      const existingPrices = await stripe.prices.list({
        product: stripeProduct.id,
        active: true,
      });

      let price: Stripe.Price;
      const targetAmount = product.price * 100;

      const matchingPrice = existingPrices.data.find(
        p => p.unit_amount === targetAmount && p.type === 'one_time'
      );

      if (matchingPrice) {
        price = matchingPrice;
        console.log(`  ✓ Price already exists: ${price.id} ($${product.price})`);
      } else {
        // Create new price
        price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: targetAmount,
          currency: 'usd',
        });
        console.log(`  ✅ Created price: ${price.id} ($${product.price})`);
      }

      createdProducts[product.id] = {
        productId: stripeProduct.id,
        priceId: price.id,
      };

    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }

    console.log('');
  }

  // Output environment variables
  console.log('============================================================');
  console.log('✅ PRODUCTS CREATED');
  console.log('============================================================\n');

  console.log('📋 ENVIRONMENT VARIABLES TO ADD:\n');

  for (const [id, data] of Object.entries(createdProducts)) {
    const envKey = `STRIPE_PRICE_${id.toUpperCase()}`;
    console.log(`${envKey}=${data.priceId}`);
  }

  console.log('\n✨ Done!');

  return createdProducts;
}

createProducts().catch(console.error);
