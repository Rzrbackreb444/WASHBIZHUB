import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  StatusBadge,
} from "@/components/premium";
import { GifPicker } from "@/components/GifPicker";
import { FileUpload } from "@/components/FileUpload";
import {
  ArrowLeft,
  Send,
  Video,
  X,
  Plus,
  Sparkles,
  Search,
  Upload,
  Image,
  MessageSquare,
  Tag,
  FileText,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Smile,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import type { ForumCategory } from "@shared/schema";

const categoryDescriptions: Record<string, string> = {
  "operations": "Discuss daily operations, staffing, and management",
  "equipment": "Questions about machines, maintenance, and repairs",
  "buying-selling": "Valuations, acquisitions, and business sales",
  "marketing": "Promotions, advertising, and customer acquisition",
  "finance": "Revenue, expenses, loans, and financial planning",
  "general": "General discussions and community topics",
};

export default function ForumNewTopicPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{url: string; filename: string; contentType: string; size: number}[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState("");
  const [selectedGif, setSelectedGif] = useState<{url: string; previewUrl: string} | null>(null);
  
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const { data: categories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const createTopicMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/forum/topics", data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      toast({
        title: "Topic created!",
        description: "Your discussion topic has been published.",
      });
      setLocation(`/forum/topic/${response.slug || response.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddVideo = () => {
    if (videoInput.trim() && !videos.includes(videoInput.trim()) && videos.length < 3) {
      const isValidUrl = videoInput.includes('youtube.com') || videoInput.includes('youtu.be') || videoInput.includes('vimeo.com');
      if (isValidUrl) {
        setVideos([...videos, videoInput.trim()]);
        setVideoInput("");
      } else {
        toast({
          title: "Invalid video URL",
          description: "Please enter a valid YouTube or Vimeo URL",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveVideo = (url: string) => {
    setVideos(videos.filter(v => v !== url));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim()) && keywords.length < 10) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleGifSelect = (gifUrl: string, previewUrl: string) => {
    setSelectedGif({ url: gifUrl, previewUrl });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, content, and select a category.",
        variant: "destructive",
      });
      return;
    }

    const images = uploadedFiles
      .filter(f => f.contentType.startsWith('image/'))
      .map(f => f.url);

    let finalContent = content.trim();
    if (selectedGif) {
      finalContent += `\n\n![GIF](${selectedGif.url})`;
    }

    createTopicMutation.mutate({
      title: title.trim(),
      content: finalContent,
      categoryId,
      tags,
      images,
      videos,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
    });
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const selectedCategory = categories?.find(c => c.id === categoryId);
  const isFormValid = title.trim().length >= 5 && content.trim().length >= 20 && categoryId;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Create New Topic | WashBizHub Community Forum"
          description="Start a new discussion in the WashBizHub community forum. Share insights, ask questions, and connect with laundromat industry professionals."
          canonicalUrl="/forum/new"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Join our community to start discussions and connect with other laundromat owners
            </p>
            <Link href="/login">
              <Button size="lg" className="gap-2" data-testid="button-signin">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Create New Topic | WashBizHub Community Forum"
        description="Start a new discussion in the WashBizHub community forum. Share insights, ask questions, and connect with laundromat industry professionals."
        canonicalUrl="/forum/new"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Forum", url: "/forum" },
          { name: "New Topic", url: "/forum/new" },
        ]}
      />

      <div className="border-b bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="container mx-auto px-4 py-4">
          <Link href="/forum">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-forum">
              <ArrowLeft className="w-4 h-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <span className="p-2 rounded-xl bg-accent/10">
                <MessageSquare className="w-7 h-7 text-accent" />
              </span>
              Start a New Discussion
            </h1>
            <p className="text-muted-foreground">
              Share your question, insight, or start a discussion with our community of 72,000+ laundromat owners
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <PremiumCard accentPosition="left" testId="card-topic-essentials">
              <PremiumCardHeader 
                title="Topic Essentials"
                subtitle="Required fields to start your discussion"
                icon={<FileText className="w-5 h-5" />}
                testId="header-essentials"
              />
              <PremiumCardContent className="pt-0 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                    Category
                    <StatusBadge variant="error" label="Required" size="sm" />
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11" data-testid="select-category">
                      <SelectValue placeholder="Choose a category for your topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {selectedCategory.description || categoryDescriptions[selectedCategory.slug] || `Discussion topics about ${selectedCategory.name.toLowerCase()}`}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    Title
                    <StatusBadge variant="error" label="Required" size="sm" />
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear, descriptive title for your topic"
                    className="h-11 text-base"
                    data-testid="input-title"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className={cn(
                      title.length < 5 && title.length > 0 && "text-destructive"
                    )}>
                      {title.length < 5 ? `${5 - title.length} more characters needed` : "Good title length"}
                    </span>
                    {title && (
                      <span>Slug: {generateSlug(title)}</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="content" className="flex items-center gap-2 text-sm font-medium">
                    Content
                    <StatusBadge variant="error" label="Required" size="sm" />
                  </Label>
                  <div className="space-y-3">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts, questions, or insights in detail. The more context you provide, the better responses you'll receive..."
                      className="min-h-48 text-base resize-y"
                      data-testid="input-content"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GifPicker onSelect={handleGifSelect} />
                        <span className="text-xs text-muted-foreground">Add a GIF to your post</span>
                      </div>
                      <span className={cn(
                        "text-xs",
                        content.length < 20 && content.length > 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {content.length < 20 ? `${20 - content.length} more characters needed` : `${content.length} characters`}
                      </span>
                    </div>
                  </div>
                  
                  {selectedGif && (
                    <div className="relative inline-block mt-3">
                      <img 
                        src={selectedGif.previewUrl} 
                        alt="Selected GIF" 
                        className="max-w-[200px] rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => setSelectedGif(null)}
                        data-testid="button-remove-gif"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>

            <PremiumCard testId="card-topic-tags">
              <PremiumCardHeader 
                title="Tags"
                subtitle="Help others find your topic (up to 5)"
                icon={<Tag className="w-5 h-5" />}
                testId="header-tags"
              />
              <PremiumCardContent className="pt-0">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag (e.g., pricing, maintenance)"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={tags.length >= 5}
                    data-testid="input-tag"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                    data-testid="button-add-tag"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag) => (
                      <StatusBadge 
                        key={tag} 
                        variant="info" 
                        label={tag}
                        size="md"
                        className="gap-1.5 pr-1"
                      >
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 p-0.5 rounded-full hover:bg-background/50"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </StatusBadge>
                    ))}
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>

            <PremiumCard testId="card-topic-media">
              <PremiumCardHeader 
                title="Media & Attachments"
                subtitle="Add images, documents, or videos to your topic"
                icon={<Image className="w-5 h-5" />}
                testId="header-media"
              />
              <PremiumCardContent className="pt-0 space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Files (Images, PDFs, Documents)
                  </Label>
                  <FileUpload
                    onFilesUploaded={setUploadedFiles}
                    existingFiles={uploadedFiles}
                    maxFiles={10}
                    maxSizeMB={10}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Video className="w-4 h-4" />
                    Videos (YouTube or Vimeo URLs, up to 3)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      placeholder="Paste YouTube or Vimeo URL"
                      disabled={videos.length >= 3}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddVideo();
                        }
                      }}
                      data-testid="input-video"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddVideo}
                      disabled={videos.length >= 3 || !videoInput.trim()}
                      data-testid="button-add-video"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {videos.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {videos.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                          <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate flex-1">{url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 w-8 h-8 text-destructive"
                            onClick={() => handleRemoveVideo(url)}
                            data-testid={`button-remove-video-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="seo" className="border rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">SEO Optimization</div>
                      <div className="text-sm text-muted-foreground font-normal">Optional settings for search visibility</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-6 pb-6 pt-2 space-y-6">
                    <div className="p-4 bg-muted/30 rounded-lg border flex items-start gap-3">
                      <Search className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Optimize your topic for search engines to help more people find your discussion. 
                        These settings are optional and if left blank, defaults will be used.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="metaTitle" className="text-sm font-medium">SEO Title</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="Custom title for search engines (defaults to topic title)"
                        maxLength={70}
                        data-testid="input-meta-title"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Recommended: 50-60 characters</span>
                        <span className={cn(metaTitle.length > 60 && "text-amber-500")}>
                          {metaTitle.length}/70
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="metaDescription" className="text-sm font-medium">SEO Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Brief description for search results (defaults to first 160 chars of content)"
                        maxLength={160}
                        className="min-h-20 resize-y"
                        data-testid="input-meta-description"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Recommended: 120-160 characters</span>
                        <span className={cn(metaDescription.length > 155 && "text-amber-500")}>
                          {metaDescription.length}/160
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">SEO Keywords (up to 10)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Add SEO keyword"
                          disabled={keywords.length >= 10}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddKeyword();
                            }
                          }}
                          data-testid="input-keyword"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddKeyword}
                          disabled={keywords.length >= 10 || !keywordInput.trim()}
                          data-testid="button-add-keyword"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {keywords.map((kw) => (
                            <StatusBadge 
                              key={kw} 
                              variant="premium" 
                              label={kw}
                              icon={Sparkles}
                              size="sm"
                              className="gap-1.5 pr-1"
                            >
                              <button 
                                type="button" 
                                onClick={() => handleRemoveKeyword(kw)}
                                className="ml-1 p-0.5 rounded-full hover:bg-background/50"
                                data-testid={`button-remove-keyword-${kw}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </StatusBadge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <PremiumCard 
              className={cn(
                "transition-all",
                isFormValid ? "ring-2 ring-accent/50" : ""
              )}
              testId="card-submit"
            >
              <PremiumCardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {isFormValid ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">Ready to publish</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-muted-foreground">
                          {!categoryId ? "Select a category" : 
                           title.length < 5 ? "Title needs at least 5 characters" :
                           "Content needs at least 20 characters"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/forum" className="w-full sm:w-auto">
                      <Button type="button" variant="outline" className="w-full sm:w-auto" data-testid="button-cancel">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={createTopicMutation.isPending || !isFormValid}
                      className="gap-2 w-full sm:w-auto"
                      data-testid="button-submit-topic"
                    >
                      {createTopicMutation.isPending ? (
                        "Publishing..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Publish Topic
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </form>
        </div>
      </div>
    </div>
  );
}
