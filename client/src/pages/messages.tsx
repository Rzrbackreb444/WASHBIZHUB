import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  MoreVertical,
  BellOff,
  Archive,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import type { User as UserType, Conversation, DirectMessage } from "@shared/schema";

interface ConversationWithParticipant extends Conversation {
  participant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    profileImageUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

interface MessageWithSender extends DirectMessage {
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    profileImageUrl: string | null;
  };
}

interface MemberSearchResult {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileImageUrl: string | null;
  email: string | null;
}

function getDisplayName(user: { firstName?: string | null; lastName?: string | null; username?: string | null }) {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.username) return user.username;
  return "Unknown User";
}

function getInitials(user: { firstName?: string | null; lastName?: string | null; username?: string | null }) {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) return user.firstName[0].toUpperCase();
  if (user.username) return user.username[0].toUpperCase();
  return "U";
}

function formatMessageTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) {
    return format(d, "h:mm a");
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "MMM d");
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={cn("flex gap-3 mb-4", isOwn && "flex-row-reverse")}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className={cn("space-y-1", isOwn && "items-end")}>
        <Skeleton className={cn("h-16 w-48 rounded-lg", isOwn ? "rounded-br-sm" : "rounded-bl-sm")} />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ conversationId?: string }>();
  const { toast } = useToast();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    params.conversationId || null
  );
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [messageSentConfirmation, setMessageSentConfirmation] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithParticipant[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId && isAuthenticated,
  });

  const { data: members, isLoading: membersLoading } = useQuery<MemberSearchResult[]>({
    queryKey: ["/api/members/search", memberSearchQuery],
    enabled: memberSearchQuery.length >= 2,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      setMessageSentConfirmation(true);
      setTimeout(() => setMessageSentConfirmation(false), 2000);
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const res = await apiRequest("POST", "/api/conversations", { participantId });
      return res.json();
    },
    onSuccess: (data) => {
      setSelectedConversationId(data.id);
      setNewConversationOpen(false);
      setMemberSearchQuery("");
      setMobileView("chat");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Failed to start conversation",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("PUT", `/api/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const muteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("PUT", `/api/conversations/${conversationId}/mute`, {});
    },
    onSuccess: () => {
      toast({ title: "Conversation muted" });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const archiveConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("PUT", `/api/conversations/${conversationId}/archive`, {});
    },
    onSuccess: () => {
      toast({ title: "Conversation archived" });
      setSelectedConversationId(null);
      setMobileView("list");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  useEffect(() => {
    if (selectedConversationId && messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageInput.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
    setSelectedConversationId(null);
  };

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;
    const name = getDisplayName(conv.participant).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-[#C8A661]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Sign In to Message</h2>
            <p className="text-muted-foreground mb-6">
              Connect with laundromat owners, brokers, and industry professionals.
            </p>
            <Button
              className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white w-full"
              onClick={() => setLocation("/login")}
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Messages | WashBizHub"
        description="Direct messaging with laundromat owners, brokers, and industry professionals."
        canonicalUrl="/messages"
      />

      <div className="h-[calc(100vh-64px)] bg-muted/30">
        <div className="h-full max-w-7xl mx-auto flex">
          {/* Conversation List - Left Panel */}
          <div
            className={cn(
              "w-full md:w-1/3 lg:w-[360px] border-r bg-card flex flex-col",
              mobileView === "chat" && "hidden md:flex"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-bold text-foreground" data-testid="text-messages-title">
                  Messages
                </h1>
                <Button
                  size="sm"
                  className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  onClick={() => setNewConversationOpen(true)}
                  data-testid="button-new-message"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-conversations"
                />
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ConversationSkeleton key={i} />
                  ))}
                </div>
              ) : !filteredConversations?.length ? (
                <div className="p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? "No conversations found" : "No messages yet"}
                  </p>
                  <Button
                    variant="link"
                    className="text-[#C8A661] mt-2"
                    onClick={() => setNewConversationOpen(true)}
                    data-testid="button-start-conversation"
                  >
                    Start a conversation
                  </Button>
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 border-b text-left transition-colors hover-elevate",
                        selectedConversationId === conv.id && "bg-muted/50"
                      )}
                      onClick={() => handleSelectConversation(conv.id)}
                      data-testid={`conversation-item-${conv.id}`}
                    >
                      <Avatar className="h-12 w-12">
                        {conv.participant.profileImageUrl && (
                          <AvatarImage src={conv.participant.profileImageUrl} alt={getDisplayName(conv.participant)} />
                        )}
                        <AvatarFallback className="bg-[#0A1628] text-[#C8A661]">
                          {getInitials(conv.participant)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground truncate" data-testid={`text-participant-name-${conv.id}`}>
                            {getDisplayName(conv.participant)}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatMessageTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${conv.id}`}>
                            {conv.lastMessage?.content || "No messages yet"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-[#C8A661] text-[#0A1628] text-xs px-2 py-0.5" data-testid={`badge-unread-${conv.id}`}>
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat View - Right Panel */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-background",
              mobileView === "list" && "hidden md:flex"
            )}
          >
            {!selectedConversationId ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-8 w-8 text-[#C8A661]" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Your Messages</h2>
                  <p className="text-muted-foreground mb-6">
                    Select a conversation or start a new one to begin messaging.
                  </p>
                  <Button
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                    onClick={() => setNewConversationOpen(true)}
                    data-testid="button-new-conversation-empty"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={handleBackToList}
                      data-testid="button-back-to-list"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {selectedConversation && (
                      <>
                        <Avatar className="h-10 w-10">
                          {selectedConversation.participant.profileImageUrl && (
                            <AvatarImage
                              src={selectedConversation.participant.profileImageUrl}
                              alt={getDisplayName(selectedConversation.participant)}
                            />
                          )}
                          <AvatarFallback className="bg-[#0A1628] text-[#C8A661]">
                            {getInitials(selectedConversation.participant)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold text-foreground" data-testid="text-chat-participant-name">
                            {getDisplayName(selectedConversation.participant)}
                          </h2>
                          <p className="text-xs text-muted-foreground">Active now</p>
                        </div>
                      </>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="button-chat-options">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => selectedConversationId && muteConversationMutation.mutate(selectedConversationId)}
                        data-testid="button-mute-conversation"
                      >
                        <BellOff className="h-4 w-4 mr-2" />
                        Mute conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => selectedConversationId && archiveConversationMutation.mutate(selectedConversationId)}
                        data-testid="button-archive-conversation"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {messagesLoading ? (
                    <div className="space-y-4">
                      <MessageSkeleton isOwn={false} />
                      <MessageSkeleton isOwn={true} />
                      <MessageSkeleton isOwn={false} />
                      <MessageSkeleton isOwn={true} />
                    </div>
                  ) : !messages?.length ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={cn("flex gap-3", isOwn && "flex-row-reverse")}
                            data-testid={`message-item-${message.id}`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              {message.sender.profileImageUrl && (
                                <AvatarImage
                                  src={message.sender.profileImageUrl}
                                  alt={getDisplayName(message.sender)}
                                />
                              )}
                              <AvatarFallback className={cn(
                                "text-sm",
                                isOwn ? "bg-[#C8A661] text-[#0A1628]" : "bg-[#0A1628] text-[#C8A661]"
                              )}>
                                {getInitials(message.sender)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn("max-w-[70%]", isOwn && "items-end")}>
                              {!isOwn && (
                                <p className="text-xs text-muted-foreground mb-1" data-testid={`text-sender-name-${message.id}`}>
                                  {getDisplayName(message.sender)}
                                </p>
                              )}
                              <div
                                className={cn(
                                  "rounded-lg px-4 py-2",
                                  isOwn
                                    ? "bg-[#0A1628] text-white rounded-br-sm"
                                    : "bg-muted rounded-bl-sm"
                                )}
                                data-testid={`text-message-content-${message.id}`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              </div>
                              <div className={cn("flex items-center gap-1 mt-1", isOwn && "justify-end")}>
                                <span className="text-xs text-muted-foreground" data-testid={`text-message-time-${message.id}`}>
                                  {formatMessageTime(message.createdAt?.toString() || "")}
                                </span>
                                {isOwn && (
                                  <CheckCheck className="h-3 w-3 text-[#C8A661]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-card">
                  {messageSentConfirmation && (
                    <div className="flex items-center gap-2 text-sm text-[#C8A661] mb-2" data-testid="text-message-sent">
                      <Check className="h-4 w-4" />
                      Message sent
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button
                      size="icon"
                      className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
        <DialogContent className="max-w-md" data-testid="modal-new-conversation">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Search for a member to start a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-members"
              />
            </div>
            <ScrollArea className="h-64">
              {membersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : memberSearchQuery.length < 2 ? (
                <div className="p-8 text-center">
                  <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </p>
                </div>
              ) : !members?.length ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No members found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {members
                    .filter((m) => m.id !== user?.id)
                    .map((member) => (
                      <button
                        key={member.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover-elevate transition-colors"
                        onClick={() => createConversationMutation.mutate(member.id)}
                        disabled={createConversationMutation.isPending}
                        data-testid={`member-item-${member.id}`}
                      >
                        <Avatar className="h-10 w-10">
                          {member.profileImageUrl && (
                            <AvatarImage src={member.profileImageUrl} alt={getDisplayName(member)} />
                          )}
                          <AvatarFallback className="bg-[#0A1628] text-[#C8A661]">
                            {getInitials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{getDisplayName(member)}</p>
                          {member.username && (
                            <p className="text-sm text-muted-foreground">@{member.username}</p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
