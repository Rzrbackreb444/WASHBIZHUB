import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Clock,
  Settings,
} from "lucide-react";
import { SiStripe, SiGoogle, SiQuickbooks, SiSlack, SiZapier } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "payment" | "accounting" | "automation" | "iot" | "analytics";
  connected: boolean;
  status: "active" | "error" | "syncing" | "disconnected";
  lastSync: string | null;
  features: string[];
}

export default function IntegrationsTab() {
  const { toast } = useToast();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and subscription management",
      icon: SiStripe,
      category: "payment",
      connected: true,
      status: "active",
      lastSync: "2024-12-10T14:30:00Z",
      features: ["Payment Processing", "Subscription Billing", "Invoice Generation"],
    },
    {
      id: "google",
      name: "Google Workspace",
      description: "Calendar sync, Google Analytics, and more",
      icon: SiGoogle,
      category: "analytics",
      connected: true,
      status: "active",
      lastSync: "2024-12-10T12:00:00Z",
      features: ["Calendar Sync", "Analytics", "Drive Storage"],
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Accounting and financial management",
      icon: SiQuickbooks,
      category: "accounting",
      connected: false,
      status: "disconnected",
      lastSync: null,
      features: ["Expense Tracking", "Invoice Sync", "Financial Reports"],
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team notifications and alerts",
      icon: SiSlack,
      category: "automation",
      connected: false,
      status: "disconnected",
      lastSync: null,
      features: ["Alert Notifications", "Team Updates", "Machine Status"],
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5,000+ apps with automation workflows",
      icon: SiZapier,
      category: "automation",
      connected: false,
      status: "disconnected",
      lastSync: null,
      features: ["Custom Workflows", "Multi-App Integration", "Automation"],
    },
    {
      id: "pos",
      name: "POS Systems",
      description: "Connect your point-of-sale hardware",
      icon: Plug,
      category: "payment",
      connected: false,
      status: "disconnected",
      lastSync: null,
      features: ["Transaction Sync", "Real-time Sales", "Inventory Management"],
    },
    {
      id: "iot",
      name: "IoT Sensors",
      description: "Machine monitoring and smart sensors",
      icon: Plug,
      category: "iot",
      connected: false,
      status: "disconnected",
      lastSync: null,
      features: ["Machine Status", "Predictive Maintenance", "Usage Analytics"],
    },
  ];

  const connectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      setConnectingId(integrationId);
      const res = await apiRequest("POST", `/api/integrations/${integrationId}/connect`);
      return res.json();
    },
    onSuccess: (data, integrationId) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
        toast({
          title: "Connected!",
          description: "Integration connected successfully.",
        });
      }
      setConnectingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect integration",
        variant: "destructive",
      });
      setConnectingId(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      await apiRequest("POST", `/api/integrations/${integrationId}/disconnect`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Disconnected",
        description: "Integration has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect integration",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      await apiRequest("POST", `/api/integrations/${integrationId}/sync`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Sync Started",
        description: "Data synchronization has been initiated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync integration",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "syncing":
        return (
          <Badge variant="secondary">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  const connectedIntegrations = integrations.filter((i) => i.connected);
  const availableIntegrations = integrations.filter((i) => !i.connected);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Plug className="h-5 w-5 text-[#C8A661]" />
            </div>
            Connected Services
          </CardTitle>
          <CardDescription>Manage your active integrations</CardDescription>
        </CardHeader>
        <CardContent>
          {connectedIntegrations.length > 0 ? (
            <div className="space-y-4">
              {connectedIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`integration-connected-${integration.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          {getStatusBadge(integration.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Last synced {new Date(integration.lastSync).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => syncMutation.mutate(integration.id)}
                        disabled={syncMutation.isPending}
                        data-testid={`button-sync-${integration.id}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-settings-${integration.id}`}>
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{integration.name} Settings</DialogTitle>
                            <DialogDescription>
                              Configure your {integration.name} integration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <h4 className="font-medium mb-2">Connected Features</h4>
                            <div className="space-y-2">
                              {integration.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-disconnect-${integration.id}`}
                          >
                            Disconnect
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {integration.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will disconnect the {integration.name} integration. You can reconnect at any time, but you may need to reconfigure your settings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => disconnectMutation.mutate(integration.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plug className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No integrations connected yet</p>
              <p className="text-sm">Connect services below to extend functionality</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect additional services to enhance your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {availableIntegrations.map((integration) => {
              const Icon = integration.icon;
              const isConnecting = connectingId === integration.id;
              
              return (
                <div
                  key={integration.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                  data-testid={`integration-available-${integration.id}`}
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {integration.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => connectMutation.mutate(integration.id)}
                      disabled={isConnecting}
                      data-testid={`button-connect-${integration.id}`}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plug className="w-4 h-4 mr-2" />
                      )}
                      Connect
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Need a custom integration?</h4>
              <p className="text-sm text-muted-foreground">
                We can build custom integrations for your specific needs
              </p>
            </div>
            <Button variant="outline" data-testid="button-request-integration">
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
