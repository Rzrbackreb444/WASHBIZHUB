import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last Updated: November 24, 2024</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">1.1 CLEANBI Calculator</h3>
              <p>When you use the CLEANBI scoring system, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Business Addresses:</strong> Street addresses you submit for analysis</li>
                <li><strong>Business Names:</strong> Optional business names you provide</li>
                <li><strong>API Data:</strong> Publicly available data retrieved from Google Places API</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">1.2 Chrome Extension</h3>
              <p>The CLEANBI Anywhere Chrome extension:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Extracts business names and addresses from public web pages (Google Maps, LoopNet, BizBuySell)</li>
                <li>Sends this data to our API for scoring</li>
                <li>Does NOT collect personal browsing history</li>
                <li>Does NOT track user behavior across websites</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">1.3 What We DO NOT Collect</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (name, email, phone) unless you voluntarily provide it</li>
                <li>Credit card or payment information (handled by Stripe)</li>
                <li>Browsing history or user tracking data</li>
                <li>Cookies for advertising purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p>We use collected information solely to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate CLEANBI scores using Google Places API</li>
                <li>Improve our scoring algorithms and data quality</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="font-semibold mt-4">
                We do NOT sell, rent, or share your data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Storage and Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Storage:</strong> Business addresses and scores are stored on secure servers (PostgreSQL via Neon)</li>
                <li><strong>Retention:</strong> Data retained for service improvement; you may request deletion</li>
                <li><strong>Security:</strong> Industry-standard encryption and access controls protect your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Places API:</strong> Retrieves publicly available business data (reviews, ratings, location)</li>
                <li><strong>Stripe:</strong> Processes payments securely (we do not store payment details)</li>
                <li><strong>Neon (PostgreSQL):</strong> Hosts our database infrastructure</li>
              </ul>
              <p>These services have their own privacy policies which we encourage you to review.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Chrome Extension Permissions</h2>
              <p>The CLEANBI Anywhere extension requests permissions to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>activeTab:</strong> Access current tab content to extract business data</li>
                <li><strong>Host permissions:</strong> Read data from Google Maps, LoopNet, BizBuySell pages</li>
              </ul>
              <p className="font-semibold mt-4">
                These permissions are used ONLY to extract business addresses for scoring. We do NOT 
                access personal data, emails, passwords, or browsing history.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of data we have about you</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Opt-Out:</strong> Stop using our Services at any time</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at support@washbizhub.com</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
              <p>
                We use minimal cookies for essential functionality (e.g., session management). We do NOT 
                use third-party advertising cookies or tracking pixels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
              <p>
                Our Services are not intended for individuals under 18 years of age. We do not knowingly 
                collect data from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Continued use of our Services after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p>
                For privacy-related questions or requests, contact us at:
              </p>
              <p className="font-semibold">support@washbizhub.com</p>
            </section>

            <section className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg border border-blue-200 dark:border-blue-900">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              <p className="font-semibold">
                We collect only business addresses you provide for scoring purposes. We do NOT sell your data, 
                track your browsing, or collect personal information beyond what's necessary to provide CLEANBI scores.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
