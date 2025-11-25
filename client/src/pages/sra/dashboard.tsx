import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Heart,
  Activity,
  Droplets,
  Footprints,
  Dumbbell,
  ArrowLeft,
  Bell,
  TrendingUp,
  Clock,
  Flame,
  Target,
  ChevronRight,
  Smartphone,
  Watch,
  RefreshCw,
  Plus,
  Calendar,
  Pill,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle2,
  Timer
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";

interface VitalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  trend?: "up" | "down" | "stable";
  lastUpdated: Date;
}

interface Reminder {
  id: string;
  type: "hydration" | "exercise" | "medication" | "stretch";
  title: string;
  time: string;
  enabled: boolean;
  completed?: boolean;
}

export default function SRADashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streak, setStreak] = useState(12);
  const [daysSinceStroke, setDaysSinceStroke] = useState(2183);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const vitals: VitalMetric[] = [
    {
      id: "heart-rate",
      name: "Heart Rate",
      value: 72,
      unit: "BPM",
      target: 80,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      trend: "stable",
      lastUpdated: new Date()
    },
    {
      id: "blood-oxygen",
      name: "Blood Oxygen",
      value: 98,
      unit: "%",
      target: 95,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      trend: "up",
      lastUpdated: new Date()
    },
    {
      id: "steps",
      name: "Steps Today",
      value: 3247,
      unit: "steps",
      target: 5000,
      icon: Footprints,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      trend: "up",
      lastUpdated: new Date()
    },
    {
      id: "hydration",
      name: "Hydration",
      value: 5,
      unit: "glasses",
      target: 8,
      icon: Droplets,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20",
      trend: "up",
      lastUpdated: new Date()
    }
  ];

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", type: "hydration", title: "Drink Water", time: "Every 2 hours", enabled: true, completed: false },
    { id: "2", type: "exercise", title: "Hand Exercises", time: "10:00 AM", enabled: true, completed: true },
    { id: "3", type: "medication", title: "Blood Pressure Meds", time: "8:00 AM", enabled: true, completed: true },
    { id: "4", type: "stretch", title: "Stretching Routine", time: "2:00 PM", enabled: true, completed: false },
    { id: "5", type: "exercise", title: "Walking (15 min)", time: "4:00 PM", enabled: true, completed: false },
    { id: "6", type: "medication", title: "Evening Medication", time: "8:00 PM", enabled: true, completed: false },
  ]);

  const todayExercises = [
    { name: "Hand Squeezes", reps: "3x20", done: true, duration: "10 min" },
    { name: "Arm Raises", reps: "3x15", done: true, duration: "8 min" },
    { name: "Leg Lifts", reps: "3x10", done: false, duration: "12 min" },
    { name: "Balance Standing", reps: "5 min", done: false, duration: "5 min" },
  ];

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const completeReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "hydration": return Droplets;
      case "exercise": return Dumbbell;
      case "medication": return Pill;
      case "stretch": return Activity;
      default: return Bell;
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case "hydration": return "text-cyan-500";
      case "exercise": return "text-green-500";
      case "medication": return "text-purple-500";
      case "stretch": return "text-yellow-500";
      default: return "text-orange-500";
    }
  };

  return (
    <>
      <Helmet>
        <title>Health Dashboard | Stroke Recovery Academy</title>
        <meta name="description" content="Track your stroke recovery progress with real-time health metrics. Monitor heart rate, blood oxygen, steps, hydration, and get exercise reminders." />
        <meta property="og:title" content="Health Dashboard | Stroke Recovery Academy" />
        <meta property="og:description" content="Complete health tracking for stroke recovery. Heart rate, SpO2, steps, hydration, and personalized reminders." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Link href="/sra">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <img src={sosLogo} alt="SOS" className="h-10 w-10" />
                  <div>
                    <h1 className="text-lg md:text-xl font-bold" data-testid="text-title">Health Dashboard</h1>
                    <p className="text-xs md:text-sm text-gray-400">
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-gray-700" data-testid="button-sync">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" className="border-gray-700" data-testid="button-connect-device">
                  <Watch className="h-4 w-4 mr-2" />
                  Devices
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Banner */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  <span className="text-sm">
                    <strong className="text-orange-500" data-testid="text-days-count">{daysSinceStroke.toLocaleString()}</strong> days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  <span className="text-sm">
                    <strong className="text-orange-500" data-testid="text-streak">{streak}</strong> day streak
                  </span>
                </div>
              </div>
              <p className="text-xs md:text-sm italic text-gray-300 hidden sm:block" data-testid="text-quote">
                "The grind is the gospel"
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Vital Signs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {vitals.map((vital) => (
              <Card key={vital.id} className="bg-gray-900 border-gray-800" data-testid={`vital-card-${vital.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${vital.bgColor}`}>
                      <vital.icon className={`h-5 w-5 ${vital.color}`} />
                    </div>
                    {vital.trend && (
                      <Badge variant="outline" className={`text-xs ${
                        vital.trend === "up" ? "border-green-500 text-green-500" :
                        vital.trend === "down" ? "border-red-500 text-red-500" :
                        "border-gray-500 text-gray-500"
                      }`}>
                        {vital.trend === "up" ? "↑" : vital.trend === "down" ? "↓" : "→"}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl md:text-3xl font-bold" data-testid={`value-${vital.id}`}>
                      {vital.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">{vital.unit}</span>
                  </div>
                  <p className="text-sm text-gray-400">{vital.name}</p>
                  {vital.target && (
                    <div className="mt-2">
                      <Progress 
                        value={Math.min((vital.value / vital.target) * 100, 100)} 
                        className="h-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Goal: {vital.target} {vital.unit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Reminders */}
            <div className="lg:col-span-2 space-y-4">
              {/* Today's Reminders */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-500" />
                      Today's Schedule
                    </CardTitle>
                    <Button variant="ghost" size="sm" data-testid="button-add-reminder">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reminders.map((reminder) => {
                    const Icon = getReminderIcon(reminder.type);
                    const colorClass = getReminderColor(reminder.type);
                    return (
                      <div 
                        key={reminder.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 ${reminder.completed ? 'opacity-60' : ''}`}
                        data-testid={`reminder-${reminder.id}`}
                      >
                        <button 
                          onClick={() => completeReminder(reminder.id)}
                          className="flex-shrink-0"
                          data-testid={`button-complete-${reminder.id}`}
                        >
                          {reminder.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className={`h-5 w-5 rounded-full border-2 ${colorClass.replace('text-', 'border-')}`} />
                          )}
                        </button>
                        <Icon className={`h-4 w-4 flex-shrink-0 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                            {reminder.title}
                          </p>
                          <p className="text-xs text-gray-500">{reminder.time}</p>
                        </div>
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={() => toggleReminder(reminder.id)}
                          data-testid={`switch-${reminder.id}`}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Exercise Plan */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-green-500" />
                      Today's Exercises
                    </CardTitle>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      {todayExercises.filter(e => e.done).length}/{todayExercises.length} done
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {todayExercises.map((exercise, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${exercise.done ? 'border-green-600/30 bg-green-600/10' : 'border-gray-700 bg-gray-800/50'}`}
                        data-testid={`exercise-${idx}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${exercise.done ? 'text-green-500' : ''}`}>
                            {exercise.name}
                          </span>
                          {exercise.done ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Timer className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{exercise.reps}</span>
                          <span>{exercise.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" data-testid="button-start-workout">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Start Next Exercise
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Stats */}
            <div className="space-y-4">
              {/* Quick Log */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-cyan-600/50 hover:bg-cyan-600/10" data-testid="button-log-water">
                    <Droplets className="h-4 w-4 mr-2 text-cyan-500" />
                    Log Water (+1 glass)
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-green-600/50 hover:bg-green-600/10" data-testid="button-log-exercise">
                    <Dumbbell className="h-4 w-4 mr-2 text-green-500" />
                    Log Exercise
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-purple-600/50 hover:bg-purple-600/10" data-testid="button-log-medication">
                    <Pill className="h-4 w-4 mr-2 text-purple-500" />
                    Log Medication
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-red-600/50 hover:bg-red-600/10" data-testid="button-log-vitals">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Log Vitals
                  </Button>
                </CardContent>
              </Card>

              {/* Connected Devices */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Watch className="h-5 w-5 text-orange-500" />
                    Connected Devices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Smartphone className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Google Fit</p>
                      <p className="text-xs text-green-500">Connected</p>
                    </div>
                    <Badge className="bg-green-600">Synced</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                    <div className="p-2 rounded-lg bg-gray-500/20">
                      <Watch className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Apple Watch</p>
                      <p className="text-xs text-gray-500">Not connected</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-xs" data-testid="button-connect-apple">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                    <div className="p-2 rounded-lg bg-gray-500/20">
                      <Activity className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fitbit</p>
                      <p className="text-xs text-gray-500">Not connected</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-xs" data-testid="button-connect-fitbit">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold">Weekly Progress</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Exercises</span>
                      <span className="text-orange-500 font-medium">18/21</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Hydration Goals</span>
                      <span className="text-orange-500 font-medium">6/7 days</span>
                    </div>
                    <Progress value={86} className="h-2" />
                  </div>
                  <Link href="/sra/tracker">
                    <Button variant="outline" className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-500/10" data-testid="button-view-full">
                      View Full Report
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* AI Companion */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Brain className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Need Motivation?</h4>
                  <p className="text-xs text-gray-400 mb-3">Chat with your AI companion</p>
                  <Link href="/sra/companion">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-companion">
                      <Zap className="h-4 w-4 mr-2" />
                      Open Companion
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
