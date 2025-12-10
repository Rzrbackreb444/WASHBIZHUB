import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Upload, 
  History, 
  Rocket, 
  Eye, 
  Undo2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Image, 
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Link2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomerWebsite, WebsiteAsset } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";

interface PublishHistoryItem {
  version: number;
  pages: any;
  theme: any;
  publishedAt: string;
  publishedBy: string;
  note?: string;
}

export default function PublishingDashboard() {
  const { toast } = useToast();
  const [selectedWebsite, setSelectedWebsite] = useState<CustomerWebsite | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [uploadingAsset, setUploadingAsset] = useState(false);

  const { data: websites, isLoading } = useQuery<CustomerWebsite[]>({
    queryKey: ["/api/websites"],
  });

  const { data: assets, refetch: refetchAssets } = useQuery<WebsiteAsset[]>({
    queryKey: ["/api/websites", selectedWebsite?.id, "assets"],
    enabled: !!selectedWebsite?.id,
  });

  const publishMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiRequest(`/api/websites/${websiteId}/publish`, { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "Website Published", description: "Your website is now live!" });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({ title: "Publish Failed", description: error.message, variant: "destructive" });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiRequest(`/api/websites/${websiteId}/unpublish`, { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "Website Unpublished", description: "Your website is now a draft." });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({ title: "Unpublish Failed", description: error.message, variant: "destructive" });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async ({ websiteId, version }: { websiteId: string; version: number }) => {
      return apiRequest(`/api/websites/${websiteId}/rollback`, {
        method: "POST",
        body: JSON.stringify({ version }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({ title: "Rollback Complete", description: "Website restored to previous version." });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({ title: "Rollback Failed", description: error.message, variant: "destructive" });
    },
  });

  const addDomainMutation = useMutation({
    mutationFn: async ({ websiteId, domain }: { websiteId: string; domain: string }) => {
      return apiRequest(`/api/websites/${websiteId}/domain`, {
        method: "POST",
        body: JSON.stringify({ domain }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({ title: "Domain Added", description: "Configure DNS to complete setup." });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setDomainDialogOpen(false);
      setNewDomain("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to Add Domain", description: error.message, variant: "destructive" });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiRequest(`/api/websites/${websiteId}/verify-domain`, { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "Domain Verified", description: "SSL certificate is active!" });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    },
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiRequest(`/api/websites/${websiteId}/domain`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "Domain Removed", description: "Custom domain has been disconnected." });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to Remove Domain", description: error.message, variant: "destructive" });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async ({ websiteId, assetId }: { websiteId: string; assetId: string }) => {
      return apiRequest(`/api/websites/${websiteId}/assets/${assetId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "Asset Deleted" });
      refetchAssets();
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleAssetUpload = async (websiteId: string, file: File) => {
    setUploadingAsset(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "image");

    try {
      const response = await fetch(`/api/websites/${websiteId}/assets`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({ title: "Asset Uploaded" });
      refetchAssets();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAsset(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-600" data-testid="status-published"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case "draft":
        return <Badge variant="secondary" data-testid="status-draft"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline" data-testid="status-unknown">{status}</Badge>;
    }
  };

  const getSslBadge = (sslStatus: string | null) => {
    switch (sslStatus) {
      case "active":
        return <Badge className="bg-green-600" data-testid="ssl-active"><Shield className="w-3 h-3 mr-1" />SSL Active</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid="ssl-pending"><RefreshCw className="w-3 h-3 mr-1" />SSL Pending</Badge>;
      default:
        return null;
    }
  };

  const getDomainStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600" data-testid="domain-verified"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid="domain-pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid="domain-failed"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-state">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Publishing Dashboard - Manage Your Websites"
        description="Manage your published websites, control versions, upload assets, and configure custom domains."
        canonicalUrl="/publishing-dashboard"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Publishing Dashboard</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage your websites, publish updates, and configure custom domains.
          </p>
        </div>

        {websites && websites.length === 0 ? (
          <Card data-testid="card-no-websites">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Websites Yet</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first website from our templates to start publishing.
              </p>
              <Button asChild data-testid="button-browse-templates">
                <a href="/website-templates">Browse Templates</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {websites?.map((website) => (
              <Card key={website.id} data-testid={`card-website-${website.id}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2" data-testid={`text-website-name-${website.id}`}>
                        <Globe className="w-5 h-5" />
                        {website.businessName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <a 
                          href={`https://${website.slug}.washbizhub.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                          data-testid={`link-subdomain-${website.id}`}
                        >
                          {website.slug}.washbizhub.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(website.status)}
                      <Badge variant="outline" data-testid={`badge-version-${website.id}`}>
                        v{website.version || 1}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="publish" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 max-w-lg" data-testid={`tabs-${website.id}`}>
                      <TabsTrigger value="publish" data-testid={`tab-publish-${website.id}`}>
                        <Rocket className="w-4 h-4 mr-1" />
                        Publish
                      </TabsTrigger>
                      <TabsTrigger value="history" data-testid={`tab-history-${website.id}`}>
                        <History className="w-4 h-4 mr-1" />
                        History
                      </TabsTrigger>
                      <TabsTrigger value="assets" data-testid={`tab-assets-${website.id}`}>
                        <Image className="w-4 h-4 mr-1" />
                        Assets
                      </TabsTrigger>
                      <TabsTrigger value="domain" data-testid={`tab-domain-${website.id}`}>
                        <Link2 className="w-4 h-4 mr-1" />
                        Domain
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="publish" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                          <Button
                            onClick={() => {
                              setSelectedWebsite(website);
                              setPreviewDialogOpen(true);
                            }}
                            variant="outline"
                            data-testid={`button-preview-${website.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          
                          {website.status === "published" ? (
                            <Button
                              onClick={() => unpublishMutation.mutate(website.id)}
                              variant="destructive"
                              disabled={unpublishMutation.isPending}
                              data-testid={`button-unpublish-${website.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Unpublish
                            </Button>
                          ) : (
                            <Button
                              onClick={() => publishMutation.mutate(website.id)}
                              disabled={publishMutation.isPending}
                              data-testid={`button-publish-${website.id}`}
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              Publish Now
                            </Button>
                          )}
                        </div>

                        {website.publishedAt && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-last-published-${website.id}`}>
                            Last published: {format(new Date(website.publishedAt), "PPpp")}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Version History</h4>
                        {(website.publishHistory as PublishHistoryItem[] | null)?.length ? (
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                              {(website.publishHistory as PublishHistoryItem[])
                                .sort((a, b) => b.version - a.version)
                                .map((item) => (
                                  <div
                                    key={item.version}
                                    className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-lg"
                                    data-testid={`history-item-${website.id}-${item.version}`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">v{item.version}</Badge>
                                        {item.note && (
                                          <span className="text-sm text-muted-foreground">{item.note}</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(item.publishedAt), "PPpp")}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => rollbackMutation.mutate({ 
                                        websiteId: website.id, 
                                        version: item.version 
                                      })}
                                      disabled={rollbackMutation.isPending}
                                      data-testid={`button-rollback-${website.id}-${item.version}`}
                                    >
                                      <Undo2 className="w-4 h-4 mr-1" />
                                      Rollback
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground" data-testid={`text-no-history-${website.id}`}>
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No publish history yet</p>
                            <p className="text-sm">Publish your website to start tracking versions</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="assets" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <h4 className="font-medium">Uploaded Assets</h4>
                          <div>
                            <input
                              type="file"
                              id={`asset-upload-${website.id}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleAssetUpload(website.id, file);
                                }
                              }}
                              data-testid={`input-asset-upload-${website.id}`}
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedWebsite(website);
                                document.getElementById(`asset-upload-${website.id}`)?.click();
                              }}
                              disabled={uploadingAsset}
                              data-testid={`button-upload-asset-${website.id}`}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingAsset ? "Uploading..." : "Upload Asset"}
                            </Button>
                          </div>
                        </div>

                        {selectedWebsite?.id === website.id && assets && assets.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assets.map((asset) => (
                              <div
                                key={asset.id}
                                className="relative group border rounded-lg p-2"
                                data-testid={`asset-item-${asset.id}`}
                              >
                                <div className="aspect-square bg-muted rounded flex items-center justify-center overflow-hidden">
                                  <img
                                    src={asset.publicUrl}
                                    alt={asset.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <p className="text-xs truncate mt-1" title={asset.name}>
                                  {asset.name}
                                </p>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteAssetMutation.mutate({ 
                                    websiteId: website.id, 
                                    assetId: asset.id 
                                  })}
                                  data-testid={`button-delete-asset-${asset.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            className="text-center py-8 text-muted-foreground cursor-pointer border-2 border-dashed rounded-lg"
                            onClick={() => {
                              setSelectedWebsite(website);
                              document.getElementById(`asset-upload-${website.id}`)?.click();
                            }}
                            data-testid={`dropzone-${website.id}`}
                          >
                            <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No assets uploaded yet</p>
                            <p className="text-sm">Click to upload images and logos</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="domain" className="mt-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Custom Domain</h4>
                        
                        {website.customDomain ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                              <div>
                                <p className="font-medium" data-testid={`text-custom-domain-${website.id}`}>
                                  {website.customDomain}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {getDomainStatusBadge(website.domainStatus)}
                                  {getSslBadge(website.sslStatus)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {website.domainStatus !== "verified" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => verifyDomainMutation.mutate(website.id)}
                                    disabled={verifyDomainMutation.isPending}
                                    data-testid={`button-verify-domain-${website.id}`}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Verify DNS
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeDomainMutation.mutate(website.id)}
                                  disabled={removeDomainMutation.isPending}
                                  data-testid={`button-remove-domain-${website.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {website.domainStatus === "pending" && website.dnsRecords && (
                              <div className="p-4 bg-muted rounded-lg">
                                <h5 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  DNS Configuration Required
                                </h5>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Add these DNS records to your domain registrar:
                                </p>
                                <div className="space-y-2 font-mono text-sm">
                                  {(website.dnsRecords as any[]).map((record: any, i: number) => (
                                    <div key={i} className="p-2 bg-background rounded">
                                      <span className="text-muted-foreground">{record.type}</span>{" "}
                                      <span>{record.name}</span> {" → "}
                                      <span className="text-primary">{record.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground mb-4">No custom domain configured</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedWebsite(website);
                                setDomainDialogOpen(true);
                              }}
                              data-testid={`button-add-domain-${website.id}`}
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Connect Custom Domain
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Website Preview</DialogTitle>
            <DialogDescription>
              Preview {selectedWebsite?.businessName} before publishing
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 border rounded-lg overflow-hidden">
            {selectedWebsite && (
              <iframe
                src={`https://${selectedWebsite.slug}.washbizhub.com`}
                className="w-full h-full"
                title="Website Preview"
                data-testid="iframe-preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            {selectedWebsite && selectedWebsite.status !== "published" && (
              <Button
                onClick={() => {
                  publishMutation.mutate(selectedWebsite.id);
                  setPreviewDialogOpen(false);
                }}
                data-testid="button-publish-from-preview"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Publish Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Enter your custom domain to connect it to {selectedWebsite?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="www.yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                data-testid="input-new-domain"
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without http:// or https://
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedWebsite && newDomain) {
                  addDomainMutation.mutate({ 
                    websiteId: selectedWebsite.id, 
                    domain: newDomain 
                  });
                }
              }}
              disabled={!newDomain || addDomainMutation.isPending}
              data-testid="button-confirm-add-domain"
            >
              Connect Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
