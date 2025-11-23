import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  const lastUpdated = "November 23, 2025";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service | WashBizHub</title>
        <meta name="description" content="WashBizHub Terms of Service - Legal terms and conditions for using our platform." />
        <link rel="canonical" href="https://washbizhub.com/terms-of-service" />
        <meta property="og:title" content="Terms of Service | WashBizHub" />
        <meta property="og:description" content="WashBizHub Terms of Service - Legal terms and conditions for using our platform." />
        <meta property="og:url" content="https://washbizhub.com/terms-of-service" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
              <CardDescription>
                Please read these Terms of Service carefully before using WashBizHub
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and WashBizHub, Inc. ("WashBizHub," "we," "us," or "our") governing your access to and use of our platform, website, and services (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use of Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Eligibility</h3>
                <p className="text-sm text-muted-foreground">
                  You must be at least 18 years old and have the legal capacity to enter into contracts to use our Services. By using our Services, you represent and warrant that you meet these requirements.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Account Registration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  To access certain features, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Acceptable Use</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Transmit harmful code, viruses, or malware</li>
                  <li>Engage in unauthorized access, data scraping, or automated queries</li>
                  <li>Interfere with or disrupt our Services or servers</li>
                  <li>Use our Services for fraudulent or illegal purposes</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Pricing and Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Certain features require a paid subscription. You agree to pay all fees associated with your subscription plan. Fees are billed in advance on a recurring basis (monthly or annually). All fees are non-refundable except as required by law or as expressly stated in these Terms.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Payment Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Payments are processed through third-party payment processors (such as Stripe). You agree to provide accurate payment information and authorize us to charge your payment method for all fees incurred.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Automatic Renewal</h3>
                <p className="text-sm text-muted-foreground">
                  Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Price Changes</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify our pricing. We will provide reasonable notice of any price changes and you will have the opportunity to cancel before the new pricing takes effect.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Our Rights</h3>
                <p className="text-sm text-muted-foreground">
                  The Services, including all content, features, and functionality, are owned by WashBizHub and are protected by copyright, trademark, patent, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of any content you submit to our Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely to provide and improve our Services.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Any feedback, suggestions, or ideas you provide to us become our property, and we may use them without restriction or compensation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Our Services may integrate with or contain links to third-party services, including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                <li>Payment processors (Stripe)</li>
                <li>Authentication providers (Google OAuth)</li>
                <li>AI services (OpenAI, Anthropic, Google Gemini)</li>
                <li>Analytics and advertising services</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                We are not responsible for the content, privacy policies, or practices of third-party services. Your use of third-party services is subject to their respective terms and policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <p className="text-sm text-muted-foreground">
                  We strive to maintain high availability but do not guarantee uninterrupted or error-free access to our Services. We may modify, suspend, or discontinue any part of our Services at any time.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Disclaimer of Warranties</h3>
                <p className="text-sm text-muted-foreground">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-sm text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, OR GOODWILL.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You agree to indemnify, defend, and hold harmless WashBizHub and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of our Services, violation of these Terms, or infringement of any rights of another.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                We may terminate or suspend your access to our Services immediately, without prior notice, for any reason, including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                <li>Violation of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Fraudulent or illegal activity</li>
                <li>At our sole discretion</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                You may terminate your account at any time through your account settings. Upon termination, your right to use our Services will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Governing Law</h3>
                <p className="text-sm text-muted-foreground">
                  These Terms are governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Arbitration</h3>
                <p className="text-sm text-muted-foreground">
                  Any disputes arising from these Terms or your use of our Services shall be resolved through binding arbitration, except that either party may seek injunctive relief in court. You waive your right to a jury trial and to participate in class actions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Provisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">Changes to Terms</h4>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes. Your continued use of our Services after such modifications constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Severability</h4>
                <p className="text-sm text-muted-foreground">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Waiver</h4>
                <p className="text-sm text-muted-foreground">
                  Our failure to enforce any provision of these Terms shall not constitute a waiver of that provision or any other provision.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Assignment</h4>
                <p className="text-sm text-muted-foreground">
                  You may not assign or transfer these Terms or your rights under them without our prior written consent. We may assign these Terms without restriction.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">Entire Agreement</h4>
                <p className="text-sm text-muted-foreground">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and WashBizHub regarding our Services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> legal@washbizhub.com</p>
                <p><strong>Support:</strong> support@washbizhub.com</p>
                <p><strong>Company:</strong> WashBizHub, Inc.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
