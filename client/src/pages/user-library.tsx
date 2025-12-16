import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Download, Crown, BookOpen, Calculator, 
  GraduationCap, Clock, CheckCircle, Search, Library,
  Folder, Star, TrendingUp, Calendar, ArrowRight,
  Lock, PlayCircle, FileCheck, Settings, ExternalLink
} from "lucide-react";

interface LibraryItem {
  id: string;
  type: "template" | "calculator" | "course";
  name: string;
  description?: string;
  category?: string;
  tier?: string;
  lastAccessed?: string;
  progress?: number;
  downloadCount?: number;
  slug?: string;
  route: string;
  icon: typeof FileText;
}

export default function UserLibrary() {
  const { user, isAuthenticated } = useAuth();
  const { tier: currentTier, canAccessTier } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch user's library data
  const { data: libraryData, isLoading } = useQuery({
    queryKey: ["/api/vault/my-library"],
    enabled: isAuthenticated,
  });

  // Fetch user's course enrollments
  const { data: coursesData } = useQuery({
    queryKey: ["/api/courses/my-enrollments"],
    enabled: isAuthenticated,
  });

  // Fetch saved calculator scenarios
  const { data: calculatorsData } = useQuery({
    queryKey: ["/api/calculator-scenarios"],
    enabled: isAuthenticated,
  });

  // Session restoration from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("washbizhub_library_session");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.activeTab) setActiveTab(session.activeTab);
        if (session.searchQuery) setSearchQuery(session.searchQuery);
      } catch (e) {}
    }
  }, []);

  // Save session on changes
  useEffect(() => {
    localStorage.setItem("washbizhub_library_session", JSON.stringify({
      activeTab,
      searchQuery,
      lastVisited: new Date().toISOString(),
    }));
  }, [activeTab, searchQuery]);

  // Combine all library items
  const templates = libraryData?.library?.subscriptionTemplates || [];
  const purchasedTemplates = libraryData?.library?.purchasedTemplates || [];
  const courses = coursesData?.enrollments || [];
  const calculators = calculatorsData?.scenarios || [];

  const allItems: LibraryItem[] = [
    ...templates.map((t: any) => ({
      id: t.id,
      type: "template" as const,
      name: t.name,
      description: t.description,
      category: t.category,
      tier: t.tier,
      slug: t.slug,
      route: `/vault/${t.slug}`,
      icon: FileText,
    })),
    ...purchasedTemplates.map((t: any) => ({
      id: t.id,
      type: "template" as const,
      name: t.name,
      description: t.description,
      category: t.category,
      tier: "purchased",
      slug: t.slug,
      route: `/vault/${t.slug}`,
      downloadCount: t.downloadCount,
      icon: FileCheck,
    })),
    ...courses.map((c: any) => ({
      id: c.id,
      type: "course" as const,
      name: c.course?.title || c.title,
      description: c.course?.description,
      progress: c.progressPercent || 0,
      lastAccessed: c.lastAccessedAt,
      route: `/learn/${c.courseSlug || c.course?.slug}`,
      icon: GraduationCap,
    })),
    ...calculators.map((c: any) => ({
      id: c.id,
      type: "calculator" as const,
      name: c.name,
      description: `${c.calculatorType} - Saved ${new Date(c.createdAt).toLocaleDateString()}`,
      lastAccessed: c.updatedAt,
      route: `/calculators/${c.calculatorType}?scenario=${c.id}`,
      icon: Calculator,
    })),
  ];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const templateCount = templates.length + purchasedTemplates.length;
  const courseCount = courses.length;
  const calculatorCount = calculators.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Library className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Your Library Awaits</CardTitle>
            <CardDescription>
              Sign in to access your templates, courses, and saved calculators
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button className="gap-2" data-testid="button-login-library">
                Sign In to Access
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Library - Templates, Courses & Calculators | WashBizHub</title>
        <meta 
          name="description" 
          content="Access your purchased templates, enrolled courses, and saved calculator scenarios. Your complete laundromat resource library." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Library className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold" data-testid="text-library-title">
                    My Library
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Your complete collection of templates, courses, and saved tools
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1 py-1.5 px-3">
                  <Crown className="w-4 h-4 text-primary" />
                  {currentTier?.toUpperCase() || "FREE"} Plan
                </Badge>
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-background/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{templateCount}</p>
                      <p className="text-xs text-muted-foreground">Templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <GraduationCap className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{courseCount}</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Calculator className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{calculatorCount}</p>
                      <p className="text-xs text-muted-foreground">Saved Calcs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{allItems.length}</p>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-library"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="all" className="gap-1" data-testid="tab-all">
                <Folder className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="template" className="gap-1" data-testid="tab-templates">
                <FileText className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="course" className="gap-1" data-testid="tab-courses">
                <GraduationCap className="w-4 h-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-1" data-testid="tab-calculators">
                <Calculator className="w-4 h-4" />
                Calcs
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="mx-auto p-4 rounded-full bg-muted w-fit mb-4">
                      <Folder className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No items found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Try a different search term" 
                        : "Start building your library by exploring our templates and courses"
                      }
                    </p>
                    <div className="flex justify-center gap-3">
                      <Link href="/template-vault">
                        <Button variant="outline" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Browse Templates
                        </Button>
                      </Link>
                      <Link href="/learn">
                        <Button variant="outline" className="gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Browse Courses
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => {
                    const ItemIcon = item.icon;
                    
                    return (
                      <Card 
                        key={`${item.type}-${item.id}`} 
                        className="hover-elevate transition-all"
                        data-testid={`card-library-${item.type}-${item.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`p-2 rounded-lg ${
                              item.type === "template" ? "bg-blue-500/10" :
                              item.type === "course" ? "bg-purple-500/10" :
                              "bg-green-500/10"
                            }`}>
                              <ItemIcon className={`w-5 h-5 ${
                                item.type === "template" ? "text-blue-500" :
                                item.type === "course" ? "text-purple-500" :
                                "text-green-500"
                              }`} />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {item.type === "template" && (item.tier === "purchased" ? "Purchased" : item.tier?.toUpperCase())}
                              {item.type === "course" && "Course"}
                              {item.type === "calculator" && "Saved"}
                            </Badge>
                          </div>
                          <CardTitle className="text-base mt-3">{item.name}</CardTitle>
                          {item.description && (
                            <CardDescription className="text-sm line-clamp-2">
                              {item.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        {item.type === "course" && item.progress !== undefined && (
                          <CardContent className="pb-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                            </div>
                          </CardContent>
                        )}
                        
                        {item.downloadCount !== undefined && (
                          <CardContent className="pb-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Download className="w-3 h-3" />
                              Downloaded {item.downloadCount} times
                            </div>
                          </CardContent>
                        )}
                        
                        <CardFooter className="pt-3 border-t">
                          <Link href={item.route} className="w-full">
                            <Button className="w-full gap-2" variant="outline">
                              {item.type === "template" && (
                                <>
                                  <Download className="w-4 h-4" />
                                  Download
                                </>
                              )}
                              {item.type === "course" && (
                                <>
                                  <PlayCircle className="w-4 h-4" />
                                  Continue
                                </>
                              )}
                              {item.type === "calculator" && (
                                <>
                                  <ExternalLink className="w-4 h-4" />
                                  Open
                                </>
                              )}
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Retention Notice */}
          {libraryData?.library?.retentionPolicy && (
            <Card className="mt-8 bg-amber-500/5 border-amber-500/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Data Retention Policy</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {libraryData.library.retentionPolicy.description}. 
                      After this period, templates will need to be re-purchased.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Link href="/template-vault">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="py-6 text-center">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium">Template Vault</p>
                  <p className="text-xs text-muted-foreground">Browse all templates</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/learn">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="py-6 text-center">
                  <GraduationCap className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium">Learning Center</p>
                  <p className="text-xs text-muted-foreground">Explore courses</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculators">
              <Card className="hover-elevate cursor-pointer h-full">
                <CardContent className="py-6 text-center">
                  <Calculator className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium">Calculator Suite</p>
                  <p className="text-xs text-muted-foreground">Financial tools</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
