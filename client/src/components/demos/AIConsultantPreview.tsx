import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Bot, User, MessageCircle, ArrowRight, Sparkles, Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean;
}

const DEMO_CONVERSATIONS = [
  {
    question: "What's a good TPD (Turns Per Day) for a laundromat?",
    answer: "A healthy TPD ranges from 4-6 turns per machine per day. Industry average is around 4.5, but top-performing laundromats in high-traffic areas can achieve 7-8 turns. Focus on increasing turns through: extended hours, efficient machine mix, competitive pricing, and excellent customer experience."
  },
  {
    question: "How much should I pay for a laundromat?",
    answer: "Laundromats typically sell for 2-4x annual net operating income (NOI). For a mat generating $100K/year NOI, expect to pay $200K-$400K. Key factors: equipment age, lease terms, location demographics, and CLEANBI score. Always verify financials with tax returns and utility bills."
  },
  {
    question: "Should I add wash-dry-fold service?",
    answer: "Absolutely! WDF typically generates 25-40% higher margins than self-service. Start with: dedicated staff during peak hours, clear pricing ($1.50-2.50/lb), quality packaging, and a simple pickup/delivery option. Most successful mats generate 20-30% of revenue from WDF services."
  },
];

export function AIConsultantPreview() {
  const [currentConvo, setCurrentConvo] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  useEffect(() => {
    if (!showDemo) return;
    
    setMessages([]);
    setIsTyping(false);
    
    const convo = DEMO_CONVERSATIONS[currentConvo];
    
    const showQuestion = setTimeout(() => {
      setMessages([{ role: 'user', content: convo.question }]);
    }, 500);
    
    const showTyping = setTimeout(() => {
      setIsTyping(true);
    }, 1500);
    
    const showAnswer = setTimeout(() => {
      setIsTyping(false);
      setMessages([
        { role: 'user', content: convo.question },
        { role: 'assistant', content: convo.answer }
      ]);
    }, 3500);
    
    const nextConvo = setTimeout(() => {
      setCurrentConvo((prev) => (prev + 1) % DEMO_CONVERSATIONS.length);
    }, 10000);
    
    return () => {
      clearTimeout(showQuestion);
      clearTimeout(showTyping);
      clearTimeout(showAnswer);
      clearTimeout(nextConvo);
    };
  }, [currentConvo, showDemo]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900/95 via-navy-800/95 to-navy-900/95 border-2 border-purple-500/30 p-0" data-testid="card-ai-consultant-demo">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-teal-500/5" />
      
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Business Consultant</h3>
              <p className="text-white/60 text-sm">Powered by multi-AI orchestration</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Live Demo
          </Badge>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="h-[280px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-white/10 bg-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything about laundromats..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                readOnly
                data-testid="input-demo-chat"
              />
              <Button size="icon" className="bg-purple-500 hover:bg-purple-400 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {DEMO_CONVERSATIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentConvo(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentConvo ? 'bg-purple-500 w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
              data-testid={`indicator-${idx}`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link href="/consultant-inquiry" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-teal-500 hover:opacity-90 text-white font-bold" data-testid="button-chat-consultant">
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat with AI Consultant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        
        <p className="text-center text-white/40 text-xs mt-3">
          Powered by GPT-4, Claude, Gemini & industry expertise
        </p>
      </div>
    </Card>
  );
}
