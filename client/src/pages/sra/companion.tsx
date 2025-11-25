import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Flame, 
  Target, 
  Dumbbell, 
  Heart, 
  MessageCircle,
  Zap,
  Trophy,
  Calendar,
  Activity,
  Watch,
  ArrowLeft
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: `Hey warrior! I'm here to help you stay accountable.

Nick always says: "The grind is the gospel." There's no wrong way to recover — the only wrong thing is doing nothing.

**What did you do today?** Even one rep counts. Even one step counts. Let's track your daily action together.

Remember: A body in motion stays in motion. 💪`,
    timestamp: new Date(),
  },
];

const quickActions = [
  { id: "log", label: "Log Today's Action", icon: Target, color: "bg-orange-600" },
  { id: "motivation", label: "I need motivation", icon: Zap, color: "bg-yellow-600" },
  { id: "exercises", label: "Help with exercises", icon: Dumbbell, color: "bg-blue-600" },
  { id: "struggling", label: "I'm struggling today", icon: Heart, color: "bg-red-600" },
  { id: "celebrate", label: "Celebrate a win!", icon: Trophy, color: "bg-green-600" },
];

const dailyTags = [
  "Exercise", "Walking", "PT Session", "Speech Therapy", 
  "OT Session", "Stretching", "Reading", "Rest Day"
];

export default function SRACompanion() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streak, setStreak] = useState(12);
  const [daysSinceStroke, setDaysSinceStroke] = useState(2183);
  const [dailyAction, setDailyAction] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with Nick's philosophy
    setTimeout(() => {
      const responses = [
        `That's what I'm talking about, warrior! Every action counts. Nick says: "You're not done. You're just scared of what comes next." Keep pushing!`,
        `The grind is the gospel. You showed up today, and that's what matters. Remember: there's no wrong way to recover — just keep moving.`,
        `A body in motion stays in motion. You took action today, and that's everything. Keep building that streak!`,
        `Nick would be proud. He went from 50 staples and a wheelchair to 90% recovery. If he can do it, you can too. One day at a time.`,
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (actionId: string) => {
    const prompts: Record<string, string> = {
      log: "I want to log what I did today for my recovery.",
      motivation: "I need some motivation to keep going today.",
      exercises: "Can you suggest some exercises I should do?",
      struggling: "I'm having a tough day and feeling discouraged.",
      celebrate: "I hit a milestone and want to celebrate!",
    };
    
    setInput(prompts[actionId] || "");
  };

  const handleLogDailyAction = () => {
    if (!dailyAction.trim() && selectedTags.length === 0) return;
    
    const actionText = selectedTags.length > 0 
      ? `Today I did: ${selectedTags.join(", ")}${dailyAction ? ` - ${dailyAction}` : ""}`
      : `Today I did: ${dailyAction}`;
    
    setInput(actionText);
    setDailyAction("");
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) 
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <>
      <Helmet>
        <title>AI Recovery Companion | Stroke Recovery Academy</title>
        <meta name="description" content="Your 24/7 accountability partner for stroke recovery. Get motivation, track daily actions, and stay consistent with AI support based on Nick Kremers' recovery wisdom." />
        <meta property="og:title" content="AI Recovery Companion | Stroke Recovery Academy" />
        <meta property="og:description" content="Stay accountable with your AI recovery partner. No wrong way to recover - just do something every day." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sra">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <Avatar className="h-12 w-12 border-2 border-orange-500">
                  <AvatarImage src={sosLogo} alt="SOS" />
                  <AvatarFallback className="bg-orange-600">SOS</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold" data-testid="text-title">AI Recovery Companion</h1>
                  <p className="text-sm text-gray-400">Accountability Partner • 24/7 Support</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/sra/tracker">
                  <Button variant="outline" size="sm" data-testid="button-tracker">
                    <Activity className="h-4 w-4 mr-2" />
                    Tracker
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Accountability Banner */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">
                    <strong className="text-orange-500" data-testid="text-days-count">{daysSinceStroke.toLocaleString()}</strong> days of your journey
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">
                    <strong className="text-orange-500" data-testid="text-streak">{streak}</strong> day streak
                  </span>
                </div>
              </div>
              <div className="text-sm italic text-gray-300" data-testid="text-quote">
                "No wrong way to recover. Just do something every day."
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3 flex flex-col h-[calc(100vh-280px)]">
              {/* Messages */}
              <Card className="flex-1 bg-gray-900 border-gray-800 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                        data-testid={`message-${message.role}-${message.id}`}
                      >
                        <Avatar className={`h-8 w-8 ${message.role === "assistant" ? "border border-orange-500" : ""}`}>
                          {message.role === "assistant" ? (
                            <>
                              <AvatarImage src={sosLogo} alt="SOS" />
                              <AvatarFallback className="bg-orange-600 text-xs">SOS</AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="bg-gray-700 text-xs">YOU</AvatarFallback>
                          )}
                        </Avatar>
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.role === "assistant"
                              ? "bg-gray-800 border border-orange-600/30"
                              : "bg-orange-600"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3" data-testid="typing-indicator">
                        <Avatar className="h-8 w-8 border border-orange-500">
                          <AvatarImage src={sosLogo} alt="SOS" />
                          <AvatarFallback className="bg-orange-600 text-xs">SOS</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-800 border border-orange-600/30 rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className="border-gray-700 hover:border-orange-500 hover:bg-orange-500/10"
                    data-testid={`button-quick-${action.id}`}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Input Area */}
              <div className="mt-4 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Remember: Just do something today..."
                  className="bg-gray-900 border-gray-700 focus:border-orange-500"
                  data-testid="input-message"
                />
                <Button 
                  onClick={handleSend} 
                  className="bg-orange-600 hover:bg-orange-700"
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Daily Action Tracker */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Log Today's Action
                  </CardTitle>
                  <p className="text-xs text-gray-400">Every day counts</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {dailyTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${
                          selectedTags.includes(tag) 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "border-gray-600 hover:border-orange-500"
                        }`}
                        onClick={() => toggleTag(tag)}
                        data-testid={`tag-${tag.toLowerCase().replace(" ", "-")}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={dailyAction}
                    onChange={(e) => setDailyAction(e.target.value)}
                    placeholder="What else did you do?"
                    className="bg-gray-800 border-gray-700 text-sm"
                    data-testid="input-daily-action"
                  />
                  <Button 
                    onClick={handleLogDailyAction}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="sm"
                    data-testid="button-log-action"
                  >
                    Log Action
                  </Button>
                </CardContent>
              </Card>

              {/* Google Fit Sync */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Watch className="h-5 w-5 text-green-500" />
                    Sync Fitness Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400 mb-3">
                    Connect Google Fit to automatically track steps and exercises
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-500 hover:bg-green-600/10"
                    data-testid="button-google-fit"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Connect Google Fit
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Days Since Stroke</span>
                    <span className="font-bold text-orange-500" data-testid="stat-days">{daysSinceStroke.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Current Streak</span>
                    <span className="font-bold text-orange-500" data-testid="stat-streak">{streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Recovery Progress</span>
                    <span className="font-bold text-orange-500" data-testid="stat-progress">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Actions This Week</span>
                    <span className="font-bold text-green-500" data-testid="stat-weekly">7/7</span>
                  </div>
                </CardContent>
              </Card>

              {/* Nick's Quote */}
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30">
                <CardContent className="pt-4">
                  <MessageCircle className="h-6 w-6 text-orange-500 mb-2" />
                  <p className="text-sm italic" data-testid="text-daily-quote">
                    "The grind is the gospel. Recovery isn't a comeback — it's a reconstruction. Brutal. Boring. Sacred."
                  </p>
                  <p className="text-xs text-orange-500 mt-2">— Nick Kremers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
