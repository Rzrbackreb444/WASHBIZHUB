import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, Send, Loader2, Plus, User, Bot, 
  Sparkles, FileText, Upload, X, Trash2, Archive,
  Bell, CheckCircle, Clock, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

interface ChatThread {
  id: string;
  title: string;
  status: string;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  context?: string;
}

interface ChatMessage {
  id: string;
  threadId: string;
  role: "user" | "larry" | "system";
  content: string;
  isRead: boolean;
  recommendation?: {
    category: string;
    actionItems: string[];
    resources: string[];
  };
  createdAt: string;
}

interface Analysis {
  id: string;
  analysisType: string;
  overallScore: number;
  status: string;
  createdAt: string;
  recommendations?: any[];
}

interface Upload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  wordCount?: number;
  createdAt: string;
}

interface LarryChatProps {
  projectId?: string;
  initialContext?: string;
  onAnalysisComplete?: (analysis: Analysis) => void;
}

export function LarryChat({ projectId, initialContext, onAnalysisComplete }: LarryChatProps) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading: threadsLoading } = useQuery<ChatThread[]>({
    queryKey: ["/api/book-studio/chat/threads"]
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/book-studio/chat/threads", activeThreadId, "messages"],
    enabled: !!activeThreadId
  });

  const { data: analyses = [] } = useQuery<Analysis[]>({
    queryKey: ["/api/book-studio/analyses"]
  });

  const { data: uploads = [] } = useQuery<Upload[]>({
    queryKey: ["/api/book-studio/uploads"]
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/book-studio/notifications/unread-count"]
  });

  const createThreadMutation = useMutation({
    mutationFn: async (data: { title?: string; context?: string; projectId?: string }) => {
      return apiRequest("/api/book-studio/chat/threads", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (thread: ChatThread) => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-studio/chat/threads"] });
      setActiveThreadId(thread.id);
      toast({ title: "New conversation started", description: "Larry is ready to help!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      return apiRequest(`/api/book-studio/chat/threads/${threadId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-studio/chat/threads", activeThreadId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/book-studio/chat/threads"] });
      setNewMessage("");
    },
    onSettled: () => {
      setIsTyping(false);
    },
    onError: (error: any) => {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      
      const response = await fetch("/api/book-studio/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (upload) => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-studio/uploads"] });
      toast({ title: "File uploaded", description: `${upload.fileName} is ready for analysis` });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { content?: string; uploadId?: string; analysisType?: string }) => {
      return apiRequest("/api/book-studio/analyze", {
        method: "POST",
        body: JSON.stringify({ ...data, projectId })
      });
    },
    onSuccess: (analysis: Analysis) => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-studio/analyses"] });
      toast({ 
        title: "Analysis Complete", 
        description: `Score: ${analysis.overallScore}/100` 
      });
      onAnalysisComplete?.(analysis);
      setContentToAnalyze("");
      setShowUploadPanel(false);
    },
    onError: (error: any) => {
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFileMutation.mutate(acceptedFiles[0]);
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"]
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeThreadId) return;
    sendMessageMutation.mutate({ threadId: activeThreadId, content: newMessage });
  };

  const handleNewThread = () => {
    createThreadMutation.mutate({ 
      title: "New Conversation", 
      context: initialContext,
      projectId 
    });
  };

  const handleAnalyzeContent = () => {
    if (!contentToAnalyze.trim()) return;
    analyzeMutation.mutate({ content: contentToAnalyze, analysisType: "full" });
  };

  const handleAnalyzeUpload = (uploadId: string) => {
    analyzeMutation.mutate({ uploadId, analysisType: "full" });
  };

  const startChatFromAnalysis = (analysis: Analysis) => {
    const context = `Analysis Summary: Score ${analysis.overallScore}/100. ${
      analysis.recommendations?.length || 0
    } recommendations provided.`;
    createThreadMutation.mutate({ 
      title: `Discussion: ${analysis.analysisType} Analysis`,
      context,
      projectId
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <div className="w-72 border-r border-slate-700 flex flex-col bg-slate-800/50">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-lg font-bold text-white">L</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Larry Larsen</h3>
                <p className="text-xs text-slate-400">Writing Consultant</p>
              </div>
            </div>
            {unreadCount && unreadCount.count > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {unreadCount.count}
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleNewThread}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white"
            disabled={createThreadMutation.isPending}
            data-testid="button-new-thread"
          >
            {createThreadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Conversation
          </Button>
        </div>

        <div className="p-2 border-b border-slate-700">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-sm",
              showUploadPanel ? "bg-slate-700" : ""
            )}
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            data-testid="button-toggle-upload"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload & Analyze
            <Sparkles className="w-3 h-3 ml-auto text-amber-400" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-500 mt-1">Start a new chat with Larry</p>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    activeThreadId === thread.id
                      ? "bg-amber-600/20 border border-amber-500/30"
                      : "hover:bg-slate-700/50"
                  )}
                  data-testid={`button-thread-${thread.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-white truncate">
                      {thread.title}
                    </span>
                    {thread.unreadCount > 0 && (
                      <Badge variant="secondary" className="bg-amber-500 text-white text-xs">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {thread.lastMessageAt ? formatTime(thread.lastMessageAt) : formatTime(thread.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>

          {analyses.length > 0 && (
            <>
              <Separator className="my-2 bg-slate-700" />
              <div className="p-2">
                <p className="text-xs font-medium text-slate-400 px-2 mb-2">Recent Analyses</p>
                {analyses.slice(0, 3).map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => startChatFromAnalysis(analysis)}
                    className="w-full p-2 rounded-lg text-left hover:bg-slate-700/50 transition-all"
                    data-testid={`button-analysis-${analysis.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        analysis.overallScore >= 80 ? "bg-green-500/20 text-green-400" :
                        analysis.overallScore >= 60 ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      )}>
                        {analysis.overallScore}
                      </div>
                      <div>
                        <p className="text-sm text-white capitalize">{analysis.analysisType}</p>
                        <p className="text-xs text-slate-500">{formatTime(analysis.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {showUploadPanel ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h2 className="text-2xl font-bold text-white mb-2">AI Content Analysis</h2>
                <p className="text-slate-400">Upload your manuscript or paste content for expert analysis</p>
              </div>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    Upload Manuscript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                      isDragActive 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-slate-600 hover:border-amber-500/50"
                    )}
                    data-testid="dropzone-upload"
                  >
                    <input {...getInputProps()} />
                    {uploadFileMutation.isPending ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-400" />
                    ) : (
                      <FileText className="w-8 h-8 mx-auto mb-4 text-slate-400" />
                    )}
                    <p className="text-white mb-1">
                      {isDragActive ? "Drop your file here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-sm text-slate-400">PDF, DOCX, TXT, or MD (max 50MB)</p>
                  </div>

                  {uploads.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-400">Recent Uploads</p>
                      {uploads.slice(0, 3).map((upload) => (
                        <div 
                          key={upload.id} 
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-amber-400" />
                            <div>
                              <p className="text-sm text-white">{upload.fileName}</p>
                              <p className="text-xs text-slate-400">
                                {upload.wordCount ? `${upload.wordCount.toLocaleString()} words` : upload.status}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAnalyzeUpload(upload.id)}
                            disabled={analyzeMutation.isPending || upload.status === "pending"}
                            className="bg-amber-600 hover:bg-amber-500"
                            data-testid={`button-analyze-upload-${upload.id}`}
                          >
                            {analyzeMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="relative">
                <Separator className="bg-slate-700" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 text-sm text-slate-500">
                  or
                </span>
              </div>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Paste Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your manuscript content here for analysis..."
                    value={contentToAnalyze}
                    onChange={(e) => setContentToAnalyze(e.target.value)}
                    className="min-h-[200px] bg-slate-900 border-slate-600 text-white resize-none"
                    data-testid="textarea-content-analyze"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      {contentToAnalyze.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                    </p>
                    <Button
                      onClick={handleAnalyzeContent}
                      disabled={!contentToAnalyze.trim() || analyzeMutation.isPending}
                      className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600"
                      data-testid="button-analyze-content"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Content
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeThreadId ? (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role !== "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex-shrink-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">L</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-white"
                        )}
                        data-testid={`message-${message.id}`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        {message.recommendation && (
                          <div className="mt-3 pt-3 border-t border-slate-600">
                            <p className="text-xs font-medium text-amber-400 mb-2">
                              Recommendations:
                            </p>
                            <ul className="space-y-1">
                              {message.recommendation.actionItems.map((item, i) => (
                                <li key={i} className="text-xs flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex-shrink-0 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">L</span>
                    </div>
                    <div className="bg-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <div className="max-w-3xl mx-auto flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Larry anything about writing, publishing, or your manuscript..."
                  className="flex-1 bg-slate-900 border-slate-600 text-white"
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">L</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Meet Larry Larsen
              </h2>
              <p className="text-slate-400 mb-6">
                Your personal writing consultant with 40+ years of industry experience. 
                Get expert feedback on your manuscript, publishing advice, and personalized recommendations.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleNewThread}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                  disabled={createThreadMutation.isPending}
                  data-testid="button-start-conversation"
                >
                  {createThreadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Start Conversation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadPanel(true)}
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                  data-testid="button-upload-analyze"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze Manuscript
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
