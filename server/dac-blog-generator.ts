/**
 * DAVID ALLEN CAPITAL BLOG GENERATOR
 * 
 * Generates 50+ SEO-optimized blog posts for business financing
 * targeting various industries across America with affiliate links.
 * 
 * Affiliate Links:
 * - English: https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1
 * - Spanish: https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1&lang=es
 * - Referral EN: https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1
 * - Referral ES: https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1&lang=es
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db";
import { blogPosts } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Affiliate Links
const AFFILIATE_LINKS = {
  financingEN: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1",
  financingES: "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1&lang=es",
  referralEN: "https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1",
  referralES: "https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1&lang=es",
  mainSite: "https://davidallencapital.com/nicholaskremers",
};

// Funding Types offered by David Allen Capital
const FUNDING_TYPES = [
  { name: "Revenue-Based Funding", slug: "revenue-based-funding", description: "Flexible funding based on monthly revenue, not credit score" },
  { name: "Merchant Cash Advance", slug: "merchant-cash-advance", description: "Fast capital based on future credit card sales" },
  { name: "SBA Loans", slug: "sba-loans", description: "Government-backed small business loans with competitive rates" },
  { name: "Equipment Financing", slug: "equipment-financing", description: "Fund machinery, vehicles, and technology purchases" },
  { name: "Business Line of Credit", slug: "business-line-of-credit", description: "Revolving credit access up to $200K" },
  { name: "Working Capital Loans", slug: "working-capital-loans", description: "Short-term funding for operational expenses" },
  { name: "Bank Term Loans", slug: "bank-term-loans", description: "Traditional structured business loans" },
];

// 50+ Industries across America
const INDUSTRIES = [
  // Restaurants & Food Service
  { name: "Restaurant", state: "Texas", city: "Houston", keywords: ["restaurant financing houston", "restaurant business loans texas"] },
  { name: "Food Truck", state: "California", city: "Los Angeles", keywords: ["food truck financing LA", "mobile food business loans california"] },
  { name: "Catering", state: "Florida", city: "Miami", keywords: ["catering business financing miami", "event catering loans florida"] },
  { name: "Bakery", state: "New York", city: "Brooklyn", keywords: ["bakery financing brooklyn", "bakery business loans new york"] },
  { name: "Coffee Shop", state: "Washington", city: "Seattle", keywords: ["coffee shop financing seattle", "cafe business loans washington"] },
  
  // Retail & Commerce
  { name: "Retail Store", state: "Illinois", city: "Chicago", keywords: ["retail store financing chicago", "small retail business loans illinois"] },
  { name: "E-commerce", state: "Arizona", city: "Phoenix", keywords: ["ecommerce business financing", "online store funding arizona"] },
  { name: "Grocery Store", state: "Georgia", city: "Atlanta", keywords: ["grocery store financing atlanta", "supermarket business loans georgia"] },
  { name: "Clothing Boutique", state: "Nevada", city: "Las Vegas", keywords: ["boutique financing las vegas", "fashion retail loans nevada"] },
  { name: "Convenience Store", state: "Pennsylvania", city: "Philadelphia", keywords: ["convenience store loans philly", "c-store financing pennsylvania"] },
  
  // Automotive
  { name: "Auto Repair Shop", state: "Michigan", city: "Detroit", keywords: ["auto repair shop financing detroit", "mechanic business loans michigan"] },
  { name: "Car Dealership", state: "Ohio", city: "Columbus", keywords: ["car dealership financing ohio", "auto dealer loans columbus"] },
  { name: "Auto Body Shop", state: "North Carolina", city: "Charlotte", keywords: ["body shop financing charlotte", "auto body business loans nc"] },
  { name: "Tire Shop", state: "Tennessee", city: "Nashville", keywords: ["tire shop financing nashville", "tire business loans tennessee"] },
  { name: "Car Wash", state: "Colorado", city: "Denver", keywords: ["car wash financing denver", "car wash business loans colorado"] },
  
  // Healthcare & Wellness
  { name: "Dental Practice", state: "Massachusetts", city: "Boston", keywords: ["dental practice financing boston", "dentist business loans massachusetts"] },
  { name: "Medical Practice", state: "Maryland", city: "Baltimore", keywords: ["medical practice loans baltimore", "doctor office financing maryland"] },
  { name: "Chiropractic", state: "Oregon", city: "Portland", keywords: ["chiropractic financing portland", "chiropractor business loans oregon"] },
  { name: "Physical Therapy", state: "Minnesota", city: "Minneapolis", keywords: ["PT clinic financing minneapolis", "physical therapy loans minnesota"] },
  { name: "Veterinary Clinic", state: "Virginia", city: "Richmond", keywords: ["vet clinic financing richmond", "veterinary practice loans virginia"] },
  
  // Construction & Trades
  { name: "Construction Company", state: "Texas", city: "Dallas", keywords: ["construction financing dallas", "contractor business loans texas"] },
  { name: "Plumbing Company", state: "Florida", city: "Tampa", keywords: ["plumbing business financing tampa", "plumber loans florida"] },
  { name: "Electrical Contractor", state: "New Jersey", city: "Newark", keywords: ["electrical contractor financing nj", "electrician business loans new jersey"] },
  { name: "HVAC Company", state: "Indiana", city: "Indianapolis", keywords: ["hvac financing indianapolis", "hvac business loans indiana"] },
  { name: "Roofing Company", state: "Oklahoma", city: "Oklahoma City", keywords: ["roofing company financing okc", "roofing contractor loans oklahoma"] },
  
  // Professional Services
  { name: "Law Firm", state: "New York", city: "Manhattan", keywords: ["law firm financing new york", "attorney business loans manhattan"] },
  { name: "Accounting Firm", state: "Connecticut", city: "Hartford", keywords: ["accounting firm financing connecticut", "CPA practice loans hartford"] },
  { name: "Marketing Agency", state: "California", city: "San Francisco", keywords: ["marketing agency financing sf", "digital agency loans california"] },
  { name: "IT Services", state: "Washington", city: "Bellevue", keywords: ["IT company financing seattle area", "tech services loans washington"] },
  { name: "Consulting Firm", state: "District of Columbia", city: "Washington DC", keywords: ["consulting firm financing dc", "business consulting loans washington dc"] },
  
  // Beauty & Personal Care
  { name: "Hair Salon", state: "Georgia", city: "Savannah", keywords: ["salon financing savannah", "hair salon business loans georgia"] },
  { name: "Barbershop", state: "Louisiana", city: "New Orleans", keywords: ["barbershop financing new orleans", "barber shop loans louisiana"] },
  { name: "Nail Salon", state: "Hawaii", city: "Honolulu", keywords: ["nail salon financing hawaii", "nail spa business loans honolulu"] },
  { name: "Spa & Wellness", state: "Arizona", city: "Scottsdale", keywords: ["spa financing scottsdale", "wellness center loans arizona"] },
  { name: "Tattoo Parlor", state: "Texas", city: "Austin", keywords: ["tattoo shop financing austin", "tattoo parlor loans texas"] },
  
  // Hospitality & Entertainment
  { name: "Hotel", state: "Florida", city: "Orlando", keywords: ["hotel financing orlando", "hospitality business loans florida"] },
  { name: "Bar & Nightclub", state: "Nevada", city: "Las Vegas", keywords: ["nightclub financing vegas", "bar business loans nevada"] },
  { name: "Event Venue", state: "California", city: "San Diego", keywords: ["event venue financing san diego", "wedding venue loans california"] },
  { name: "Gym & Fitness", state: "Colorado", city: "Boulder", keywords: ["gym financing boulder", "fitness center loans colorado"] },
  { name: "Bowling Alley", state: "Wisconsin", city: "Milwaukee", keywords: ["bowling alley financing milwaukee", "entertainment venue loans wisconsin"] },
  
  // Transportation & Logistics
  { name: "Trucking Company", state: "Missouri", city: "Kansas City", keywords: ["trucking company financing kc", "trucking business loans missouri"] },
  { name: "Moving Company", state: "Utah", city: "Salt Lake City", keywords: ["moving company financing salt lake", "moving business loans utah"] },
  { name: "Taxi & Rideshare", state: "New York", city: "Queens", keywords: ["taxi business financing nyc", "rideshare fleet loans new york"] },
  { name: "Courier Service", state: "Kentucky", city: "Louisville", keywords: ["courier service financing louisville", "delivery business loans kentucky"] },
  { name: "Auto Transport", state: "Alabama", city: "Birmingham", keywords: ["auto transport financing alabama", "car hauling business loans birmingham"] },
  
  // Manufacturing & Industrial
  { name: "Manufacturing", state: "Ohio", city: "Cleveland", keywords: ["manufacturing financing cleveland", "factory business loans ohio"] },
  { name: "Machine Shop", state: "Pennsylvania", city: "Pittsburgh", keywords: ["machine shop financing pittsburgh", "machining business loans pennsylvania"] },
  { name: "Printing Company", state: "Illinois", city: "Naperville", keywords: ["printing company financing chicago area", "print shop loans illinois"] },
  { name: "Welding Shop", state: "Texas", city: "San Antonio", keywords: ["welding shop financing san antonio", "welding business loans texas"] },
  { name: "Packaging Company", state: "New Jersey", city: "Edison", keywords: ["packaging company financing nj", "packaging business loans new jersey"] },
  
  // Agriculture & Farming
  { name: "Farm", state: "Iowa", city: "Des Moines", keywords: ["farm financing iowa", "agricultural business loans des moines"] },
  { name: "Nursery & Garden", state: "Oregon", city: "Salem", keywords: ["nursery financing oregon", "garden center loans salem"] },
  { name: "Landscaping", state: "Florida", city: "Jacksonville", keywords: ["landscaping financing jacksonville", "lawn care business loans florida"] },
  
  // Spanish-Language Industries (for Latino communities)
  { name: "Restaurante Mexicano", state: "Texas", city: "San Antonio", keywords: ["financiamiento restaurante mexicano", "prestamos negocios hispanos texas"], language: "es" },
  { name: "Tienda Latina", state: "California", city: "Los Angeles", keywords: ["financiamiento tienda latina LA", "prestamos negocios latinos california"], language: "es" },
  { name: "Taqueria", state: "Arizona", city: "Phoenix", keywords: ["financiamiento taqueria phoenix", "prestamos para taquerias arizona"], language: "es" },
];

interface BlogGenerationResult {
  success: boolean;
  title: string;
  slug: string;
  industry: string;
  fundingType: string;
  language: string;
  error?: string;
}

/**
 * Generate a single SEO-optimized blog post
 */
async function generateDACBlog(
  industry: typeof INDUSTRIES[0],
  fundingType: typeof FUNDING_TYPES[0]
): Promise<BlogGenerationResult> {
  const isSpanish = industry.language === "es";
  const affiliateLink = isSpanish ? AFFILIATE_LINKS.financingES : AFFILIATE_LINKS.financingEN;
  const referralLink = isSpanish ? AFFILIATE_LINKS.referralES : AFFILIATE_LINKS.referralEN;
  
  const prompt = isSpanish 
    ? buildSpanishPrompt(industry, fundingType, affiliateLink, referralLink)
    : buildEnglishPrompt(industry, fundingType, affiliateLink, referralLink);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${fundingType.name} for ${industry.name} in ${industry.city}, ${industry.state}`;
    
    // Generate slug
    const slug = `${fundingType.slug}-${industry.name.toLowerCase().replace(/\s+/g, "-")}-${industry.city.toLowerCase().replace(/\s+/g, "-")}-${industry.state.toLowerCase().replace(/\s+/g, "-")}`;
    
    // Generate meta description
    const metaDescription = isSpanish
      ? `Obtenga financiamiento de ${fundingType.name} para su ${industry.name} en ${industry.city}, ${industry.state}. Aprobacion en 24 horas, sin afectar su credito. Aplique ahora!`
      : `Get ${fundingType.name} for your ${industry.name} in ${industry.city}, ${industry.state}. 24-hour approval, no credit impact. Apply now!`;
    
    // Save to database
    await db.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt: metaDescription,
      metaTitle: title,
      metaDescription,
      canonicalUrl: `https://davidallencapital.com/nicholaskremers/blog/${slug}`,
      focusKeyphrases: industry.keywords,
      category: "business_financing",
      market: isSpanish ? "hispanic" : "usa",
      type: "ai_generated",
      status: "published",
      published: true,
      linkToCleanbi: false,
      ogTitle: title,
      ogDescription: metaDescription,
      twitterTitle: title,
      twitterDescription: metaDescription,
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": metaDescription,
        "author": {
          "@type": "Person",
          "name": "Nicholas Kremers",
          "url": AFFILIATE_LINKS.mainSite
        },
        "publisher": {
          "@type": "Organization",
          "name": "David Allen Capital",
          "url": "https://davidallencapital.com"
        }
      }),
    });
    
    console.log(`Created blog: ${title}`);
    
    return {
      success: true,
      title,
      slug,
      industry: industry.name,
      fundingType: fundingType.name,
      language: isSpanish ? "Spanish" : "English",
    };
  } catch (error: any) {
    console.error(`Failed to generate blog for ${industry.name}:`, error.message);
    return {
      success: false,
      title: "",
      slug: "",
      industry: industry.name,
      fundingType: fundingType.name,
      language: industry.language === "es" ? "Spanish" : "English",
      error: error.message,
    };
  }
}

function buildEnglishPrompt(
  industry: typeof INDUSTRIES[0],
  fundingType: typeof FUNDING_TYPES[0],
  affiliateLink: string,
  referralLink: string
): string {
  return `Write a 1500-2000 word SEO-optimized blog post about ${fundingType.name} for ${industry.name} businesses in ${industry.city}, ${industry.state}.

**Target Keywords:** ${industry.keywords.join(", ")}

**Requirements:**
1. Use proper heading hierarchy (H1, H2, H3)
2. Include target keywords naturally (1-2% density)
3. Write actionable, practical advice for ${industry.name} owners
4. Include specific data points about ${industry.name} industry
5. Use short paragraphs (2-4 sentences)
6. Write for 8th-9th grade reading level
7. Include compelling introduction and conclusion

**CRITICAL - Include these CTAs with exact affiliate links:**

1. Primary CTA (after introduction):
"**[Apply Now - Check Your Rate Without Affecting Your Credit Score](${affiliateLink})**"

2. Mid-article CTA:
"Ready to see how much funding your ${industry.name} qualifies for? **[Get Pre-Qualified in Minutes](${affiliateLink})** - No credit impact!"

3. End CTA:
"**[Start Your Application Today](${affiliateLink})** - Get approved in 24 hours with funding as fast as 1-2 business days!"

4. Referral mention:
"Know other ${industry.name} owners who need funding? **[Become a Referral Partner](${referralLink})** and earn commissions!"

**Structure:**
1. H1: Compelling title with primary keyword
2. Introduction (why ${industry.name} in ${industry.city} need ${fundingType.name})
3. H2: What is ${fundingType.name}? (explain in simple terms)
4. H2: Benefits for ${industry.name} Businesses
5. H2: How to Qualify (4+ months in business, $100K+ revenue, 500+ credit score)
6. H2: Common Uses in ${industry.name} Industry
7. H2: Why Choose David Allen Capital
8. Conclusion with strong CTA

**Key Selling Points:**
- $2,000 to $2,000,000 funding available
- 24-48 hour approval
- No collateral required
- 500+ credit score accepted
- No impact on credit score to apply
- Funding in 1-5 business days
- Works with 700+ industries
- Over $10 billion funded

Write the complete blog post now:`;
}

function buildSpanishPrompt(
  industry: typeof INDUSTRIES[0],
  fundingType: typeof FUNDING_TYPES[0],
  affiliateLink: string,
  referralLink: string
): string {
  return `Escribe un articulo de blog de 1500-2000 palabras optimizado para SEO sobre ${fundingType.name} para negocios de ${industry.name} en ${industry.city}, ${industry.state}.

**Palabras Clave:** ${industry.keywords.join(", ")}

**Requisitos:**
1. Usa jerarquia de encabezados (H1, H2, H3)
2. Incluye palabras clave naturalmente
3. Escribe consejos practicos para duenos de ${industry.name}
4. Usa parrafos cortos (2-4 oraciones)
5. Escribe para nivel de lectura de secundaria

**CRITICO - Incluye estos CTAs con los enlaces exactos:**

1. CTA Principal:
"**[Aplique Ahora - Verifique Su Tasa Sin Afectar Su Credito](${affiliateLink})**"

2. CTA Medio:
"Listo para ver cuanto financiamiento califica su ${industry.name}? **[Pre-Califique en Minutos](${affiliateLink})** - Sin impacto en su credito!"

3. CTA Final:
"**[Comience Su Aplicacion Hoy](${affiliateLink})** - Aprobacion en 24 horas con fondos en 1-2 dias!"

4. Mencion de Referidos:
"Conoce otros duenos de ${industry.name} que necesitan financiamiento? **[Conviertase en Socio de Referidos](${referralLink})** y gane comisiones!"

**Puntos Clave de Venta:**
- Financiamiento de $2,000 a $2,000,000
- Aprobacion en 24-48 horas
- Sin colateral requerido
- Puntaje de credito 500+ aceptado
- Sin impacto en credito al aplicar
- Fondos en 1-5 dias habiles

Escribe el articulo completo ahora:`;
}

/**
 * Generate all 50+ blogs for David Allen Capital
 */
export async function generateAllDACBlogs(): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: BlogGenerationResult[];
}> {
  const results: BlogGenerationResult[] = [];
  let successful = 0;
  let failed = 0;
  
  console.log("Starting David Allen Capital blog generation...");
  console.log(`Total industries: ${INDUSTRIES.length}`);
  console.log(`Funding types: ${FUNDING_TYPES.length}`);
  
  // Generate one blog per industry with rotating funding types
  for (let i = 0; i < INDUSTRIES.length; i++) {
    const industry = INDUSTRIES[i];
    const fundingType = FUNDING_TYPES[i % FUNDING_TYPES.length];
    
    console.log(`\nGenerating blog ${i + 1}/${INDUSTRIES.length}: ${industry.name} in ${industry.city}, ${industry.state}`);
    
    const result = await generateDACBlog(industry, fundingType);
    results.push(result);
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Rate limiting - wait 2 seconds between requests to avoid API limits
    if (i < INDUSTRIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Blog Generation Complete!`);
  console.log(`Total: ${INDUSTRIES.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`${"=".repeat(50)}`);
  
  return {
    total: INDUSTRIES.length,
    successful,
    failed,
    results,
  };
}

/**
 * Get list of all industries and funding types
 */
export function getDACBlogTopics() {
  return {
    industries: INDUSTRIES,
    fundingTypes: FUNDING_TYPES,
    affiliateLinks: AFFILIATE_LINKS,
    totalCombinations: INDUSTRIES.length * FUNDING_TYPES.length,
  };
}
