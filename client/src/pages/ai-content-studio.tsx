import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Plus, 
  Pin, 
  PinOff, 
  Trash2, 
  Send, 
  Loader2,
  FileText,
  BookOpen,
  Mail,
  Code,
  FolderOpen,
  ChevronRight,
  Sparkles,
  User,
  Bot,
  MoreVertical,
  Search,
  Settings,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";

type ConversationType = "general" | "blog" | "book" | "newsletter" | "code";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  type: ConversationType;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

interface Project {
  id: string;
  title: string;
  type: ConversationType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationTypeConfig: Record<ConversationType, { icon: typeof MessageSquare; label: string; color: string }> = {
  general: { icon: MessageSquare, label: "General", color: "text-blue-500" },
  blog: { icon: FileText, label: "Blog", color: "text-green-500" },
  book: { icon: BookOpen, label: "Book", color: "text-purple-500" },
  newsletter: { icon: Mail, label: "Newsletter", color: "text-orange-500" },
  code: { icon: Code, label: "Code", color: "text-cyan-500" },
};

const blogTopicSuggestions = [
  "How to Start a Laundromat Business in 2025",
  "Essential Equipment Maintenance Tips",
  "Marketing Strategies for Laundromats",
  "Customer Retention Best Practices",
  "Energy Efficiency Cost Savings",
  "Location Analysis Guide",
];

const bookChapters = [
  { id: 1, title: "Introduction", status: "completed" },
  { id: 2, title: "Market Research", status: "in-progress" },
  { id: 3, title: "Business Planning", status: "pending" },
  { id: 4, title: "Location Selection", status: "pending" },
  { id: 5, title: "Equipment Selection", status: "pending" },
  { id: 6, title: "Operations", status: "pending" },
];

export default function AIContentStudio() {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<"chat" | "blog" | "book" | "newsletter" | "projects">("chat");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newConversationType, setNewConversationType] = useState<ConversationType>("general");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [localConversations, setLocalConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Business Strategy Discussion",
      type: "general",
      isPinned: true,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      messages: [
        {
          id: "m1",
          role: "system",
          content: "Welcome to AI Content Studio! How can I help you today?",
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
    },
    {
      id: "2",
      title: "Blog Post: Marketing Tips",
      type: "blog",
      isPinned: false,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 86400000),
      messages: [],
    },
  ]);

  const [localProjects] = useState<Project[]>([
    {
      id: "p1",
      title: "Laundromat Marketing Guide",
      type: "blog",
      content: "Draft content for marketing guide...",
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 86400000),
    },
  ]);

  const { data: conversations = localConversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/ai-studio/conversations"],
    enabled: false,
  });

  const { data: projects = localProjects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/ai-studio/projects"],
    enabled: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const response = await apiRequest("POST", `/api/ai-studio/conversations/${conversationId}/messages`, {
        content: message,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ title, type }: { title: string; type: ConversationType }) => {
      const response = await apiRequest("POST", "/api/ai-studio/conversations", { title, type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
      setIsNewConversationOpen(false);
      setNewConversationTitle("");
      toast({
        title: "Conversation created",
        description: "Your new conversation is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating conversation",
        description: error.message || "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const response = await apiRequest("PATCH", `/api/ai-studio/conversations/${id}`, { isPinned });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai-studio/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
      if (selectedConversation) {
        setSelectedConversation(null);
      }
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting conversation",
        description: error.message || "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, localConversations]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newUserMessage: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: messageInput,
      timestamp: new Date(),
    };

    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? { ...conv, messages: [...conv.messages, newUserMessage], updatedAt: new Date() }
          : conv
      )
    );

    setMessageInput("");

    setTimeout(() => {
      const assistantResponse: Message = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: "Thank you for your message! I'm here to help you with content creation. Based on your input, I can help you draft blog posts, develop book chapters, create newsletter content, or assist with code documentation. What would you like to work on?",
        timestamp: new Date(),
      };

      setLocalConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, messages: [...conv.messages, assistantResponse], updatedAt: new Date() }
            : conv
        )
      );
    }, 1500);
  };

  const handleCreateConversation = () => {
    const newConv: Conversation = {
      id: `conv${Date.now()}`,
      title: newConversationTitle || `New ${conversationTypeConfig[newConversationType].label} Conversation`,
      type: newConversationType,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `m${Date.now()}`,
          role: "system",
          content: `Welcome to your new ${conversationTypeConfig[newConversationType].label} conversation! How can I assist you today?`,
          timestamp: new Date(),
        },
      ],
    };

    setLocalConversations((prev) => [newConv, ...prev]);
    setSelectedConversation(newConv.id);
    setIsNewConversationOpen(false);
    setNewConversationTitle("");
    toast({
      title: "Conversation created",
      description: "Your new conversation is ready",
    });
  };

  const handleTogglePin = (id: string) => {
    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    );
  };

  const handleDeleteConversation = (id: string) => {
    setLocalConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (selectedConversation === id) {
      setSelectedConversation(null);
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed",
    });
  };

  const filteredConversations = localConversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((conv) => conv.isPinned);
  const unpinnedConversations = filteredConversations.filter((conv) => !conv.isPinned);

  const currentConversation = localConversations.find((conv) => conv.id === selectedConversation);

  const renderConversationItem = (conv: Conversation) => {
    const TypeIcon = conversationTypeConfig[conv.type].icon;
    const isSelected = selectedConversation === conv.id;

    return (
      <div
        key={conv.id}
        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10 border border-primary/20" : "hover-elevate"
        }`}
        onClick={() => setSelectedConversation(conv.id)}
        data-testid={`conversation-item-${conv.id}`}
      >
        <div className={`p-2 rounded-md bg-muted ${conversationTypeConfig[conv.type].color}`}>
          <TypeIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" data-testid={`conversation-title-${conv.id}`}>
            {conv.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(conv.updatedAt, "MMM d, h:mm a")}
          </p>
        </div>
        <div className="flex items-center gap-1 invisible group-hover:visible">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(conv.id);
            }}
            data-testid={`button-pin-${conv.id}`}
          >
            {conv.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-menu-${conv.id}`}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePin(conv.id);
                }}
                data-testid={`menu-pin-${conv.id}`}
              >
                {conv.isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                {conv.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                data-testid={`menu-delete-${conv.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";

    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
        data-testid={`message-${message.id}`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : isSystem ? "bg-muted" : "bg-accent"}>
            {isUser ? <User className="h-4 w-4" /> : isSystem ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : isSystem
                ? "bg-muted text-muted-foreground italic"
                : "bg-card border"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs text-muted-foreground mt-1" data-testid={`message-time-${message.id}`}>
            {format(message.timestamp, "h:mm a")}
          </span>
        </div>
      </div>
    );
  };

  const renderChatInterface = () => (
    <div className="flex flex-col h-full">
      {currentConversation ? (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              {(() => {
                const TypeIcon = conversationTypeConfig[currentConversation.type].icon;
                return (
                  <div className={`p-2 rounded-md bg-muted ${conversationTypeConfig[currentConversation.type].color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                );
              })()}
              <div>
                <h2 className="font-semibold" data-testid="current-conversation-title">
                  {currentConversation.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {conversationTypeConfig[currentConversation.type].label} Conversation
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-conversation-settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {currentConversation.messages.map(renderMessage)}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3" data-testid="loading-indicator">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 bg-card border rounded-2xl px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to AI Content Studio</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Select a conversation from the sidebar or create a new one to start generating content with AI assistance.
          </p>
          <Button onClick={() => setIsNewConversationOpen(true)} data-testid="button-new-conversation-empty">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
      )}
    </div>
  );

  const renderBlogMode = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Blog Content Generator</h2>
        <p className="text-muted-foreground mb-6">
          Get topic suggestions and generate blog posts with AI assistance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topic Suggestions</CardTitle>
          <CardDescription>Click a topic to start generating content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {blogTopicSuggestions.map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3 px-4 text-left"
                onClick={() => {
                  const newConv: Conversation = {
                    id: `conv${Date.now()}`,
                    title: topic,
                    type: "blog",
                    isPinned: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messages: [
                      {
                        id: `m${Date.now()}`,
                        role: "system",
                        content: `Let's create a blog post about: "${topic}"`,
                        timestamp: new Date(),
                      },
                    ],
                  };
                  setLocalConversations((prev) => [newConv, ...prev]);
                  setSelectedConversation(newConv.id);
                  setActiveMode("chat");
                  toast({
                    title: "Blog topic selected",
                    description: "Starting your blog post creation",
                  });
                }}
                data-testid={`button-topic-${index}`}
              >
                <FileText className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                <span className="truncate">{topic}</span>
                <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Topic</CardTitle>
          <CardDescription>Enter your own blog topic idea</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your blog topic..."
              data-testid="input-custom-topic"
            />
            <Button data-testid="button-generate-blog">
              <Zap className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBookMode = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Writing Assistant</h2>
        <p className="text-muted-foreground mb-6">
          Write your book chapter by chapter with AI guidance and structure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chapter Outline</CardTitle>
          <CardDescription>Track your progress and edit chapters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bookChapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                onClick={() => {
                  const newConv: Conversation = {
                    id: `conv${Date.now()}`,
                    title: `Chapter ${chapter.id}: ${chapter.title}`,
                    type: "book",
                    isPinned: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messages: [
                      {
                        id: `m${Date.now()}`,
                        role: "system",
                        content: `Let's work on Chapter ${chapter.id}: ${chapter.title}. What would you like to focus on?`,
                        timestamp: new Date(),
                      },
                    ],
                  };
                  setLocalConversations((prev) => [newConv, ...prev]);
                  setSelectedConversation(newConv.id);
                  setActiveMode("chat");
                }}
                data-testid={`chapter-${chapter.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {chapter.id}
                  </div>
                  <span className="font-medium">{chapter.title}</span>
                </div>
                <Badge
                  variant={
                    chapter.status === "completed"
                      ? "default"
                      : chapter.status === "in-progress"
                      ? "secondary"
                      : "outline"
                  }
                  data-testid={`chapter-status-${chapter.id}`}
                >
                  {chapter.status === "completed"
                    ? "Completed"
                    : chapter.status === "in-progress"
                    ? "In Progress"
                    : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNewsletterMode = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Newsletter Generator</h2>
        <p className="text-muted-foreground mb-6">
          Create engaging email newsletters for your audience.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Newsletter Templates</CardTitle>
          <CardDescription>Choose a template to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Weekly Update", desc: "Regular updates for subscribers" },
              { title: "Product Announcement", desc: "New feature or product launch" },
              { title: "Educational Content", desc: "Tips and industry insights" },
              { title: "Promotional", desc: "Special offers and deals" },
            ].map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover-elevate"
                onClick={() => {
                  const newConv: Conversation = {
                    id: `conv${Date.now()}`,
                    title: `Newsletter: ${template.title}`,
                    type: "newsletter",
                    isPinned: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messages: [
                      {
                        id: `m${Date.now()}`,
                        role: "system",
                        content: `Let's create a ${template.title.toLowerCase()} newsletter. What's the main topic you'd like to cover?`,
                        timestamp: new Date(),
                      },
                    ],
                  };
                  setLocalConversations((prev) => [newConv, ...prev]);
                  setSelectedConversation(newConv.id);
                  setActiveMode("chat");
                }}
                data-testid={`newsletter-template-${index}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectsMode = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
          <p className="text-muted-foreground">
            View and manage your saved content projects.
          </p>
        </div>
        <Button data-testid="button-new-project">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : localProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating content and save it as a project for later.
            </p>
            <Button onClick={() => setIsNewConversationOpen(true)} data-testid="button-start-project">
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localProjects.map((project) => {
            const TypeIcon = conversationTypeConfig[project.type].icon;
            return (
              <Card key={project.id} className="hover-elevate cursor-pointer" data-testid={`project-${project.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-md bg-muted ${conversationTypeConfig[project.type].color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <Badge variant="outline">{conversationTypeConfig[project.type].label}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.content}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {format(project.updatedAt, "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEO
        title="AI Content Studio | WashBizHub"
        description="Create blog posts, books, newsletters, and more with AI-powered content generation tools."
        canonicalUrl="/ai-content-studio"
      />

      <div className="min-h-screen bg-background" data-testid="ai-content-studio-page">
        <div className="flex h-[calc(100vh-4rem)]">
          <aside
            className={`border-r bg-muted/30 transition-all duration-300 ${
              isSidebarCollapsed ? "w-16" : "w-80"
            } flex flex-col`}
            data-testid="sidebar"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                {!isSidebarCollapsed && (
                  <h1 className="font-bold text-lg">Content Studio</h1>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  data-testid="button-toggle-sidebar"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? "" : "rotate-180"}`}
                  />
                </Button>
              </div>

              {!isSidebarCollapsed && (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-conversations"
                    />
                  </div>

                  <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" data-testid="button-new-conversation">
                        <Plus className="h-4 w-4 mr-2" />
                        New Conversation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Conversation</DialogTitle>
                        <DialogDescription>
                          Start a new conversation with AI assistance for your content.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title (optional)</label>
                          <Input
                            placeholder="Enter conversation title..."
                            value={newConversationTitle}
                            onChange={(e) => setNewConversationTitle(e.target.value)}
                            data-testid="input-conversation-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <Select
                            value={newConversationType}
                            onValueChange={(value) => setNewConversationType(value as ConversationType)}
                          >
                            <SelectTrigger data-testid="select-conversation-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(conversationTypeConfig).map(([type, config]) => (
                                <SelectItem key={type} value={type} data-testid={`option-type-${type}`}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className={`h-4 w-4 ${config.color}`} />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewConversationOpen(false)} data-testid="button-cancel-new">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateConversation} data-testid="button-create-conversation">
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>

            {!isSidebarCollapsed && (
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {pinnedConversations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 mb-2">
                        <Pin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Pinned
                        </span>
                      </div>
                      <div className="space-y-1">
                        {pinnedConversations.map(renderConversationItem)}
                      </div>
                    </div>
                  )}

                  {unpinnedConversations.length > 0 && (
                    <div>
                      {pinnedConversations.length > 0 && <Separator className="my-3" />}
                      <div className="flex items-center gap-2 px-2 mb-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Recent
                        </span>
                      </div>
                      <div className="space-y-1">
                        {unpinnedConversations.map(renderConversationItem)}
                      </div>
                    </div>
                  )}

                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No conversations found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {isSidebarCollapsed && (
              <div className="flex flex-col items-center gap-2 p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNewConversationOpen(true)}
                  data-testid="button-new-collapsed"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b">
              <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
                <div className="px-4">
                  <TabsList className="h-12">
                    <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="blog" className="gap-2" data-testid="tab-blog">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Blog</span>
                    </TabsTrigger>
                    <TabsTrigger value="book" className="gap-2" data-testid="tab-book">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Book</span>
                    </TabsTrigger>
                    <TabsTrigger value="newsletter" className="gap-2" data-testid="tab-newsletter">
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Newsletter</span>
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="gap-2" data-testid="tab-projects">
                      <FolderOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Projects</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeMode === "chat" && renderChatInterface()}
              {activeMode === "blog" && (
                <ScrollArea className="h-full">{renderBlogMode()}</ScrollArea>
              )}
              {activeMode === "book" && (
                <ScrollArea className="h-full">{renderBookMode()}</ScrollArea>
              )}
              {activeMode === "newsletter" && (
                <ScrollArea className="h-full">{renderNewsletterMode()}</ScrollArea>
              )}
              {activeMode === "projects" && (
                <ScrollArea className="h-full">{renderProjectsMode()}</ScrollArea>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
