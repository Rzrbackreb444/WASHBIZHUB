import { Shield, AlertTriangle, Calculator, DollarSign, Wrench, Scale, BookOpen, Info } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";

export default function LegalDisclaimerPage() {
  const lastUpdated = "December 7, 2025";

  return (
    <>
      <Helmet>
        <title>Legal Disclaimer | WashBizHub</title>
        <meta name="description" content="Important legal disclaimers for WashBizHub tools, calculators, CLEANBI analysis, and business intelligence services. For informational purposes only." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2e4a]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#C8A661]/20 p-4 rounded-full">
              <Shield className="w-10 h-10 text-[#C8A661]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="heading-legal-disclaimer">
                Legal Disclaimer
              </h1>
              <p className="text-white/60 mt-1">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="bg-[#0f1d30]/80 border-white/10 mb-8" data-testid="section-general-disclaimer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-[#C8A661]" />
                General Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-4">
              <p>
                <strong className="text-white">WashBizHub</strong> provides tools, calculators, market analysis, 
                and educational content for informational and educational purposes only. The information, data, 
                analysis, and estimates provided on this platform do not constitute financial, legal, tax, 
                investment, or professional advice.
              </p>
              <p>
                All users are strongly encouraged to consult with qualified professionals—including licensed 
                accountants, attorneys, business brokers, appraisers, and financial advisors—before making 
                any business or investment decisions.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="bg-[#0f1d30]/80 border-white/10" data-testid="section-cleanbi-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#C8A661]" />
                  CLEANBI™ Location Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  CLEANBI scores, grades, and location analysis are generated using publicly available data, 
                  proprietary algorithms, and industry benchmarks. These scores are estimates designed to 
                  help users evaluate potential laundromat locations.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li>Scores do not guarantee business success or profitability</li>
                  <li>Market conditions, competition, and economic factors change over time</li>
                  <li>Data sources include third-party providers and may contain inaccuracies</li>
                  <li>Always conduct on-site due diligence before any investment</li>
                  <li>CLEANBI analysis does not replace professional business appraisals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d30]/80 border-white/10" data-testid="section-calculator-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#C8A661]" />
                  Calculators & Financial Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  All calculators (Valuation, ROI, Loan, Utility, Labor, etc.) provide estimates based on 
                  user inputs and industry averages. Results are for planning purposes only.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li>Calculations are estimates and may differ significantly from actual results</li>
                  <li>Industry benchmarks are averages and may not apply to your specific situation</li>
                  <li>Loan calculations use standard amortization formulas; actual terms may vary</li>
                  <li>Valuation multiples are based on industry norms, not professional appraisals</li>
                  <li>Always verify calculations with qualified financial professionals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d30]/80 border-white/10" data-testid="section-investment-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C8A661]" />
                  Investment & Business Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  WashBizHub is not a registered investment advisor, broker-dealer, or financial planner. 
                  No content on this platform should be construed as investment advice or a recommendation 
                  to buy, sell, or hold any business interest.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li>Investment projections involve substantial risk and are not guarantees</li>
                  <li>Past performance and industry averages do not predict future results</li>
                  <li>Always conduct thorough due diligence before any business investment</li>
                  <li>Consult licensed financial advisors, attorneys, and accountants</li>
                  <li>We do not provide personalized investment recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d30]/80 border-white/10" data-testid="section-service-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#C8A661]" />
                  Service Guy AI & Repair Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  Service Guy AI and all repair diagnostic content is provided for educational purposes only. 
                  Working on commercial laundry equipment involves significant safety hazards.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li className="text-amber-400 font-semibold">Always consult a licensed, certified professional technician before attempting repairs</li>
                  <li>Commercial equipment involves electrical, gas, and mechanical hazards</li>
                  <li>Improper repairs can result in injury, death, property damage, or voided warranties</li>
                  <li>Part numbers and specifications may vary by model and region</li>
                  <li>WashBizHub assumes no liability for actions taken based on this information</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d30]/80 border-white/10" data-testid="section-data-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#C8A661]" />
                  Data Sources & Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  WashBizHub aggregates data from various third-party sources, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li>U.S. Census Bureau (demographic data)</li>
                  <li>Google Maps Platform (location and business data)</li>
                  <li>Walk Score and Transit Score APIs</li>
                  <li>Real estate and economic databases</li>
                  <li>Industry publications and associations</li>
                </ul>
                <p className="mt-4">
                  While we strive for accuracy, we cannot guarantee the completeness, timeliness, or accuracy 
                  of third-party data. Data may be outdated, incomplete, or contain errors beyond our control.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30" data-testid="section-liability-disclaimer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-3">
                <p>
                  To the maximum extent permitted by applicable law, WashBizHub, its owners, operators, 
                  affiliates, and partners shall not be liable for any direct, indirect, incidental, 
                  consequential, or punitive damages arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-white/70">
                  <li>Your use of or reliance on any information, tools, or services provided</li>
                  <li>Any business or investment decisions made based on our content</li>
                  <li>Errors, inaccuracies, or omissions in data or calculations</li>
                  <li>Any actions taken based on Service Guy AI or repair information</li>
                  <li>Loss of business, revenue, profits, or anticipated savings</li>
                </ul>
                <p className="mt-4 font-semibold text-white">
                  Use of WashBizHub tools and services is at your own risk.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 p-6 bg-[#0f1d30]/60 border border-white/10 rounded-xl text-center">
            <p className="text-white/70 mb-4">
              By using WashBizHub, you acknowledge that you have read, understood, and agree to this disclaimer.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/terms">
                <Button variant="outline" className="border-[#C8A661]/30 text-[#C8A661] hover:bg-[#C8A661]/10" data-testid="link-to-terms">
                  View Terms of Service
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/5" data-testid="link-to-privacy">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-white/40 text-sm">
            <p>© 2025 WashBizHub. All rights reserved.</p>
            <p className="mt-1">WashBizHub™ and CLEANBI™ are trademarks.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
