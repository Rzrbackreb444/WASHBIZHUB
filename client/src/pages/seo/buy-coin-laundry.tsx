import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function BuyCoinLaundrySEO() {
  const config = getSEOPageConfig("/buy-coin-laundry");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={[
        { value: "250+", label: "Active Listings" },
        { value: "$150K-$2M+", label: "Price Range" },
        { value: "2.5-4x", label: "EBITDA Multiples" },
        { value: "Verified", label: "Seller Data" }
      ]}
      features={[
        {
          icon: "checkCircle",
          title: "Revenue Verified Listings",
          description: "All listings include verified income statements, tax returns, or bank statements reviewed by our team."
        },
        {
          icon: "wrench",
          title: "Equipment Details",
          description: "Complete equipment lists with brand, model, age, and condition for every listing."
        },
        {
          icon: "mapPin",
          title: "Location Analysis",
          description: "CLEANBI scores for demographics, competition, and growth potential included free."
        },
        {
          icon: "users",
          title: "Seller Financing Options",
          description: "Many listings offer owner financing with 15-30% down and negotiable terms."
        },
        {
          icon: "users",
          title: "Broker Connections",
          description: "Connect directly with specialized laundromat brokers who understand the industry."
        },
        {
          icon: "fileText",
          title: "Due Diligence Support",
          description: "Access our 47-point due diligence checklist and expert consultation."
        }
      ]}
      testimonials={[
        {
          quote: "Found a coin laundry on WashBizHub that wasn't listed anywhere else. The CLEANBI analysis helped me negotiate $50K off the asking price.",
          author: "Marcus W.",
          role: "Coin Laundry Owner",
          rating: 5
        },
        {
          quote: "The verified revenue data gave me confidence to make an offer. Closed in 45 days with seller financing.",
          author: "Patricia H.",
          role: "First-Time Buyer",
          rating: 5
        }
      ]}
      cta={{
        primary: { text: "View Listings", href: "/buy-laundromat" },
        secondary: { text: "Get Buyer Alerts", href: "/signup" }
      }}
      relatedTools={[
        {
          name: "Laundromat Marketplace",
          description: "Browse all verified coin laundry listings with CLEANBI analysis",
          href: "/buy-laundromat",
          icon: "building"
        },
        {
          name: "Valuation Calculator",
          description: "Determine fair market value for any coin laundry",
          href: "/valuation-calculator",
          icon: "calculator"
        },
        {
          name: "Due Diligence Checklist",
          description: "47-point checklist for evaluating coin laundry purchases",
          href: "/laundromat-due-diligence",
          icon: "fileText"
        },
        {
          name: "SBA Readiness",
          description: "Check your eligibility for coin laundry financing",
          href: "/sba-readiness",
          icon: "checkCircle"
        }
      ]}
    />
  );
}
