import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Book, BookOpen, ChevronRight, Lock, CheckCircle2, Star, Clock, 
  ExternalLink, Calculator, MapPin, FileText, Wrench, Users, 
  AlertTriangle, Lightbulb, Award, Shield, Download, QrCode, GraduationCap,
  Copy, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { bibleChapters, bibleAppendices, bibleMetadata } from "@/data/laundromat-bible";
import larryLarsenPhoto from "@assets/image_1765341641648.png";
import QRCodeStyling from "qr-code-styling";

interface TrapAlert {
  trap: string;
  warning: string;
  solution: string;
}

const trapAlerts: { category: string; alerts: TrapAlert[] }[] = [
  {
    category: "Financial Traps",
    alerts: [
      {
        trap: "Cash flow easily faked",
        warning: "Cash flow is easily faked; water bills don't lie. Always verify revenue against water usage.",
        solution: "Request 12 months of water bills. Calculate actual turns vs claimed revenue."
      },
      {
        trap: "P&L vs Tax mismatch",
        warning: "If the P&L doesn't align with bank deposits or tax returns, walk away.",
        solution: "Demand 3 years of tax returns AND bank statements."
      },
      {
        trap: "Undocumented income",
        warning: "Every dollar you don't document is worth $3-4 less at sale time.",
        solution: "Keep meticulous records. Card systems provide automatic documentation."
      }
    ]
  },
  {
    category: "Lease Traps",
    alerts: [
      {
        trap: "Short lease with verbal promise",
        warning: "Never accept a 5-year lease because the seller says 'the landlord will renew.'",
        solution: "Require minimum 10 years with two 5-year options IN WRITING."
      },
      {
        trap: "Triple Net (NNN) ambiguity",
        warning: "Triple Net means everything. Confirm you aren't stuck paying for the landlord's HVAC or roof.",
        solution: "Get NNN breakdown in writing. Specify landlord handles structural."
      },
      {
        trap: "No assignment rights",
        warning: "If you can't assign the lease to a buyer, you can't sell the business.",
        solution: "Ensure full assignment rights with reasonable landlord approval."
      }
    ]
  },
  {
    category: "Equipment Traps",
    alerts: [
      {
        trap: "False equipment age",
        warning: "Check the serial number for the true manufacture date. Sellers claim machines are '5 years old' when they're 15.",
        solution: "Decode serial numbers. One letter or digit tells the whole story."
      },
      {
        trap: "Old machine efficiency",
        warning: "A 40-year-old Maytag uses 45 gallons per load. A new Speed Queen uses 12.",
        solution: "Calculate utility cost per turn for each machine."
      }
    ]
  }
];

const platformTools = [
  {
    name: "CLEANBI Explorer",
    description: "17-factor location scoring system",
    icon: MapPin,
    href: "/cleanbi",
    color: "from-emerald-500 to-emerald-700"
  },
  {
    name: "What-If Analysis",
    description: "10-variable scenario modeling",
    icon: Calculator,
    href: "/what-if",
    color: "from-blue-500 to-blue-700"
  },
  {
    name: "Valuation Calculator",
    description: "SDE and cap rate valuations",
    icon: FileText,
    href: "/valuation",
    color: "from-purple-500 to-purple-700"
  },
  {
    name: "Service Guy AI",
    description: "Equipment diagnostics",
    icon: Wrench,
    href: "/service-guy",
    color: "from-orange-500 to-orange-700"
  },
  {
    name: "Larry's Academy",
    description: "50+ years of education",
    icon: GraduationCap,
    href: "/larrys-academy",
    color: "from-amber-500 to-amber-700"
  },
  {
    name: "Deal Analyzer",
    description: "Acquisition evaluation",
    icon: Shield,
    href: "/deal-analyzer",
    color: "from-pink-500 to-pink-700"
  }
];

const partGroups = [
  { part: 1, title: "Foundations of a Laundry Empire", chapters: [1, 2, 3, 4] },
  { part: 2, title: "Building the Machine", chapters: [5, 6, 7, 8] },
  { part: 3, title: "Scaling and Legacy", chapters: [9, 10, 11, 12, 13] },
  { part: 4, title: "Future of Laundromats", chapters: [14, 15] }
];

export default function LaundromatBiblePage() {
  const { user, isAuthenticated } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chapters");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrChapter, setQrChapter] = useState<typeof bibleChapters[0] | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  
  const hasBookAccess = hasFeatureAccess("book-access").hasAccess || hasFeatureAccess("pro").hasAccess;
  
  const getChaptersByPart = (part: number) => {
    return bibleChapters.filter(ch => ch.part === part);
  };

  const selectedChapterData = selectedChapter 
    ? bibleChapters.find(ch => ch.id === selectedChapter) 
    : null;

  const getChapterToolUrl = (chapter: typeof bibleChapters[0]) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com';
    const toolMap: Record<number, string> = {
      1: '/about-us',
      2: '/cleanbi',
      3: '/cleanbi-explorer',
      4: '/resources',
      5: '/service-guy-ai',
      6: '/design-studio',
      7: '/valuation',
      8: '/pos-suite',
      9: '/resources',
      10: '/marketing-loyalty',
      11: '/doctrine',
      12: '/valuation',
      13: '/marketplace',
      14: '/blog',
      15: '/larrys-academy',
    };
    const tool = toolMap[chapter.chapterNumber] || '/laundromat-bible';
    return `${baseUrl}${tool}?ref=bible-ch${chapter.chapterNumber}`;
  };

  const openQrModal = (chapter: typeof bibleChapters[0]) => {
    setQrChapter(chapter);
    setQrModalOpen(true);
  };

  useEffect(() => {
    if (qrModalOpen && qrChapter && qrRef.current) {
      const url = getChapterToolUrl(qrChapter);
      
      if (qrCodeRef.current) {
        qrCodeRef.current.update({ data: url });
      } else {
        qrCodeRef.current = new QRCodeStyling({
          width: 280,
          height: 280,
          data: url,
          dotsOptions: {
            color: "#0A1628",
            type: "rounded"
          },
          cornersSquareOptions: {
            color: "#C8A661",
            type: "extra-rounded"
          },
          cornersDotOptions: {
            color: "#C8A661",
            type: "dot"
          },
          backgroundOptions: {
            color: "#ffffff"
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 8
          }
        });
        
        qrRef.current.innerHTML = '';
        qrCodeRef.current.append(qrRef.current);
      }
    }
  }, [qrModalOpen, qrChapter]);

  const downloadQr = (format: 'png' | 'svg') => {
    if (qrCodeRef.current && qrChapter) {
      qrCodeRef.current.download({
        name: `washbizhub-bible-ch${qrChapter.chapterNumber}`,
        extension: format
      });
      toast({
        title: "QR Code Downloaded",
        description: `Chapter ${qrChapter.chapterNumber} QR code saved as ${format.toUpperCase()}`
      });
    }
  };

  const copyQrUrl = () => {
    if (qrChapter) {
      const url = getChapterToolUrl(qrChapter);
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Chapter tool link copied to clipboard"
      });
    }
  };

  return (
    <>
      <SEO 
        title="The Laundromat Bible | Complete Playbook"
        description="The definitive guide to laundromat ownership by Nick Kremers and Larry Larsen. 50+ years of combined expertise, C.L.E.A.N. methodology, trap alerts, and platform tools."
      />
      
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb 
              items={[
                { label: "Resources", href: "/resources" },
                { label: "The Laundromat Bible" }
              ]} 
            />
            
            <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Book className="w-8 h-8 text-primary" />
                  <Badge variant="default" className="bg-amber-600">Complete Playbook</Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3" data-testid="text-bible-title">
                  {bibleMetadata.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-4" data-testid="text-bible-subtitle">
                  {bibleMetadata.subtitle}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>By {bibleMetadata.authors[0].name.split("'")[0]}</span>
                  </div>
                  <span className="text-muted-foreground/50">+</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Larry Larsen</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{bibleChapters.length} Chapters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{bibleAppendices.length} Appendices</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 lg:items-end">
                {hasBookAccess ? (
                  <Badge variant="outline" className="gap-1.5 border-green-500 text-green-600" data-testid="badge-full-access">
                    <CheckCircle2 className="w-4 h-4" />
                    Full Access
                  </Badge>
                ) : (
                  <Link href="/pricing">
                    <Button size="lg" className="gap-2" data-testid="button-unlock-access">
                      <Lock className="w-4 h-4" />
                      Unlock Full Access
                    </Button>
                  </Link>
                )}
                
                <a href="https://amazon.com/dp/XXXXXXXXX" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2" data-testid="button-buy-paperback">
                    <ExternalLink className="w-4 h-4" />
                    Buy Paperback on Amazon
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-xl grid-cols-4">
              <TabsTrigger value="chapters" data-testid="tab-chapters">
                <BookOpen className="w-4 h-4 mr-2" />
                Chapters
              </TabsTrigger>
              <TabsTrigger value="tools" data-testid="tab-tools">
                <Calculator className="w-4 h-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="traps" data-testid="tab-traps">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Trap Alerts
              </TabsTrigger>
              <TabsTrigger value="authors" data-testid="tab-authors">
                <Users className="w-4 h-4 mr-2" />
                Authors
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chapters" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <Card className="sticky top-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Table of Contents</CardTitle>
                      <CardDescription>
                        {bibleChapters.length} chapters across {partGroups.length} parts
                      </CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        <Accordion type="single" collapsible className="w-full">
                          {partGroups.map((part) => (
                            <AccordionItem key={part.part} value={`part-${part.part}`}>
                              <AccordionTrigger className="px-4 py-3 text-sm font-semibold">
                                <span>Part {part.part}: {part.title}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-2 pb-2">
                                {getChaptersByPart(part.part).map((chapter) => (
                                  <button
                                    key={chapter.id}
                                    onClick={() => setSelectedChapter(chapter.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                      selectedChapter === chapter.id 
                                        ? "bg-primary text-primary-foreground" 
                                        : "hover:bg-muted"
                                    }`}
                                    data-testid={`button-chapter-${chapter.id}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium">
                                          Ch. {chapter.chapterNumber}: {chapter.title}
                                        </span>
                                        <p className="text-xs opacity-75 truncate">
                                          {chapter.subtitle}
                                        </p>
                                      </div>
                                      {chapter.isPremium && !hasBookAccess ? (
                                        <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        
                        <div className="px-4 py-3 border-t">
                          <h4 className="text-sm font-semibold mb-2">Appendices</h4>
                          {bibleAppendices.map((appendix) => (
                            <div key={appendix.id} className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Appendix {appendix.letter}: {appendix.title}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-8">
                  {selectedChapterData ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              Part {selectedChapterData.part}: {selectedChapterData.partTitle}
                            </Badge>
                            <CardTitle className="text-2xl" data-testid="text-chapter-title">
                              Chapter {selectedChapterData.chapterNumber}: {selectedChapterData.title}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                              {selectedChapterData.subtitle}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {selectedChapterData.estimatedReadTime}
                            </Badge>
                            {selectedChapterData.isPremium && (
                              <Badge variant="default">Premium</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6" data-testid="text-chapter-description">
                          {selectedChapterData.description}
                        </p>
                        
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Key Topics Covered
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedChapterData.keyTopics.map((topic, idx) => (
                              <Badge key={idx} variant="secondary">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        {selectedChapterData.isPremium && !hasBookAccess ? (
                          <Card className="bg-muted/50 border-dashed">
                            <CardContent className="py-8 text-center">
                              <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                              <h4 className="font-semibold mb-2">Premium Chapter</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Unlock full access to read this chapter and all premium content.
                              </p>
                              <Link href="/pricing">
                                <Button data-testid="button-unlock-chapter">Unlock Access</Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-muted-foreground italic">
                              Full chapter content available in the digital book and paperback edition.
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => openQrModal(selectedChapterData)}
                          data-testid="button-get-qr"
                        >
                          <QrCode className="w-4 h-4" />
                          Get QR Code
                        </Button>
                        <Link href="/qr-generator">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Marketing QR Codes
                          </Button>
                        </Link>
                        <Link href="/cleanbi">
                          <Button variant="outline" size="sm" className="gap-2">
                            <MapPin className="w-4 h-4" />
                            Try CLEANBI
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="h-full min-h-[400px] flex items-center justify-center">
                      <div className="text-center p-8">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select a Chapter</h3>
                        <p className="text-muted-foreground">
                          Choose a chapter from the table of contents to view its details.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Platform Tools</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every chapter in The Laundromat Bible connects to powerful WashBizHub tools. 
                  Scan QR codes in the book or access them directly here.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformTools.map((tool) => (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="h-full hover-elevate cursor-pointer group">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {tool.name}
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                          <span>Launch Tool</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="traps" className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <h2 className="text-2xl font-bold">Larry's Trap Alerts</h2>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  50+ years of due diligence expertise distilled into warnings that have saved buyers 
                  from millions in bad deals. "Those bills don't lie — and neither do I."
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {trapAlerts.map((category) => (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                      <CardDescription>{category.alerts.length} trap alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.alerts.map((alert, idx) => (
                        <div key={idx} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                          <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            {alert.trap}
                          </h4>
                          <p className="text-sm text-muted-foreground">{alert.warning}</p>
                          <p className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{alert.solution}</span>
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={larryLarsenPhoto} 
                      alt="Larry Larsen"
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500"
                    />
                    <div>
                      <h4 className="font-semibold">Larry's Due Diligence Mantra</h4>
                      <p className="text-lg italic text-muted-foreground mt-1">
                        "If the seller can't produce 12 months of utility bills, walk away. Those bills don't lie — and neither do I."
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        — Lawrence "Laundromat Larry" Larsen, 50+ years experience, 2,000+ stores evaluated
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="authors" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bibleMetadata.authors.map((author, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {idx === 1 ? (
                          <img 
                            src={larryLarsenPhoto} 
                            alt={author.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                            NK
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl">{author.name.split("'")[0]}</CardTitle>
                          <Badge variant="secondary" className="mt-1">{author.role}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{author.bio}</p>
                      
                      {idx === 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">3rd Gen</div>
                            <div className="text-xs text-muted-foreground">Industry Expert</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">70K+</div>
                            <div className="text-xs text-muted-foreground">Community Members</div>
                          </div>
                        </div>
                      )}
                      
                      {idx === 1 && (
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xl font-bold text-primary">50+</div>
                            <div className="text-xs text-muted-foreground">Years</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xl font-bold text-primary">2K+</div>
                            <div className="text-xs text-muted-foreground">Stores Evaluated</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xl font-bold text-primary">135+</div>
                            <div className="text-xs text-muted-foreground">Store Designs</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {idx === 1 ? (
                        <Link href="/larrys-academy">
                          <Button variant="outline" className="gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Visit Larry's Academy
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/about-us">
                          <Button variant="outline" className="gap-2">
                            <Users className="w-4 h-4" />
                            About WashBizHub
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="py-8 text-center">
                  <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">The Complete Laundromat Playbook</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                    This book represents the most comprehensive laundromat guide ever created — 
                    combining three generations of Kremers expertise with Larry Larsen's 50+ years of 
                    due diligence wisdom. It's designed to be talked about 50 years from now.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/pricing">
                      <Button size="lg" className="gap-2">
                        <Lock className="w-4 h-4" />
                        Get Digital Access
                      </Button>
                    </Link>
                    <a href="https://amazon.com/dp/XXXXXXXXX" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Buy on Amazon
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Chapter QR Code
            </DialogTitle>
            <DialogDescription>
              {qrChapter && (
                <>
                  Ch. {qrChapter.chapterNumber}: {qrChapter.title}
                  <br />
                  <span className="text-xs">Links to related platform tool</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <div 
              ref={qrRef} 
              className="bg-white p-4 rounded-lg border shadow-sm"
              data-testid="qr-code-display"
            />
            
            {qrChapter && (
              <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs">
                Scan to access the {qrChapter.title} tool on WashBizHub
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadQr('png')}
              className="gap-2"
              data-testid="button-download-png"
            >
              <Download className="w-4 h-4" />
              PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadQr('svg')}
              className="gap-2"
              data-testid="button-download-svg"
            >
              <Download className="w-4 h-4" />
              SVG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyQrUrl}
              className="gap-2"
              data-testid="button-copy-url"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center mb-2">
              For advanced QR codes with custom branding:
            </p>
            <Link href="/qr-generator">
              <Button variant="default" className="w-full gap-2" size="sm">
                <QrCode className="w-4 h-4" />
                Open Full QR Generator
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
