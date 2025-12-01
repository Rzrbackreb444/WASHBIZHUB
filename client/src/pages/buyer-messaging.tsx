import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { Send, ArrowLeft, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function BuyerMessaging() {
  const { user } = useAuth();
  const { threadId } = useParams();
  const { toast } = useToast();
  const [messageBody, setMessageBody] = useState("");

  const { data: threadData } = useQuery({
    queryKey: ["/api/buyer/messages/threads", threadId],
    enabled: !!user && !!threadId,
    queryFn: async () => {
      const res = await fetch(`/api/buyer/messages/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to fetch thread");
      return res.json();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/buyer/messages/threads/${threadId}`, {
        body: messageBody
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/messages/threads", threadId] });
      setMessageBody("");
      toast({ title: "Message sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  if (!user) {
    return <div className="p-8 text-center">Please sign in to view messages</div>;
  }

  const thread = threadData?.thread;
  const messages = threadData?.messages || [];

  return (
    <>
      <SEO title="Conversation | WashBizHub" description="Buyer-seller conversation" />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/buyer/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold" data-testid="text-thread-subject">{thread?.subject}</h1>
                <p className="text-sm text-muted-foreground">
                  {thread?.status === 'active' ? 'Active' : 'Closed'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No messages yet</div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Card className={msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : ''}>
                    <CardContent className="p-3">
                      <p className="text-sm">{msg.body}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="border-t p-4 space-y-3">
            <Textarea
              placeholder="Type your message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="min-h-24"
              data-testid="input-message"
            />
            <Button
              onClick={() => sendMessageMutation.mutate()}
              disabled={!messageBody.trim() || sendMessageMutation.isPending}
              className="w-full"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
