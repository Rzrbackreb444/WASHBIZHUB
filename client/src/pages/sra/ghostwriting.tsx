import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  PenTool,
  Sparkles,
  ArrowLeft,
  Save,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  BarChart3,
  Table,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Undo,
  Redo,
  Type,
  Wand2,
  Upload,
  FolderOpen,
  Eye,
  Settings,
  Palette,
  Layout,
  User,
  Crown,
  Zap,
  Target,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  Play,
  Pause,
  Share2,
  ExternalLink,
  BookMarked,
  GraduationCap,
  FileImage,
  TableIcon,
  PieChart,
  LineChart,
  BarChart,
  TrendingUp,
  Camera,
  Mic,
  Film,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Music,
  Globe,
  Star,
  Heart,
  Clock,
  Calendar,
  Award,
  Brain,
  Lightbulb,
  FileDown,
  Printer
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";
import strokeLyfePublishingLogo from "@assets/Logo Transparent BG_1764090018405.png";
import hammerImg from "@assets/hammer_1764090332002.jpg";
import manImg from "@assets/man_1764090332005.jpg";
import sosAxeImg from "@assets/sos axe_1764090332006.jpg";
import wheelchairImg from "@assets/wheelchair_1764090332007.jpg";
import nickCrookedSmileImg from "@assets/Nick crooked smile_1764090476963.jpg";
import nickHemiImg from "@assets/Nick Hemi 1_1764090476967.png";
import staplesImg from "@assets/staples_1764090476968.jpg";
import strokeLyfeTshirtImg from "@assets/Stroke Lyfe · Products · Unisex oversized t-shirt · Shopify_1764090476968.png";
import nickImg from "@assets/Nick_1764090566981.jpg";

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  isExpanded: boolean;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  content: string;
  type: "text" | "image" | "table" | "chart" | "quote" | "callout";
}

interface MediaItem {
  id: string;
  type: "image" | "video" | "document";
  name: string;
  url: string;
  thumbnail?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: "book" | "course" | "memoir" | "guide";
  chapters: string[];
}

const bookTemplates: Template[] = [
  {
    id: "memoir",
    name: "Stroke Recovery Memoir",
    description: "Share your personal journey from stroke to recovery",
    type: "memoir",
    chapters: ["The Day Everything Changed", "Hospital Days", "Early Recovery", "Physical Therapy Journey", "Emotional Healing", "Support System", "Milestones & Victories", "Lessons Learned", "Looking Forward", "Message of Hope"]
  },
  {
    id: "guide",
    name: "Recovery Guide",
    description: "Create a comprehensive guide for fellow survivors",
    type: "guide",
    chapters: ["Introduction", "Understanding Stroke", "Physical Recovery", "Cognitive Recovery", "Emotional Wellness", "Nutrition & Lifestyle", "Therapy Options", "Assistive Tools", "Support Resources", "Conclusion"]
  },
  {
    id: "course",
    name: "Video Course",
    description: "Structure your knowledge into teachable modules",
    type: "course",
    chapters: ["Welcome & Overview", "Module 1: Foundation", "Module 2: Getting Started", "Module 3: Core Techniques", "Module 4: Advanced Methods", "Module 5: Practice & Application", "Module 6: Troubleshooting", "Bonus: Resources", "Conclusion & Next Steps"]
  }
];

const stockImages: MediaItem[] = [
  { id: "1", type: "image", name: "Hammer on Brain", url: hammerImg },
  { id: "2", type: "image", name: "Anatomy Man", url: manImg },
  { id: "3", type: "image", name: "SOS Axe", url: sosAxeImg },
  { id: "4", type: "image", name: "Wheelchair", url: wheelchairImg },
  { id: "5", type: "image", name: "Nick Crooked Smile", url: nickCrookedSmileImg },
  { id: "6", type: "image", name: "Nick Hemi", url: nickHemiImg },
  { id: "7", type: "image", name: "Staples", url: staplesImg },
  { id: "8", type: "image", name: "Stroke Lyfe T-Shirt", url: strokeLyfeTshirtImg },
  { id: "9", type: "image", name: "Nick Recent", url: nickImg },
];

const aiPromptTemplates = [
  { id: "expand", label: "Expand this section", icon: Sparkles },
  { id: "rewrite", label: "Rewrite for clarity", icon: RefreshCw },
  { id: "emotional", label: "Add emotional depth", icon: Heart },
  { id: "professional", label: "Make more professional", icon: Award },
  { id: "simplify", label: "Simplify language", icon: Lightbulb },
  { id: "storify", label: "Turn into story", icon: BookOpen },
  { id: "outline", label: "Create outline", icon: List },
  { id: "conclude", label: "Write conclusion", icon: Target },
];

export default function SRAGhostwriting() {
  const [activeTab, setActiveTab] = useState("write");
  const [projectTitle, setProjectTitle] = useState("My Stroke Recovery Journey");
  const [projectType, setProjectType] = useState<"book" | "course">("book");
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "The Day Everything Changed",
      content: "",
      wordCount: 0,
      isExpanded: true,
      sections: []
    }
  ]);
  const [activeChapterId, setActiveChapterId] = useState("1");
  const [editorContent, setEditorContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAboutMeGenerator, setShowAboutMeGenerator] = useState(false);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  const [showTableGenerator, setShowTableGenerator] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [aboutMeData, setAboutMeData] = useState({
    name: "Nicholas Kremers",
    nickname: "Stroked Out Sasquatch",
    strokeDate: "December 3, 2018",
    strokeType: "Hemorrhagic",
    recoveryPercent: "90",
    mission: "To help stroke survivors rebuild their lives through accountability and daily action.",
    achievements: ["1M+ TikTok followers", "Founded StrokeLyfe.org", "90% recovery achieved"],
    quote: "The grind is the gospel."
  });

  const [chartData, setChartData] = useState({
    type: "bar",
    title: "Recovery Progress",
    labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
    values: [10, 25, 40, 55, 70, 85]
  });

  const [tableData, setTableData] = useState({
    rows: 4,
    cols: 3,
    headers: ["Exercise", "Duration", "Frequency"],
    data: [
      ["Hand squeezes", "10 min", "3x daily"],
      ["Arm raises", "15 min", "2x daily"],
      ["Walking", "20 min", "Daily"],
    ]
  });

  const handleContentChange = (content: string) => {
    setEditorContent(content);
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
    
    setChapters(prev => prev.map(ch => 
      ch.id === activeChapterId 
        ? { ...ch, content, wordCount: words }
        : ch
    ));
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      content: "",
      wordCount: 0,
      isExpanded: false,
      sections: []
    };
    setChapters([...chapters, newChapter]);
  };

  const selectChapter = (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      setActiveChapterId(chapterId);
      setEditorContent(chapter.content);
      setWordCount(chapter.wordCount);
    }
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, title } : ch
    ));
  };

  const deleteChapter = (chapterId: string) => {
    if (chapters.length > 1) {
      const newChapters = chapters.filter(ch => ch.id !== chapterId);
      setChapters(newChapters);
      if (activeChapterId === chapterId) {
        setActiveChapterId(newChapters[0].id);
        setEditorContent(newChapters[0].content);
      }
    }
  };

  const applyTemplate = (template: Template) => {
    const newChapters = template.chapters.map((title, index) => ({
      id: (index + 1).toString(),
      title,
      content: "",
      wordCount: 0,
      isExpanded: index === 0,
      sections: []
    }));
    setChapters(newChapters);
    setActiveChapterId("1");
    setEditorContent("");
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newMedia: MediaItem = {
            id: Date.now().toString(),
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
            name: file.name,
            url: e.target?.result as string
          };
          setUploadedMedia(prev => [...prev, newMedia]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const insertImage = (url: string, name: string) => {
    const imageMarkdown = `\n\n![${name}](${url})\n\n`;
    setEditorContent(prev => prev + imageMarkdown);
    setShowMediaLibrary(false);
  };

  const generateAIContent = async (prompt: string) => {
    setIsGenerating(true);
    setAiSuggestion("");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses: Record<string, string> = {
      expand: `The morning of December 3, 2018, started like any other. I woke up, stretched my arms, and felt that familiar comfort of routine. Little did I know that within hours, my entire world would be turned upside down.

The first sign was subtle - a slight tingling in my left hand. I dismissed it as sleeping in an awkward position. But then came the headache. Not just any headache - this was a thunderclap that felt like my skull was being split open from the inside.

I remember trying to call for help, but the words wouldn't form properly. My tongue felt thick, foreign. The room began to spin, and I knew - with a certainty that chilled me to my core - that something was terribly wrong.

When the paramedics arrived, I could see the urgency in their eyes. "Stroke," I heard one whisper to the other. That single word would define the next chapter of my life.`,
      
      rewrite: `My stroke happened on December 3, 2018. The experience was overwhelming - a sudden headache, confusion, and the terrifying realization that my body was betraying me. But looking back, I can see how that day became the starting point for the most meaningful journey of my life.`,
      
      emotional: `There are moments in life that break you. December 3, 2018, was mine. As I lay in that hospital bed, tubes snaking from my body, machines beeping their mechanical symphony, I felt something I'd never experienced before: complete and utter helplessness.

I thought about my family. My dreams. Everything I'd taken for granted. And in that sterile room, with fluorescent lights buzzing overhead, I made a promise to myself. I would fight. Not just to survive, but to truly live again.

The tears came freely those first nights. Not from self-pity, but from a fierce determination that surprised even me. Each tear was a testament to the fire burning within - a fire that refused to be extinguished.`,
      
      professional: `The acute hemorrhagic stroke I experienced on December 3, 2018, resulted in significant left-side hemiparesis. Initial assessments indicated substantial motor function deficits, requiring immediate surgical intervention involving craniotomy and hematoma evacuation. The rehabilitation protocol that followed incorporated evidence-based therapies targeting neuroplasticity and functional recovery.`,
      
      simplify: `I had a stroke on December 3, 2018. A blood vessel burst in my brain. The left side of my body stopped working. Doctors did surgery to fix it. Then I started therapy to get better. It was hard work, but I kept trying every day.`,
      
      storify: `Picture this: A 36-year-old man, full of life, suddenly struck down by an invisible enemy within his own brain. That man was me. And this is my story of how I went from being told I'd never walk again to proving every doubter wrong.

It reads like fiction, but every word is real. Every struggle. Every victory. Every moment of doubt overcome by an unshakeable will to survive.`,
      
      outline: `I. The Day of the Stroke
   A. Morning routine disrupted
   B. First symptoms appear
   C. Emergency response
   D. Hospital arrival

II. The Immediate Aftermath
   A. Surgery and ICU
   B. Family reactions
   C. Initial prognosis
   D. The fog of early recovery

III. The Recovery Begins
   A. First movements
   B. Meeting my care team
   C. Setting initial goals
   D. Small victories matter`,
      
      conclude: `As I close this chapter of my story, I want you to know one thing: if I can do this, so can you. The path forward isn't easy. There will be days when you want to give up, when the progress feels too slow, when the mountain seems too high.

But remember this - every step forward, no matter how small, is a victory. Every day you show up and do the work is a day you're proving the impossible possible.

The grind is the gospel. Embrace it. Own it. Let it transform you.

Your stroke is not your ending. It's your beginning.

REBUILD. REWIRE. RISE.`
    };
    
    setAiSuggestion(responses[prompt] || responses.expand);
    setIsGenerating(false);
    setShowAiPanel(true);
  };

  const insertAiSuggestion = () => {
    setEditorContent(prev => prev + "\n\n" + aiSuggestion);
    setShowAiPanel(false);
    setAiSuggestion("");
  };

  const generateAboutMe = () => {
    const aboutMe = `## About the Author

**${aboutMeData.name}** (known as "${aboutMeData.nickname}")

On ${aboutMeData.strokeDate}, ${aboutMeData.name.split(' ')[0]} experienced a ${aboutMeData.strokeType.toLowerCase()} stroke that would change the course of their life forever. Against all odds and medical predictions, they achieved ${aboutMeData.recoveryPercent}% recovery through unwavering determination and daily action.

### Mission
${aboutMeData.mission}

### Achievements
${aboutMeData.achievements.map(a => `- ${a}`).join('\n')}

### Philosophy
*"${aboutMeData.quote}"*

---

Connect with ${aboutMeData.name.split(' ')[0]}:
- TikTok: @strokedoutsasquatch
- Website: strokerecoveryacademy.com
- Nonprofit: strokelyfe.org
`;
    setEditorContent(prev => prev + "\n\n" + aboutMe);
    setShowAboutMeGenerator(false);
  };

  const generateTable = () => {
    let tableMarkdown = `\n\n| ${tableData.headers.join(' | ')} |\n`;
    tableMarkdown += `| ${tableData.headers.map(() => '---').join(' | ')} |\n`;
    tableData.data.forEach(row => {
      tableMarkdown += `| ${row.join(' | ')} |\n`;
    });
    tableMarkdown += '\n';
    setEditorContent(prev => prev + tableMarkdown);
    setShowTableGenerator(false);
  };

  const generateChart = () => {
    const chartMarkdown = `\n\n### ${chartData.title}

\`\`\`chart
Type: ${chartData.type}
Data:
${chartData.labels.map((label, i) => `  ${label}: ${chartData.values[i]}%`).join('\n')}
\`\`\`

*Chart showing ${chartData.title.toLowerCase()} over time.*

\n`;
    setEditorContent(prev => prev + chartMarkdown);
    setShowChartGenerator(false);
  };

  const exportToKDP = () => {
    const content = chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_KDP.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const targetWordCount = projectType === "book" ? 50000 : 10000;
  const progress = Math.min((totalWordCount / targetWordCount) * 100, 100);

  return (
    <>
      <Helmet>
        <title>Book & Course Studio | Stroke Lyfe Publishing</title>
        <meta name="description" content="Professional book and course creation studio. Write your stroke recovery story with AI assistance, generate images, charts, and tables, then publish to Amazon KDP." />
      </Helmet>

      <div className="min-h-screen bg-black text-white flex flex-col">
        <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <Link href="/sra">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <img src={strokeLyfePublishingLogo} alt="Stroke Lyfe Publishing" className="h-8 w-8" />
              <div>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0"
                  data-testid="input-project-title"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    {projectType === "book" ? "Book" : "Course"}
                  </Badge>
                  <span>{totalWordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{chapters.length} chapters</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-700" onClick={() => setShowTemplates(true)} data-testid="button-templates">
                <Layout className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline" size="sm" className="border-gray-700" data-testid="button-save">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem onClick={exportToKDP} className="cursor-pointer">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to KDP (Markdown)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Export as EPUB
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="cursor-pointer text-orange-500">
                    <Crown className="h-4 w-4 mr-2" />
                    Publish to Amazon KDP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Progress to {targetWordCount.toLocaleString()} words:</span>
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs font-medium text-orange-500">{Math.round(progress)}%</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col">
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Chapters</h3>
              <Button variant="ghost" size="icon" onClick={addChapter} data-testid="button-add-chapter">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`group p-2 rounded-lg cursor-pointer transition-colors ${
                      activeChapterId === chapter.id ? 'bg-orange-600/20 border border-orange-600/30' : 'hover:bg-gray-800'
                    }`}
                    onClick={() => selectChapter(chapter.id)}
                    data-testid={`chapter-${chapter.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-500">{index + 1}</span>
                      <Input
                        value={chapter.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateChapterTitle(chapter.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChapter(chapter.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="ml-6 mt-1 text-xs text-gray-500">
                      {chapter.wordCount} words
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t border-gray-800 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-gray-700 text-sm"
                onClick={() => setShowAboutMeGenerator(true)}
                data-testid="button-about-me"
              >
                <User className="h-4 w-4 mr-2" />
                About Me
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-gray-700 text-sm"
                onClick={() => setShowMediaLibrary(true)}
                data-testid="button-media-library"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Media Library
              </Button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-800 bg-gray-950 p-2">
              <div className="flex items-center gap-1 flex-wrap">
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2 mr-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2 mr-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2 mr-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2 mr-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2 mr-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowMediaLibrary(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowTableGenerator(true)}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowChartGenerator(true)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-orange-600 text-orange-500 hover:bg-orange-600/10">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Write
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700 w-48">
                      {aiPromptTemplates.map(template => (
                        <DropdownMenuItem
                          key={template.id}
                          onClick={() => generateAIContent(template.id)}
                          className="cursor-pointer"
                        >
                          <template.icon className="h-4 w-4 mr-2" />
                          {template.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-600 text-purple-500 hover:bg-purple-600/10"
                    onClick={() => setShowImageGenerator(true)}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6 text-orange-500">
                    {chapters.find(ch => ch.id === activeChapterId)?.title || "Untitled Chapter"}
                  </h2>
                  
                  <Textarea
                    value={editorContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing your story here...

Tips for getting started:
• Click 'AI Write' to generate content with AI assistance
• Use the toolbar to format your text
• Insert images, tables, and charts
• Create your About Me section with one click

Your story matters. Every word is a step toward helping others on their recovery journey."
                    className="min-h-[600px] bg-transparent border-none text-lg leading-relaxed resize-none focus-visible:ring-0 placeholder:text-gray-600"
                    data-testid="editor-textarea"
                  />
                </div>
              </div>
              
              {showAiPanel && (
                <div className="w-96 border-l border-gray-800 bg-gray-950 p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      AI Suggestion
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowAiPanel(false)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mb-4" />
                      <p className="text-sm text-gray-400">Generating content...</p>
                    </div>
                  ) : (
                    <>
                      <Card className="bg-gray-800 border-gray-700 mb-4">
                        <CardContent className="p-4">
                          <p className="text-sm whitespace-pre-wrap">{aiSuggestion}</p>
                        </CardContent>
                      </Card>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          onClick={insertAiSuggestion}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Insert
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-gray-700"
                          onClick={() => generateAIContent('expand')}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 bg-gray-950 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>{wordCount} words in chapter</span>
                <span>•</span>
                <span>{totalWordCount.toLocaleString()} total words</span>
                <span>•</span>
                <span>~{Math.ceil(totalWordCount / 250)} pages</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Auto-saved</span>
                <span>•</span>
                <span>{chapters.length} chapters</span>
              </div>
            </div>
          </main>

          <aside className="w-72 border-l border-gray-800 bg-gray-950 flex flex-col">
            <Tabs defaultValue="video" className="flex-1 flex flex-col">
              <TabsList className="bg-gray-900 border-b border-gray-800 rounded-none justify-start p-1 m-2">
                <TabsTrigger value="video" className="text-xs data-[state=active]:bg-orange-600">
                  <Video className="h-3 w-3 mr-1" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="publish" className="text-xs data-[state=active]:bg-orange-600">
                  <Globe className="h-3 w-3 mr-1" />
                  Publish
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-orange-600">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="flex-1 p-3 space-y-4 overflow-auto m-0">
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Film className="h-4 w-4 text-orange-500" />
                    Video Studio
                  </h4>
                  <p className="text-xs text-gray-400 mb-4">
                    Convert your chapters into engaging video content for social media.
                  </p>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <Youtube className="h-4 w-4 mr-2 text-red-500" />
                      YouTube Long-form
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                      Instagram Reel
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <Music className="h-4 w-4 mr-2" />
                      TikTok
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <Facebook className="h-4 w-4 mr-2 text-blue-500" />
                      Facebook Video
                    </Button>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div>
                  <h4 className="font-semibold text-sm mb-3">Voice Options</h4>
                  <Select defaultValue="nick">
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="nick">Nick's Voice</SelectItem>
                      <SelectItem value="professional">Professional Male</SelectItem>
                      <SelectItem value="female">Professional Female</SelectItem>
                      <SelectItem value="custom">Upload Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-3">Background Music</h4>
                  <Select defaultValue="inspirational">
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="upbeat">Upbeat</SelectItem>
                      <SelectItem value="none">No Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-create-video">
                  <Play className="h-4 w-4 mr-2" />
                  Create Video
                </Button>
              </TabsContent>
              
              <TabsContent value="publish" className="flex-1 p-3 space-y-4 overflow-auto m-0">
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-orange-500" />
                    Publishing Options
                  </h4>
                  
                  <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={strokeLyfePublishingLogo} alt="Stroke Lyfe" className="h-6 w-6" />
                        <span className="font-semibold text-sm">Amazon KDP</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-3">
                        One-click publish to Amazon Kindle Direct Publishing with automatic formatting.
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-publish-kdp">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Publish to KDP
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <BookMarked className="h-4 w-4 mr-2" />
                      SRA Marketplace
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Course Platform
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start border-gray-700">
                      <Globe className="h-4 w-4 mr-2" />
                      Personal Website
                    </Button>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div>
                  <h4 className="font-semibold text-sm mb-3">Export Formats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="border-gray-700 text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      EPUB
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 text-xs">
                      <FileDown className="h-3 w-3 mr-1" />
                      DOCX
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 text-xs">
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="flex-1 p-3 space-y-4 overflow-auto m-0">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Project Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-400">Project Type</Label>
                      <Select value={projectType} onValueChange={(v: "book" | "course") => setProjectType(v)}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="book">Book / Memoir</SelectItem>
                          <SelectItem value="course">Video Course</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-400">Target Word Count</Label>
                      <Input 
                        type="number"
                        value={targetWordCount}
                        className="bg-gray-800 border-gray-700 mt-1"
                        readOnly
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Auto-save</Label>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Spell Check</Label>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">AI Suggestions</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div>
                  <h4 className="font-semibold text-sm mb-3">Book Metadata</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-400">Author Name</Label>
                      <Input 
                        defaultValue="Nicholas Kremers"
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">ISBN (optional)</Label>
                      <Input 
                        placeholder="Enter ISBN"
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Category</Label>
                      <Select defaultValue="health">
                        <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="health">Health & Wellness</SelectItem>
                          <SelectItem value="memoir">Memoir</SelectItem>
                          <SelectItem value="self-help">Self-Help</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        </div>

        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-orange-500" />
                Choose a Template
              </DialogTitle>
              <DialogDescription>
                Start with a professionally structured template for your content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {bookTemplates.map(template => (
                <Card 
                  key={template.id}
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover-elevate ${
                    selectedTemplate?.id === template.id ? 'border-orange-500' : ''
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">
                          {template.chapters.length} chapters
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-orange-500" />
                Media Library
              </DialogTitle>
              <DialogDescription>
                Upload images or choose from your media library.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="library">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="library" className="data-[state=active]:bg-orange-600">
                  Stock Images
                </TabsTrigger>
                <TabsTrigger value="uploaded" className="data-[state=active]:bg-orange-600">
                  My Uploads
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-orange-600">
                  Upload New
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="library" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-3 gap-4">
                    {stockImages.map(image => (
                      <Card 
                        key={image.id}
                        className="bg-gray-800 border-gray-700 cursor-pointer hover-elevate overflow-hidden"
                        onClick={() => insertImage(image.url, image.name)}
                      >
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <CardContent className="p-2">
                          <p className="text-xs truncate">{image.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="uploaded" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {uploadedMedia.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedMedia.filter(m => m.type === 'image').map(image => (
                        <Card 
                          key={image.id}
                          className="bg-gray-800 border-gray-700 cursor-pointer hover-elevate overflow-hidden"
                          onClick={() => insertImage(image.url, image.name)}
                        >
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-32 object-cover"
                          />
                          <CardContent className="p-2">
                            <p className="text-xs truncate">{image.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                      <p>No uploaded images yet</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="upload" className="mt-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-4">Drag and drop files here, or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="border-orange-500 text-orange-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={showAboutMeGenerator} onOpenChange={setShowAboutMeGenerator}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                About Me Generator
              </DialogTitle>
              <DialogDescription>
                Create a compelling author biography for your book.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={aboutMeData.name}
                    onChange={(e) => setAboutMeData({...aboutMeData, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
                <div>
                  <Label>Nickname/Alias</Label>
                  <Input
                    value={aboutMeData.nickname}
                    onChange={(e) => setAboutMeData({...aboutMeData, nickname: e.target.value})}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stroke Date</Label>
                  <Input
                    value={aboutMeData.strokeDate}
                    onChange={(e) => setAboutMeData({...aboutMeData, strokeDate: e.target.value})}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
                <div>
                  <Label>Stroke Type</Label>
                  <Select 
                    value={aboutMeData.strokeType}
                    onValueChange={(v) => setAboutMeData({...aboutMeData, strokeType: v})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="Hemorrhagic">Hemorrhagic</SelectItem>
                      <SelectItem value="Ischemic">Ischemic</SelectItem>
                      <SelectItem value="TIA">TIA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Recovery Percentage</Label>
                <Input
                  value={aboutMeData.recoveryPercent}
                  onChange={(e) => setAboutMeData({...aboutMeData, recoveryPercent: e.target.value})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              
              <div>
                <Label>Mission Statement</Label>
                <Textarea
                  value={aboutMeData.mission}
                  onChange={(e) => setAboutMeData({...aboutMeData, mission: e.target.value})}
                  className="bg-gray-800 border-gray-700 mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Signature Quote</Label>
                <Input
                  value={aboutMeData.quote}
                  onChange={(e) => setAboutMeData({...aboutMeData, quote: e.target.value})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAboutMeGenerator(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={generateAboutMe}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate & Insert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showTableGenerator} onOpenChange={setShowTableGenerator}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-orange-500" />
                Table Generator
              </DialogTitle>
              <DialogDescription>
                Create a formatted table for your content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    value={tableData.rows}
                    onChange={(e) => setTableData({...tableData, rows: parseInt(e.target.value)})}
                    className="bg-gray-800 border-gray-700 mt-1"
                    min={1}
                    max={20}
                  />
                </div>
                <div>
                  <Label>Columns</Label>
                  <Input
                    type="number"
                    value={tableData.cols}
                    onChange={(e) => setTableData({...tableData, cols: parseInt(e.target.value)})}
                    className="bg-gray-800 border-gray-700 mt-1"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
              
              <div>
                <Label>Column Headers (comma-separated)</Label>
                <Input
                  value={tableData.headers.join(", ")}
                  onChange={(e) => setTableData({...tableData, headers: e.target.value.split(", ")})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {tableData.headers.map((h, i) => (
                        <th key={i} className="border border-gray-600 p-2 bg-gray-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.data.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-gray-600 p-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTableGenerator(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={generateTable}>
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showChartGenerator} onOpenChange={setShowChartGenerator}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Chart Generator
              </DialogTitle>
              <DialogDescription>
                Create a visual chart to illustrate your recovery progress.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Chart Type</Label>
                <Select 
                  value={chartData.type}
                  onValueChange={(v) => setChartData({...chartData, type: v})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Chart Title</Label>
                <Input
                  value={chartData.title}
                  onChange={(e) => setChartData({...chartData, title: e.target.value})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              
              <div>
                <Label>Labels (comma-separated)</Label>
                <Input
                  value={chartData.labels.join(", ")}
                  onChange={(e) => setChartData({...chartData, labels: e.target.value.split(", ")})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              
              <div>
                <Label>Values (comma-separated percentages)</Label>
                <Input
                  value={chartData.values.join(", ")}
                  onChange={(e) => setChartData({...chartData, values: e.target.value.split(", ").map(Number)})}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Preview: {chartData.title}</p>
                <div className="flex items-end gap-2 h-32">
                  {chartData.values.map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-orange-600 rounded-t"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs mt-1 text-gray-400">{chartData.labels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChartGenerator(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={generateChart}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Insert Chart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showImageGenerator} onOpenChange={setShowImageGenerator}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                AI Image Generator
              </DialogTitle>
              <DialogDescription>
                Generate custom images for your book using AI.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Describe the image you want</Label>
                <Textarea
                  placeholder="Example: A serene image of a person doing physical therapy exercises in a bright, hopeful rehabilitation room with sunlight streaming through windows..."
                  className="bg-gray-800 border-gray-700 mt-1"
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Style</Label>
                <Select defaultValue="realistic">
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="realistic">Realistic Photography</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="sketch">Pencil Sketch</SelectItem>
                    <SelectItem value="digital">Digital Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Aspect Ratio</Label>
                <Select defaultValue="16:9">
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageGenerator(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
