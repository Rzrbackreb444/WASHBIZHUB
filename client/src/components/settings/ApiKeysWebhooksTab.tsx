import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Webhook,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  lastTriggered: string | null;
  failureCount: number;
}

interface ApiUsageStats {
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  rateLimit: { used: number; limit: number };
}

interface ApiKeysProps {
  user: any;
}

export default function ApiKeysWebhooksTab({ user }: ApiKeysProps) {
  const { toast } = useToast();
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const isPro = user?.subscriptionTier === "scale" || user?.subscriptionTier === "summit" || user?.subscriptionTier === "accelerate";

  const apiKeys: ApiKey[] = [
    {
      id: "key_1",
      name: "Production API",
      prefix: "wbh_live_****",
      permissions: ["read", "write"],
      createdAt: "2024-11-15",
      lastUsed: "2024-12-10",
      expiresAt: null,
    },
    {
      id: "key_2",
      name: "Test Key",
      prefix: "wbh_test_****",
      permissions: ["read"],
      createdAt: "2024-12-01",
      lastUsed: null,
      expiresAt: "2025-01-01",
    },
  ];

  const webhooks: WebhookEndpoint[] = [
    {
      id: "wh_1",
      url: "https://api.example.com/webhooks/washbizhub",
      events: ["transaction.completed", "location.updated"],
      status: "active",
      lastTriggered: "2024-12-10T14:30:00Z",
      failureCount: 0,
    },
  ];

  const usageStats: ApiUsageStats = {
    totalRequests: 12450,
    successRate: 99.2,
    avgLatency: 145,
    rateLimit: { used: 450, limit: 1000 },
  };

  const eventOptions = [
    "transaction.completed",
    "transaction.failed",
    "location.created",
    "location.updated",
    "location.deleted",
    "machine.status_changed",
    "alert.triggered",
    "report.generated",
  ];

  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/api-keys", {
        name: newKeyName,
        permissions: newKeyPermissions,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setShowNewKeyDialog(false);
      setNewKeyName("");
      toast({
        title: "API Key Created",
        description: "Make sure to copy your key now. You won't be able to see it again!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiRequest("DELETE", `/api/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been permanently revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/webhooks", {
        url: newWebhookUrl,
        events: newWebhookEvents,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setShowNewWebhookDialog(false);
      setNewWebhookUrl("");
      setNewWebhookEvents([]);
      toast({
        title: "Webhook Created",
        description: "Your webhook endpoint has been configured.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  if (!isPro) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro+ Feature</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              API access and webhooks are available on Accelerate, Scale, and Summit plans.
              Upgrade to unlock programmatic access to your data.
            </p>
            <Button data-testid="button-upgrade-for-api">
              Upgrade to Access API
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Key className="h-5 w-5 text-[#C8A661]" />
              </div>
              API Keys
            </CardTitle>
            <CardDescription>Manage your API keys for programmatic access</CardDescription>
          </div>
          <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-api-key">
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for accessing the WashBizHub API
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Production API Key"
                    data-testid="input-api-key-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newKeyPermissions.includes("read")}
                        onCheckedChange={(checked) => {
                          setNewKeyPermissions(
                            checked
                              ? [...newKeyPermissions, "read"]
                              : newKeyPermissions.filter((p) => p !== "read")
                          );
                        }}
                        data-testid="switch-permission-read"
                      />
                      <Label className="font-normal">Read</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newKeyPermissions.includes("write")}
                        onCheckedChange={(checked) => {
                          setNewKeyPermissions(
                            checked
                              ? [...newKeyPermissions, "write"]
                              : newKeyPermissions.filter((p) => p !== "write")
                          );
                        }}
                        data-testid="switch-permission-write"
                      />
                      <Label className="font-normal">Write</Label>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => generateKeyMutation.mutate()}
                  disabled={generateKeyMutation.isPending || !newKeyName}
                  className="w-full"
                  data-testid="button-generate-key"
                >
                  {generateKeyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Generate API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`api-key-row-${key.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{key.name}</h4>
                      {key.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">
                        {revealedKeys.has(key.id) ? "wbh_live_abc123xyz789" : key.prefix}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setRevealedKeys((prev) => {
                            const next = new Set(prev);
                            if (next.has(key.id)) {
                              next.delete(key.id);
                            } else {
                              next.add(key.id);
                            }
                            return next;
                          });
                        }}
                        data-testid={`button-toggle-key-${key.id}`}
                      >
                        {revealedKeys.has(key.id) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard("wbh_live_abc123xyz789")}
                        data-testid={`button-copy-key-${key.id}`}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                      {key.expiresAt && ` • Expires ${new Date(key.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-revoke-key-${key.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently revoke the API key "{key.name}". Any applications using this key will stop working immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeKeyMutation.mutate(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No API keys yet</p>
              <p className="text-sm">Create your first API key to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Endpoints
            </CardTitle>
            <CardDescription>Configure webhooks to receive real-time event notifications</CardDescription>
          </div>
          <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" data-testid="button-add-webhook">
                <Plus className="w-4 h-4 mr-2" />
                Add Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a URL to receive webhook notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Endpoint URL</Label>
                  <Input
                    id="webhookUrl"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.example.com/webhooks"
                    data-testid="input-webhook-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events to Send</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventOptions.map((event) => (
                      <div key={event} className="flex items-center gap-2">
                        <Switch
                          checked={newWebhookEvents.includes(event)}
                          onCheckedChange={(checked) => {
                            setNewWebhookEvents(
                              checked
                                ? [...newWebhookEvents, event]
                                : newWebhookEvents.filter((e) => e !== event)
                            );
                          }}
                          data-testid={`switch-event-${event.replace(".", "-")}`}
                        />
                        <Label className="text-xs font-normal">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => createWebhookMutation.mutate()}
                  disabled={createWebhookMutation.isPending || !newWebhookUrl || newWebhookEvents.length === 0}
                  className="w-full"
                  data-testid="button-create-webhook"
                >
                  {createWebhookMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Webhook className="w-4 h-4 mr-2" />
                  )}
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {webhooks.length > 0 ? (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`webhook-row-${webhook.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={webhook.status === "active" ? "default" : webhook.status === "failing" ? "destructive" : "secondary"}
                        className={webhook.status === "active" ? "bg-green-600" : ""}
                      >
                        {webhook.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {webhook.status === "failing" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {webhook.status}
                      </Badge>
                      <code className="text-sm">{webhook.url}</code>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    {webhook.lastTriggered && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last triggered {new Date(webhook.lastTriggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" data-testid={`button-delete-webhook-${webhook.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No webhook endpoints configured</p>
              <p className="text-sm">Add an endpoint to receive event notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            API Usage Statistics
          </CardTitle>
          <CardDescription>Monitor your API usage and rate limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#C8A661]">
                {usageStats.totalRequests.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Requests</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {usageStats.successRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Success Rate</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#C8A661]">
                {usageStats.avgLatency}ms
              </div>
              <div className="text-xs text-muted-foreground mt-1">Avg Latency</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#C8A661]">
                {usageStats.rateLimit.used}/{usageStats.rateLimit.limit}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Rate Limit (per min)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Rate Limit Usage</span>
              <span className="text-muted-foreground">
                {((usageStats.rateLimit.used / usageStats.rateLimit.limit) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={(usageStats.rateLimit.used / usageStats.rateLimit.limit) * 100}
              className="h-2"
              data-testid="progress-rate-limit"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
