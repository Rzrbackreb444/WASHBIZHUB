import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { Send, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useRef } from "react";

export default function BuyerMessaging() {
  const { user } = useAuth();
  const { threadId } = useParams();
  const { toast } = useToast();
  const [messageBody, setMessageBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threadData, isLoading } = useQuery({
    queryKey: ["/api/buyer/messages/threads", threadId],
    enabled: !!user && !!threadId,
    queryFn: async () => {
      const res = await fetch(`/api/buyer/messages/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 3000
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/buyer/messages/threads/${threadId}`, {
        body: messageBody
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/messages/threads", threadId] });
      setMessageBody("");
      toast({ title: "Message sent" });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadData?.messages]);

  if (!user) return <div className="p-8">Please sign in</div>;
  if (isLoading) return <div className="p-8">Loading...</div>;

  const thread = threadData?.thread;
  const messages = threadData?.messages || [];

  return (
    <>
      <SEO title={`Conversation: ${thread?.subject} | WashBizHub`} description="Buyer-seller messaging" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/buyer/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white truncate" data-testid="text-subject">{thread?.subject}</h1>
              <p className="text-xs text-slate-400">
                {thread?.status === 'active' ? '• Active conversation' : '• Archived'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} data-testid={`message-${msg.id}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    isOwn 
                      ? 'bg-blue-600/30 border border-blue-500/30 text-white' 
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-100'
                  }`}>
                    <p className="text-sm leading-relaxed break-words">{msg.body}</p>
                    <p className={`text-xs mt-2 ${isOwn ? 'text-blue-200/60' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm max-w-4xl mx-auto w-full px-4 py-6 space-y-3">
          <Textarea
            placeholder="Type your message..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && messageBody.trim()) {
                sendMutation.mutate();
              }
            }}
            className="min-h-20 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            data-testid="input-message"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!messageBody.trim() || sendMutation.isPending}
              className="flex-1 gap-2"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
              {sendMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
