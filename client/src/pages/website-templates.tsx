import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Rocket, Star, Users, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WebsiteTemplate } from "@shared/schema";

export default function WebsiteTemplatesPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  
  // Fetch templates
  const { data: templates, isLoading } = useQuery<WebsiteTemplate[]>({
    queryKey: ["/api/website-templates", industry === "all" ? undefined : industry],
  });

  // Deploy from template mutation
  const deployMutation = useMutation({
    mutationFn: async (data: { templateId: string; businessName: string; subdomain: string }) => {
      const response = await fetch("/api/websites/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Website Created!",
        description: `Your website is ready at ${subdomain}.washbizhub.com`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      setDeployDialogOpen(false);
      setBusinessName("");
      setSubdomain("");
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeploy = (template: WebsiteTemplate) => {
    setSelectedTemplate(template);
    setDeployDialogOpen(true);
  };

  const handleSubmitDeploy = () => {
    if (!selectedTemplate || !businessName || !subdomain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    deployMutation.mutate({
      templateId: selectedTemplate.id,
      businessName,
      subdomain,
    });
  };

  const filteredTemplates = templates?.filter((t) => 
    industry === "all" || t.industry === industry
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Professional Website Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Launch your laundromat website in minutes. Choose a template, customize it, and deploy to your own subdomain instantly.
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={industry} onValueChange={setIndustry} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4" data-testid="tabs-template-industry">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="laundromat" data-testid="tab-laundromat">Laundromat</TabsTrigger>
            <TabsTrigger value="car_wash" data-testid="tab-car-wash">Car Wash</TabsTrigger>
            <TabsTrigger value="dry_cleaner" data-testid="tab-dry-cleaner">Dry Cleaner</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates?.map((template) => (
              <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
                {/* Preview Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900 dark:to-slate-900 rounded-t-lg overflow-hidden">
                  <img 
                    src={template.previewImage} 
                    alt={template.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {template.isPro && (
                      <Badge className="bg-yellow-500 text-slate-900" data-testid="badge-pro">
                        PRO
                      </Badge>
                    )}
                    <Badge variant="secondary" data-testid={`badge-usecount-${template.id}`}>
                      <Users className="w-3 h-3 mr-1" />
                      {template.useCount}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-foreground text-xl" data-testid={`text-template-name-${template.id}`}>
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground" data-testid={`text-template-description-${template.id}`}>
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(template.features as string[]).slice(0, 4).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs" data-testid={`badge-feature-${idx}`}>
                        <Check className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{template.rating || "5.0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{(template.pages as any[])?.length || 3} pages</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  {template.demoUrl && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => template.demoUrl && window.open(template.demoUrl, "_blank")}
                      data-testid={`button-preview-${template.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                  <Button 
                    className="flex-1"
                    onClick={() => handleDeploy(template)}
                    disabled={template.isPro || false}
                    data-testid={`button-deploy-${template.id}`}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {template.isPro ? "Pro Only" : "Deploy"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* No templates found */}
        {!isLoading && filteredTemplates?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No templates found for this category.</p>
          </div>
        )}
      </div>

      {/* Deploy Dialog */}
      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-deploy-dialog-title">Deploy {selectedTemplate?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Customize your website and deploy it to a custom subdomain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Clean & Fresh Laundry"
                data-testid="input-business-name"
              />
            </div>

            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="clean-fresh"
                  data-testid="input-subdomain"
                />
                <span className="text-muted-foreground whitespace-nowrap">.washbizhub.com</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your website will be available at: {subdomain || "your-domain"}.washbizhub.com
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeployDialogOpen(false)}
              data-testid="button-cancel-deploy"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitDeploy}
              disabled={deployMutation.isPending}
              data-testid="button-confirm-deploy"
            >
              {deployMutation.isPending ? "Deploying..." : "Deploy Website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
