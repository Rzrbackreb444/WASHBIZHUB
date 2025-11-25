import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  PenTool,
  FileText,
  Download,
  ArrowLeft,
  Plus,
  ChevronRight,
  BookMarked,
  Wand2,
  Target,
  Users,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Zap,
  Upload,
  Share2,
  Youtube,
  Instagram,
  Facebook
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import strokeLyfePublishingLogo from "@assets/Logo Transparent BG_1764090018405.png";

const chapterTemplates = [
  {
    id: 1,
    title: "The Day Everything Changed",
    theme: "The rupture that rewrote everything",
    canonPrinciple: "You don't survive a stroke. You interrogate it.",
    prompts: [
      "Describe the moment you knew something was wrong",
      "What were the first words you heard after?",
      "Who was there with you?"
    ]
  },
  {
    id: 2,
    title: "The Hospital: A New Reality",
    theme: "The grind is the gospel",
    canonPrinciple: "Recovery isn't a comeback—it's a reconstruction.",
    prompts: [
      "What was your first clear memory in the hospital?",
      "Who showed up for you?",
      "What was the hardest thing to accept?"
    ]
  },
  {
    id: 3,
    title: "Learning to Fight Again",
    theme: "The philosophy behind the fight",
    canonPrinciple: "Interrogate the stroke. Extract doctrine from the wreckage.",
    prompts: [
      "What was your first small victory?",
      "Who pushed you hardest?",
      "What motivated you to keep going?"
    ]
  },
  {
    id: 4,
    title: "The Long Road Back",
    theme: "Progress is never linear",
    canonPrinciple: "A body in motion stays in motion.",
    prompts: [
      "Describe a setback and how you overcame it",
      "What exercises or therapies helped most?",
      "What surprised you about recovery?"
    ]
  },
  {
    id: 5,
    title: "Finding Your Voice",
    theme: "Speaking your truth",
    canonPrinciple: "Your story is your weapon.",
    prompts: [
      "When did you first share your story?",
      "How did telling your story help others?",
      "What do you want people to understand?"
    ]
  }
];

const kdpFormats = [
  { id: "6x9", name: "6\" x 9\"", description: "Most popular for memoirs", recommended: true },
  { id: "5.5x8.5", name: "5.5\" x 8.5\"", description: "Compact trade paperback" },
  { id: "5x8", name: "5\" x 8\"", description: "Mass market paperback" },
];

export default function SRAGhostwriting() {
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const projects = [
    {
      id: "1",
      title: "My Stroke Story: Fighting Back",
      status: "writing",
      progress: 45,
      chapters: 10,
      completedChapters: 4,
      wordCount: 18500,
      targetWordCount: 50000,
      lastEdited: new Date("2024-11-20"),
    }
  ];

  const handleOneClickPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
    }, 3000);
  };

  return (
    <>
      <Helmet>
        <title>Stroke Lyfe Publishing | Write Your Recovery Story</title>
        <meta name="description" content="Write and publish your stroke recovery story with AI assistance. One-click KDP publishing. Templates based on Nick Kremers' bestselling structure. REBUILD. REWIRE. RISE." />
        <meta property="og:title" content="Stroke Lyfe Publishing | Write & Publish Your Story" />
        <meta property="og:description" content="Transform your recovery journey into an inspiring book. AI-powered ghostwriting with one-click Amazon KDP publishing." />
        <meta property="og:image" content={strokeLyfePublishingLogo} />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/sra">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <img 
                    src={strokeLyfePublishingLogo} 
                    alt="Stroke Lyfe Publishing" 
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold" data-testid="text-title">Stroke Lyfe Publishing</h1>
                    <p className="text-sm text-gray-400">REBUILD. REWIRE. RISE.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="border-gray-700" data-testid="button-video-studio">
                  <Youtube className="h-4 w-4 mr-2" />
                  Video Studio
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-new-project">
                  <Plus className="h-4 w-4 mr-2" />
                  New Book
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner with Logo */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-orange-600 mb-4">AI-Powered Publishing</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-hero">
                  Your Story Deserves to Be Told
                </h2>
                <p className="text-gray-300 mb-6">
                  Transform your recovery journey into an inspiring book. AI-powered ghostwriting guides you through every chapter. One-click publish to Amazon KDP.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">One-Click KDP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">AI Writing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Video Studio</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <img 
                  src={strokeLyfePublishingLogo} 
                  alt="Stroke Lyfe Publishing" 
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-900 border border-gray-800 mb-6 flex-wrap h-auto">
              <TabsTrigger value="projects" className="data-[state=active]:bg-orange-600" data-testid="tab-projects">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-orange-600" data-testid="tab-templates">
                Templates
              </TabsTrigger>
              <TabsTrigger value="publish" className="data-[state=active]:bg-orange-600" data-testid="tab-publish">
                Publish
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-orange-600" data-testid="tab-video">
                Video
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-gray-900 border-gray-800 hover-elevate cursor-pointer" data-testid={`project-card-${project.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {project.status === "writing" ? "In Progress" : project.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {project.lastEdited.toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
                      <CardDescription>
                        {project.completedChapters} of {project.chapters} chapters complete
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-orange-500">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Word Count</span>
                          <span>{project.wordCount.toLocaleString()} / {project.targetWordCount.toLocaleString()}</span>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid={`button-continue-${project.id}`}>
                          Continue Writing
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-gray-900 border-gray-800 border-dashed hover-elevate cursor-pointer" data-testid="card-new-project">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                    <div className="h-16 w-16 rounded-full bg-orange-600/20 flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start Your Story</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Begin writing your recovery journey with AI assistance
                    </p>
                    <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
                      Create New Book
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Chapter Templates</h3>
                <p className="text-gray-400">Based on "The Stroked Out Sasquatch" structure by Nick Kremers</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {chapterTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`bg-gray-900 border-gray-800 hover-elevate cursor-pointer ${selectedChapter === template.id ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setSelectedChapter(template.id)}
                    data-testid={`template-card-${template.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-500 font-bold">{template.id}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription>{template.theme}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-orange-500 italic">
                          "{template.canonPrinciple}"
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase">Writing Prompts:</p>
                        {template.prompts.map((prompt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{prompt}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" data-testid={`button-use-template-${template.id}`}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Publish Tab - Enhanced with One-Click KDP */}
            <TabsContent value="publish">
              <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                <div>
                  {/* One-Click KDP Button - Main Feature */}
                  <Card className="bg-gradient-to-br from-green-600/30 to-green-500/10 border-green-600/50 mb-6">
                    <CardContent className="p-6 md:p-8 text-center">
                      <Rocket className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">One-Click Publish to KDP</h3>
                      <p className="text-gray-300 mb-6">
                        Auto-formats your manuscript and uploads directly to Amazon Kindle Direct Publishing. Ready to sell worldwide in minutes.
                      </p>
                      <Button 
                        onClick={handleOneClickPublish}
                        disabled={isPublishing}
                        className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto"
                        data-testid="button-one-click-kdp"
                      >
                        {isPublishing ? (
                          <>
                            <Zap className="h-5 w-5 mr-2 animate-pulse" />
                            Publishing to KDP...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-5 w-5 mr-2" />
                            Publish to Amazon KDP
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-4">
                        Formats to 6"x9", generates cover, sets pricing automatically
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="text-xl font-bold mb-4">Manual Export Options</h3>
                  <Card className="bg-gray-900 border-gray-800 mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">KDP Export Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Trim Size</label>
                        <div className="grid grid-cols-3 gap-2">
                          {kdpFormats.map((format) => (
                            <Button
                              key={format.id}
                              variant={format.recommended ? "default" : "outline"}
                              size="sm"
                              className={format.recommended ? "bg-orange-600 hover:bg-orange-700" : "border-gray-700"}
                              data-testid={`button-format-${format.id}`}
                            >
                              {format.name}
                              {format.recommended && <Star className="h-3 w-3 ml-1" />}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Interior Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700" data-testid="button-interior-bw">
                            Black & White
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-700" data-testid="button-interior-color">
                            Full Color
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-export-docx">
                      <Download className="h-4 w-4 mr-2" />
                      Export DOCX
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-export-epub">
                      <Download className="h-4 w-4 mr-2" />
                      Export EPUB
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Publishing Checklist</h3>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="pt-6 space-y-4">
                      {[
                        { label: "Manuscript complete (50,000+ words)", done: false },
                        { label: "All chapters reviewed", done: false },
                        { label: "Professional editing (optional)", done: false },
                        { label: "Cover design uploaded", done: false },
                        { label: "Book description written", done: false },
                        { label: "Keywords & categories selected", done: false },
                        { label: "Pricing set", done: false },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className={item.done ? "text-green-500" : "text-gray-400"}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30 mt-6">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookMarked className="h-5 w-5 text-orange-500" />
                        Need Help Publishing?
                      </h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Upgrade to Champion or Legend tier for professional editing assistance and publishing support.
                      </p>
                      <Link href="/sra/pricing">
                        <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10" data-testid="button-upgrade">
                          View Plans
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Video Studio Tab - NEW */}
            <TabsContent value="video">
              <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Create & Share Videos</h3>
                  <p className="text-gray-400 mb-6">
                    Record your recovery story, share tips, and connect with the community through video.
                  </p>

                  <Card className="bg-gray-900 border-gray-800 mb-6">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-700">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400">Drag video or click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 500MB</p>
                        </div>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-record-video">
                        <Youtube className="h-4 w-4 mr-2" />
                        Record New Video
                      </Button>
                    </CardContent>
                  </Card>

                  <h4 className="font-semibold mb-3">One-Click Share to:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-gray-700 hover:bg-red-600/20 hover:border-red-500" data-testid="button-share-youtube">
                      <Youtube className="h-4 w-4 mr-2 text-red-500" />
                      YouTube
                    </Button>
                    <Button variant="outline" className="border-gray-700 hover:bg-pink-600/20 hover:border-pink-500" data-testid="button-share-tiktok">
                      <SiTiktok className="h-4 w-4 mr-2" />
                      TikTok
                    </Button>
                    <Button variant="outline" className="border-gray-700 hover:bg-pink-600/20 hover:border-pink-500" data-testid="button-share-instagram">
                      <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="border-gray-700 hover:bg-blue-600/20 hover:border-blue-500" data-testid="button-share-facebook">
                      <Facebook className="h-4 w-4 mr-2 text-blue-500" />
                      Facebook
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Your Videos</h3>
                  <div className="space-y-4">
                    {[
                      { title: "My Recovery Journey - Day 100", views: "2.4K", date: "Nov 15", platform: "YouTube" },
                      { title: "3 Tips for Hand Therapy", views: "8.9K", date: "Nov 10", platform: "TikTok" },
                      { title: "Message to New Survivors", views: "1.2K", date: "Nov 5", platform: "Instagram" },
                    ].map((video, idx) => (
                      <Card key={idx} className="bg-gray-900 border-gray-800 hover-elevate" data-testid={`video-card-${idx}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-20 h-14 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                            <Youtube className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{video.title}</h4>
                            <p className="text-sm text-gray-400">{video.views} views • {video.date}</p>
                          </div>
                          <Badge variant="outline" className="border-gray-600 flex-shrink-0">
                            {video.platform}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30 mt-6">
                    <CardContent className="p-6 text-center">
                      <Share2 className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Grow Your Audience</h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Connect your social accounts for one-click publishing across all platforms.
                      </p>
                      <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-connect-socials">
                        Connect Accounts
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Stats Section */}
          <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold" data-testid="stat-books">47</div>
                <p className="text-xs md:text-sm text-gray-400">Books Published</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="pt-6">
                <Users className="h-6 md:h-8 w-6 md:w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold" data-testid="stat-authors">238</div>
                <p className="text-xs md:text-sm text-gray-400">Survivor Authors</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="pt-6">
                <FileText className="h-6 md:h-8 w-6 md:w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold" data-testid="stat-words">2.4M</div>
                <p className="text-xs md:text-sm text-gray-400">Words Written</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="pt-6">
                <Clock className="h-6 md:h-8 w-6 md:w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold" data-testid="stat-avg">6 wks</div>
                <p className="text-xs md:text-sm text-gray-400">Avg. to Publish</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
