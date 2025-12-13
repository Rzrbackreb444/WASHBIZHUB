import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Send, FileText, Loader2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";

interface Advertisement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  placement: 'header' | 'sidebar' | 'footer' | 'inline';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority: number;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export default function AdminAds() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    placement: 'header' as const,
    isActive: true,
    startDate: '',
    endDate: '',
    priority: 1,
  });

  const [invoiceData, setInvoiceData] = useState({
    email: '',
    companyName: '',
    contactName: '',
    amount: '',
    description: '',
    dueInDays: '7',
  });
  
  const [invoiceResult, setInvoiceResult] = useState<{
    invoiceUrl?: string;
    invoiceNumber?: string;
    amount?: number;
  } | null>(null);

  // Fetch ads
  const { data: ads, isLoading: adsLoading } = useQuery<Advertisement[]>({
    queryKey: ['/api/admin/ads'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingAd) {
        return apiRequest(`/api/admin/ads/${editingAd.id}`, 'PATCH', data);
      } else {
        return apiRequest('/api/admin/ads', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
      toast({
        title: editingAd ? "Ad updated" : "Ad created",
        description: "Advertisement saved successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/ads/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
      toast({
        title: "Ad deleted",
        description: "Advertisement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Invoice mutation - for sending invoices to advertisers like Londr
  const invoiceMutation = useMutation({
    mutationFn: async (data: typeof invoiceData) => {
      const response = await fetch('/api/advertising/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          companyName: data.companyName,
          contactName: data.contactName,
          amount: parseFloat(data.amount),
          description: data.description,
          dueInDays: parseInt(data.dueInDays),
          sendEmail: true,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Invoice Sent!",
        description: `Invoice #${result.invoiceNumber} emailed to ${invoiceData.email}`,
      });
      setInvoiceResult({
        invoiceUrl: result.invoiceUrl,
        invoiceNumber: result.invoiceNumber,
        amount: result.amount,
      });
      setInvoiceData({
        email: '',
        companyName: '',
        contactName: '',
        amount: '',
        description: '',
        dueInDays: '7',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invoice Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/ads/${id}`, 'PATCH', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      placement: 'header',
      isActive: true,
      startDate: '',
      endDate: '',
      priority: 1,
    });
    setEditingAd(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content,
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      placement: ad.placement,
      isActive: ad.isActive,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      priority: ad.priority,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/admin'}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#C8A661' }}>
              Advertisement Management
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Control ads across the entire platform
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-create-ad"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ads?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads?.filter(a => a.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads?.reduce((sum, a) => sum + a.impressions, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads?.reduce((sum, a) => sum + a.clicks, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Generator for Advertisers */}
      <Card className="mb-6 sm:mb-8 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Send Invoice to Advertiser
          </CardTitle>
          <CardDescription>
            Email a Stripe invoice for Facebook group advertising, sponsorships, or vendor partnerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!invoiceData.email || !invoiceData.amount || !invoiceData.description) {
                toast({
                  title: "Missing Fields",
                  description: "Email, amount, and description are required",
                  variant: "destructive",
                });
                return;
              }
              invoiceMutation.mutate(invoiceData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoice-email">Email Address *</Label>
                <Input
                  id="invoice-email"
                  type="email"
                  placeholder="benjamin@londr.com"
                  value={invoiceData.email}
                  onChange={(e) => setInvoiceData({ ...invoiceData, email: e.target.value })}
                  data-testid="input-invoice-email"
                />
              </div>
              <div>
                <Label htmlFor="invoice-company">Company Name</Label>
                <Input
                  id="invoice-company"
                  placeholder="Londr.com"
                  value={invoiceData.companyName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                  data-testid="input-invoice-company"
                />
              </div>
              <div>
                <Label htmlFor="invoice-contact">Contact Name</Label>
                <Input
                  id="invoice-contact"
                  placeholder="Benjamin Johnson"
                  value={invoiceData.contactName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, contactName: e.target.value })}
                  data-testid="input-invoice-contact"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-amount">Amount (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invoice-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="500.00"
                    className="pl-9"
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                    data-testid="input-invoice-amount"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoice-due">Due In (Days)</Label>
                <Select 
                  value={invoiceData.dueInDays} 
                  onValueChange={(value) => setInvoiceData({ ...invoiceData, dueInDays: value })}
                >
                  <SelectTrigger data-testid="select-invoice-due">
                    <SelectValue placeholder="Select due date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days (1 week)</SelectItem>
                    <SelectItem value="14">14 days (2 weeks)</SelectItem>
                    <SelectItem value="30">30 days (1 month)</SelectItem>
                    <SelectItem value="60">60 days (2 months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="invoice-description">Description / Line Item *</Label>
              <Textarea
                id="invoice-description"
                placeholder="Premium Sponsor - Facebook Group (1 month) + Featured Post + Homepage Logo"
                value={invoiceData.description}
                onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                rows={2}
                data-testid="input-invoice-description"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={invoiceMutation.isPending}
                data-testid="button-send-invoice"
              >
                {invoiceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </>
                )}
              </Button>
              
              {invoiceResult && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Last: #{invoiceResult.invoiceNumber} (${invoiceResult.amount})</span>
                  <a 
                    href={invoiceResult.invoiceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-invoice-view"
                  >
                    View Invoice
                  </a>
                </div>
              )}
            </div>
          </form>

          {/* Quick Templates */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium mb-3">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInvoiceData({
                  ...invoiceData,
                  amount: '500',
                  description: 'Featured Post - Facebook Group (73K+ Members) + Branded Template',
                })}
                data-testid="button-template-featured"
              >
                Featured Post ($500)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInvoiceData({
                  ...invoiceData,
                  amount: '1400',
                  description: 'Premium Sponsor - Monthly (73K+ Members) - Featured placement, Logo on cover, Monthly spotlight, Priority response',
                })}
                data-testid="button-template-premium"
              >
                Premium Sponsor ($1,400/mo)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInvoiceData({
                  ...invoiceData,
                  amount: '499',
                  description: 'Vendor Partner Badge - Monthly - Official status, Post promotions, Vendor directory listing',
                })}
                data-testid="button-template-vendor"
              >
                Vendor Badge ($499/mo)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>Manage platform-wide ad placements</CardDescription>
        </CardHeader>
        <CardContent>
          {adsLoading ? (
            <div className="text-center py-8">Loading ads...</div>
          ) : ads && ads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>
                      <span className="capitalize">{ad.placement}</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: ad.id, isActive: checked })
                        }
                        data-testid={`switch-ad-active-${ad.id}`}
                      />
                    </TableCell>
                    <TableCell>{ad.priority}</TableCell>
                    <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                    <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                    <TableCell>
                      {ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                        : '0.00'}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ad)}
                          data-testid={`button-edit-ad-${ad.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this ad?')) {
                              deleteMutation.mutate(ad.id);
                            }
                          }}
                          data-testid={`button-delete-ad-${ad.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No advertisements yet. Create your first ad!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit' : 'Create'} Advertisement</DialogTitle>
            <DialogDescription>
              {editingAd ? 'Update' : 'Create a new'} advertisement placement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="input-ad-title"
                />
              </div>
              <div>
                <Label htmlFor="placement">Placement*</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, placement: value })
                  }
                >
                  <SelectTrigger data-testid="select-ad-placement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="inline">Inline (Blog/Content)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content/HTML*</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                placeholder="HTML or plain text content"
                required
                data-testid="input-ad-content"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-ad-image"
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">Link URL (optional)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-ad-link"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) })
                  }
                  data-testid="input-ad-priority"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date (optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-ad-start-date"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  data-testid="input-ad-end-date"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                data-testid="switch-ad-is-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save-ad"
              >
                {saveMutation.isPending ? 'Saving...' : editingAd ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
