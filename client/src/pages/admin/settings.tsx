import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="WashBizHub" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input id="siteDescription" defaultValue="The Bloomberg of Laundromats" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" defaultValue="info@washbizhub.com" />
            </div>

            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Email service settings (Resend/SendGrid)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailProvider">Email Provider</Label>
              <Input id="emailProvider" defaultValue="Resend" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input id="fromEmail" type="email" defaultValue="info@washbizhub.com" />
            </div>

            <Button>Update Email Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Tiers</CardTitle>
            <CardDescription>Configure pricing and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Free Tier</Label>
                  <Input defaultValue="$0/mo" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Pro Tier</Label>
                  <Input defaultValue="$19.99/mo" />
                </div>
                <div className="space-y-2">
                  <Label>Elite Tier</Label>
                  <Input defaultValue="$49.99/mo" />
                </div>
              </div>

              <Button>Update Pricing</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Configure third-party integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripeKey">Stripe Secret Key</Label>
              <Input id="stripeKey" type="password" placeholder="sk_live_..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonTag">Amazon Affiliate Tag</Label>
              <Input id="amazonTag" defaultValue="nicholaskreme-20" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
              <Input id="googleAnalytics" placeholder="G-XXXXXXXXXX" />
            </div>

            <Button>Save API Keys</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
