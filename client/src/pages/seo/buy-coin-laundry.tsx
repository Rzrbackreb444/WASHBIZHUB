import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function BuyCoinLaundrySEO() {
  const pageConfig = getSEOPageConfig("buy-coin-laundry");

  return (
    <SEOLandingPage
      title="Buy a Coin Laundry | Coin-Op Laundromat For Sale Near You"
      description="Find coin laundry businesses for sale in your area. Browse verified coin-op laundromat listings with revenue data, equipment details, and seller financing options."
      keywords={pageConfig.keywords}
      canonical="/buy-coin-laundry"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Marketplace", url: "/buy-laundromat" },
        { name: "Coin Laundry", url: "/buy-coin-laundry" }
      ]}
      heroHeadline="Coin Laundry For Sale"
      heroSubheadline="Browse verified coin-op laundromats with owner financing, equipment details, and complete financial disclosures."
      heroCTA={{ text: "View Listings", href: "/buy-laundromat" }}
      stats={[
        { value: "250+", label: "Active Listings" },
        { value: "$150K-$2M+", label: "Price Range" },
        { value: "2.5-4x", label: "EBITDA Multiples" },
        { value: "Verified", label: "Seller Data" }
      ]}
      features={[
        {
          title: "Revenue Verified Listings",
          description: "All listings include verified income statements, tax returns, or bank statements reviewed by our team.",
          icon: "CheckCircle"
        },
        {
          title: "Equipment Details",
          description: "Complete equipment lists with brand, model, age, and condition for every listing.",
          icon: "Settings"
        },
        {
          title: "Location Analysis",
          description: "CLEANBI scores for demographics, competition, and growth potential included free.",
          icon: "MapPin"
        },
        {
          title: "Seller Financing Options",
          description: "Many listings offer owner financing with 15-30% down and negotiable terms.",
          icon: "Handshake"
        },
        {
          title: "Broker Connections",
          description: "Connect directly with specialized laundromat brokers who understand the industry.",
          icon: "Users"
        },
        {
          title: "Due Diligence Support",
          description: "Access our 47-point due diligence checklist and expert consultation.",
          icon: "ClipboardList"
        }
      ]}
      faqs={[
        {
          question: "What is the difference between a coin laundry and a laundromat?",
          answer: "The terms are often used interchangeably, but traditionally: Coin laundry specifically refers to self-service operations using coin-operated machines. Laundromat is a broader term that may include card-operated, app-based payment, or attended services like wash-dry-fold. Today, many 'coin laundries' actually accept cards and mobile payments alongside coins, so the distinction is mostly historical."
        },
        {
          question: "How much does a coin laundry cost to buy?",
          answer: "Coin laundry purchase prices typically range from $100,000 to $2,000,000+ depending on: Annual net income (businesses sell for 2.5-4x EBITDA), Equipment age and condition, Lease terms (length and rent amount), Location quality (demographics, visibility), Size and capacity, and Additional services (wash-dry-fold adds value). A coin laundry generating $100K annual net income might sell for $250K-$400K."
        },
        {
          question: "Are coin laundries still profitable in 2024?",
          answer: "Yes, coin laundries remain highly profitable with 20-35% average net margins. Key success factors include: Strong location with 40%+ renter population, Modern equipment with efficient operations, Competitive but profitable pricing, Clean, safe, well-maintained facilities, and Additional services like wash-dry-fold. The shift to cashless payment options has actually increased revenue for many operators."
        },
        {
          question: "Should I buy an existing coin laundry or build new?",
          answer: "Buying existing offers: Immediate cash flow, proven location, lower initial risk, easier financing, and trained staff (if attended). Building new provides: Custom design, new equipment warranties, no inherited problems, but higher costs ($200K-$1M+) and 6-18 month timeline. For first-time buyers, acquiring an existing business is usually recommended."
        },
        {
          question: "What should I look for when buying a coin laundry?",
          answer: "Key evaluation factors: Financial records (2-3 years P&L, tax returns), Lease terms (minimum 5-10 years remaining), Equipment condition (age, maintenance records), Utility costs (water, gas, electric), Location demographics (use CLEANBI Explorer), Competition within 1-mile radius, Reason for sale (retirement is better than declining business), and Real estate opportunity (if available for purchase)."
        },
        {
          question: "How do I finance a coin laundry purchase?",
          answer: "Common financing options: SBA 7(a) loans (10-20% down, 10-25 year terms), SBA 504 loans (for real estate component), Equipment financing (use equipment as collateral), Seller financing (often 15-30% down with seller note), Conventional bank loans (20-30% down), and Investor partnerships. Our SBA Readiness tool can assess your eligibility for government-backed loans."
        },
        {
          question: "What equipment brands are best for coin laundries?",
          answer: "Top commercial laundry equipment brands: Speed Queen (industry standard, excellent durability), Dexter (popular for larger capacity machines), Continental Girbau (efficient, good value), Huebsch (Speed Queen sister brand, competitive pricing), and Maytag Commercial (familiar brand, good support). When buying an existing coin laundry, equipment brand and condition significantly impact value."
        },
        {
          question: "How do I find coin laundries for sale in my area?",
          answer: "Best resources for finding coin laundries for sale: WashBizHub Marketplace (verified listings), Specialized brokers (Laundromat Larry, Coin-Op Brokers), BizBuySell (general business marketplace), LoopNet (commercial real estate), Industry publications (American Coin-Op, PlanetLaundry), Local classified ads, and Networking at industry events. Our marketplace features CLEANBI analysis for every listing."
        }
      ]}
      testimonials={[
        {
          quote: "Found a coin laundry on WashBizHub that wasn't listed anywhere else. The CLEANBI analysis helped me negotiate $50K off the asking price.",
          author: "Marcus W.",
          role: "Coin Laundry Owner",
          location: "Chicago, IL"
        },
        {
          quote: "The verified revenue data gave me confidence to make an offer. Closed in 45 days with seller financing.",
          author: "Patricia H.",
          role: "First-Time Buyer",
          location: "Las Vegas, NV"
        }
      ]}
      crossSellTools={[
        {
          name: "Laundromat Marketplace",
          description: "Browse all verified coin laundry listings with CLEANBI analysis",
          href: "/buy-laundromat",
          primary: true
        },
        {
          name: "Valuation Calculator",
          description: "Determine fair market value for any coin laundry",
          href: "/valuation-calculator"
        },
        {
          name: "Due Diligence Checklist",
          description: "47-point checklist for evaluating coin laundry purchases",
          href: "/laundromat-due-diligence"
        },
        {
          name: "SBA Readiness",
          description: "Check your eligibility for coin laundry financing",
          href: "/sba-readiness"
        }
      ]}
      expertCredentials={{
        title: "Industry-Verified Listings",
        description: "All listings are reviewed by experienced laundromat professionals. Revenue claims are verified through financial documentation before publication."
      }}
    />
  );
}
