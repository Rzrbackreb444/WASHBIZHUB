import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function LaundromatFinancingSEO() {
  const config = getSEOPageConfig("/laundromat-financing");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={[
        { value: "$5M", label: "Max SBA Loan" },
        { value: "6-8%", label: "Current SBA Rates" },
        { value: "25 Years", label: "Max Loan Term" },
        { value: "10-20%", label: "Typical Down Payment" }
      ]}
      features={[
        {
          icon: "building",
          title: "SBA 7(a) Loans",
          description: "Up to $5 million with 10-25 year terms. Best for acquisitions, new builds, and working capital."
        },
        {
          icon: "building",
          title: "SBA 504 Loans",
          description: "Low fixed rates for real estate and major equipment purchases. Requires 10% down."
        },
        {
          icon: "wrench",
          title: "Equipment Financing",
          description: "Finance 80-100% of equipment cost. Equipment serves as collateral. Quick approval process."
        },
        {
          icon: "users",
          title: "Seller Financing",
          description: "Negotiate terms directly with sellers. Often requires less down payment than bank loans."
        },
        {
          icon: "users",
          title: "Investor Partnerships",
          description: "Partner with investors for capital. Structure deals with preferred returns and equity splits."
        },
        {
          icon: "dollarSign",
          title: "Business Lines of Credit",
          description: "Flexible working capital for operations, repairs, and expansion. Draw funds as needed."
        }
      ]}
      testimonials={[
        {
          quote: "The SBA Readiness tool identified gaps in my application. After addressing them, I got approved for a $750K loan at 6.5% interest.",
          author: "David K.",
          role: "Laundromat Investor",
          rating: 5
        },
        {
          quote: "As a first-time buyer, the funding marketplace connected me with lenders who specialize in laundromats. Made all the difference.",
          author: "Maria G.",
          role: "New Owner",
          rating: 5
        }
      ]}
      cta={{
        primary: { text: "Check SBA Eligibility", href: "/sba-readiness" },
        secondary: { text: "View Funding Options", href: "/funding" }
      }}
      relatedTools={[
        {
          name: "SBA Readiness Checker",
          description: "Assess your eligibility for SBA financing in minutes",
          href: "/sba-readiness",
          icon: "checkCircle"
        },
        {
          name: "Loan Calculator",
          description: "Calculate monthly payments and total loan costs",
          href: "/loan-calculator",
          icon: "calculator"
        },
        {
          name: "Business Plan Generator",
          description: "Create a lender-ready business plan with AI",
          href: "/business-plan-generator",
          icon: "fileText"
        },
        {
          name: "Funding Marketplace",
          description: "Compare financing options from multiple lenders",
          href: "/funding",
          icon: "dollarSign"
        }
      ]}
    />
  );
}
