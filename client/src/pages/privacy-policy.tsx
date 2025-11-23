import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  const lastUpdated = "November 23, 2025";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | WashBizHub</title>
        <meta name="description" content="WashBizHub Privacy Policy - How we collect, use, and protect your information." />
        <link rel="canonical" href="https://washbizhub.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy | WashBizHub" />
        <meta property="og:description" content="WashBizHub Privacy Policy - How we collect, use, and protect your information." />
        <meta property="og:url" content="https://washbizhub.com/privacy-policy" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
              <CardDescription>
                Your privacy is important to us
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <p>
                WashBizHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials and authentication data</li>
                  <li>Business information (company name, location details)</li>
                  <li>Payment and billing information</li>
                  <li>Communications with us (support tickets, feedback)</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <p className="text-sm text-muted-foreground">
                  We automatically collect certain information about your use of our platform:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages viewed, features used, time spent)</li>
                  <li>Analytics and performance data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve our platform and services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, updates, and security alerts</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Generate analytics to improve our services</li>
                <li>Personalize your experience and deliver targeted content</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Service Providers</h4>
                  <p className="text-sm text-muted-foreground">
                    We share information with third-party service providers who perform services on our behalf, such as payment processing, data analytics, email delivery, and customer support.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Business Transfers</h4>
                  <p className="text-sm text-muted-foreground">
                    In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">Legal Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    When required by law or to protect our rights, privacy, safety, or property.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">With Your Consent</h4>
                  <p className="text-sm text-muted-foreground">
                    We may share information with your explicit consent or at your direction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-3 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications at any time</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                To exercise these rights, please contact us at privacy@washbizhub.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We use cookies and similar tracking technologies to collect usage information and improve our services. You can control cookies through your browser settings, though disabling cookies may affect functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our platform may contain links to third-party websites and integrate with third-party services (such as Google OAuth, Stripe payments, and AI providers). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such modifications constitutes your acknowledgment and acceptance of the modified Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> privacy@washbizhub.com</p>
                <p><strong>Address:</strong> WashBizHub, Inc.</p>
                <p className="text-muted-foreground text-xs mt-4">
                  For EU/UK residents: You have the right to lodge a complaint with your local data protection authority.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
