/**
 * Stripe Product Catalog Sync
 * 
 * This script creates all WashBizHub products and prices in Stripe.
 * Run via: npx tsx server/stripe-catalog-sync.ts
 * Or call the API endpoint: POST /api/admin/stripe/sync-catalog
 */

import Stripe from 'stripe';
import { fileURLToPath } from 'url';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20' as any,
});

// Complete product catalog definition
export const PRODUCT_CATALOG = {
  // ================================================
  // CLEANBI LOCATION INTELLIGENCE
  // ================================================
  cleanbi: {
    starter: {
      name: 'CLEANBI Starter',
      description: 'Unlimited CLEANBI location analyses with full breakdowns, competitor mapping, and PDF exports.',
      metadata: { tier: 'starter', product_line: 'cleanbi' },
      prices: {
        monthly: { amount: 2900, interval: 'month' as const, envKey: 'STRIPE_PRICE_STARTER_MONTHLY' },
        annual: { amount: 29000, interval: 'year' as const, envKey: 'STRIPE_PRICE_STARTER_ANNUAL' },
      }
    },
    pro: {
      name: 'CLEANBI Pro',
      description: 'Everything in Starter plus API access (500 calls/mo), ROI calculator, Monte Carlo simulation, and phone support.',
      metadata: { tier: 'pro', product_line: 'cleanbi' },
      prices: {
        monthly: { amount: 9900, interval: 'month' as const, envKey: 'STRIPE_PRICE_PRO_MONTHLY' },
        annual: { amount: 99000, interval: 'year' as const, envKey: 'STRIPE_PRICE_PRO_ANNUAL' },
      }
    },
    enterprise: {
      name: 'CLEANBI Enterprise',
      description: 'Full access with unlimited API, white-label, ownership data, motivated seller scores, and dedicated account manager.',
      metadata: { tier: 'enterprise', product_line: 'cleanbi' },
      prices: {
        monthly: { amount: 69900, interval: 'month' as const, envKey: 'STRIPE_PRICE_ENTERPRISE_MONTHLY' },
        annual: { amount: 699000, interval: 'year' as const, envKey: 'STRIPE_PRICE_ENTERPRISE_ANNUAL' },
      }
    },
  },

  // ================================================
  // ALL-ACCESS BUNDLES (matches pricing page)
  // ================================================
  bundles: {
    business: {
      name: 'WashBizHub All-Access',
      description: 'Complete access to CLEANBI Pro, Service Guy AI Pro, POS Suite, and all premium templates.',
      metadata: { tier: 'business', product_line: 'bundle' },
      prices: {
        monthly: { amount: 14900, interval: 'month' as const, envKey: 'STRIPE_BUSINESS_MONTHLY_PRICE_ID' },
        annual: { amount: 149000, interval: 'year' as const, envKey: 'STRIPE_BUSINESS_ANNUAL_PRICE_ID' },
      }
    },
    enterprise: {
      name: 'WashBizHub Enterprise',
      description: 'Everything in All-Access plus API access, white-label reports, multi-location management, team seats, and dedicated account manager.',
      metadata: { tier: 'enterprise', product_line: 'bundle' },
      prices: {
        monthly: { amount: 29900, interval: 'month' as const, envKey: 'STRIPE_ENTERPRISE_MONTHLY_PRICE_ID' },
        annual: { amount: 299000, interval: 'year' as const, envKey: 'STRIPE_ENTERPRISE_ANNUAL_PRICE_ID' },
      }
    },
    academyBundle: {
      name: 'Forensic Investor Academy Bundle',
      description: 'All academy courses, templates, and exclusive Larry Larsen content.',
      metadata: { tier: 'academy_bundle', product_line: 'education' },
      prices: {
        oneTime: { amount: 99700, interval: null, envKey: 'STRIPE_PRICE_ACADEMY_BUNDLE' },
      }
    },
    vaultBundle: {
      name: 'Template Vault Bundle',
      description: 'All premium templates: Business Plan, Due Diligence, LOI, Financial Model, and more.',
      metadata: { tier: 'vault_bundle', product_line: 'templates' },
      prices: {
        oneTime: { amount: 29700, interval: null, envKey: 'STRIPE_PRICE_VAULT_BUNDLE' },
      }
    },
  },

  // ================================================
  // SERVICE GUY AI
  // ================================================
  serviceGuyAi: {
    pro: {
      name: 'Service Guy AI Pro',
      description: 'AI-powered equipment diagnostics with voice input, photo analysis, job tracking, and parts ordering.',
      metadata: { tier: 'pro', product_line: 'service_guy_ai' },
      prices: {
        monthly: { amount: 4900, interval: 'month' as const, envKey: 'STRIPE_SERVICE_GUY_AI_PRO_MONTHLY_PRICE_ID' },
        annual: { amount: 49000, interval: 'year' as const, envKey: 'STRIPE_SERVICE_GUY_AI_PRO_ANNUAL_PRICE_ID' },
      }
    },
  },

  // ================================================
  // POS SUITE
  // ================================================
  pos: {
    pro: {
      name: 'POS Suite Pro',
      description: 'Complete point-of-sale system with transaction register, WDF calculator, cash drawer, and daily summary.',
      metadata: { tier: 'pro', product_line: 'pos' },
      prices: {
        monthly: { amount: 7900, interval: 'month' as const, envKey: 'STRIPE_POS_PRO_MONTHLY_PRICE_ID' },
        annual: { amount: 79000, interval: 'year' as const, envKey: 'STRIPE_POS_PRO_ANNUAL_PRICE_ID' },
      }
    },
  },

  // ================================================
  // MARKETPLACE LISTINGS
  // ================================================
  listings: {
    basic: {
      name: 'Marketplace Listing - Basic',
      description: 'Standard listing with photos, description, and contact form.',
      metadata: { tier: 'basic', product_line: 'marketplace' },
      prices: {
        monthly: { amount: 4900, interval: 'month' as const, envKey: 'STRIPE_LISTING_BASIC_PRICE_ID' },
      }
    },
    showcase: {
      name: 'Marketplace Listing - Showcase',
      description: 'Featured placement, video tour, CLEANBI score badge, and priority support.',
      metadata: { tier: 'showcase', product_line: 'marketplace' },
      prices: {
        monthly: { amount: 14900, interval: 'month' as const, envKey: 'STRIPE_LISTING_SHOWCASE_PRICE_ID' },
      }
    },
    diamond: {
      name: 'Marketplace Listing - Diamond',
      description: 'Premium placement, virtual tour, broker matching, and dedicated listing manager.',
      metadata: { tier: 'diamond', product_line: 'marketplace' },
      prices: {
        monthly: { amount: 29900, interval: 'month' as const, envKey: 'STRIPE_LISTING_DIAMOND_PRICE_ID' },
      }
    },
  },

  // ================================================
  // DISTRIBUTOR COMMAND CENTER
  // ================================================
  distributor: {
    enterprise: {
      name: 'Distributor Command Center',
      description: 'Enterprise AI hub for equipment distributors with fleet health dashboard, parts intelligence, and technician dispatch.',
      metadata: { tier: 'enterprise', product_line: 'distributor' },
      prices: {
        monthly: { amount: 99900, interval: 'month' as const, envKey: 'STRIPE_DISTRIBUTOR_MONTHLY_PRICE_ID' },
        annual: { amount: 999000, interval: 'year' as const, envKey: 'STRIPE_DISTRIBUTOR_ANNUAL_PRICE_ID' },
      }
    },
  },

  // ================================================
  // INDIVIDUAL TEMPLATES
  // ================================================
  templates: {
    dueDiligence: {
      name: 'Due Diligence Checklist Template',
      description: 'Comprehensive 200+ item checklist for laundromat acquisitions.',
      metadata: { type: 'template', template_id: 'due_diligence' },
      prices: {
        oneTime: { amount: 9700, interval: null, envKey: 'STRIPE_PRICE_TEMPLATE_DUE_DILIGENCE' },
      }
    },
    grandOpening: {
      name: 'Grand Opening Marketing Kit',
      description: 'Complete marketing materials for laundromat grand openings.',
      metadata: { type: 'template', template_id: 'grand_opening' },
      prices: {
        oneTime: { amount: 4700, interval: null, envKey: 'STRIPE_PRICE_TEMPLATE_GRAND_OPENING' },
      }
    },
    employeeHandbook: {
      name: 'Employee Handbook Template',
      description: 'Professional employee handbook customizable for laundromat operations.',
      metadata: { type: 'template', template_id: 'employee_handbook' },
      prices: {
        oneTime: { amount: 4700, interval: null, envKey: 'STRIPE_PRICE_TEMPLATE_EMPLOYEE_HANDBOOK' },
      }
    },
    wdfManual: {
      name: 'Wash-Dry-Fold Operations Manual',
      description: 'Complete WDF service operations guide with pricing, workflows, and customer management.',
      metadata: { type: 'template', template_id: 'wdf_manual' },
      prices: {
        oneTime: { amount: 7900, interval: null, envKey: 'STRIPE_PRICE_TEMPLATE_WDF_MANUAL' },
      }
    },
  },

  // ================================================
  // CLEANBI SINGLE REPORTS (One-time purchases)
  // Pricing: $29 Quick → $149 Standard → $349 Pro → $599 Enterprise
  // ================================================
  cleanbiReports: {
    quick: {
      name: 'CLEANBI Quick Score Report',
      description: 'Instant location grade with overall score summary. Gateway product for quick assessments.',
      metadata: { type: 'report', report_tier: 'quick' },
      prices: {
        oneTime: { amount: 2900, interval: null, envKey: 'STRIPE_PRICE_CLEANBI_QUICK' },
      }
    },
    standard: {
      name: 'CLEANBI Location Intelligence Report',
      description: 'Full 17-factor analysis with competitor mapping, Walk Score, demographics, and PDF export.',
      metadata: { type: 'report', report_tier: 'standard' },
      prices: {
        oneTime: { amount: 14900, interval: null, envKey: 'STRIPE_PRICE_CLEANBI_STANDARD' },
      }
    },
    pro: {
      name: 'CLEANBI Due Diligence Report',
      description: 'Comprehensive analysis with ROI projections, property intelligence, growth signals, and valuation estimates.',
      metadata: { type: 'report', report_tier: 'pro' },
      prices: {
        oneTime: { amount: 34900, interval: null, envKey: 'STRIPE_PRICE_CLEANBI_PRO' },
      }
    },
    enterprise: {
      name: 'CLEANBI Acquisition Ready Report',
      description: 'Full enterprise analysis with ownership data, motivated seller detection, AI insights, and deep competitor intelligence.',
      metadata: { type: 'report', report_tier: 'enterprise' },
      prices: {
        oneTime: { amount: 59900, interval: null, envKey: 'STRIPE_PRICE_CLEANBI_ENTERPRISE' },
      }
    },
  },

  // ================================================
  // BUSINESS DIRECTORY
  // ================================================
  directory: {
    boost: {
      name: 'Directory Boost',
      description: 'Enhanced visibility in the service provider directory.',
      metadata: { tier: 'boost', product_line: 'directory' },
      prices: {
        monthly: { amount: 4900, interval: 'month' as const, envKey: 'STRIPE_DIRECTORY_BOOST_PRICE_ID' },
      }
    },
    spotlight: {
      name: 'Directory Spotlight',
      description: 'Featured placement with logo and expanded profile.',
      metadata: { tier: 'spotlight', product_line: 'directory' },
      prices: {
        monthly: { amount: 14900, interval: 'month' as const, envKey: 'STRIPE_DIRECTORY_SPOTLIGHT_PRICE_ID' },
      }
    },
    pro: {
      name: 'Directory Pro',
      description: 'Premium placement with video, reviews, and lead generation tools.',
      metadata: { tier: 'pro', product_line: 'directory' },
      prices: {
        monthly: { amount: 29900, interval: 'month' as const, envKey: 'STRIPE_DIRECTORY_PRO_PRICE_ID' },
      }
    },
  },
};

interface SyncResult {
  productsCreated: number;
  pricesCreated: number;
  productsUpdated: number;
  pricesUpdated: number;
  errors: string[];
  envVars: Record<string, string>;
}

export async function syncStripeCatalog(): Promise<SyncResult> {
  const result: SyncResult = {
    productsCreated: 0,
    pricesCreated: 0,
    productsUpdated: 0,
    pricesUpdated: 0,
    errors: [],
    envVars: {},
  };

  console.log('🔄 Starting Stripe catalog sync...');
  console.log(`📊 Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);

  // Flatten catalog into processable items
  const productItems: Array<{
    category: string;
    key: string;
    config: {
      name: string;
      description: string;
      metadata: Record<string, string>;
      prices: Record<string, { amount: number; interval: 'month' | 'year' | null; envKey: string }>;
    };
  }> = [];

  for (const [category, products] of Object.entries(PRODUCT_CATALOG)) {
    for (const [key, config] of Object.entries(products)) {
      productItems.push({ category, key, config: config as any });
    }
  }

  // Process each product
  for (const { category, key, config } of productItems) {
    const productIdEnvKey = `STRIPE_PRODUCT_${category.toUpperCase()}_${key.toUpperCase()}`;
    
    try {
      // Check if product already exists by searching
      const existingProducts = await stripe.products.search({
        query: `name:'${config.name}'`,
      });

      let product: Stripe.Product;

      if (existingProducts.data.length > 0) {
        // Update existing product
        product = await stripe.products.update(existingProducts.data[0].id, {
          name: config.name,
          description: config.description,
          metadata: config.metadata,
        });
        result.productsUpdated++;
        console.log(`✅ Updated product: ${config.name} (${product.id})`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: config.name,
          description: config.description,
          metadata: config.metadata,
        });
        result.productsCreated++;
        console.log(`🆕 Created product: ${config.name} (${product.id})`);
      }

      result.envVars[productIdEnvKey] = product.id;

      // Process prices for this product
      for (const [priceType, priceConfig] of Object.entries(config.prices)) {
        try {
          // Check if price already exists
          const existingPrices = await stripe.prices.list({
            product: product.id,
            active: true,
          });

          const matchingPrice = existingPrices.data.find(p => {
            if (priceConfig.interval === null) {
              return p.type === 'one_time' && p.unit_amount === priceConfig.amount;
            }
            return p.recurring?.interval === priceConfig.interval && p.unit_amount === priceConfig.amount;
          });

          let price: Stripe.Price;

          if (matchingPrice) {
            price = matchingPrice;
            result.pricesUpdated++;
            console.log(`  ✓ Price exists: ${priceType} - ${price.id}`);
          } else {
            // Create new price
            const priceParams: Stripe.PriceCreateParams = {
              product: product.id,
              unit_amount: priceConfig.amount,
              currency: 'usd',
              metadata: {
                ...config.metadata,
                price_type: priceType,
              },
            };

            if (priceConfig.interval) {
              priceParams.recurring = { interval: priceConfig.interval };
            }

            price = await stripe.prices.create(priceParams);
            result.pricesCreated++;
            console.log(`  🆕 Created price: ${priceType} - ${price.id}`);
          }

          result.envVars[priceConfig.envKey] = price.id;
        } catch (priceError: any) {
          result.errors.push(`Price error for ${config.name} (${priceType}): ${priceError.message}`);
          console.error(`  ❌ Price error: ${priceError.message}`);
        }
      }
    } catch (productError: any) {
      result.errors.push(`Product error for ${config.name}: ${productError.message}`);
      console.error(`❌ Product error: ${productError.message}`);
    }
  }

  console.log('\n📊 Sync Summary:');
  console.log(`  Products created: ${result.productsCreated}`);
  console.log(`  Products updated: ${result.productsUpdated}`);
  console.log(`  Prices created: ${result.pricesCreated}`);
  console.log(`  Prices updated: ${result.pricesUpdated}`);
  console.log(`  Errors: ${result.errors.length}`);

  if (Object.keys(result.envVars).length > 0) {
    console.log('\n🔑 Environment Variables to set:');
    for (const [key, value] of Object.entries(result.envVars)) {
      console.log(`  ${key}=${value}`);
    }
  }

  return result;
}

// CLI execution - ES module compatible
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  syncStripeCatalog()
    .then(result => {
      if (result.errors.length > 0) {
        console.error('\n❌ Completed with errors');
        process.exit(1);
      }
      console.log('\n✅ Catalog sync complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
