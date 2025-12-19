import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' as any });

async function createProducts() {
  console.log('🚀 Creating Stripe Products and Prices...\n');
  
  const products = [
    {
      name: 'WashBizHub All-Access',
      description: 'Complete access to all WashBizHub tools: CLEANBI Explorer, calculators, AI consultants, marketplace, courses, and more.',
      monthly: 12900,
      annual: 129000,
      metadata: { tier: 'all_access', category: 'platform' }
    },
    {
      name: 'Service Guy AI Pro',
      description: 'AI-powered equipment diagnostics, repair guidance, photo diagnosis, and service manual library for laundromat technicians.',
      monthly: 4900,
      annual: 49000,
      metadata: { tier: 'service_guy_pro', category: 'ai_tools' }
    },
    {
      name: 'CLEANBI Pro',
      description: 'Advanced location intelligence scoring, demographic analysis, competition mapping, and market reports.',
      monthly: 7900,
      annual: 79000,
      metadata: { tier: 'cleanbi_pro', category: 'analytics' }
    },
    {
      name: 'WashBizPOS Pro',
      description: 'Point-of-sale system for laundromat operations with transaction tracking, customer management, and reporting.',
      monthly: 9900,
      annual: 99000,
      metadata: { tier: 'pos_pro', category: 'operations' }
    },
    {
      name: 'Marketplace Listing - Basic',
      description: 'List your laundromat for sale with standard visibility.',
      monthly: 6500,
      metadata: { tier: 'listing_basic', category: 'marketplace' }
    },
    {
      name: 'Marketplace Listing - Showcase',
      description: 'Enhanced listing with priority placement and featured badge.',
      monthly: 8900,
      metadata: { tier: 'listing_showcase', category: 'marketplace' }
    },
    {
      name: 'Marketplace Listing - Diamond',
      description: 'Premium listing with homepage feature, top search placement, and dedicated support.',
      monthly: 19900,
      metadata: { tier: 'listing_diamond', category: 'marketplace' }
    },
    {
      name: 'Distributor Command Center',
      description: 'Enterprise AI hub for equipment distributors: Fleet monitoring, parts intelligence, AI receptionist, technician dispatch.',
      monthly: 49900,
      annual: 499000,
      metadata: { tier: 'distributor_enterprise', category: 'enterprise' }
    }
  ];

  const results: { name: string; productId: string; monthlyPriceId: string; annualPriceId?: string }[] = [];

  for (const p of products) {
    try {
      const product = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: p.metadata,
      });
      console.log(`✅ Created product: ${p.name} (${product.id})`);

      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: p.monthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { ...p.metadata, billing: 'monthly' },
      });
      console.log(`   💵 Monthly: $${p.monthly / 100}/mo (${monthlyPrice.id})`);

      let annualPriceId: string | undefined;
      if ((p as any).annual) {
        const annualPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: (p as any).annual,
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { ...p.metadata, billing: 'annual' },
        });
        annualPriceId = annualPrice.id;
        console.log(`   💵 Annual: $${(p as any).annual / 100}/yr (${annualPrice.id})`);
      }

      results.push({ name: p.name, productId: product.id, monthlyPriceId: monthlyPrice.id, annualPriceId });
    } catch (error: any) {
      console.error(`❌ Error creating ${p.name}:`, error.message);
    }
  }

  console.log('\n📋 ENV VARS TO SET:\n');
  for (const r of results) {
    const prefix = r.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    console.log(`STRIPE_${prefix}_MONTHLY_PRICE_ID=${r.monthlyPriceId}`);
    if (r.annualPriceId) console.log(`STRIPE_${prefix}_ANNUAL_PRICE_ID=${r.annualPriceId}`);
  }
  
  console.log('\n📦 JSON:', JSON.stringify(results, null, 2));
}

createProducts().catch(console.error);
