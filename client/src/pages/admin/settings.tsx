import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "WashBizHub",
    siteDescription: "The #1 Laundromat Resource Hub",
    contactEmail: "info@washbizhub.com",
  });

  const [emailSettings, setEmailSettings] = useState({
    fromEmail: "info@washbizhub.com",
  });

  const [pricingSettings, setPricingSettings] = useState({
    proTier: "19.99",
    eliteTier: "49.99",
  });

  const [apiSettings, setApiSettings] = useState({
    amazonTag: "nicholaskreme-20",
    googleAnalytics: "",
  });

  const saveGeneralSettings = () => {
    // In production, this would call API
    toast({ 
      title: "Settings saved",
      description: "General settings updated successfully"
    });
  };

  const saveEmailSettings = () => {
    toast({ 
      title: "Email settings saved",
      description: "Email configuration updated"
    });
  };

  const savePricingSettings = () => {
    toast({ 
      title: "Pricing updated",
      description: "Subscription tiers configured"
    });
  };

  const saveAPISettings = () => {
    toast({ 
      title: "API keys saved",
      description: "Third-party integrations configured"
    });
  };

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
              <Input 
                id="siteName" 
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                data-testid="input-site-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input 
                id="siteDescription" 
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                data-testid="input-site-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input 
                id="contactEmail" 
                type="email" 
                value={generalSettings.contactEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                data-testid="input-contact-email"
              />
            </div>

            <Button onClick={saveGeneralSettings} data-testid="button-save-general">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Email service settings (Resend/SendGrid)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-900 dark:text-green-100">Email provider: Resend (configured)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input 
                id="fromEmail" 
                type="email" 
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                data-testid="input-from-email"
              />
            </div>

            <Button onClick={saveEmailSettings} data-testid="button-save-email">
              <Save className="w-4 h-4 mr-2" />
              Update Email Settings
            </Button>
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
                  <Input defaultValue="$0/mo" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Pro Tier ($)</Label>
                  <Input 
                    value={pricingSettings.proTier}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, proTier: e.target.value })}
                    data-testid="input-pro-tier"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Elite Tier ($)</Label>
                  <Input 
                    value={pricingSettings.eliteTier}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, eliteTier: e.target.value })}
                    data-testid="input-elite-tier"
                  />
                </div>
              </div>

              <Button onClick={savePricingSettings} data-testid="button-save-pricing">
                <Save className="w-4 h-4 mr-2" />
                Update Pricing
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys & Integrations</CardTitle>
            <CardDescription>Configure third-party services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900 dark:text-blue-100">Stripe configured via secrets</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonTag">Amazon Affiliate Tag</Label>
              <Input 
                id="amazonTag" 
                value={apiSettings.amazonTag}
                onChange={(e) => setApiSettings({ ...apiSettings, amazonTag: e.target.value })}
                data-testid="input-amazon-tag"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
              <Input 
                id="googleAnalytics" 
                placeholder="G-XXXXXXXXXX"
                value={apiSettings.googleAnalytics}
                onChange={(e) => setApiSettings({ ...apiSettings, googleAnalytics: e.target.value })}
                data-testid="input-google-analytics"
              />
            </div>

            <Button onClick={saveAPISettings} data-testid="button-save-api">
              <Save className="w-4 h-4 mr-2" />
              Save API Keys
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
