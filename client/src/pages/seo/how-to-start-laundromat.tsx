import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function HowToStartLaundromatSEO() {
  const config = getSEOPageConfig("/how-to-start-laundromat");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={[
        { value: "$7.1B", label: "US Industry Size" },
        { value: "35,000+", label: "US Laundromats" },
        { value: "20-35%", label: "Average Annual ROI" },
        { value: "$200K-$1M", label: "Typical Startup Cost" }
      ]}
      features={[
        {
          icon: "mapPin",
          title: "Location Analysis",
          description: "Use CLEANBI Explorer to analyze demographics, competition, traffic patterns, and accessibility before investing."
        },
        {
          icon: "dollarSign",
          title: "Financial Planning",
          description: "Calculate startup costs, project revenue, and plan for profitability with our suite of financial calculators."
        },
        {
          icon: "wrench",
          title: "Equipment Selection",
          description: "Choose the right mix of washers and dryers for your market with our equipment optimization tools."
        },
        {
          icon: "building",
          title: "Funding Options",
          description: "Explore SBA loans, equipment financing, and investor partnerships through our funding marketplace."
        },
        {
          icon: "fileText",
          title: "Business Planning",
          description: "Generate a professional business plan with AI-powered insights tailored to your laundromat concept."
        },
        {
          icon: "users",
          title: "Operations Setup",
          description: "Learn best practices for staffing, maintenance schedules, and customer service from industry experts."
        }
      ]}
      testimonials={[
        {
          quote: "WashBizHub's location analysis tool helped me find a site that's now generating $45K monthly. The demographic data was spot-on.",
          author: "Carlos M.",
          role: "Laundromat Owner since 2023",
          rating: 5
        },
        {
          quote: "Started with zero laundromat experience. The step-by-step resources and calculators gave me confidence to make my first investment.",
          author: "Jennifer L.",
          role: "First-Time Owner",
          rating: 5
        }
      ]}
      cta={{
        primary: { text: "Analyze Your Location", href: "/cleanbi-explorer" },
        secondary: { text: "View Startup Guide", href: "/resources" }
      }}
      relatedTools={[
        {
          name: "CLEANBI Location Explorer",
          description: "Analyze any address with our 6-factor location intelligence system",
          href: "/cleanbi-explorer",
          icon: "mapPin"
        },
        {
          name: "ROI Calculator",
          description: "Project your laundromat investment returns and payback period",
          href: "/roi-calculator",
          icon: "trendingUp"
        },
        {
          name: "SBA Loan Readiness",
          description: "Check your eligibility for SBA financing",
          href: "/sba-readiness",
          icon: "dollarSign"
        },
        {
          name: "Business Plan Generator",
          description: "Create an investor-ready business plan in minutes",
          href: "/business-plan-generator",
          icon: "fileText"
        }
      ]}
    />
  );
}
