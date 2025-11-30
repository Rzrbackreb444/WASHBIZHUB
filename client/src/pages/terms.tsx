import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>Last Updated: November 24, 2024</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using WashBizHub.com and the CLEANBI scoring system ("Services"), 
                you agree to be bound by these Terms of Service. If you do not agree to these terms, 
                do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
              <p>
                WashBizHub provides business intelligence tools, including the CLEANBI scoring system, 
                which analyzes publicly available data from Google Places API to generate informational 
                scores for businesses across multiple industries.
              </p>
              <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                CLEANBI scores are NOT professional business valuations, appraisals, or financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Educational Use Only</h2>
              <p>Our Services are provided for informational and educational purposes only. They are NOT intended for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Legal proceedings or litigation support</li>
                <li>Tax filings or IRS compliance (e.g., 409A valuations, estate tax)</li>
                <li>Mergers and acquisitions (M&A) transactions</li>
                <li>Financial reporting or regulatory compliance</li>
                <li>Loan collateral assessment or bank financing</li>
                <li>Professional appraisal services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. No Professional Relationship</h2>
              <p>
                WashBizHub does not act as your advisor, agent, or fiduciary. We have no duty to verify 
                information you provide or recommend specific actions. You are solely responsible for 
                your business decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Accuracy Disclaimer</h2>
              <p>
                CLEANBI scores depend on the completeness and accuracy of data from Google Places API 
                and user inputs. We make no warranties about:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accuracy, completeness, or timeliness of scores</li>
                <li>Reliability of third-party data sources</li>
                <li>Actual business value or future performance</li>
              </ul>
              <p>Actual market value may differ significantly from calculated estimates.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WASHBIZHUB AND ITS AFFILIATES SHALL NOT BE 
                LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING 
                FROM YOUR USE OF OUR SERVICES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Financial losses from business decisions</li>
                <li>Errors or inaccuracies in scoring data</li>
                <li>Service interruptions or data loss</li>
                <li>Reliance on CLEANBI scores for any purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information when using our Services</li>
                <li>Consult qualified professionals (certified appraisers, attorneys, accountants) before making business decisions</li>
                <li>Not misrepresent CLEANBI scores as professional valuations or appraisals</li>
                <li>Use Services in compliance with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Professional Advice Required</h2>
              <p>
                For official business valuations, you must engage a certified business appraiser with 
                credentials such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>ASA (Accredited Senior Appraiser)</li>
                <li>CPA/ABV (Certified Public Accountant/Accredited in Business Valuation)</li>
                <li>CVA (Certified Valuation Analyst)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Intellectual Property & Trade Secrets</h2>
              <p className="mb-4">
                All content, trademarks, and technology on WashBizHub.com are owned by WashBizHub, LLC or 
                its licensors. "WashBizHub" and "CLEANBI" are trademarks of WashBizHub, LLC.
              </p>
              
              <h3 className="text-xl font-semibold mb-2">9.1 Proprietary Technology</h3>
              <p className="mb-4">
                The CLEANBI™ scoring system, including but not limited to its 17-factor weighted algorithm, 
                valuation methodologies, data processing techniques, scoring formulas, weighting systems, 
                and proprietary calculations, constitutes <strong>trade secret information</strong> owned 
                exclusively by WashBizHub, LLC. This proprietary technology is protected under the Defend 
                Trade Secrets Act (18 U.S.C. § 1836), the Arkansas Trade Secrets Act, and other applicable 
                federal and state trade secret laws.
              </p>
              
              <h3 className="text-xl font-semibold mb-2">9.2 Prohibited Activities</h3>
              <p className="mb-2">You expressly agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code, algorithms, or proprietary formulas of our scoring system</li>
                <li>Use automated tools, bots, scrapers, or data mining techniques to extract data, scores, or methodologies</li>
                <li>Copy, reproduce, or create derivative works based on our proprietary scoring systems</li>
                <li>Share, sell, license, or distribute any proprietary information obtained from our Services</li>
                <li>Attempt to circumvent security measures, rate limiting, or access controls</li>
                <li>Use our Services to develop a competing product or service</li>
                <li>Access our APIs or backend systems without explicit authorization</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-2">9.3 Legal Remedies</h3>
              <p className="mb-4">
                Any unauthorized access, reverse engineering, or misappropriation of our trade secrets 
                may result in immediate termination of your account and legal action. We reserve the right 
                to seek injunctive relief, monetary damages (including treble damages for willful violations), 
                and attorney's fees to the fullest extent permitted by law.
              </p>
              
              <h3 className="text-xl font-semibold mb-2">9.4 Copyright</h3>
              <p>
                All website content, documentation, user interfaces, code, and materials are protected by 
                copyright. © 2025 WashBizHub, LLC. All rights reserved.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Continued use of our Services 
                after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the United States. Any disputes shall be resolved 
                in the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
              <p>
                For questions about these Terms, contact us at support@washbizhub.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
