import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ContentEditable from "react-contenteditable";
import {
  BookOpen, PenTool, Brain, Search, FileText, Loader2, CheckCircle2,
  Sparkles, Upload, Download, Send, Wand2, BookMarked, Lightbulb, Zap,
  Globe, RefreshCw, Copy, ExternalLink, Save, Plus, Trash2, Move,
  Image as ImageIcon, Layout, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3,
  MessageSquare, Settings, FileDown, Printer, Share2, Eye, ChevronRight,
  ChevronDown, GripVertical, X, MoreVertical, FileImage, Video, Mic,
  Play, Pause, RotateCcw, Clock, Users, Target, TrendingUp, Star,
  Palette, Layers, Grid, BookCopy, Library, FolderOpen, FilePlus
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  status: "draft" | "generating" | "complete" | "editing";
  images: ChapterImage[];
}

interface ChapterImage {
  id: string;
  url: string;
  alt: string;
  placement: "inline" | "full-width" | "float-left" | "float-right";
  caption?: string;
}

interface BookProject {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  genre: string;
  targetAudience: string;
  chapters: Chapter[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  status: "planning" | "writing" | "editing" | "complete";
}

interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const GENRES = [
  "Business & Finance", "Self-Help", "Health & Wellness", "Biography",
  "How-To Guide", "Technical Manual", "Educational", "Memoir",
  "Industry Guide", "Recovery & Rehabilitation", "Entrepreneurship"
];

const AI_MODELS = [
  { id: "gemini", name: "Gemini Pro", icon: "🔷", tier: "free" },
  { id: "grok", name: "Grok", icon: "🤖", tier: "free" },
  { id: "claude", name: "Claude", icon: "🧠", tier: "paid" },
  { id: "gpt4", name: "GPT-4o", icon: "✨", tier: "paid" },
  { id: "perplexity", name: "Perplexity", icon: "🔍", tier: "research" },
];

export default function BookStudio() {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [sidebarTab, setSidebarTab] = useState("chapters");

  const [project, setProject] = useState<BookProject>({
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    author: "Nick Kremers",
    description: "",
    genre: "Business & Finance",
    targetAudience: "",
    chapters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 0,
    status: "planning"
  });

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [aiChat, setAiChat] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [selectedAI, setSelectedAI] = useState("gemini");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewBookDialog, setShowNewBookDialog] = useState(true);

  const currentChapter = currentChapterIndex !== null ? project.chapters[currentChapterIndex] : null;

  const updateWordCount = useCallback((content: string) => {
    const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text ? text.split(" ").length : 0;
  }, []);

  const handleEditorChange = useCallback((evt: any) => {
    const content = evt.target.value;
    setEditorContent(content);
    
    if (currentChapterIndex !== null) {
      const wordCount = updateWordCount(content);
      setProject(prev => ({
        ...prev,
        chapters: prev.chapters.map((ch, i) => 
          i === currentChapterIndex 
            ? { ...ch, content, wordCount, updatedAt: new Date().toISOString() }
            : ch
        ),
        updatedAt: new Date().toISOString(),
        wordCount: prev.chapters.reduce((sum, ch, i) => 
          sum + (i === currentChapterIndex ? wordCount : ch.wordCount), 0
        )
      }));
    }
  }, [currentChapterIndex, updateWordCount]);

  const addChapter = useCallback(() => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${project.chapters.length + 1}`,
      content: "",
      wordCount: 0,
      status: "draft",
      images: []
    };
    setProject(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
    setCurrentChapterIndex(project.chapters.length);
    setEditorContent("");
  }, [project.chapters.length]);

  const selectChapter = useCallback((index: number) => {
    setCurrentChapterIndex(index);
    setEditorContent(project.chapters[index]?.content || "");
  }, [project.chapters]);

  const deleteChapter = useCallback((index: number) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }));
    if (currentChapterIndex === index) {
      setCurrentChapterIndex(null);
      setEditorContent("");
    } else if (currentChapterIndex !== null && currentChapterIndex > index) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  }, [currentChapterIndex]);

  const updateChapterTitle = useCallback((index: number, title: string) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map((ch, i) => i === index ? { ...ch, title } : ch)
    }));
  }, []);

  const generateOutlineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/generate-outline", {
        title: project.title,
        description: project.description,
        genre: project.genre,
        targetAudience: project.targetAudience,
        chapterCount: 12,
        aiModel: selectedAI
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.chapters) {
        setProject(prev => ({
          ...prev,
          chapters: data.chapters.map((ch: any, i: number) => ({
            id: crypto.randomUUID(),
            title: ch.title || `Chapter ${i + 1}`,
            content: ch.description || "",
            wordCount: 0,
            status: "draft" as const,
            images: []
          })),
          status: "writing"
        }));
        toast({ title: "Outline Generated", description: `Created ${data.chapters.length} chapters` });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const generateChapterMutation = useMutation({
    mutationFn: async () => {
      if (!currentChapter) throw new Error("No chapter selected");
      const res = await apiRequest("POST", "/api/book-studio/generate-chapter", {
        bookTitle: project.title,
        bookDescription: project.description,
        chapterTitle: currentChapter.title,
        chapterNumber: (currentChapterIndex || 0) + 1,
        totalChapters: project.chapters.length,
        previousChapter: currentChapterIndex && currentChapterIndex > 0 
          ? project.chapters[currentChapterIndex - 1].content.substring(0, 1000)
          : null,
        targetWordCount: 3000,
        genre: project.genre,
        targetAudience: project.targetAudience,
        aiModel: selectedAI
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.content && currentChapterIndex !== null) {
        const wordCount = updateWordCount(data.content);
        setEditorContent(data.content);
        setProject(prev => ({
          ...prev,
          chapters: prev.chapters.map((ch, i) => 
            i === currentChapterIndex 
              ? { ...ch, content: data.content, wordCount, status: "complete" }
              : ch
          )
        }));
        toast({ title: "Chapter Generated", description: `${wordCount} words written` });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const sendAiMessage = useMutation({
    mutationFn: async () => {
      const userMessage: AIMessage = {
        role: "user",
        content: aiInput,
        timestamp: new Date().toISOString()
      };
      setAiChat(prev => [...prev, userMessage]);
      setAiInput("");
      setIsGenerating(true);

      const res = await apiRequest("POST", "/api/book-studio/ai-chat", {
        message: aiInput,
        bookContext: {
          title: project.title,
          description: project.description,
          currentChapter: currentChapter?.title,
          currentContent: editorContent.substring(0, 2000)
        },
        aiModel: selectedAI
      });
      return res.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data.response) {
        setAiChat(prev => [...prev, {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
      }
    },
    onError: (err: any) => {
      setIsGenerating(false);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const exportDocxMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/export/docx", {
        project,
        format: "kdp"
      });
      return res.blob();
    },
    onSuccess: async (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "DOCX file downloaded" });
    },
    onError: (err: any) => {
      toast({ title: "Export Error", description: err.message, variant: "destructive" });
    }
  });

  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/export/pdf", {
        project,
        format: "kdp"
      });
      return res.blob();
    },
    onSuccess: async (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "PDF file downloaded" });
    },
    onError: (err: any) => {
      toast({ title: "Export Error", description: err.message, variant: "destructive" });
    }
  });

  const generateCoverMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/generate-cover", {
        title: project.title,
        subtitle: project.subtitle,
        author: project.author,
        genre: project.genre,
        description: project.description
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        setProject(prev => ({ ...prev, coverImage: data.imageUrl }));
        toast({ title: "Cover Generated", description: "Book cover created successfully" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const saveProject = useCallback(() => {
    localStorage.setItem(`book_project_${project.id}`, JSON.stringify(project));
    toast({ title: "Saved", description: "Project saved locally" });
  }, [project, toast]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const formatTools = [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: Underline, command: "underline", label: "Underline" },
    { icon: AlignLeft, command: "justifyLeft", label: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", label: "Center" },
    { icon: AlignRight, command: "justifyRight", label: "Align Right" },
    { icon: List, command: "insertUnorderedList", label: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered List" },
  ];

  const totalWordCount = project.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <AuthGuard>
      <SEO
        title="Book Studio | Stroke Lyfe Publishing"
        description="Professional book creation studio with AI-powered writing, editing, and KDP formatting"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#C8A661]" />
                <span className="font-bold text-white">Book Studio</span>
              </div>
              <Separator orientation="vertical" className="h-6 bg-slate-600" />
              <Input
                value={project.title}
                onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Book Title"
                className="w-64 bg-slate-800 border-slate-600 text-white"
                data-testid="input-book-title"
              />
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {totalWordCount.toLocaleString()} words
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedAI} onValueChange={setSelectedAI}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white" data-testid="select-ai-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        <span>{m.icon}</span>
                        <span>{m.name}</span>
                        {m.tier === "free" && <Badge variant="secondary" className="text-xs">Free</Badge>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={saveProject} className="border-slate-600 text-white" data-testid="button-save">
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportDocxMutation.mutate()}
                disabled={exportDocxMutation.isPending}
                className="border-slate-600 text-white"
                data-testid="button-export-docx"
              >
                {exportDocxMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
                DOCX
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportPdfMutation.mutate()}
                disabled={exportPdfMutation.isPending}
                className="border-slate-600 text-white"
                data-testid="button-export-pdf"
              >
                {exportPdfMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
                PDF
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-4 py-1 border-t border-slate-700 bg-slate-800/50">
            <Select onValueChange={(v) => execCommand("formatBlock", v)}>
              <SelectTrigger className="w-32 h-8 bg-transparent border-none text-white text-sm">
                <SelectValue placeholder="Heading" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<h1>">Heading 1</SelectItem>
                <SelectItem value="<h2>">Heading 2</SelectItem>
                <SelectItem value="<h3>">Heading 3</SelectItem>
                <SelectItem value="<p>">Paragraph</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 bg-slate-600 mx-2" />

            {formatTools.map((tool) => (
              <Button
                key={tool.command}
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => execCommand(tool.command)}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </Button>
            ))}

            <Separator orientation="vertical" className="h-6 bg-slate-600 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
              onClick={() => generateChapterMutation.mutate()}
              disabled={generateChapterMutation.isPending || !currentChapter}
              data-testid="button-generate-chapter"
            >
              {generateChapterMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-1" />
              )}
              Generate Chapter
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-100px)]">
          <div className="w-64 border-r border-slate-700 bg-slate-900/50 flex flex-col">
            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none bg-slate-800 border-b border-slate-700">
                <TabsTrigger value="chapters" className="flex-1 text-xs">Chapters</TabsTrigger>
                <TabsTrigger value="outline" className="flex-1 text-xs">Outline</TabsTrigger>
                <TabsTrigger value="assets" className="flex-1 text-xs">Assets</TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="flex-1 m-0 overflow-hidden">
                <div className="p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-slate-600 text-white"
                    onClick={addChapter}
                    data-testid="button-add-chapter"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Chapter
                  </Button>
                </div>
                <ScrollArea className="flex-1 h-[calc(100%-60px)]">
                  <div className="p-2 space-y-1">
                    {project.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          currentChapterIndex === index 
                            ? "bg-[#C8A661]/20 text-[#C8A661]" 
                            : "text-slate-300 hover:bg-slate-700/50"
                        }`}
                        onClick={() => selectChapter(index)}
                        data-testid={`chapter-item-${index}`}
                      >
                        <GripVertical className="w-4 h-4 opacity-50" />
                        <div className="flex-1 min-w-0">
                          <Input
                            value={chapter.title}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateChapterTitle(index, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 text-sm bg-transparent border-none p-0 text-inherit focus:ring-0"
                          />
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{chapter.wordCount} words</span>
                            <Badge 
                              variant={chapter.status === "complete" ? "default" : "secondary"}
                              className="text-[10px] h-4"
                            >
                              {chapter.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="outline" className="flex-1 m-0 p-4 overflow-hidden">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-xs">Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is your book about?"
                      className="mt-1 bg-slate-800 border-slate-600 text-white text-sm resize-none h-24"
                      data-testid="input-description"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Genre</Label>
                    <Select 
                      value={project.genre} 
                      onValueChange={(v) => setProject(prev => ({ ...prev, genre: v }))}
                    >
                      <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Target Audience</Label>
                    <Input
                      value={project.targetAudience}
                      onChange={(e) => setProject(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Who is this book for?"
                      className="mt-1 bg-slate-800 border-slate-600 text-white text-sm"
                      data-testid="input-audience"
                    />
                  </div>
                  <Button
                    className="w-full bg-[#C8A661] hover:bg-[#b89551]"
                    onClick={() => generateOutlineMutation.mutate()}
                    disabled={generateOutlineMutation.isPending || !project.title || !project.description}
                    data-testid="button-generate-outline"
                  >
                    {generateOutlineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Generate Outline
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="flex-1 m-0 p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    {project.coverImage ? (
                      <img 
                        src={project.coverImage} 
                        alt="Book cover" 
                        className="w-full rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
                        <div className="text-center text-slate-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-xs">No cover</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-white"
                    onClick={() => generateCoverMutation.mutate()}
                    disabled={generateCoverMutation.isPending}
                    data-testid="button-generate-cover"
                  >
                    {generateCoverMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Palette className="w-4 h-4 mr-2" />
                    )}
                    Generate Cover
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto p-8">
                {currentChapter ? (
                  <div className="bg-white rounded-lg shadow-xl min-h-[800px]">
                    <div className="p-8">
                      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
                        {currentChapter.title}
                      </h1>
                      <ContentEditable
                        innerRef={editorRef}
                        html={editorContent}
                        onChange={handleEditorChange}
                        className="prose prose-lg max-w-none min-h-[600px] focus:outline-none text-gray-800 leading-relaxed"
                        style={{ fontFamily: "Georgia, serif" }}
                        data-testid="editor-content"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center text-slate-400">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select or create a chapter to begin writing</p>
                      <Button 
                        className="mt-4 bg-[#C8A661] hover:bg-[#b89551]"
                        onClick={addChapter}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Create First Chapter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="w-80 border-l border-slate-700 bg-slate-900/50 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-[#C8A661]" />
                <span className="font-medium">AI Assistant</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {aiChat.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <Brain className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Ask AI for help with your book</p>
                    <div className="mt-4 space-y-2">
                      {[
                        "Generate a table of contents",
                        "Suggest chapter titles",
                        "Expand this section",
                        "Improve the tone",
                        "Add more detail here"
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-slate-600 text-slate-300"
                          onClick={() => {
                            setAiInput(suggestion);
                            sendAiMessage.mutate();
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {aiChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-[#C8A661]/20 ml-4"
                        : "bg-slate-700/50 mr-4"
                    }`}
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      {msg.role === "user" ? "You" : "AI Assistant"}
                    </div>
                    <div className="text-sm text-white whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI for help..."
                  className="bg-slate-800 border-slate-600 text-white text-sm resize-none h-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendAiMessage.mutate();
                    }
                  }}
                  data-testid="input-ai-chat"
                />
              </div>
              <Button
                className="w-full mt-2 bg-[#C8A661] hover:bg-[#b89551]"
                onClick={() => sendAiMessage.mutate()}
                disabled={sendAiMessage.isPending || !aiInput.trim()}
                data-testid="button-send-ai"
              >
                {sendAiMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showNewBookDialog && !project.title} onOpenChange={setShowNewBookDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#C8A661]" />
              Create New Book
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Start your next book project. Works for any topic - laundromats, stroke recovery, business guides, anything.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Book Title</Label>
              <Input
                value={project.title}
                onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., The Laundromat Bible"
                className="mt-1 bg-slate-800 border-slate-600"
                data-testid="dialog-input-title"
              />
            </div>
            <div>
              <Label>Subtitle (Optional)</Label>
              <Input
                value={project.subtitle}
                onChange={(e) => setProject(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g., Three Generations' Guide to a Profitable Empire"
                className="mt-1 bg-slate-800 border-slate-600"
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input
                value={project.author}
                onChange={(e) => setProject(prev => ({ ...prev, author: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-600"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is your book about? Who is it for?"
                className="mt-1 bg-slate-800 border-slate-600 h-24"
                data-testid="dialog-input-description"
              />
            </div>
            <div>
              <Label>Genre</Label>
              <Select 
                value={project.genre} 
                onValueChange={(v) => setProject(prev => ({ ...prev, genre: v }))}
              >
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-[#C8A661] hover:bg-[#b89551]"
              onClick={() => setShowNewBookDialog(false)}
              disabled={!project.title}
              data-testid="dialog-button-create"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              Create Book
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
