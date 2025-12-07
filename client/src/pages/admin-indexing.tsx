import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Search, Globe, FileText, ExternalLink, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";

interface IndexingResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results?: Array<{ url: string; success: boolean; message: string }>;
  engine?: string;
  engines?: string[];
  error?: string;
}

interface MassIndexingResult {
  success: boolean;
  message: string;
  totalUrls: number;
  breakdown: {
    staticPages: number;
    errorCodes: number;
    blogPosts: number;
    listings: number;
  };
  google: {
    submitted: number;
    success: number;
    failed: number;
    note: string;
    errors: string[];
  };
  indexNow: {
    submitted: number;
    engines: string[];
  };
  error?: string;
}

export default function AdminIndexing() {
  const { toast } = useToast();
  const [indexNowResult, setIndexNowResult] = useState<IndexingResult | null>(null);
  const [googleResult, setGoogleResult] = useState<IndexingResult | null>(null);
  const [massIndexResult, setMassIndexResult] = useState<MassIndexingResult | null>(null);

  // Mass Index All Engines mutation
  const massIndexMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/index-all-engines");
      return await res.json() as MassIndexingResult;
    },
    onSuccess: (data) => {
      setMassIndexResult(data);
      if (data.success) {
        toast({
          title: "Mass Indexing Complete!",
          description: `Submitted ${data.totalUrls} URLs to Google, Bing, Yandex & DuckDuckGo`,
        });
      } else {
        toast({
          title: "Mass Indexing Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Mass Indexing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const indexNowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/indexnow-all");
      return await res.json() as IndexingResult;
    },
    onSuccess: (data) => {
      setIndexNowResult(data);
      if (data.success) {
        toast({
          title: "IndexNow Submission Complete",
          description: `Successfully submitted ${data.succeeded}/${data.total} URLs to 4 search engines`,
        });
      } else {
        toast({
          title: "IndexNow Submission Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "IndexNow Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/index-all");
      return await res.json() as IndexingResult;
    },
    onSuccess: (data) => {
      setGoogleResult(data);
      if (data.success) {
        toast({
          title: "Google Indexing Complete",
          description: `Successfully submitted ${data.succeeded}/${data.total} URLs to Google`,
        });
      } else {
        toast({
          title: "Google Indexing Failed",
          description: data.error || "OAuth2 credentials not configured",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Google Indexing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Search Engine Indexing - Admin - WashBizHub</title>
        <meta name="description" content="Manage search engine indexing for all WashBizHub pages" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Engine Indexing</h1>
          <p className="text-muted-foreground">
            Submit your sitemap URLs to search engines for faster indexing
          </p>
        </div>

        {/* Mass Index All Engines - Featured Card */}
        <Card className="mb-8 border-2 border-[#C8A661] bg-gradient-to-r from-[#C8A661]/10 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-[#C8A661]" />
                Mass Index All Engines
              </CardTitle>
              <Badge className="bg-[#C8A661] text-white">Recommended</Badge>
            </div>
            <CardDescription className="text-base">
              Submit ALL URLs to Google, Bing, Yandex & DuckDuckGo in one click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-background border" data-testid="stat-static-pages">
                <div className="text-2xl font-bold text-[#C8A661]">35+</div>
                <div className="text-muted-foreground">Static Pages</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border" data-testid="stat-error-codes">
                <div className="text-2xl font-bold text-[#C8A661]">2,500+</div>
                <div className="text-muted-foreground">Error Codes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border" data-testid="stat-blog-posts">
                <div className="text-2xl font-bold text-[#C8A661]">All</div>
                <div className="text-muted-foreground">Blog Posts</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border" data-testid="stat-listings">
                <div className="text-2xl font-bold text-[#C8A661]">All</div>
                <div className="text-muted-foreground">Listings</div>
              </div>
            </div>

            {massIndexResult && (
              <div className="p-4 rounded-lg bg-muted space-y-3" data-testid="mass-index-result">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Mass Index:</span>
                  {massIndexResult.success ? (
                    <Badge variant="default" data-testid="badge-mass-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive" data-testid="badge-mass-failed">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div data-testid="text-mass-total">
                    <span className="text-muted-foreground">Total URLs:</span>{" "}
                    <span className="font-medium">{massIndexResult.totalUrls}</span>
                  </div>
                  <div data-testid="text-mass-google">
                    <span className="text-muted-foreground">Google:</span>{" "}
                    <span className="font-medium">{massIndexResult.google?.success || 0} success</span>
                  </div>
                  <div data-testid="text-mass-indexnow">
                    <span className="text-muted-foreground">IndexNow:</span>{" "}
                    <span className="font-medium">{massIndexResult.indexNow?.submitted || 0} submitted</span>
                  </div>
                  <div data-testid="text-mass-engines">
                    <span className="text-muted-foreground">Engines:</span>{" "}
                    <span className="font-medium">5 total</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => massIndexMutation.mutate()}
              disabled={massIndexMutation.isPending}
              size="lg"
              className="w-full bg-[#C8A661] hover:bg-[#b8963d] text-white font-semibold text-lg h-14"
              data-testid="button-mass-index-all"
            >
              {massIndexMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting to All Engines...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Index Everything Now
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Submits to Google Indexing API + IndexNow (Bing, Yandex, DuckDuckGo)
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* IndexNow Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  IndexNow
                </CardTitle>
                <Badge variant="default">Ready</Badge>
              </div>
              <CardDescription>
                Submit to Bing, Yahoo, Yandex, DuckDuckGo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm" data-testid="info-indexnow-engines">
                  <span className="text-muted-foreground">Search Engines:</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex items-center justify-between text-sm" data-testid="info-indexnow-rate-limit">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="font-medium">Unlimited</span>
                </div>
                <div className="flex items-center justify-between text-sm" data-testid="info-indexnow-setup">
                  <span className="text-muted-foreground">Setup Required:</span>
                  <Badge variant="default" className="text-xs" data-testid="badge-indexnow-setup-status">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              </div>

              {indexNowResult && (
                <div className="p-4 rounded-lg bg-muted space-y-2" data-testid="indexnow-result">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Submission:</span>
                    {indexNowResult.success ? (
                      <Badge variant="default" data-testid="badge-indexnow-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" data-testid="badge-indexnow-failed">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid="text-indexnow-stats">
                    {indexNowResult.succeeded}/{indexNowResult.total} URLs submitted
                  </div>
                </div>
              )}

              <Button
                onClick={() => indexNowMutation.mutate()}
                disabled={indexNowMutation.isPending}
                className="w-full"
                data-testid="button-submit-indexnow"
              >
                {indexNowMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Submit All URLs
                  </>
                )}
              </Button>

              <a
                href="/INDEXNOW_README.md"
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                data-testid="link-indexnow-docs"
              >
                <FileText className="h-4 w-4" />
                View Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          {/* Google Indexing API Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Google Indexing API
                </CardTitle>
                <Badge variant="secondary">OAuth2</Badge>
              </div>
              <CardDescription>
                Direct submission to Google Search Console
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm" data-testid="info-google-engines">
                  <span className="text-muted-foreground">Search Engines:</span>
                  <span className="font-medium">1 (Google)</span>
                </div>
                <div className="flex items-center justify-between text-sm" data-testid="info-google-rate-limit">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="font-medium">200/day</span>
                </div>
                <div className="flex items-center justify-between text-sm" data-testid="info-google-setup">
                  <span className="text-muted-foreground">Setup Required:</span>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-google-setup-status">
                    OAuth2 Credentials
                  </Badge>
                </div>
              </div>

              {googleResult && (
                <div className="p-4 rounded-lg bg-muted space-y-2" data-testid="google-result">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Submission:</span>
                    {googleResult.success ? (
                      <Badge variant="default" data-testid="badge-google-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" data-testid="badge-google-failed">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid="text-google-stats">
                    {googleResult.error || `${googleResult.succeeded}/${googleResult.total} URLs submitted`}
                  </div>
                </div>
              )}

              <Button
                onClick={() => googleMutation.mutate()}
                disabled={googleMutation.isPending}
                variant="outline"
                className="w-full"
                data-testid="button-submit-google"
              >
                {googleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Submit All URLs
                  </>
                )}
              </Button>

              <a
                href="/GOOGLE_OAUTH2_SETUP.md"
                target="_blank"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                data-testid="link-google-setup"
              >
                <FileText className="h-4 w-4" />
                Setup Instructions
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
            <CardDescription>
              Setup guides and technical documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="link-sitemap"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Sitemap</div>
                  <div className="text-xs text-muted-foreground">sitemap.xml</div>
                </div>
              </a>

              <a
                href="/INDEXNOW_README.md"
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="link-indexnow-docs-resource"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">IndexNow Guide</div>
                  <div className="text-xs text-muted-foreground">Quick start</div>
                </div>
              </a>

              <a
                href="/GOOGLE_OAUTH2_SETUP.md"
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="link-google-docs"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Google Setup</div>
                  <div className="text-xs text-muted-foreground">OAuth2 guide</div>
                </div>
              </a>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Quick Stats</h4>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="p-3 rounded-lg bg-muted" data-testid="stat-total-urls">
                  <div className="text-2xl font-bold">40</div>
                  <div className="text-xs text-muted-foreground">Total URLs</div>
                </div>
                <div className="p-3 rounded-lg bg-muted" data-testid="stat-search-engines">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">Search Engines</div>
                </div>
                <div className="p-3 rounded-lg bg-muted" data-testid="stat-indexnow-success">
                  <div className="text-2xl font-bold">
                    {indexNowResult ? indexNowResult.succeeded : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">IndexNow Success</div>
                </div>
                <div className="p-3 rounded-lg bg-muted" data-testid="stat-google-success">
                  <div className="text-2xl font-bold">
                    {googleResult ? googleResult.succeeded : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">Google Success</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>IndexNow:</strong> Submit immediately when you publish new content (no rate limits!)
            </p>
            <p>
              • <strong>Google API:</strong> Limited to 200 URLs/day - use for priority pages only
            </p>
            <p>
              • <strong>Timing:</strong> Allow 24-48 hours for search engines to crawl and index
            </p>
            <p>
              • <strong>Monitoring:</strong> Check Bing Webmaster Tools and Google Search Console for indexing status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
