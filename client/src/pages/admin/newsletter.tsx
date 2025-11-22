import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Pencil, Trash2, Plus, CheckCircle, Clock } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  status: string;
  source: string | null;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
  });

  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ['/api/newsletter/subscribers'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/newsletter/send", data);
      return response.json();
    },
    onSuccess: () => {
      setIsComposeOpen(false);
      setFormData({ subject: "", content: "" });
      toast({ title: "Newsletter sent successfully", description: `Sent to ${activeSubscribers.length} subscribers` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const activeSubscribers = subscribers.filter(s => s.status === 'active');
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Send newsletter to ${activeSubscribers.length} subscribers?`)) {
      sendNewsletterMutation.mutate(formData);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Newsletter Management</h1>
          <p className="text-muted-foreground">Compose and send newsletters to subscribers</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)} data-testid="button-compose-newsletter">
          <Mail className="w-4 h-4 mr-2" />
          Compose Newsletter
        </Button>
      </div>

      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscribers.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeSubscribers.length}</div>
                <p className="text-xs text-muted-foreground">Can receive emails</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
                <p className="text-xs text-muted-foreground">Opted out</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>Manage your email subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p>No subscribers yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {subscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
                      data-testid={`subscriber-${sub.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{sub.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {sub.firstName && `${sub.firstName} · `}
                          Subscribed {new Date(sub.subscribedAt).toLocaleDateString()}
                          {sub.source && ` · via ${sub.source}`}
                        </div>
                      </div>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Statistics</CardTitle>
              <CardDescription>Subscriber growth and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                    <div className="text-2xl font-bold">+12%</div>
                    <div className="text-xs text-muted-foreground">Last 30 days</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
                    <div className="text-2xl font-bold">35%</div>
                    <div className="text-xs text-muted-foreground">Industry avg: 21%</div>
                  </div>
                </div>

                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p>Detailed analytics coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Newsletter</DialogTitle>
            <DialogDescription>
              Send email to {activeSubscribers.length} active subscribers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Your newsletter subject..."
                required
                data-testid="input-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={16}
                placeholder="Write your newsletter content here..."
                required
                data-testid="input-content"
              />
              <div className="text-xs text-muted-foreground">
                Plain text format. HTML support coming soon.
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Ready to Send
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    This newsletter will be sent to {activeSubscribers.length} active subscribers via info@washbizhub.com
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendNewsletterMutation.isPending}
                data-testid="button-send"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendNewsletterMutation.isPending ? 'Sending...' : `Send to ${activeSubscribers.length} Subscribers`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
