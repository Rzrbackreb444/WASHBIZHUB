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
  ChevronDown, ChevronUp, ChevronLeft, GripVertical, X, MoreVertical, FileImage, Video, Mic,
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
  isIllustratedMode?: boolean;
  artStyle?: string;
  ageRange?: string;
  characters?: CharacterDescription[];
  pageIllustrations?: PageIllustration[];
}

interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const GENRES = [
  "Business & Finance", "Self-Help", "Health & Wellness", "Biography",
  "How-To Guide", "Technical Manual", "Educational", "Memoir",
  "Industry Guide", "Recovery & Rehabilitation", "Entrepreneurship",
  "Children's Picture Book", "Children's Chapter Book", "Young Adult",
  "Fiction", "Fantasy", "Mystery", "Romance", "Sci-Fi"
];

const ART_STYLES = [
  { id: "watercolor", name: "Watercolor", description: "Soft, dreamy colors" },
  { id: "cartoon", name: "Cartoon", description: "Vibrant, Disney-style" },
  { id: "digital-painting", name: "Digital Painting", description: "Rich, detailed" },
  { id: "pencil-sketch", name: "Pencil Sketch", description: "Hand-drawn feel" },
  { id: "flat-design", name: "Flat Design", description: "Modern minimalist" },
  { id: "storybook-classic", name: "Storybook Classic", description: "Beatrix Potter style" },
  { id: "whimsical", name: "Whimsical", description: "Magical, enchanted" },
  { id: "anime", name: "Anime", description: "Japanese animation" }
];

const AGE_RANGES = [
  { id: "0-3", name: "Baby/Toddler (0-3)" },
  { id: "3-5", name: "Preschool (3-5)" },
  { id: "5-8", name: "Early Reader (5-8)" },
  { id: "8-12", name: "Middle Grade (8-12)" },
  { id: "12-18", name: "Young Adult (12-18)" },
  { id: "adult", name: "Adult" }
];

interface CharacterDescription {
  id: string;
  name: string;
  description: string;
  clothing?: string;
}

interface PageIllustration {
  id: string;
  pageNumber: number;
  imageUrl: string;
  sceneDescription: string;
  textPosition: "left" | "right" | "top" | "bottom" | "none";
  pageText: string;
}

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
    status: "planning",
    isIllustratedMode: false,
    artStyle: "watercolor",
    ageRange: "3-5",
    characters: [],
    pageIllustrations: []
  });

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [aiChat, setAiChat] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [selectedAI, setSelectedAI] = useState("gemini");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewBookDialog, setShowNewBookDialog] = useState(true);
  
  // Illustrated book mode - page index for current page being edited
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [generatingIllustration, setGeneratingIllustration] = useState(false);

  // Derived state for easier access
  const pageIllustrations = project.pageIllustrations || [];
  const characters = project.characters || [];
  
  // Keep currentPageIndex in bounds
  useEffect(() => {
    if (pageIllustrations.length === 0) {
      setCurrentPageIndex(0);
    } else if (currentPageIndex >= pageIllustrations.length) {
      setCurrentPageIndex(pageIllustrations.length - 1);
    } else if (currentPageIndex < 0) {
      setCurrentPageIndex(0);
    }
  }, [pageIllustrations.length, currentPageIndex]);

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

  const [kdpTrimSize, setKdpTrimSize] = useState("8.5x8.5");
  const [showKdpExport, setShowKdpExport] = useState(false);
  
  const exportKdpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/export/kdp-illustrated", {
        project,
        trimSize: kdpTrimSize,
        bleed: true
      });
      return res.blob();
    },
    onSuccess: async (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, "_")}_KDP_${kdpTrimSize.replace(".", "_")}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setShowKdpExport(false);
      toast({ title: "KDP Export Ready", description: "Open the HTML file in a browser and print to PDF for KDP upload" });
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

  // Generate illustration for a page
  const generateIllustrationMutation = useMutation({
    mutationFn: async ({ sceneDescription, pageText, textPosition }: { 
      sceneDescription: string; 
      pageText: string; 
      textPosition: string;
    }) => {
      setGeneratingIllustration(true);
      const res = await apiRequest("POST", "/api/book-studio/generate-children-illustration", {
        sceneDescription,
        characterDescriptions: characters,
        artStyle: project.artStyle || "watercolor",
        pageNumber: currentPageIndex + 1,
        bookTitle: project.title,
        ageRange: project.ageRange || "3-5",
        mood: "cheerful",
        setting: ""
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratingIllustration(false);
      if (data.imageUrl && pageIllustrations.length > 0 && currentPageIndex < pageIllustrations.length) {
        // Update the existing page with the new illustration
        setProject(prev => ({
          ...prev,
          pageIllustrations: (prev.pageIllustrations || []).map((p, i) => 
            i === currentPageIndex ? { ...p, imageUrl: data.imageUrl } : p
          )
        }));
        toast({ title: "Illustration Created", description: "Your page illustration is ready!" });
      }
    },
    onError: (err: any) => {
      setGeneratingIllustration(false);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Generate full storyboard
  const generateStoryboardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/book-studio/generate-storyboard", {
        bookTitle: project.title,
        synopsis: project.description,
        pageCount: 24,
        characterDescriptions: characters,
        artStyle: project.artStyle || "watercolor",
        ageRange: project.ageRange || "3-5"
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.storyboard) {
        const pages: PageIllustration[] = data.storyboard.map((page: any) => ({
          id: crypto.randomUUID(),
          pageNumber: page.pageNumber,
          imageUrl: "",
          sceneDescription: page.sceneDescription,
          textPosition: page.isSpread ? "bottom" : "bottom",
          pageText: page.pageText
        }));
        setProject(prev => ({ ...prev, pageIllustrations: pages }));
        setCurrentPageIndex(0);
        toast({ title: "Storyboard Created", description: `${pages.length} pages planned` });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Add character
  const addCharacter = useCallback(() => {
    setProject(prev => {
      const newChar: CharacterDescription = {
        id: crypto.randomUUID(),
        name: `Character ${(prev.characters?.length || 0) + 1}`,
        description: "",
        clothing: ""
      };
      return { ...prev, characters: [...(prev.characters || []), newChar] };
    });
  }, []);

  // Update character
  const updateCharacter = useCallback((id: string, updates: Partial<CharacterDescription>) => {
    setProject(prev => ({
      ...prev,
      characters: (prev.characters || []).map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  // Remove character
  const removeCharacter = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      characters: (prev.characters || []).filter(c => c.id !== id)
    }));
  }, []);

  // Add blank page
  const addPage = useCallback(() => {
    setProject(prev => {
      const newPage: PageIllustration = {
        id: crypto.randomUUID(),
        pageNumber: (prev.pageIllustrations?.length || 0) + 1,
        imageUrl: "",
        sceneDescription: "",
        textPosition: "bottom",
        pageText: ""
      };
      const newPages = [...(prev.pageIllustrations || []), newPage];
      // Set the new page as selected after render
      setTimeout(() => setCurrentPageIndex(newPages.length - 1), 0);
      return { ...prev, pageIllustrations: newPages };
    });
  }, []);

  // Update page
  const updatePage = useCallback((index: number, updates: Partial<PageIllustration>) => {
    setProject(prev => ({
      ...prev,
      pageIllustrations: (prev.pageIllustrations || []).map((p, i) => i === index ? { ...p, ...updates } : p)
    }));
  }, []);

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
              
              {pageIllustrations.length > 0 && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => setShowKdpExport(true)}
                  className="bg-[#C8A661] hover:bg-[#b89551]"
                  data-testid="button-export-kdp"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  KDP Export
                </Button>
              )}
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
                <TabsTrigger value="illustrations" className="flex-1 text-xs">Illustrations</TabsTrigger>
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

              <TabsContent value="illustrations" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {/* Art Style Selection */}
                    <div>
                      <Label className="text-slate-400 text-xs">Art Style</Label>
                      <Select 
                        value={project.artStyle || "watercolor"} 
                        onValueChange={(v) => setProject(prev => ({ ...prev, artStyle: v }))}
                      >
                        <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white text-sm" data-testid="select-art-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ART_STYLES.map(style => (
                            <SelectItem key={style.id} value={style.id}>
                              <span className="flex flex-col">
                                <span>{style.name}</span>
                                <span className="text-xs text-muted-foreground">{style.description}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age Range Selection */}
                    <div>
                      <Label className="text-slate-400 text-xs">Age Range</Label>
                      <Select 
                        value={project.ageRange || "3-5"} 
                        onValueChange={(v) => setProject(prev => ({ ...prev, ageRange: v }))}
                      >
                        <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white text-sm" data-testid="select-age-range">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RANGES.map(range => (
                            <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Characters Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-400 text-xs">Characters</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs text-[#C8A661]"
                          onClick={addCharacter}
                          data-testid="button-add-character"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {characters.map(char => (
                          <div key={char.id} className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                              <Input
                                value={char.name}
                                onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                                placeholder="Name"
                                className="h-7 text-xs bg-transparent border-none p-0 text-white font-medium"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 text-slate-500 hover:text-red-400"
                                onClick={() => removeCharacter(char.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <Textarea
                              value={char.description}
                              onChange={(e) => updateCharacter(char.id, { description: e.target.value })}
                              placeholder="Describe appearance..."
                              className="h-16 text-xs bg-slate-700/50 border-slate-600 text-white resize-none"
                            />
                          </div>
                        ))}
                        {characters.length === 0 && (
                          <p className="text-xs text-slate-500 text-center py-2">No characters yet</p>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Pages Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-slate-400 text-xs">Pages ({pageIllustrations.length})</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs text-[#C8A661]"
                          onClick={addPage}
                          data-testid="button-add-page"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Page
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pageIllustrations.map((page, index) => (
                          <div 
                            key={page.id}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              currentPageIndex === index 
                                ? "bg-[#C8A661]/20 border border-[#C8A661]" 
                                : "bg-slate-800 border border-slate-700 hover:border-slate-600"
                            }`}
                            onClick={() => setCurrentPageIndex(index)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-16 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
                                {page.imageUrl ? (
                                  <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white">Page {page.pageNumber}</p>
                                <p className="text-xs text-slate-400 truncate">{page.sceneDescription || "No description"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {pageIllustrations.length === 0 && (
                          <p className="text-xs text-slate-500 text-center py-2">No pages yet</p>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Generate Storyboard */}
                    <Button
                      className="w-full bg-[#C8A661]"
                      onClick={() => generateStoryboardMutation.mutate()}
                      disabled={generateStoryboardMutation.isPending || !project.title || !project.description}
                      data-testid="button-generate-storyboard"
                    >
                      {generateStoryboardMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Layers className="w-4 h-4 mr-2" />
                      )}
                      Generate Storyboard
                    </Button>

                    {/* Cover Image */}
                    <div className="pt-2">
                      <Label className="text-slate-400 text-xs">Cover</Label>
                      <div className="mt-2 text-center">
                        {project.coverImage ? (
                          <img 
                            src={project.coverImage} 
                            alt="Book cover" 
                            className="w-full rounded-lg shadow-lg"
                          />
                        ) : (
                          <div className="aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
                            <div className="text-center text-slate-500">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                              <span className="text-xs">No cover</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-slate-600 text-white"
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
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto p-8">
                {/* Illustrated Page Editor */}
                {currentPageIndex !== null && pageIllustrations[currentPageIndex] ? (
                  <div className="space-y-6">
                    {/* Page Preview with Real-time Text Positioning */}
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden relative group">
                      {/* Page Number Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-[#C8A661] text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Page {currentPageIndex + 1} of {pageIllustrations.length}
                      </div>
                      
                      {/* Live Preview */}
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {pageIllustrations[currentPageIndex].imageUrl ? (
                          <img 
                            src={pageIllustrations[currentPageIndex].imageUrl} 
                            alt={`Page ${currentPageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                            <div className="text-center p-6">
                              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-200/50 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-amber-400" />
                              </div>
                              <p className="text-amber-700 font-medium mb-1">Illustration Pending</p>
                              <p className="text-amber-600 text-sm mb-4">Add a scene description below</p>
                              <Button
                                className="bg-[#C8A661] hover:bg-[#b89551]"
                                onClick={() => {
                                  const page = pageIllustrations[currentPageIndex];
                                  if (page?.sceneDescription) {
                                    generateIllustrationMutation.mutate({
                                      sceneDescription: page.sceneDescription,
                                      pageText: page.pageText || "",
                                      textPosition: page.textPosition || "bottom"
                                    });
                                  }
                                }}
                                disabled={generatingIllustration || !pageIllustrations[currentPageIndex].sceneDescription}
                                data-testid="button-generate-illustration"
                              >
                                {generatingIllustration ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Wand2 className="w-4 h-4 mr-2" />
                                )}
                                Generate Art
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Text Overlay with Real-time Preview */}
                        {pageIllustrations[currentPageIndex].pageText && pageIllustrations[currentPageIndex].textPosition !== "none" && (
                          <div 
                            className={`absolute transition-all duration-300 ${
                              pageIllustrations[currentPageIndex].textPosition === "top" 
                                ? "top-0 left-0 right-0 p-4" 
                                : pageIllustrations[currentPageIndex].textPosition === "bottom" 
                                ? "bottom-0 left-0 right-0 p-4" 
                                : pageIllustrations[currentPageIndex].textPosition === "left" 
                                ? "left-0 top-0 bottom-0 w-2/5 flex items-center p-4" 
                                : "right-0 top-0 bottom-0 w-2/5 flex items-center p-4"
                            }`}
                          >
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                              <p className="text-lg font-serif text-gray-800 leading-relaxed">
                                {pageIllustrations[currentPageIndex].pageText}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Clickable Position Indicators - Always visible for touch/mobile */}
                        <div className="absolute inset-0 pointer-events-none">
                          {["top", "bottom", "left", "right"].map((pos) => (
                            <div 
                              key={pos}
                              onClick={() => updatePage(currentPageIndex, { textPosition: pos })}
                              className={`absolute cursor-pointer pointer-events-auto transition-all ${
                                pos === "top" ? "top-2 left-1/4 right-1/4 h-7" :
                                pos === "bottom" ? "bottom-2 left-1/4 right-1/4 h-7" :
                                pos === "left" ? "left-2 top-1/4 bottom-1/4 w-7" :
                                "right-2 top-1/4 bottom-1/4 w-7"
                              } ${
                                pageIllustrations[currentPageIndex].textPosition === pos 
                                  ? "bg-[#C8A661] border-2 border-[#C8A661] shadow-lg" 
                                  : "bg-slate-800/70 hover:bg-slate-700/90 border border-slate-500/50"
                              } rounded flex items-center justify-center`}
                              data-testid={`position-indicator-${pos}`}
                            >
                              <span className={`text-[9px] font-bold uppercase ${
                                pageIllustrations[currentPageIndex].textPosition === pos 
                                  ? "text-white" 
                                  : "text-slate-200"
                              }`}>
                                {pageIllustrations[currentPageIndex].textPosition === pos ? "Text" : pos}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quick Action Bar - Always visible */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs bg-white/95 hover:bg-white shadow-lg"
                          onClick={() => updatePage(currentPageIndex, { textPosition: "none" })}
                          data-testid="button-hide-text"
                        >
                          Hide Text
                        </Button>
                      </div>
                    </div>

                    {/* Page Details Editor */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-lg">Page {currentPageIndex + 1} Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-slate-400 text-sm">Scene Description (for AI)</Label>
                          <Textarea
                            value={pageIllustrations[currentPageIndex].sceneDescription}
                            onChange={(e) => updatePage(currentPageIndex, { sceneDescription: e.target.value })}
                            placeholder="Describe what should be illustrated on this page..."
                            className="mt-1 bg-slate-700 border-slate-600 text-white resize-none h-24"
                            data-testid="input-scene-description"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-400 text-sm">Page Text</Label>
                          <Textarea
                            value={pageIllustrations[currentPageIndex].pageText}
                            onChange={(e) => updatePage(currentPageIndex, { pageText: e.target.value })}
                            placeholder="The story text for this page..."
                            className="mt-1 bg-slate-700 border-slate-600 text-white resize-none h-20 font-serif"
                            data-testid="input-page-text"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-400 text-sm">Text Position</Label>
                          <Select 
                            value={pageIllustrations[currentPageIndex].textPosition} 
                            onValueChange={(val) => updatePage(currentPageIndex, { textPosition: val })}
                          >
                            <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-white" data-testid="select-text-position">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="none">No Text</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-[#C8A661] hover:bg-[#b89551]"
                            onClick={() => {
                              const page = pageIllustrations[currentPageIndex];
                              generateIllustrationMutation.mutate({
                                sceneDescription: page.sceneDescription,
                                pageText: page.pageText || "",
                                textPosition: page.textPosition || "bottom"
                              });
                            }}
                            disabled={generatingIllustration || !pageIllustrations[currentPageIndex].sceneDescription}
                            data-testid="button-regenerate-illustration"
                          >
                            {generatingIllustration ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            {pageIllustrations[currentPageIndex].imageUrl ? "Regenerate" : "Generate"} Illustration
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-slate-600 text-slate-400 hover:text-white"
                            onClick={() => {
                              if (currentPageIndex > 0) {
                                setProject(prev => {
                                  const pages = [...(prev.pageIllustrations || [])];
                                  [pages[currentPageIndex - 1], pages[currentPageIndex]] = [pages[currentPageIndex], pages[currentPageIndex - 1]];
                                  return { ...prev, pageIllustrations: pages.map((p, i) => ({ ...p, pageNumber: i + 1 })) };
                                });
                                setCurrentPageIndex(prev => prev - 1);
                              }
                            }}
                            disabled={currentPageIndex === 0}
                            data-testid="button-move-page-up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-slate-600 text-slate-400 hover:text-white"
                            onClick={() => {
                              if (currentPageIndex < pageIllustrations.length - 1) {
                                setProject(prev => {
                                  const pages = [...(prev.pageIllustrations || [])];
                                  [pages[currentPageIndex], pages[currentPageIndex + 1]] = [pages[currentPageIndex + 1], pages[currentPageIndex]];
                                  return { ...prev, pageIllustrations: pages.map((p, i) => ({ ...p, pageNumber: i + 1 })) };
                                });
                                setCurrentPageIndex(prev => prev + 1);
                              }
                            }}
                            disabled={currentPageIndex >= pageIllustrations.length - 1}
                            data-testid="button-move-page-down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={() => {
                              const newIndex = Math.min(currentPageIndex, pageIllustrations.length - 2);
                              setProject(prev => {
                                const filtered = prev.pageIllustrations?.filter((_, i) => i !== currentPageIndex) || [];
                                return { ...prev, pageIllustrations: filtered.map((p, i) => ({ ...p, pageNumber: i + 1 })) };
                              });
                              setCurrentPageIndex(Math.max(0, newIndex));
                            }}
                            disabled={pageIllustrations.length <= 1}
                            data-testid="button-delete-page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : currentChapter ? (
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
                      <p className="text-sm mt-2 opacity-75">Or use the Illustrations tab to create a picture book</p>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button 
                          className="bg-[#C8A661] hover:bg-[#b89551]"
                          onClick={addChapter}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Create Chapter
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-slate-600 text-white"
                          onClick={() => {
                            setSidebarTab("illustrations");
                            addPage();
                          }}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" /> Create Picture Book
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Horizontal Page Strip - Storyboard Navigator */}
            {pageIllustrations.length > 0 && (
              <div className="h-28 border-t border-slate-700 bg-slate-900/80 flex items-center px-4 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-400 hover:text-white"
                  onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentPageIndex === 0}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-2 py-2">
                    {pageIllustrations.map((page, idx) => (
                      <div
                        key={page.id}
                        className={`shrink-0 w-16 h-20 rounded-lg cursor-pointer transition-all ${
                          idx === currentPageIndex 
                            ? "ring-2 ring-[#C8A661] scale-105" 
                            : "ring-1 ring-slate-600 hover:ring-slate-400"
                        }`}
                        onClick={() => setCurrentPageIndex(idx)}
                        data-testid={`page-thumbnail-${idx}`}
                      >
                        {page.imageUrl ? (
                          <img 
                            src={page.imageUrl} 
                            alt={`Page ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-500">{idx + 1}</span>
                            {page.sceneDescription && (
                              <div className="w-1 h-1 bg-[#C8A661] rounded-full mt-1" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      className="shrink-0 w-16 h-20 border border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-white hover:border-slate-400"
                      onClick={addPage}
                      data-testid="button-add-page-strip"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-400 hover:text-white"
                  onClick={() => setCurrentPageIndex(prev => Math.min(pageIllustrations.length - 1, prev + 1))}
                  disabled={currentPageIndex >= pageIllustrations.length - 1}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
                
                <div className="shrink-0 text-sm text-slate-400 ml-2">
                  Page {currentPageIndex + 1} / {pageIllustrations.length}
                </div>
              </div>
            )}
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
                onValueChange={(v) => {
                  setProject(prev => ({ 
                    ...prev, 
                    genre: v,
                    isIllustratedMode: v.includes("Children") || v.includes("Picture") ? true : prev.isIllustratedMode
                  }));
                }}
              >
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="dialog-select-genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* Illustrated Book Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-[#C8A661]" />
                <div>
                  <Label className="text-sm">Illustrated Picture Book</Label>
                  <p className="text-xs text-slate-400">Create a book with AI-generated illustrations</p>
                </div>
              </div>
              <Switch
                checked={project.isIllustratedMode || false}
                onCheckedChange={(v) => setProject(prev => ({ ...prev, isIllustratedMode: v }))}
                data-testid="dialog-switch-illustrated"
              />
            </div>

            {/* Art Style (shown when illustrated mode is on) */}
            {project.isIllustratedMode && (
              <div>
                <Label>Art Style</Label>
                <Select 
                  value={project.artStyle || "watercolor"} 
                  onValueChange={(v) => setProject(prev => ({ ...prev, artStyle: v }))}
                >
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="dialog-select-art-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ART_STYLES.map(style => (
                      <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Age Range (shown when illustrated mode is on) */}
            {project.isIllustratedMode && (
              <div>
                <Label>Target Age Range</Label>
                <Select 
                  value={project.ageRange || "3-5"} 
                  onValueChange={(v) => setProject(prev => ({ ...prev, ageRange: v }))}
                >
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="dialog-select-age-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map(range => (
                      <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full bg-[#C8A661] hover:bg-[#b89551]"
              onClick={() => {
                setShowNewBookDialog(false);
                if (project.isIllustratedMode) {
                  setSidebarTab("illustrations");
                }
              }}
              disabled={!project.title}
              data-testid="dialog-button-create"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              {project.isIllustratedMode ? "Create Picture Book" : "Create Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showKdpExport} onOpenChange={setShowKdpExport}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#C8A661]" />
              KDP Print-Ready Export
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Export your illustrated book for Amazon Kindle Direct Publishing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trim Size</Label>
              <Select value={kdpTrimSize} onValueChange={setKdpTrimSize}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-600" data-testid="select-kdp-trim-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8.5x8.5">Square (8.5" x 8.5") - Most Popular</SelectItem>
                  <SelectItem value="8x10">Portrait (8" x 10")</SelectItem>
                  <SelectItem value="6x9">Trade (6" x 9")</SelectItem>
                  <SelectItem value="7x10">Large (7" x 10")</SelectItem>
                  <SelectItem value="8.25x6">Landscape (8.25" x 6")</SelectItem>
                  <SelectItem value="8.25x8.25">Square Alt (8.25" x 8.25")</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Square format recommended for children's picture books
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Book Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                <span>Title:</span>
                <span className="text-white">{project.title}</span>
                <span>Author:</span>
                <span className="text-white">{project.author}</span>
                <span>Pages:</span>
                <span className="text-white">{pageIllustrations.length + 3} (incl. front/back matter)</span>
                <span>Art Style:</span>
                <span className="text-white">{project.artStyle || "Watercolor"}</span>
              </div>
            </div>
            
            <div className="bg-amber-900/30 border border-amber-700/50 p-3 rounded-lg space-y-2">
              <p className="text-xs text-amber-200 font-semibold">Print to PDF Instructions:</p>
              <ol className="text-xs text-amber-200/90 list-decimal list-inside space-y-1">
                <li>Download the HTML file</li>
                <li>Open in Chrome or Firefox</li>
                <li>Press Ctrl+P (Cmd+P on Mac)</li>
                <li>Set "Destination" to "Save as PDF"</li>
                <li>Set "Paper size" to match your trim size</li>
                <li>Set "Margins" to "None"</li>
                <li>Enable "Background graphics"</li>
                <li>Save and upload to KDP</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-600"
                onClick={() => setShowKdpExport(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#C8A661] hover:bg-[#b89551]"
                onClick={() => exportKdpMutation.mutate()}
                disabled={exportKdpMutation.isPending}
                data-testid="button-confirm-kdp-export"
              >
                {exportKdpMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export for KDP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
