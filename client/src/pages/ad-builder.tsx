import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasBannerEditor } from '@/components/ad-builder/CanvasBannerEditor';
import { Zap, SquareIcon, Copy } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from "@/components/AuthGuard";

export default function AdBuilder() {
  const [activeTemplate, setActiveTemplate] = useState<'horizontal' | 'vertical' | 'square'>('horizontal');
  const { toast } = useToast();

  const handleSave = (design: any) => {
    console.log('Saving design:', design);
    toast({
      title: 'Design Saved',
      description: 'Your banner design has been saved successfully.',
    });
  };

  return (
    <AuthGuard title="Sign In to Build Ads" description="Sign in to access this tool.">
      <SEO
        title="Ad Banner Builder | Canva-Style Editor | WashBizHub"
        description="Create professional ad banners with drag-and-drop logo and text placement. No design experience needed."
        canonicalUrl="/ad-builder"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Ad Banner Builder</h1>
            </div>
            <p className="text-slate-300">Canva-style editor • Drag & drop logos & text • Export instantly</p>
          </div>
        </div>

        {/* Templates Selection */}
        <div className="bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <p className="text-sm font-semibold mb-4">Select Template Size</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer hover-elevate ${activeTemplate === 'horizontal' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveTemplate('horizontal')}
                data-testid="card-template-horizontal"
              >
                <CardContent className="pt-6">
                  <div className="aspect-video bg-slate-100 rounded mb-3 flex items-center justify-center text-muted-foreground">
                    <svg className="w-12 h-6" viewBox="0 0 120 30" fill="currentColor">
                      <rect width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <p className="font-semibold text-sm">Horizontal</p>
                  <p className="text-xs text-muted-foreground">1200 × 300 px</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer hover-elevate ${activeTemplate === 'vertical' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveTemplate('vertical')}
                data-testid="card-template-vertical"
              >
                <CardContent className="pt-6">
                  <div className="aspect-[3/6] bg-slate-100 rounded mb-3 flex items-center justify-center text-muted-foreground">
                    <svg className="w-6 h-12" viewBox="0 0 30 120" fill="currentColor">
                      <rect width="30" height="120" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <p className="font-semibold text-sm">Vertical</p>
                  <p className="text-xs text-muted-foreground">300 × 600 px</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer hover-elevate ${activeTemplate === 'square' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveTemplate('square')}
                data-testid="card-template-square"
              >
                <CardContent className="pt-6">
                  <div className="aspect-square bg-slate-100 rounded mb-3 flex items-center justify-center text-muted-foreground">
                    <svg className="w-12 h-12" viewBox="0 0 50 50" fill="currentColor">
                      <rect width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <p className="font-semibold text-sm">Square</p>
                  <p className="text-xs text-muted-foreground">500 × 500 px</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <CanvasBannerEditor 
            templateType={activeTemplate} 
            onSave={handleSave}
          />
        </div>

        {/* Tips */}
        <div className="max-w-7xl mx-auto px-6 py-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Pro Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Logo Placement</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Place your logo in the top-left or center for maximum brand visibility. Keep at least 10px padding from edges.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Text Hierarchy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Use large, bold text for headlines (24-36px) and smaller text for supporting copy (12-16px).
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Color Contrast</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ensure text is readable against your background. Test with at least 4.5:1 contrast ratio.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
