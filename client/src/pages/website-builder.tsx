import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DroppableCanvas } from "@/components/website-builder/DroppableCanvas";
import { SEOPanel } from "@/components/website-builder/SEOPanel";
import type { Block } from "@/components/website-builder/DroppableCanvas";
import {
  Globe, Plus, Layout, Palette, Search, Eye, Code, Zap,
  Sparkles, TrendingUp, FileText, Image as ImageIcon, Type,
  Settings, Save, ExternalLink
} from "lucide-react";

interface SiteProject {
  id: string;
  name: string;
  subdomain: string | null;
  customDomain: string | null;
  theme: string;
  primaryColor: string;
  isPublished: boolean;
  siteTitle: string | null;
  totalViews: number;
}

const BLOCK_LIBRARY = [
  {
    id: 'hero',
    category: 'Hero Sections',
    name: 'Modern Hero',
    icon: Layout,
    preview: 'Full-width hero with headline, subtext, and CTA buttons',
  },
  {
    id: 'features',
    category: 'Features',
    name: 'Feature Grid',
    icon: Sparkles,
    preview: '3-column feature showcase with icons',
  },
  {
    id: 'testimonials',
    category: 'Social Proof',
    name: 'Customer Reviews',
    icon: FileText,
    preview: 'Rotating testimonial cards with photos',
  },
  {
    id: 'cta',
    category: 'Calls to Action',
    name: 'Pricing CTA',
    icon: TrendingUp,
    preview: 'Bold call-to-action with pricing emphasis',
  },
  {
    id: 'gallery',
    category: 'Media',
    name: 'Image Gallery',
    icon: ImageIcon,
    preview: 'Responsive image grid with lightbox',
  },
  {
    id: 'text',
    category: 'Content',
    name: 'Rich Text',
    icon: Type,
    preview: 'Formatted text block with headings',
  },
];

export default function WebsiteBuilder() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<SiteProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch user's website projects
  const { data: projects = [], isLoading } = useQuery<SiteProject[]>({
    queryKey: ['/api/websites'],
  });

  // Create new site mutation
  const createSiteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/websites', {
        name: newSiteName,
        subdomain: newSubdomain,
        theme: 'modern',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast({
        title: "Website Created!",
        description: `${newSiteName} is ready to customize.`,
      });
      setIsCreating(false);
      setNewSiteName('');
      setNewSubdomain('');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSite = () => {
    if (!newSiteName || !newSubdomain) {
      toast({
        title: "Missing Information",
        description: "Please provide both site name and subdomain",
        variant: "destructive",
      });
      return;
    }
    createSiteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your websites...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Website Builder - Build Your Laundromat Website in Minutes"
        description="Drag-and-drop website builder for laundromat businesses. Professional templates, automatic SEO optimization, Google Business Profile integration, and instant publishing. No coding required."
        canonicalUrl="/website-builder"
        keywords={[
          "laundromat website builder",
          "small business website creator",
          "drag and drop website builder",
          "SEO optimized websites",
          "no-code website builder",
          "laundry business website",
          "professional website templates"
        ]}
        breadcrumbs={[
          { name: "Website Builder", url: "/website-builder" }
        ]}
        author={{
          name: "WashBizHub Web Team",
          expertise: "Website Design & SEO Automation",
          credentials: "Helping 1000+ laundromats build high-converting websites"
        }}
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[{ name: "Website Builder", url: "/website-builder" }]} />
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Zap className="w-3 h-3 mr-1" />
                WYSIWYG Website Builder
              </Badge>
              <h1 className="text-5xl font-bold text-white mb-4 uppercase tracking-tight">
                Build Your Website
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Professional websites with automatic SEO, drag-and-drop editing, and instant publishing
              </p>
            </motion.div>
          </div>

          {selectedProject ? (
            /* WYSIWYG Editor View */
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Block Library Sidebar */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Layout className="w-4 h-4" />
                    Content Blocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {Object.entries(
                        BLOCK_LIBRARY.reduce((acc, block) => {
                          if (!acc[block.category]) acc[block.category] = [];
                          acc[block.category].push(block);
                          return acc;
                        }, {} as Record<string, typeof BLOCK_LIBRARY>)
                      ).map(([category, blocks]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {blocks.map((block) => (
                              <motion.div
                                key={block.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer border border-border hover:border-primary/50 transition-all"
                                data-testid={`block-${block.id}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <block.icon className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">{block.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{block.preview}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Canvas */}
              <div className="lg:col-span-2">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      {selectedProject.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid="button-preview">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-primary hover-elevate active-elevate-2" data-testid="button-publish">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DroppableCanvas
                      projectId={selectedProject.id}
                      onBlocksChange={(newBlocks) => {
                        setBlocks(newBlocks);
                        toast({
                          title: "Changes Saved",
                          description: "Your page has been updated",
                        });
                      }}
                      onAISuggest={() => {
                        toast({
                          title: "AI Suggestions",
                          description: "Analyzing your content to suggest improvements...",
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Settings Sidebar */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4" />
                    Site Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="design">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="design">Design</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="design" className="space-y-4">
                      <div>
                        <Label>Theme</Label>
                        <Select defaultValue={selectedProject.theme}>
                          <SelectTrigger data-testid="select-theme">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            defaultValue={selectedProject.primaryColor}
                            className="w-16 h-10"
                            data-testid="input-primary-color"
                          />
                          <Input 
                            value={selectedProject.primaryColor}
                            readOnly
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Domain</Label>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedProject.subdomain ? (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {selectedProject.subdomain}.washbizhub.com
                            </span>
                          ) : (
                            <span>No subdomain set</span>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="seo" className="h-[600px] p-0">
                      <SEOPanel
                        pageTitle={selectedProject.siteTitle || selectedProject.name}
                        pageId={selectedProject.id}
                        blocks={blocks}
                        onUpdate={(seoData) => {
                          console.log("SEO data updated:", seoData);
                          toast({
                            title: "SEO Updated",
                            description: "Your SEO settings have been saved",
                          });
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Project Selection View */
            <div className="space-y-6">
              {/* Create New Site */}
              {isCreating ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle>Create New Website</CardTitle>
                      <CardDescription>
                        Enter your site details to get started
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Site Name</Label>
                        <Input
                          value={newSiteName}
                          onChange={(e) => setNewSiteName(e.target.value)}
                          placeholder="My Laundromat"
                          data-testid="input-site-name"
                        />
                      </div>
                      <div>
                        <Label>Subdomain</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newSubdomain}
                            onChange={(e) => setNewSubdomain(e.target.value)}
                            placeholder="mylaundromat"
                            data-testid="input-subdomain"
                          />
                          <span className="flex items-center text-muted-foreground text-sm">
                            .washbizhub.com
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateSite} className="flex-1" data-testid="button-create-site">
                          <Save className="w-4 h-4 mr-2" />
                          Create Site
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreating(false)} data-testid="button-cancel">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Button 
                  onClick={() => setIsCreating(true)} 
                  className="w-full bg-primary hover-elevate active-elevate-2"
                  data-testid="button-new-website"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Website
                </Button>
              )}

              {/* Existing Projects */}
              {projects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Your Websites</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.02 }}
                        data-testid={`project-card-${project.id}`}
                      >
                        <Card 
                          className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover-elevate"
                          onClick={() => setSelectedProject(project)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              {project.isPublished && (
                                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Live
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-1 text-xs">
                              <Globe className="w-3 h-3" />
                              {project.subdomain || project.customDomain || 'No domain'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{project.totalViews} views</span>
                              <span className="capitalize">{project.theme}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
