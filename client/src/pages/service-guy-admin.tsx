import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Palette, 
  Mail, 
  MessageSquare, 
  Activity,
  Settings,
  Users,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Upload,
  Building2,
  Globe,
  Phone,
  Image,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import serviceGuyAiLogoUrl from "@assets/service_guy_ai_logo_transparent_1766168656313.png";

const DEMO_DISTRIBUTOR_ID = "demo-distributor-001";

export default function ServiceGuyAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState({
    diagnostics: true,
    jobs: true,
    parts: false,
    invoices: false,
    fleet: false,
    users: false,
    reports: false,
    webhooks: false,
  });
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");

  const { data: demoStats } = useQuery({
    queryKey: ["/api/service-guy-admin/demo/stats"],
  });

  const { data: demoBranding } = useQuery({
    queryKey: ["/api/service-guy-admin/demo/branding"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/service-guy-admin/distributors/${DEMO_DISTRIBUTOR_ID}/api-keys`, {
        name: newKeyName,
        scopes: newKeyScopes,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShowNewKey(data.apiKey);
      setNewKeyName("");
      toast({ title: "API Key Created", description: "Save this key securely - it cannot be retrieved again." });
      queryClient.invalidateQueries({ queryKey: ["/api/service-guy-admin/distributors", DEMO_DISTRIBUTOR_ID, "api-keys"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" });
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/service-guy-admin/distributors/${DEMO_DISTRIBUTOR_ID}/send-test-email`, {
        recipient: testEmailRecipient,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Test Email Sent", description: `Email sent to ${testEmailRecipient}` });
      } else {
        toast({ title: "Email Failed", description: data.error || "Failed to send email", variant: "destructive" });
      }
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#16213e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src={serviceGuyAiLogoUrl} 
              alt="Service Guy AI" 
              className="h-16 md:h-20"
              data-testid="img-service-guy-ai-logo"
            />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#C8A661]" />
                Service Guy AI Enterprise Admin
              </h1>
              <p className="text-gray-400 mt-1">Manage white-labeling, API keys, messaging, and security</p>
            </div>
          </div>
          <Badge className="bg-[#C8A661] text-[#0A1628]">
            ENTERPRISE
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-8 bg-[#16213e]/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="messaging" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]">
              <Mail className="w-4 h-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#C8A661] data-[state=active]:text-[#0A1628]">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-[#C8A661]">{demoStats?.activeDistributors || 47}</div>
                  <div className="text-sm text-gray-400">Active Distributors</div>
                </CardContent>
              </Card>
              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-[#C8A661]">{demoStats?.totalTechnicians || 312}</div>
                  <div className="text-sm text-gray-400">Technicians</div>
                </CardContent>
              </Card>
              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-[#C8A661]">{demoStats?.apiCallsToday || "12,847"}</div>
                  <div className="text-sm text-gray-400">API Calls Today</div>
                </CardContent>
              </Card>
              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-500">{demoStats?.uptime || "99.97%"}</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white">Enterprise Features</CardTitle>
                <CardDescription>What's included in your Service Guy AI Enterprise plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">White-Label Branding</div>
                      <div className="text-sm text-gray-400">Custom logos, colors, domains</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">API Access</div>
                      <div className="text-sm text-gray-400">Full REST API with rate limiting</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">Email & SMS Notifications</div>
                      <div className="text-sm text-gray-400">Resend + Twilio integration</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">Audit Logging</div>
                      <div className="text-sm text-gray-400">Complete security trail</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">Multi-User RBAC</div>
                      <div className="text-sm text-gray-400">Role-based access control</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-white">Priority Support</div>
                      <div className="text-sm text-gray-400">24/7 dedicated support</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#C8A661]" />
                  Company Branding
                </CardTitle>
                <CardDescription>Customize how Service Guy AI appears to your customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Company Name</Label>
                      <Input 
                        defaultValue={demoBranding?.companyName || "AAdvantage Laundry Systems"} 
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Support Email</Label>
                      <Input 
                        defaultValue={demoBranding?.supportEmail || "support@aadvantage.com"} 
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Support Phone</Label>
                      <Input 
                        defaultValue={demoBranding?.supportPhone || "1-800-555-WASH"} 
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Custom Domain</Label>
                      <Input 
                        defaultValue={demoBranding?.customDomain || "fleet.aadvantage.com"} 
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Email From Name</Label>
                      <Input 
                        defaultValue={demoBranding?.emailFromName || "AAdvantage Service Team"} 
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Logo Upload</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept="image/*" className="bg-[#0A1628] border-[#C8A661]/30 text-white" />
                        <Button variant="outline" className="border-[#C8A661] text-[#C8A661]">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#C8A661]/20" />

                <div>
                  <Label className="text-white mb-4 block">Brand Colors</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Primary", value: demoBranding?.primaryColor || "#C8A661" },
                      { label: "Secondary", value: demoBranding?.secondaryColor || "#0A1628" },
                      { label: "Accent", value: demoBranding?.accentColor || "#F59E0B" },
                      { label: "Background", value: "#0A0F1A" },
                      { label: "Text", value: "#FFFFFF" },
                    ].map((color) => (
                      <div key={color.label} className="text-center">
                        <div 
                          className="w-12 h-12 rounded-lg mx-auto mb-2 border border-white/20"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="text-xs text-gray-400">{color.label}</div>
                        <div className="text-xs text-[#C8A661]">{color.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#C8A661]/20 mt-4">
                <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                  Save Branding Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#C8A661]" />
                    API Keys
                  </CardTitle>
                  <CardDescription>Manage API keys for programmatic access</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                      <Plus className="w-4 h-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#16213e] border-[#C8A661]/30">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New API Key</DialogTitle>
                      <DialogDescription>Generate a new API key with custom scopes</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-white">Key Name</Label>
                        <Input 
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Production API Key"
                          className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Scopes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(newKeyScopes).map(([scope, enabled]) => (
                            <div key={scope} className="flex items-center justify-between bg-[#0A1628] p-2 rounded">
                              <span className="text-sm text-white capitalize">{scope}</span>
                              <Switch 
                                checked={enabled}
                                onCheckedChange={(checked) => setNewKeyScopes(prev => ({ ...prev, [scope]: checked }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => createKeyMutation.mutate()}
                        className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                        disabled={!newKeyName || createKeyMutation.isPending}
                      >
                        {createKeyMutation.isPending ? "Creating..." : "Create Key"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {showNewKey && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-500 font-medium">New API Key Created</div>
                        <div className="text-xs text-gray-400 mt-1">Save this key securely - it cannot be retrieved again</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowNewKey(null)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <code className="flex-1 bg-[#0A1628] p-2 rounded text-xs text-[#C8A661] font-mono overflow-x-auto">
                        {showNewKey}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(showNewKey)}
                        className="border-[#C8A661] text-[#C8A661]"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow className="border-[#C8A661]/20">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Key</TableHead>
                      <TableHead className="text-gray-400">Scopes</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Last Used</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Production API", prefix: "sgai_live_", lastFour: "x7k2", scopes: 5, status: "active", lastUsed: "2 min ago" },
                      { name: "Staging API", prefix: "sgai_test_", lastFour: "m3n9", scopes: 8, status: "active", lastUsed: "1 hour ago" },
                      { name: "Mobile App", prefix: "sgai_live_", lastFour: "p4q1", scopes: 3, status: "active", lastUsed: "5 min ago" },
                    ].map((key) => (
                      <TableRow key={key.name} className="border-[#C8A661]/10">
                        <TableCell className="text-white font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs text-gray-400">{key.prefix}...{key.lastFour}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#C8A661]/30 text-[#C8A661]">
                            {key.scopes} scopes
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">{key.lastUsed}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#C8A661]" />
                    Email (Resend)
                  </CardTitle>
                  <CardDescription>Email notifications for job updates, invoices, and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                    <div>
                      <div className="text-white font-medium">Email Integration</div>
                      <div className="text-xs text-gray-400">Powered by Resend</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
                  </div>
                  <div>
                    <Label className="text-white">Send Test Email</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        type="email"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="test@example.com"
                        className="bg-[#0A1628] border-[#C8A661]/30 text-white"
                      />
                      <Button 
                        onClick={() => sendTestEmailMutation.mutate()}
                        disabled={!testEmailRecipient || sendTestEmailMutation.isPending}
                        className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#C8A661]" />
                    SMS (Twilio)
                  </CardTitle>
                  <CardDescription>SMS alerts for technicians and customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                    <div>
                      <div className="text-white font-medium">SMS Integration</div>
                      <div className="text-xs text-gray-400">Powered by Twilio</div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-500">Configure</Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    SMS notifications require Twilio credentials. Contact support to enable.
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white">Message Templates</CardTitle>
                <CardDescription>Customize notification templates for your brand</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#C8A661]/20">
                      <TableHead className="text-gray-400">Template</TableHead>
                      <TableHead className="text-gray-400">Channel</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Job Created", slug: "job_created", channel: "both", active: true },
                      { name: "Job Assigned", slug: "job_assigned", channel: "email", active: true },
                      { name: "Technician Dispatch", slug: "tech_dispatch", channel: "sms", active: true },
                      { name: "Job Completed", slug: "job_completed", channel: "both", active: true },
                      { name: "Invoice Sent", slug: "invoice_sent", channel: "email", active: false },
                    ].map((template) => (
                      <TableRow key={template.slug} className="border-[#C8A661]/10">
                        <TableCell className="text-white font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#C8A661]/30 text-[#C8A661]">
                            {template.channel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={template.active} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-[#C8A661]">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C8A661]" />
                  Security & Audit Logs
                </CardTitle>
                <CardDescription>Monitor all activity and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "API Key Created", actor: "admin@aadvantage.com", resource: "Production API", time: "2 min ago", success: true },
                    { action: "Branding Updated", actor: "admin@aadvantage.com", resource: "Logo", time: "1 hour ago", success: true },
                    { action: "API Call", actor: "sgai_live_...x7k2", resource: "/diagnostics", time: "2 min ago", success: true },
                    { action: "Login", actor: "tech@aadvantage.com", resource: "Dashboard", time: "5 min ago", success: true },
                    { action: "API Call Failed", actor: "sgai_test_...m3n9", resource: "/jobs", time: "10 min ago", success: false },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0A1628] rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-white text-sm font-medium">{log.action}</div>
                          <div className="text-xs text-gray-400">{log.actor} • {log.resource}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{log.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#C8A661]/20">
                <Button variant="outline" className="border-[#C8A661] text-[#C8A661]">
                  View All Logs
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white">Rate Limiting</CardTitle>
                <CardDescription>API rate limits and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0A1628] rounded-lg">
                    <div className="text-2xl font-bold text-[#C8A661]">1,000</div>
                    <div className="text-sm text-gray-400">Requests / Hour</div>
                    <div className="text-xs text-gray-500 mt-1">Default limit</div>
                  </div>
                  <div className="p-4 bg-[#0A1628] rounded-lg">
                    <div className="text-2xl font-bold text-white">847</div>
                    <div className="text-sm text-gray-400">Current Usage</div>
                    <div className="text-xs text-gray-500 mt-1">This hour</div>
                  </div>
                  <div className="p-4 bg-[#0A1628] rounded-lg">
                    <div className="text-2xl font-bold text-green-500">153</div>
                    <div className="text-sm text-gray-400">Remaining</div>
                    <div className="text-xs text-gray-500 mt-1">Resets in 23 min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
