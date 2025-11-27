import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
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
  Zap,
  Copy,
  Check,
  RefreshCw,
  Download,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
  Edit,
  Clock,
  FileDown,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import type { AiConversation, ContentProject } from "@shared/schema";

type ConversationType = "general" | "blog" | "book" | "newsletter" | "code";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  error?: boolean;
}

interface Conversation extends AiConversation {
  messages: Message[];
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [failedMessageContent, setFailedMessageContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectType, setNewProjectType] = useState<string>("book");
  
  const [editingProject, setEditingProject] = useState<ContentProject | null>(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  
  const [deletingProject, setDeletingProject] = useState<ContentProject | null>(null);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<ContentProject | null>(null);
  const [bookContent, setBookContent] = useState("");
  const [isBookDirty, setIsBookDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const bookEditorRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: isLoadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ["/api/ai-studio/conversations"],
  });

  const { data: projects = [], isLoading: isLoadingProjects, error: projectsError } = useQuery<ContentProject[]>({
    queryKey: ["/api/ai-studio/projects"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message, type }: { conversationId: string; message: string; type: ConversationType }) => {
      const currentConv = conversations.find(c => c.id === conversationId);
      const messages = currentConv?.messages || [];
      
      const response = await apiRequest("POST", `/api/ai-studio/chat`, {
        conversationId,
        messages: [...messages, { role: "user", content: message, timestamp: new Date().toISOString() }],
        type,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
      setFailedMessageContent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message. Click retry to try again.",
        variant: "destructive",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ title, type }: { title: string; type: ConversationType }) => {
      const response = await apiRequest("POST", "/api/ai-studio/conversations", { title, type });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
      setIsNewConversationOpen(false);
      setNewConversationTitle("");
      setSelectedConversation(data.id);
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

  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; isPinned?: boolean; title?: string }) => {
      const response = await apiRequest("PATCH", `/api/ai-studio/conversations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating conversation",
        description: error.message || "Failed to update conversation",
        variant: "destructive",
      });
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

  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; type: string }) => {
      const response = await apiRequest("POST", "/api/ai-studio/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/projects"] });
      setIsNewProjectOpen(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
      toast({
        title: "Project created",
        description: "Your new project is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; content?: any }) => {
      const response = await apiRequest("PATCH", `/api/ai-studio/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/projects"] });
      setIsEditProjectOpen(false);
      setEditingProject(null);
      setLastSaved(new Date());
      setIsBookDirty(false);
      toast({
        title: "Project updated",
        description: "Your changes have been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai-studio/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/projects"] });
      setIsDeleteProjectOpen(false);
      setDeletingProject(null);
      if (selectedProject?.id === deletingProject?.id) {
        setSelectedProject(null);
      }
      toast({
        title: "Project deleted",
        description: "The project has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch("/api/ai-studio/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to export PDF");
      }
      const blob = await response.blob();
      const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "export.pdf";
      return { blob, filename };
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "PDF exported",
        description: "Your PDF has been downloaded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export PDF",
        variant: "destructive",
      });
    },
  });

  const exportDocxMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch("/api/ai-studio/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to export DOCX");
      }
      const blob = await response.blob();
      const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "export.docx";
      return { blob, filename };
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "DOCX exported",
        description: "Your document has been downloaded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export DOCX",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [selectedConversation, conversations, scrollToBottom]);

  useEffect(() => {
    if (sendMessageMutation.isPending) {
      scrollToBottom();
    }
  }, [sendMessageMutation.isPending, scrollToBottom]);

  useEffect(() => {
    if (!isBookDirty || !selectedProject) return;
    
    const timer = setTimeout(() => {
      updateProjectMutation.mutate({
        id: selectedProject.id,
        content: { text: bookContent },
      });
    }, 30000);

    return () => clearTimeout(timer);
  }, [bookContent, isBookDirty, selectedProject]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation) return;

    const currentConv = conversations.find(c => c.id === selectedConversation);
    if (!currentConv) return;

    setFailedMessageContent(messageInput);
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: messageInput.trim(),
      type: (currentConv.type as ConversationType) || "general",
    });
    setMessageInput("");
  }, [messageInput, selectedConversation, conversations, sendMessageMutation]);

  const handleRetryMessage = useCallback(() => {
    if (!failedMessageContent || !selectedConversation) return;
    
    const currentConv = conversations.find(c => c.id === selectedConversation);
    if (!currentConv) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: failedMessageContent,
      type: (currentConv.type as ConversationType) || "general",
    });
  }, [failedMessageContent, selectedConversation, conversations, sendMessageMutation]);

  const handleCopyMessage = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleCreateConversation = useCallback(() => {
    createConversationMutation.mutate({
      title: newConversationTitle || `New ${conversationTypeConfig[newConversationType].label} Conversation`,
      type: newConversationType,
    });
  }, [newConversationTitle, newConversationType, createConversationMutation]);

  const handleTogglePin = useCallback((id: string, currentPinned: boolean) => {
    updateConversationMutation.mutate({ id, isPinned: !currentPinned });
  }, [updateConversationMutation]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversationMutation.mutate(id);
  }, [deleteConversationMutation]);

  const handleCreateProject = useCallback(() => {
    if (!newProjectTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a project title",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate({
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim() || undefined,
      type: newProjectType,
    });
  }, [newProjectTitle, newProjectDescription, newProjectType, createProjectMutation, toast]);

  const handleUpdateProject = useCallback(() => {
    if (!editingProject || !editProjectTitle.trim()) return;
    updateProjectMutation.mutate({
      id: editingProject.id,
      title: editProjectTitle.trim(),
      description: editProjectDescription.trim() || undefined,
    });
  }, [editingProject, editProjectTitle, editProjectDescription, updateProjectMutation]);

  const handleDeleteProject = useCallback(() => {
    if (!deletingProject) return;
    deleteProjectMutation.mutate(deletingProject.id);
  }, [deletingProject, deleteProjectMutation]);

  const handleSaveBook = useCallback(() => {
    if (!selectedProject) return;
    updateProjectMutation.mutate({
      id: selectedProject.id,
      content: { text: bookContent },
    });
  }, [selectedProject, bookContent, updateProjectMutation]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    bookEditorRef.current?.focus();
    setIsBookDirty(true);
  }, []);

  const handleBookContentChange = useCallback((evt: ContentEditableEvent) => {
    setBookContent(evt.target.value);
    setIsBookDirty(true);
  }, []);

  const getWordCount = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>/g, " ").trim();
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, []);

  const getCharacterCount = useCallback((text: string) => {
    return text.replace(/<[^>]*>/g, "").length;
  }, []);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((conv) => conv.isPinned);
  const unpinnedConversations = filteredConversations.filter((conv) => !conv.isPinned);

  const currentConversation = conversations.find((conv) => conv.id === selectedConversation);

  const renderConversationItem = (conv: Conversation) => {
    const TypeIcon = conversationTypeConfig[(conv.type as ConversationType) || "general"]?.icon || MessageSquare;
    const isSelected = selectedConversation === conv.id;
    const typeColor = conversationTypeConfig[(conv.type as ConversationType) || "general"]?.color || "text-blue-500";

    return (
      <div
        key={conv.id}
        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10 border border-primary/20" : "hover-elevate"
        }`}
        onClick={() => setSelectedConversation(conv.id)}
        data-testid={`conversation-item-${conv.id}`}
      >
        <div className={`p-2 rounded-md bg-muted ${typeColor}`}>
          <TypeIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" data-testid={`conversation-title-${conv.id}`}>
            {conv.title || "Untitled"}
          </p>
          <p className="text-xs text-muted-foreground">
            {conv.updatedAt ? format(new Date(conv.updatedAt), "MMM d, h:mm a") : "Just now"}
          </p>
        </div>
        <div className="flex items-center gap-1 invisible group-hover:visible">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(conv.id, conv.isPinned || false);
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
                  handleTogglePin(conv.id, conv.isPinned || false);
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

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";
    const messageId = `${message.timestamp}-${index}`;
    const isCopied = copiedMessageId === messageId;

    return (
      <div
        key={messageId}
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
        data-testid={`message-${messageId}`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : isSystem ? "bg-muted" : "bg-accent"}>
            {isUser ? <User className="h-4 w-4" /> : isSystem ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl px-4 py-2 group relative ${
              isUser
                ? "bg-primary text-primary-foreground"
                : isSystem
                ? "bg-muted text-muted-foreground italic"
                : message.error
                ? "bg-destructive/10 border border-destructive"
                : "bg-card border"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {!isUser && !isSystem && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopyMessage(message.content, messageId)}
                    data-testid={`button-copy-${messageId}`}
                  >
                    {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCopied ? "Copied!" : "Copy message"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1" data-testid={`message-time-${messageId}`}>
            {message.timestamp ? format(new Date(message.timestamp), "h:mm a") : "Just now"}
          </span>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex gap-3" data-testid="typing-indicator">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-accent">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 bg-card border rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
      </div>
    </div>
  );

  const renderChatInterface = () => (
    <div className="flex flex-col h-full">
      {currentConversation ? (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              {(() => {
                const TypeIcon = conversationTypeConfig[(currentConversation.type as ConversationType) || "general"]?.icon || MessageSquare;
                const typeColor = conversationTypeConfig[(currentConversation.type as ConversationType) || "general"]?.color || "text-blue-500";
                return (
                  <div className={`p-2 rounded-md bg-muted ${typeColor}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                );
              })()}
              <div>
                <h2 className="font-semibold" data-testid="current-conversation-title">
                  {currentConversation.title || "Untitled"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {conversationTypeConfig[(currentConversation.type as ConversationType) || "general"]?.label || "General"} Conversation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentConversation.updatedAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="last-edited-time">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(currentConversation.updatedAt), { addSuffix: true })}
                </span>
              )}
              <Button variant="ghost" size="icon" data-testid="button-conversation-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {currentConversation.messages?.map((msg, idx) => renderMessage(msg, idx))}
              {sendMessageMutation.isPending && renderTypingIndicator()}
              {sendMessageMutation.isError && failedMessageContent && (
                <div className="flex items-center justify-center gap-2 py-2" data-testid="retry-section">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Failed to send message</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryMessage}
                    disabled={sendMessageMutation.isPending}
                    data-testid="button-retry-message"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
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
                  createConversationMutation.mutate({
                    title: topic,
                    type: "blog",
                  });
                  setActiveMode("chat");
                }}
                disabled={createConversationMutation.isPending}
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
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              data-testid="input-custom-topic"
            />
            <Button 
              onClick={() => {
                if (newConversationTitle.trim()) {
                  createConversationMutation.mutate({
                    title: newConversationTitle.trim(),
                    type: "blog",
                  });
                  setNewConversationTitle("");
                  setActiveMode("chat");
                }
              }}
              disabled={!newConversationTitle.trim() || createConversationMutation.isPending}
              data-testid="button-generate-blog"
            >
              {createConversationMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBookMode = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Book Writing Assistant</h2>
          <p className="text-muted-foreground">
            Write your book with AI guidance and rich text editing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsNewProjectOpen(true)} data-testid="button-new-book-project">
            <Plus className="h-4 w-4 mr-2" />
            New Book
          </Button>
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : selectedProject ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg" data-testid="book-project-title">{selectedProject.title}</CardTitle>
                {selectedProject.description && (
                  <CardDescription>{selectedProject.description}</CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="book-last-saved">
                    <Clock className="h-3 w-3" />
                    Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveBook}
                  disabled={!isBookDirty || updateProjectMutation.isPending}
                  data-testid="button-save-book"
                >
                  {updateProjectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-export-book">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => exportPdfMutation.mutate(selectedProject.id)}
                      disabled={exportPdfMutation.isPending}
                      data-testid="button-export-pdf"
                    >
                      {exportPdfMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 mr-2" />
                      )}
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportDocxMutation.mutate(selectedProject.id)}
                      disabled={exportDocxMutation.isPending}
                      data-testid="button-export-docx"
                    >
                      {exportDocxMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 mr-2" />
                      )}
                      Export as DOCX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProject(null)}
                  data-testid="button-close-book"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("bold")} data-testid="button-bold">
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (Ctrl+B)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("italic")} data-testid="button-italic">
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (Ctrl+I)</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("formatBlock", "h1")} data-testid="button-h1">
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 1</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("formatBlock", "h2")} data-testid="button-h2">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("insertUnorderedList")} data-testid="button-ul">
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("insertOrderedList")} data-testid="button-ol">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>
            </div>

            <div 
              className="min-h-[400px] p-4 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring"
              ref={bookEditorRef}
            >
              <ContentEditable
                html={bookContent}
                onChange={handleBookContentChange}
                className="prose prose-sm dark:prose-invert max-w-none min-h-[350px] focus:outline-none"
                data-testid="book-editor"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span data-testid="word-count">Words: {getWordCount(bookContent)}</span>
                <span data-testid="char-count">Characters: {getCharacterCount(bookContent)}</span>
              </div>
              {isBookDirty && (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved changes
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects
            .filter((p) => p.type === "book" || p.type === "ebook")
            .map((project) => (
              <Card 
                key={project.id} 
                className="hover-elevate cursor-pointer" 
                onClick={() => {
                  setSelectedProject(project);
                  setBookContent((project.content as any)?.text || "");
                  setIsBookDirty(false);
                  setLastSaved(project.updatedAt ? new Date(project.updatedAt) : null);
                }}
                data-testid={`book-project-${project.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-md bg-muted text-purple-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()} data-testid={`button-project-menu-${project.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(project);
                            setEditProjectTitle(project.title);
                            setEditProjectDescription(project.description || "");
                            setIsEditProjectOpen(true);
                          }}
                          data-testid={`menu-edit-project-${project.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProject(project);
                            setIsDeleteProjectOpen(true);
                          }}
                          data-testid={`menu-delete-project-${project.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-base mt-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span data-testid={`project-updated-${project.id}`}>
                      {project.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : "Recently"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          {projects.filter((p) => p.type === "book" || p.type === "ebook").length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No book projects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first book project to start writing
                </p>
                <Button onClick={() => setIsNewProjectOpen(true)} data-testid="button-create-first-book">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Book Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
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
                  createConversationMutation.mutate({
                    title: `Newsletter: ${template.title}`,
                    type: "newsletter",
                  });
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
          <p className="text-muted-foreground">
            View and manage your saved content projects.
          </p>
        </div>
        <Button onClick={() => setIsNewProjectOpen(true)} data-testid="button-new-project">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoadingProjects ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-5 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projectsError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
            <p className="text-muted-foreground text-center mb-4">
              {(projectsError as Error).message || "Failed to load projects"}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/projects"] })} data-testid="button-retry-projects">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating content and save it as a project for later.
            </p>
            <Button onClick={() => setIsNewProjectOpen(true)} data-testid="button-start-project">
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const TypeIcon = conversationTypeConfig[(project.type as ConversationType)]?.icon || FolderOpen;
            const typeColor = conversationTypeConfig[(project.type as ConversationType)]?.color || "text-gray-500";
            return (
              <Card key={project.id} className="hover-elevate" data-testid={`project-${project.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-md bg-muted ${typeColor}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{conversationTypeConfig[(project.type as ConversationType)]?.label || project.type}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-project-actions-${project.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProject(project);
                              setEditProjectTitle(project.title);
                              setEditProjectDescription(project.description || "");
                              setIsEditProjectOpen(true);
                            }}
                            data-testid={`menu-edit-${project.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => exportPdfMutation.mutate(project.id)}
                            disabled={exportPdfMutation.isPending}
                            data-testid={`menu-export-pdf-${project.id}`}
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => exportDocxMutation.mutate(project.id)}
                            disabled={exportDocxMutation.isPending}
                            data-testid={`menu-export-docx-${project.id}`}
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Export DOCX
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingProject(project);
                              setIsDeleteProjectOpen(true);
                            }}
                            data-testid={`menu-delete-${project.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2" data-testid={`project-title-${project.id}`}>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`project-description-${project.id}`}>{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <Clock className="h-3 w-3" />
                    <span data-testid={`project-timestamp-${project.id}`}>
                      Updated {project.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : "recently"}
                    </span>
                  </div>
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
              <div className="flex items-center justify-between mb-4 gap-2">
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
                          <Label>Title (optional)</Label>
                          <Input
                            placeholder="Enter conversation title..."
                            value={newConversationTitle}
                            onChange={(e) => setNewConversationTitle(e.target.value)}
                            data-testid="input-conversation-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
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
                        <Button 
                          onClick={handleCreateConversation} 
                          disabled={createConversationMutation.isPending}
                          data-testid="button-create-conversation"
                        >
                          {createConversationMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
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
                  {isLoadingConversations ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversationsError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-sm text-destructive">Failed to load conversations</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/ai-studio/conversations"] })}
                        data-testid="button-retry-conversations"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
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
                    </>
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

      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new content project to organize your writing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Enter project title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                data-testid="input-project-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Enter project description..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                data-testid="input-project-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newProjectType} onValueChange={setNewProjectType}>
                <SelectTrigger data-testid="select-project-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="ebook">eBook</SelectItem>
                  <SelectItem value="blog_series">Blog Series</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectOpen(false)} data-testid="button-cancel-project">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject} 
              disabled={!newProjectTitle.trim() || createProjectMutation.isPending}
              data-testid="button-create-project"
            >
              {createProjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Enter project title..."
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                data-testid="input-edit-project-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Enter project description..."
                value={editProjectDescription}
                onChange={(e) => setEditProjectDescription(e.target.value)}
                data-testid="input-edit-project-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)} data-testid="button-cancel-edit-project">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProject} 
              disabled={!editProjectTitle.trim() || updateProjectMutation.isPending}
              data-testid="button-save-project"
            >
              {updateProjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProject?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-project">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProjectMutation.isPending}
              data-testid="button-confirm-delete-project"
            >
              {deleteProjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
