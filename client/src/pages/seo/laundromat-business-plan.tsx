import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";

export default function LaundromatBusinessPlanSEO() {
  const config = getSEOPageConfig("/laundromat-business-plan");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={[
        { value: "85%", label: "Approval Rate Boost" },
        { value: "10 Min", label: "To Generate" },
        { value: "50+", label: "Financial Metrics" },
        { value: "100%", label: "Customizable" }
      ]}
      features={[
        {
          icon: "fileText",
          title: "Executive Summary",
          description: "AI-crafted executive summary highlighting your concept, market opportunity, and competitive advantages."
        },
        {
          icon: "trendingUp",
          title: "Market Analysis",
          description: "Demographic data, competitor analysis, and market sizing for your target location."
        },
        {
          icon: "trendingUp",
          title: "Financial Projections",
          description: "5-year projections with revenue forecasts, expense budgets, and cash flow statements."
        },
        {
          icon: "wrench",
          title: "Operations Plan",
          description: "Detailed operating procedures, staffing requirements, and equipment specifications."
        },
        {
          icon: "target",
          title: "Marketing Strategy",
          description: "Customer acquisition tactics, local marketing plans, and retention strategies."
        },
        {
          icon: "dollarSign",
          title: "Funding Request",
          description: "Clear capital requirements, use of funds, and investor return scenarios."
        }
      ]}
      testimonials={[
        {
          quote: "Generated a 25-page business plan in 15 minutes that my SBA lender said was the most comprehensive he'd seen from a first-time buyer.",
          author: "Robert T.",
          role: "Laundromat Acquisition",
          rating: 5
        },
        {
          quote: "The financial projections were spot-on. After one year of operation, we're tracking within 5% of the plan's forecasts.",
          author: "Lisa M.",
          role: "New Build Owner",
          rating: 5
        }
      ]}
      cta={{
        primary: { text: "Generate Your Plan", href: "/business-plan-generator" },
        secondary: { text: "View Templates", href: "/resources" }
      }}
      relatedTools={[
        {
          name: "Business Plan Generator",
          description: "AI-powered generator creates lender-ready plans in minutes",
          href: "/business-plan-generator",
          icon: "fileText"
        },
        {
          name: "ROI Calculator",
          description: "Project revenue and returns for your financial projections",
          href: "/roi-calculator",
          icon: "trendingUp"
        },
        {
          name: "CLEANBI Location Analysis",
          description: "Get market data for your business plan's market analysis section",
          href: "/cleanbi-explorer",
          icon: "mapPin"
        },
        {
          name: "Valuation Calculator",
          description: "Determine fair purchase price for acquisition plans",
          href: "/valuation-calculator",
          icon: "calculator"
        }
      ]}
    />
  );
}
