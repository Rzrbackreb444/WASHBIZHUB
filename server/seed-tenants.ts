/**
 * Tenant Seeding Script
 * 
 * Seeds the multi-tenant configuration for:
 * - WashBizHub.com (Laundromat Industry Platform)
 * - StrokeRecoveryAcademy.com (Healthcare Platform)
 * - HawgWash.xyz (Fun Laundry Brand)
 * 
 * Run during server startup to ensure tenants exist
 */

import { storage } from "./storage";
import type { InsertTenant } from "@shared/schema";

const TENANTS: InsertTenant[] = [
  {
    slug: "washbizhub",
    name: "WashBizHub",
    domain: "washbizhub.com",
    logoUrl: null,
    primaryColor: "#C8A661",
    accentColor: "#1a2332",
    heroTitle: "The #1 Resource for Laundromat Professionals",
    heroSubtitle: "Business intelligence, market analysis, AI consulting, and industry resources for laundromat owners and investors.",
    tagline: "Built by industry veterans. Powered by AI.",
    metaTitle: "WashBizHub | Professional Laundromat Industry Platform",
    metaDescription: "The leading SaaS platform for laundromat business intelligence, market analysis, AI consulting, and industry resources. Powered by the Laundromat Bible.",
    ogImage: null,
    enableCourses: true,
    enableMarketplace: true,
    enableCommunity: true,
    enableWhiteLabel: true,
    aiKnowledgeBasePath: "laundromat-bible",
    aiWelcomeMessage: "Welcome to WashBizHub! I'm your AI consultant trained on The Laundromat Bible. How can I help you with your laundromat business today?",
    amazonCatalogType: "commercial_laundry",
    isActive: true,
  },
  {
    slug: "strokerecoveryacademy",
    name: "Stroke Recovery Academy",
    domain: "strokerecoveryacademy.com",
    logoUrl: null,
    primaryColor: "#4A90D9",
    accentColor: "#2C5282",
    heroTitle: "Your Recovery Journey Starts Here",
    heroSubtitle: "Evidence-based stroke recovery education, AI coaching, and community support from stroke survivors who understand.",
    tagline: "From survivor to thriver. Your recovery is possible.",
    metaTitle: "Stroke Recovery Academy | Evidence-Based Recovery Education",
    metaDescription: "Comprehensive stroke recovery education with AI-powered curricula, community forums, and tracking tools. Created by stroke survivors for stroke survivors.",
    ogImage: null,
    enableCourses: true,
    enableMarketplace: false,
    enableCommunity: true,
    enableWhiteLabel: false,
    aiKnowledgeBasePath: "stroke-recovery-bible",
    aiWelcomeMessage: "Welcome to Stroke Recovery Academy! I'm your AI companion, trained on The Ultimate Stroke Recovery Bible. Your recovery is possible - let's work on it together.",
    amazonCatalogType: "recovery_products",
    isActive: true,
  },
  {
    slug: "hawgwash",
    name: "HawgWash",
    domain: "hawgwash.xyz",
    logoUrl: null,
    primaryColor: "#FF6B35",
    accentColor: "#1E3A5F",
    heroTitle: "Get Your Stuff Clean, the HawgWash Way",
    heroSubtitle: "No-nonsense laundry solutions for real people. Fast, fun, and fabulous results.",
    tagline: "Clean clothes. Happy life. Hawg wild about laundry.",
    metaTitle: "HawgWash | No-Nonsense Laundry Solutions",
    metaDescription: "HawgWash delivers fast, fun, and fabulous laundry solutions. Get your stuff clean the HawgWash way - professional quality, down-home service.",
    ogImage: null,
    enableCourses: false,
    enableMarketplace: true,
    enableCommunity: true,
    enableWhiteLabel: false,
    aiKnowledgeBasePath: "laundromat-bible",
    aiWelcomeMessage: "Howdy! Welcome to HawgWash! I'm here to help you get your laundry situation sorted out. What can I do for ya today?",
    amazonCatalogType: "commercial_laundry",
    isActive: true,
  },
];

export async function seedTenants() {
  console.log("🏢 Seeding tenants...");

  for (const tenantData of TENANTS) {
    try {
      const existing = await storage.getTenantByDomain(tenantData.domain);
      
      if (existing) {
        console.log(`✓ Tenant already exists: ${tenantData.name} (${tenantData.domain})`);
        continue;
      }

      await storage.createTenant(tenantData);
      console.log(`✓ Created tenant: ${tenantData.name} (${tenantData.domain})`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⚡ Tenant already exists (constraint): ${tenantData.name}`);
      } else {
        console.error(`❌ Error creating tenant ${tenantData.name}:`, error.message);
      }
    }
  }

  console.log("✅ Tenant seeding complete!");
}
