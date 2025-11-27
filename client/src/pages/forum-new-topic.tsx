import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Send,
  Video,
  X,
  Plus,
  Sparkles,
  Search,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { FileUpload } from "@/components/FileUpload";
import type { ForumCategory } from "@shared/schema";

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
  
  // SEO fields
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
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddVideo = () => {
    if (videoInput.trim() && !videos.includes(videoInput.trim())) {
      setVideos([...videos, videoInput.trim()]);
      setVideoInput("");
    }
  };

  const handleRemoveVideo = (url: string) => {
    setVideos(videos.filter(v => v !== url));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
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

    createTopicMutation.mutate({
      title: title.trim(),
      content: content.trim(),
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Create New Topic | WashBizHub Community Forum"
          description="Start a new discussion in the WashBizHub community forum. Share insights, ask questions, and connect with laundromat industry professionals."
          canonicalUrl="/forum/new"
        />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to create a new topic
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
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

      {/* Header */}
      <div className="border-b">
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Topic</CardTitle>
              <CardDescription>
                Share your question, insight, or start a discussion with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your topic"
                    data-testid="input-title"
                  />
                  {title && (
                    <p className="text-xs text-muted-foreground">
                      Slug: {generateSlug(title)}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or insights..."
                    className="min-h-48"
                    data-testid="input-content"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      data-testid="input-tag"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Uploads (Images, PDFs, etc.) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Attachments (Images, PDFs, Documents)
                  </Label>
                  <FileUpload
                    onFilesUploaded={setUploadedFiles}
                    existingFiles={uploadedFiles}
                    maxFiles={10}
                    maxSizeMB={10}
                  />
                </div>

                {/* Videos */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Videos (YouTube/Vimeo URLs)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      placeholder="Paste video URL"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddVideo();
                        }
                      }}
                      data-testid="input-video"
                    />
                    <Button type="button" variant="outline" onClick={handleAddVideo}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {videos.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {videos.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate flex-1">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(url)}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEO Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    SEO Optimization (Optional)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Optimize your topic for search engines to reach more people
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">SEO Title</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="Custom title for search engines (60 chars recommended)"
                        maxLength={70}
                        data-testid="input-meta-title"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {metaTitle.length}/70 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">SEO Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Brief description for search results (160 chars recommended)"
                        maxLength={160}
                        className="min-h-20"
                        data-testid="input-meta-description"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {metaDescription.length}/160 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>SEO Keywords</Label>
                      <div className="flex gap-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Add SEO keyword"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddKeyword();
                            }
                          }}
                          data-testid="input-keyword"
                        />
                        <Button type="button" variant="outline" onClick={handleAddKeyword}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {keywords.map((kw) => (
                            <Badge key={kw} variant="outline" className="gap-1">
                              <Sparkles className="w-3 h-3" />
                              {kw}
                              <button type="button" onClick={() => handleRemoveKeyword(kw)}>
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Link href="/forum">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createTopicMutation.isPending}
                    className="gap-2"
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
