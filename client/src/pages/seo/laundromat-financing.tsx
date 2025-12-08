import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function LaundromatFinancingSEO() {
  const pageConfig = getSEOPageConfig("laundromat-financing");

  return (
    <SEOLandingPage
      title="Laundromat Financing & SBA Loans | Complete Guide 2024"
      description="Explore laundromat financing options including SBA 7(a) loans, equipment financing, and investor partnerships. Get pre-qualified and compare rates from top lenders."
      keywords={pageConfig.keywords}
      canonical="/laundromat-financing"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Funding", url: "/funding" },
        { name: "Laundromat Financing", url: "/laundromat-financing" }
      ]}
      heroHeadline="Laundromat Financing Made Simple"
      heroSubheadline="Compare SBA loans, equipment financing, and investor partnerships. Get pre-qualified in minutes with our funding marketplace."
      heroCTA={{ text: "Check SBA Eligibility", href: "/sba-readiness" }}
      stats={[
        { value: "$5M", label: "Max SBA Loan" },
        { value: "6-8%", label: "Current SBA Rates" },
        { value: "25 Years", label: "Max Loan Term" },
        { value: "10-20%", label: "Typical Down Payment" }
      ]}
      features={[
        {
          title: "SBA 7(a) Loans",
          description: "Up to $5 million with 10-25 year terms. Best for acquisitions, new builds, and working capital.",
          icon: "Landmark"
        },
        {
          title: "SBA 504 Loans",
          description: "Low fixed rates for real estate and major equipment purchases. Requires 10% down.",
          icon: "Building2"
        },
        {
          title: "Equipment Financing",
          description: "Finance 80-100% of equipment cost. Equipment serves as collateral. Quick approval process.",
          icon: "Settings"
        },
        {
          title: "Seller Financing",
          description: "Negotiate terms directly with sellers. Often requires less down payment than bank loans.",
          icon: "Handshake"
        },
        {
          title: "Investor Partnerships",
          description: "Partner with investors for capital. Structure deals with preferred returns and equity splits.",
          icon: "Users"
        },
        {
          title: "Business Lines of Credit",
          description: "Flexible working capital for operations, repairs, and expansion. Draw funds as needed.",
          icon: "CreditCard"
        }
      ]}
      faqs={[
        {
          question: "What is the best financing option for buying a laundromat?",
          answer: "SBA 7(a) loans are typically the best option for laundromat acquisitions, offering up to $5 million with competitive rates (currently 6-8%) and terms up to 25 years. They require 10-20% down payment and are guaranteed by the Small Business Administration. For equipment-heavy purchases, SBA 504 loans offer even lower fixed rates for the real estate and equipment portions."
        },
        {
          question: "What credit score is needed for laundromat financing?",
          answer: "Most SBA lenders require a minimum credit score of 650-680, though some may approve scores as low as 620 with strong compensating factors. Conventional bank loans typically require 700+. Equipment financing companies may approve scores of 600-650 with larger down payments. The higher your credit score, the better your interest rate and terms."
        },
        {
          question: "How much down payment is required for a laundromat loan?",
          answer: "SBA loans typically require 10-20% down payment. Conventional bank loans may require 20-30%. Equipment financing often requires 10-20% down. Seller financing terms are negotiable but commonly require 15-30% down. Some deals can be structured with less down payment if you have strong cash flow or additional collateral."
        },
        {
          question: "What documents do I need for a laundromat loan application?",
          answer: "Typical requirements include: 3 years of personal and business tax returns, personal financial statement, current profit & loss and balance sheet (for existing businesses), business plan with projections, lease agreement or LOI, equipment quotes, resumes showing relevant experience, and bank statements (last 3-6 months). Our Business Plan Generator can help you prepare these documents."
        },
        {
          question: "How long does the laundromat loan approval process take?",
          answer: "Timeline varies by loan type: Equipment financing: 1-7 days. Conventional bank loans: 2-4 weeks. SBA 7(a) loans: 30-60 days. SBA 504 loans: 45-90 days. Having all documentation ready and working with experienced laundromat lenders can significantly accelerate the process."
        },
        {
          question: "Can I finance a laundromat with no experience?",
          answer: "Yes, but it requires additional preparation. Lenders want to see: a solid business plan, industry research, management experience (even if not laundromat-specific), strong personal financials, adequate capital, and sometimes a commitment to training or consulting. Our platform provides the education and tools to strengthen your application."
        },
        {
          question: "What interest rates can I expect for laundromat financing?",
          answer: "Current rates (2024): SBA 7(a) loans: Prime + 2-3% (approximately 6-8%). SBA 504 loans: Fixed rates around 5-6.5%. Equipment financing: 7-15% depending on credit. Conventional bank loans: 7-10%. Seller financing: 6-10% (negotiable). Rates vary based on creditworthiness, loan amount, and market conditions."
        },
        {
          question: "Is it better to lease or finance laundromat equipment?",
          answer: "Financing (purchasing) is usually better for long-term ownership because: you build equity in the equipment, you can deduct depreciation, and you own the equipment outright after the loan term. Leasing makes sense for: conserving capital, maintaining flexibility to upgrade, or if you're uncertain about long-term ownership. Consider a lease-to-own option for a middle ground."
        }
      ]}
      testimonials={[
        {
          quote: "The SBA Readiness tool identified gaps in my application. After addressing them, I got approved for a $750K loan at 6.5% interest.",
          author: "David K.",
          role: "Laundromat Investor",
          location: "Austin, TX"
        },
        {
          quote: "As a first-time buyer, the funding marketplace connected me with lenders who specialize in laundromats. Made all the difference.",
          author: "Maria G.",
          role: "New Owner",
          location: "Denver, CO"
        }
      ]}
      crossSellTools={[
        {
          name: "SBA Readiness Checker",
          description: "Assess your eligibility for SBA financing in minutes",
          href: "/sba-readiness",
          primary: true
        },
        {
          name: "Loan Calculator",
          description: "Calculate monthly payments and total loan costs",
          href: "/loan-calculator"
        },
        {
          name: "Business Plan Generator",
          description: "Create a lender-ready business plan with AI",
          href: "/business-plan-generator"
        },
        {
          name: "Funding Marketplace",
          description: "Compare financing options from multiple lenders",
          href: "/funding"
        }
      ]}
      expertCredentials={{
        title: "Vetted by Financial Experts",
        description: "Our financing guides are reviewed by SBA-certified lenders and commercial finance specialists with $500M+ in laundromat deal experience."
      }}
    />
  );
}
