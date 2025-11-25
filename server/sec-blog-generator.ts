/**
 * SOUTH END CAPITAL BLOG GENERATOR
 * 
 * Generates 50+ SEO-optimized blog posts for business financing
 * targeting various industries across America with affiliate links.
 * 
 * South End Capital - Division of Stearns Bank N.A. ($3.2B institution)
 * 
 * Affiliate Links:
 * - Main: https://southendcapital.com/?rp=RP020811&sub_id=Laundromat
 * - Partners: https://southendcapital.com/partners/?rp=RP020811&sub_id=Laundromat
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db";
import { blogPosts } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Affiliate Links
const AFFILIATE_LINKS = {
  main: "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat",
  partners: "https://southendcapital.com/partners/?rp=RP020811&sub_id=Laundromat",
};

// Funding Types offered by South End Capital
const FUNDING_TYPES = [
  { 
    name: "SBA 7(a) Loan", 
    slug: "sba-7a-loan", 
    amount: "$500,000 - $15,000,000",
    terms: "5-25 years",
    description: "Government-backed loans for business acquisition, real estate, and working capital" 
  },
  { 
    name: "SBA 504 Loan", 
    slug: "sba-504-loan", 
    amount: "$500,000 - $15,000,000",
    terms: "10-25 years",
    description: "Long-term fixed-rate financing for major assets like real estate and equipment" 
  },
  { 
    name: "Equipment Financing", 
    slug: "equipment-financing", 
    amount: "$5,000 - $5,000,000",
    terms: "Up to 10 years",
    description: "Same-day approval, 0% down, new and used equipment" 
  },
  { 
    name: "Commercial Real Estate Loan", 
    slug: "commercial-real-estate-loan", 
    amount: "$500,000 - $15,000,000",
    terms: "5-25 years",
    description: "Purchase, construction, or refinance commercial properties" 
  },
  { 
    name: "Fast Capital", 
    slug: "fast-capital", 
    amount: "$1,000 - $500,000+",
    terms: "Flexible",
    description: "24-hour funding, no collateral required, no minimum credit score" 
  },
  { 
    name: "Business Line of Credit", 
    slug: "business-line-of-credit", 
    amount: "Up to $500,000",
    terms: "12-24 months revolving",
    description: "Approval in minutes, only pay for what you use" 
  },
  { 
    name: "MCA Consolidation Loan", 
    slug: "mca-consolidation-loan", 
    amount: "$350,000+",
    terms: "Up to 10 years fixed",
    description: "Consolidate merchant cash advances into one manageable payment" 
  },
];

// 50+ Industries across America (different locations than DAC for variety)
const INDUSTRIES = [
  // Restaurants & Food Service
  { name: "Restaurant", state: "New York", city: "New York City", keywords: ["restaurant financing NYC", "restaurant SBA loans new york"] },
  { name: "Pizzeria", state: "New Jersey", city: "Newark", keywords: ["pizza shop financing NJ", "pizzeria business loans new jersey"] },
  { name: "Food Truck", state: "Texas", city: "Austin", keywords: ["food truck financing austin", "mobile food SBA loans texas"] },
  { name: "Brewery", state: "Colorado", city: "Denver", keywords: ["brewery financing denver", "craft brewery loans colorado"] },
  { name: "Ice Cream Shop", state: "Florida", city: "Tampa", keywords: ["ice cream shop financing tampa", "dessert shop loans florida"] },
  
  // Automotive & Transportation
  { name: "Car Dealership", state: "Michigan", city: "Detroit", keywords: ["car dealership financing detroit", "auto dealer SBA loans michigan"] },
  { name: "Auto Repair Shop", state: "California", city: "Los Angeles", keywords: ["auto shop financing LA", "mechanic business loans california"] },
  { name: "Car Wash", state: "Arizona", city: "Phoenix", keywords: ["car wash financing phoenix", "car wash SBA loans arizona"] },
  { name: "Trucking Company", state: "Tennessee", city: "Memphis", keywords: ["trucking financing memphis", "freight company loans tennessee"] },
  { name: "Gas Station", state: "Georgia", city: "Atlanta", keywords: ["gas station financing atlanta", "fuel station SBA loans georgia"] },
  
  // Retail & Commerce
  { name: "Convenience Store", state: "Texas", city: "Houston", keywords: ["convenience store financing houston", "c-store SBA loans texas"] },
  { name: "Liquor Store", state: "Nevada", city: "Las Vegas", keywords: ["liquor store financing vegas", "alcohol retail loans nevada"] },
  { name: "Hardware Store", state: "Ohio", city: "Cleveland", keywords: ["hardware store financing cleveland", "home improvement store loans ohio"] },
  { name: "Furniture Store", state: "North Carolina", city: "Charlotte", keywords: ["furniture store financing charlotte", "furniture retail loans NC"] },
  { name: "Sporting Goods Store", state: "Minnesota", city: "Minneapolis", keywords: ["sporting goods financing minneapolis", "sports retail loans minnesota"] },
  
  // Healthcare & Medical
  { name: "Medical Practice", state: "Massachusetts", city: "Boston", keywords: ["medical practice financing boston", "doctor office SBA loans mass"] },
  { name: "Dental Office", state: "Pennsylvania", city: "Philadelphia", keywords: ["dental office financing philly", "dentist practice loans PA"] },
  { name: "Pharmacy", state: "Illinois", city: "Chicago", keywords: ["pharmacy financing chicago", "independent pharmacy loans illinois"] },
  { name: "Urgent Care", state: "Florida", city: "Miami", keywords: ["urgent care financing miami", "walk-in clinic SBA loans florida"] },
  { name: "Physical Therapy", state: "Washington", city: "Seattle", keywords: ["PT clinic financing seattle", "physical therapy loans washington"] },
  
  // Construction & Trades
  { name: "General Contractor", state: "Texas", city: "Dallas", keywords: ["contractor financing dallas", "construction company SBA loans texas"] },
  { name: "Electrician", state: "Maryland", city: "Baltimore", keywords: ["electrical company financing baltimore", "electrician business loans maryland"] },
  { name: "Plumber", state: "Indiana", city: "Indianapolis", keywords: ["plumbing company financing indianapolis", "plumber SBA loans indiana"] },
  { name: "Landscaping", state: "California", city: "San Diego", keywords: ["landscaping company financing san diego", "lawn care SBA loans california"] },
  { name: "Paving Company", state: "Virginia", city: "Richmond", keywords: ["paving company financing richmond", "asphalt contractor loans virginia"] },
  
  // Hospitality
  { name: "Hotel", state: "Nevada", city: "Las Vegas", keywords: ["hotel financing las vegas", "hospitality SBA loans nevada"] },
  { name: "Motel", state: "Florida", city: "Orlando", keywords: ["motel financing orlando", "motel purchase loans florida"] },
  { name: "Bed & Breakfast", state: "Vermont", city: "Burlington", keywords: ["B&B financing vermont", "bed breakfast SBA loans burlington"] },
  { name: "RV Park", state: "Arizona", city: "Tucson", keywords: ["RV park financing tucson", "campground SBA loans arizona"] },
  { name: "Wedding Venue", state: "South Carolina", city: "Charleston", keywords: ["wedding venue financing charleston", "event venue loans SC"] },
  
  // Laundry & Cleaning
  { name: "Laundromat", state: "California", city: "San Francisco", keywords: ["laundromat financing SF", "laundromat SBA loans california"] },
  { name: "Dry Cleaner", state: "New York", city: "Brooklyn", keywords: ["dry cleaner financing brooklyn", "dry cleaning SBA loans NY"] },
  { name: "Commercial Laundry", state: "Texas", city: "San Antonio", keywords: ["commercial laundry financing san antonio", "industrial laundry loans texas"] },
  { name: "Coin Laundry", state: "Illinois", city: "Springfield", keywords: ["coin laundry financing illinois", "coin-op laundry SBA loans springfield"] },
  { name: "Laundry Service", state: "Florida", city: "Jacksonville", keywords: ["laundry service financing jacksonville", "wash fold business loans florida"] },
  
  // Professional Services
  { name: "Law Firm", state: "District of Columbia", city: "Washington DC", keywords: ["law firm financing DC", "attorney practice SBA loans washington"] },
  { name: "Accounting Firm", state: "Connecticut", city: "Stamford", keywords: ["CPA firm financing stamford", "accounting practice loans connecticut"] },
  { name: "Insurance Agency", state: "Georgia", city: "Savannah", keywords: ["insurance agency financing savannah", "insurance business SBA loans georgia"] },
  { name: "Real Estate Agency", state: "Colorado", city: "Boulder", keywords: ["real estate office financing boulder", "realty company loans colorado"] },
  { name: "Staffing Agency", state: "Missouri", city: "St. Louis", keywords: ["staffing agency financing st louis", "temp agency SBA loans missouri"] },
  
  // Manufacturing & Industrial
  { name: "Manufacturing", state: "Wisconsin", city: "Milwaukee", keywords: ["manufacturing financing milwaukee", "factory SBA loans wisconsin"] },
  { name: "Machine Shop", state: "Michigan", city: "Grand Rapids", keywords: ["machine shop financing grand rapids", "machining business loans michigan"] },
  { name: "Printing Company", state: "New Jersey", city: "Trenton", keywords: ["printing company financing trenton", "print shop SBA loans NJ"] },
  { name: "Metal Fabrication", state: "Alabama", city: "Birmingham", keywords: ["metal fab financing birmingham", "fabrication shop loans alabama"] },
  { name: "Food Manufacturing", state: "California", city: "Fresno", keywords: ["food manufacturer financing fresno", "food production SBA loans california"] },
  
  // Specialty & Niche
  { name: "Daycare Center", state: "Oregon", city: "Portland", keywords: ["daycare financing portland", "childcare center SBA loans oregon"] },
  { name: "Self Storage", state: "Utah", city: "Salt Lake City", keywords: ["self storage financing salt lake", "storage facility SBA loans utah"] },
  { name: "Pet Grooming", state: "Hawaii", city: "Honolulu", keywords: ["pet grooming financing honolulu", "dog grooming SBA loans hawaii"] },
  { name: "Funeral Home", state: "Louisiana", city: "Baton Rouge", keywords: ["funeral home financing baton rouge", "mortuary SBA loans louisiana"] },
  { name: "Bowling Alley", state: "Kentucky", city: "Louisville", keywords: ["bowling alley financing louisville", "entertainment center loans kentucky"] },
  
  // Spanish-Language Industries
  { name: "Restaurante", state: "Florida", city: "Miami", keywords: ["financiamiento restaurante miami", "prestamos SBA restaurantes florida"], language: "es" },
  { name: "Tienda de Abarrotes", state: "Texas", city: "El Paso", keywords: ["financiamiento tienda el paso", "prestamos negocios hispanos texas"], language: "es" },
  { name: "Taller Mecanico", state: "California", city: "Los Angeles", keywords: ["financiamiento taller mecanico LA", "prestamos taller automotriz california"], language: "es" },
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
 * Generate a single SEO-optimized blog post for South End Capital
 */
async function generateSECBlog(
  industry: typeof INDUSTRIES[0],
  fundingType: typeof FUNDING_TYPES[0]
): Promise<BlogGenerationResult> {
  const isSpanish = industry.language === "es";
  
  const prompt = isSpanish 
    ? buildSpanishPrompt(industry, fundingType)
    : buildEnglishPrompt(industry, fundingType);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${fundingType.name} for ${industry.name} in ${industry.city}, ${industry.state}`;
    
    // Generate slug
    const slug = `sec-${fundingType.slug}-${industry.name.toLowerCase().replace(/\s+/g, "-")}-${industry.city.toLowerCase().replace(/\s+/g, "-")}`;
    
    // Generate meta description
    const metaDescription = isSpanish
      ? `Financiamiento ${fundingType.name} para su ${industry.name} en ${industry.city}, ${industry.state}. Prestamos SBA desde $500K hasta $15M. Division de Stearns Bank. Aplique hoy!`
      : `${fundingType.name} for your ${industry.name} in ${industry.city}, ${industry.state}. SBA loans from $500K-$15M. Division of Stearns Bank. Apply today!`;
    
    // Save to database
    await db.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt: metaDescription,
      metaTitle: title,
      metaDescription,
      canonicalUrl: `https://southendcapital.com/blog/${slug}`,
      focusKeyphrases: industry.keywords,
      category: "sba_financing",
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
          "@type": "Organization",
          "name": "South End Capital",
          "url": "https://southendcapital.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Stearns Bank N.A.",
          "url": "https://stearnsbank.com"
        }
      }),
    });
    
    console.log(`Created SEC blog: ${title}`);
    
    return {
      success: true,
      title,
      slug,
      industry: industry.name,
      fundingType: fundingType.name,
      language: isSpanish ? "Spanish" : "English",
    };
  } catch (error: any) {
    console.error(`Failed to generate SEC blog for ${industry.name}:`, error.message);
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
  fundingType: typeof FUNDING_TYPES[0]
): string {
  return `Write a 1500-2000 word SEO-optimized blog post about ${fundingType.name} for ${industry.name} businesses in ${industry.city}, ${industry.state}.

**Target Keywords:** ${industry.keywords.join(", ")}

**About South End Capital:**
- Division of Stearns Bank N.A. ($3.2 billion institution)
- Direct lender AND tech-powered loan marketplace
- Available in all 50 states + Washington DC
- Works with borrowers rejected by other lenders
- Same-day approvals available

**${fundingType.name} Details:**
- Amount: ${fundingType.amount}
- Terms: ${fundingType.terms}
- ${fundingType.description}

**Requirements:**
1. Use proper heading hierarchy (H1, H2, H3)
2. Include target keywords naturally (1-2% density)
3. Write actionable advice for ${industry.name} owners
4. Include specific data points about ${industry.name} industry
5. Short paragraphs (2-4 sentences)
6. 8th-9th grade reading level

**CRITICAL - Include these CTAs with exact affiliate links:**

1. Primary CTA (after introduction):
"**[Apply Now - Get Pre-Qualified Today](${AFFILIATE_LINKS.main})**"

2. Mid-article CTA:
"Ready to see what your ${industry.name} qualifies for? **[Check Your Options in Minutes](${AFFILIATE_LINKS.main})** - Fast approval from a trusted bank."

3. End CTA:
"**[Start Your SBA Loan Application](${AFFILIATE_LINKS.main})** - Division of $3.2B Stearns Bank. Get approved and funded fast!"

4. Partner mention:
"Are you a CPA, broker, or finance professional? **[Join the Partner Program](${AFFILIATE_LINKS.partners})** and help your clients access better financing."

**Structure:**
1. H1: Compelling title with primary keyword
2. Introduction (why ${industry.name} in ${industry.city} need ${fundingType.name})
3. H2: What is ${fundingType.name}? (explain in simple terms)
4. H2: Benefits for ${industry.name} Businesses
   - Loan amounts: ${fundingType.amount}
   - Terms: ${fundingType.terms}
5. H2: Qualification Requirements
6. H2: Common Uses in ${industry.name} Industry
7. H2: Why Choose South End Capital
   - Division of Stearns Bank N.A.
   - Works with borrowers rejected elsewhere
   - Same-day approvals available
   - Tech-powered platform + live support
8. Conclusion with strong CTA

**Key Selling Points:**
- Backed by $3.2 billion Stearns Bank N.A.
- SBA loans from $500K to $15M
- Equipment financing $5K to $5M with 0% down
- Same-day approvals available
- Works with borrowers other lenders reject
- Flexible underwriting
- No prepayment penalties on many programs
- Available in all 50 states

Write the complete blog post now:`;
}

function buildSpanishPrompt(
  industry: typeof INDUSTRIES[0],
  fundingType: typeof FUNDING_TYPES[0]
): string {
  return `Escribe un articulo de blog de 1500-2000 palabras optimizado para SEO sobre ${fundingType.name} para negocios de ${industry.name} en ${industry.city}, ${industry.state}.

**Palabras Clave:** ${industry.keywords.join(", ")}

**Sobre South End Capital:**
- Division de Stearns Bank N.A. (institucion de $3.2 mil millones)
- Prestamista directo Y mercado de prestamos con tecnologia
- Disponible en los 50 estados + Washington DC
- Trabaja con prestatarios rechazados por otros prestamistas

**Detalles de ${fundingType.name}:**
- Cantidad: ${fundingType.amount}
- Plazos: ${fundingType.terms}
- ${fundingType.description}

**Requisitos:**
1. Usa jerarquia de encabezados (H1, H2, H3)
2. Incluye palabras clave naturalmente
3. Escribe consejos practicos para duenos de ${industry.name}
4. Parrafos cortos (2-4 oraciones)

**CRITICO - Incluye estos CTAs con los enlaces exactos:**

1. CTA Principal:
"**[Aplique Ahora - Pre-Califique Hoy](${AFFILIATE_LINKS.main})**"

2. CTA Medio:
"Listo para ver cuanto financiamiento califica su ${industry.name}? **[Verifique Sus Opciones en Minutos](${AFFILIATE_LINKS.main})**"

3. CTA Final:
"**[Comience Su Aplicacion de Prestamo SBA](${AFFILIATE_LINKS.main})** - Respaldado por Stearns Bank de $3.2 mil millones!"

4. Programa de Socios:
"Es usted CPA, corredor o profesional financiero? **[Unase al Programa de Socios](${AFFILIATE_LINKS.partners})**"

**Puntos Clave:**
- Respaldado por Stearns Bank N.A. de $3.2 mil millones
- Prestamos SBA de $500K a $15M
- Financiamiento de equipos $5K a $5M con 0% de enganche
- Aprobaciones el mismo dia disponibles
- Trabaja con prestatarios rechazados en otros lugares

Escribe el articulo completo ahora:`;
}

/**
 * Generate all 50+ blogs for South End Capital
 */
export async function generateAllSECBlogs(): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: BlogGenerationResult[];
}> {
  const results: BlogGenerationResult[] = [];
  let successful = 0;
  let failed = 0;
  
  console.log("Starting South End Capital blog generation...");
  console.log(`Total industries: ${INDUSTRIES.length}`);
  console.log(`Funding types: ${FUNDING_TYPES.length}`);
  
  // Generate one blog per industry with rotating funding types
  for (let i = 0; i < INDUSTRIES.length; i++) {
    const industry = INDUSTRIES[i];
    const fundingType = FUNDING_TYPES[i % FUNDING_TYPES.length];
    
    console.log(`\nGenerating SEC blog ${i + 1}/${INDUSTRIES.length}: ${industry.name} in ${industry.city}, ${industry.state}`);
    
    const result = await generateSECBlog(industry, fundingType);
    results.push(result);
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Rate limiting - wait 2 seconds between requests
    if (i < INDUSTRIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`South End Capital Blog Generation Complete!`);
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
export function getSECBlogTopics() {
  return {
    industries: INDUSTRIES,
    fundingTypes: FUNDING_TYPES,
    affiliateLinks: AFFILIATE_LINKS,
    totalCombinations: INDUSTRIES.length * FUNDING_TYPES.length,
  };
}
