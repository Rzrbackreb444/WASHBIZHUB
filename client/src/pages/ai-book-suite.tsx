import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BookOpen,
  PenTool,
  Brain,
  Search,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
  Upload,
  Download,
  Send,
  Wand2,
  BookMarked,
  Lightbulb,
  Zap,
  Globe,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react";

interface ChapterOutline {
  title: string;
  description: string;
  keyPoints: string[];
  targetWordCount: number;
}

interface GeneratedChapter {
  title: string;
  content: string;
  wordCount: number;
  citations: string[];
  researchNotes: string[];
  aiModel: string;
  generatedAt: string;
}

interface AIStatus {
  status: Record<string, boolean>;
  available: number;
  total: number;
}

export default function AIBookSuite() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("write");
  
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [chapterCount, setChapterCount] = useState(10);
  const [chapters, setChapters] = useState<ChapterOutline[]>([]);
  
  const [selectedChapter, setSelectedChapter] = useState<ChapterOutline | null>(null);
  const [bookContext, setBookContext] = useState("");
  const [includeResearch, setIncludeResearch] = useState(true);
  const [autoEdit, setAutoEdit] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<GeneratedChapter | null>(null);

  const [blogId, setBlogId] = useState("");

  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ["/api/ai-book/status"],
  });

  const outlineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai-book/outline", {
        bookTitle,
        bookDescription,
        chapterCount,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setChapters(data.chapters || []);
      toast({
        title: "Outline Generated",
        description: `Created ${data.chapters?.length || 0} chapter outlines`,
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

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChapter) throw new Error("Select a chapter first");
      
      const res = await apiRequest("POST", "/api/ai-book/generate-chapter", {
        chapterTitle: selectedChapter.title,
        chapterDescription: selectedChapter.description,
        keyPoints: selectedChapter.keyPoints,
        bookContext,
        targetWordCount: selectedChapter.targetWordCount,
        includeResearch,
        editAfterGeneration: autoEdit,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Chapter Generated",
        description: `${data.wordCount} words using ${data.aiModel}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!generatedContent || !blogId) throw new Error("Missing content or blog ID");
      
      const res = await apiRequest("POST", "/api/ai-book/publish-blogger", {
        blogId,
        title: generatedContent.title,
        content: generatedContent.content,
        labels: ["book-chapter", "laundromat-industry"],
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Published to Blogger",
        description: "Chapter is now live",
      });
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Publish Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast({ title: "Copied to clipboard" });
    }
  };

  const AI_MODELS = [
    { name: "Claude", key: "claude", icon: Brain, color: "#D97706", role: "Long-form writing" },
    { name: "GPT-4", key: "openai", icon: Sparkles, color: "#10B981", role: "Editing & polish" },
    { name: "Perplexity", key: "perplexity", icon: Search, color: "#3B82F6", role: "Research & citations" },
    { name: "Grok", key: "grok", icon: Zap, color: "#8B5CF6", role: "Trending topics" },
    { name: "Gemini", key: "gemini", icon: Wand2, color: "#EC4899", role: "Data analysis" },
    { name: "Blogger", key: "blogger", icon: Globe, color: "#F97316", role: "Auto-publish" },
    { name: "Drive", key: "drive", icon: Upload, color: "#14B8A6", role: "Cloud storage" },
  ];

  return (
    <AuthGuard>
      <SEO
        title="AI Book Writing Suite | WashBizHub"
        description="Write your book with multi-AI orchestration. Claude writes, Perplexity researches, GPT-4 edits, and Blogger publishes."
        canonicalUrl="/ai-book-suite"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-[#C8A661] to-[#9A7B4F] rounded-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                AI Book Writing Suite
              </h1>
              <p className="text-white/70">Multi-AI orchestration for professional book writing</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-8">
            {AI_MODELS.map((model) => {
              const isActive = aiStatus?.status?.[model.key];
              const Icon = model.icon;
              return (
                <Card
                  key={model.key}
                  className={`p-3 ${isActive ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 opacity-50"}`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${model.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: model.color }} />
                    </div>
                    <span className="text-xs font-medium text-white">{model.name}</span>
                    <span className="text-[10px] text-white/50">{model.role}</span>
                    {isActive ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-white/20" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 mb-6">
              <TabsTrigger value="outline" className="data-[state=active]:bg-[#C8A661]">
                <BookMarked className="w-4 h-4 mr-2" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="write" className="data-[state=active]:bg-[#C8A661]">
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </TabsTrigger>
              <TabsTrigger value="publish" className="data-[state=active]:bg-[#C8A661]">
                <Send className="w-4 h-4 mr-2" />
                Publish
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outline">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-[#C8A661]" />
                      Book Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white/70">Book Title</Label>
                      <Input
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="The Laundromat Bible"
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-book-title"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Description</Label>
                      <Textarea
                        value={bookDescription}
                        onChange={(e) => setBookDescription(e.target.value)}
                        placeholder="A comprehensive guide to buying, operating, and scaling laundromat businesses..."
                        className="bg-white/10 border-white/20 text-white min-h-[120px]"
                        data-testid="input-book-description"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Number of Chapters</Label>
                      <Input
                        type="number"
                        value={chapterCount}
                        onChange={(e) => setChapterCount(parseInt(e.target.value) || 10)}
                        min={3}
                        max={30}
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-chapter-count"
                      />
                    </div>
                    <Button
                      onClick={() => outlineMutation.mutate()}
                      disabled={outlineMutation.isPending || !bookTitle}
                      className="w-full bg-[#C8A661] hover:bg-[#b89551]"
                      data-testid="button-generate-outline"
                    >
                      {outlineMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Generate Outline with Claude
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#C8A661]" />
                      Chapter Outline
                      {chapters.length > 0 && (
                        <Badge className="ml-2 bg-[#C8A661]">{chapters.length} chapters</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {chapters.length === 0 ? (
                        <div className="text-center text-white/50 py-12">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Generate an outline to see chapters</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {chapters.map((chapter, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedChapter(chapter);
                                setActiveTab("write");
                              }}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedChapter?.title === chapter.title
                                  ? "bg-[#C8A661]/20 border-[#C8A661]"
                                  : "bg-white/5 border-white/10 hover:border-white/30"
                              }`}
                              data-testid={`chapter-${i}`}
                            >
                              <h4 className="font-medium text-white mb-1">{chapter.title}</h4>
                              <p className="text-sm text-white/60 mb-2">{chapter.description}</p>
                              <div className="flex items-center gap-2 text-xs text-white/40">
                                <Badge variant="outline" className="text-white/50 border-white/20">
                                  {chapter.keyPoints?.length || 0} points
                                </Badge>
                                <Badge variant="outline" className="text-white/50 border-white/20">
                                  ~{chapter.targetWordCount} words
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="write">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-[#C8A661]" />
                      Write Chapter
                    </CardTitle>
                    <CardDescription className="text-white/50">
                      {selectedChapter ? selectedChapter.title : "Select a chapter from the outline"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white/70">Book Context (Optional)</Label>
                      <Textarea
                        value={bookContext}
                        onChange={(e) => setBookContext(e.target.value)}
                        placeholder="Add any context about your book's style, audience, or specific requirements..."
                        className="bg-white/10 border-white/20 text-white min-h-[100px]"
                        data-testid="input-book-context"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white/70">Research with Perplexity</span>
                      </div>
                      <Switch
                        checked={includeResearch}
                        onCheckedChange={setIncludeResearch}
                        data-testid="switch-research"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white/70">Polish with GPT-4</span>
                      </div>
                      <Switch
                        checked={autoEdit}
                        onCheckedChange={setAutoEdit}
                        data-testid="switch-edit"
                      />
                    </div>

                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending || !selectedChapter}
                      className="w-full bg-gradient-to-r from-[#C8A661] to-[#9A7B4F]"
                      size="lg"
                      data-testid="button-generate-chapter"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Chapter
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#C8A661]" />
                        Generated Content
                      </CardTitle>
                      {generatedContent && (
                        <CardDescription className="text-white/50">
                          {generatedContent.wordCount} words | {generatedContent.aiModel}
                        </CardDescription>
                      )}
                    </div>
                    {generatedContent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyToClipboard}
                        className="text-white/50 hover:text-white"
                        data-testid="button-copy"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {generateMutation.isPending ? (
                        <div className="text-center py-12">
                          <div className="space-y-4">
                            <Brain className="w-12 h-12 mx-auto text-[#C8A661] animate-pulse" />
                            <div className="space-y-2 text-white/70">
                              {includeResearch && <p className="flex items-center justify-center gap-2"><Search className="w-4 h-4 text-blue-400" /> Researching with Perplexity...</p>}
                              <p className="flex items-center justify-center gap-2"><Brain className="w-4 h-4 text-orange-400" /> Writing with Claude...</p>
                              {autoEdit && <p className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-green-400" /> Polishing with GPT-4...</p>}
                            </div>
                          </div>
                        </div>
                      ) : generatedContent ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                            {generatedContent.content}
                          </div>
                          {generatedContent.citations.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                              <h4 className="text-sm font-medium text-white/70 mb-2">Citations</h4>
                              <ul className="text-xs text-white/50 space-y-1">
                                {generatedContent.citations.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-white/50 py-12">
                          <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Generate a chapter to see content</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="publish">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#C8A661]" />
                      Publish to Blogger
                    </CardTitle>
                    <CardDescription className="text-white/50">
                      Auto-publish chapters to your Google Blog for SEO
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white/70">Blogger Blog ID</Label>
                      <Input
                        value={blogId}
                        onChange={(e) => setBlogId(e.target.value)}
                        placeholder="Enter your Blogger blog ID"
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-blog-id"
                      />
                      <p className="text-xs text-white/40 mt-1">
                        Find this in your Blogger dashboard URL
                      </p>
                    </div>

                    {generatedContent && (
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Ready to Publish:</h4>
                        <p className="text-sm text-white/70">{generatedContent.title}</p>
                        <p className="text-xs text-white/50">{generatedContent.wordCount} words</p>
                      </div>
                    )}

                    <Button
                      onClick={() => publishMutation.mutate()}
                      disabled={publishMutation.isPending || !generatedContent || !blogId}
                      className="w-full bg-[#C8A661] hover:bg-[#b89551]"
                      data-testid="button-publish"
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Publish to Blogger
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="w-5 h-5 text-[#C8A661]" />
                      Export Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={() => {
                        if (generatedContent) {
                          const blob = new Blob([generatedContent.content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${generatedContent.title.replace(/\s+/g, "-")}.txt`;
                          a.click();
                        }
                      }}
                      disabled={!generatedContent}
                      data-testid="button-download-txt"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download as Text
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                      onClick={copyToClipboard}
                      disabled={!generatedContent}
                      data-testid="button-copy-content"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </Button>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-white/50 mb-3">Coming Soon:</p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-white/40 border-white/20">
                          Save to Google Drive
                        </Badge>
                        <Badge variant="outline" className="text-white/40 border-white/20">
                          Export as PDF
                        </Badge>
                        <Badge variant="outline" className="text-white/40 border-white/20">
                          Export as DOCX
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
