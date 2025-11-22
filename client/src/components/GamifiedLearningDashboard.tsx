import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, Flame, TrendingUp, Award, Target, Zap } from "lucide-react";

interface LearningStats {
  lessonsCompleted: number;
  averageScore: number;
  currentStreak: number;
  totalTimeSpent: number;
  certificatesEarned: number;
  badges: Badge[];
  recentScores: { date: string; score: number }[];
  courseProgress: { name: string; value: number }[];
}

interface Badge {
  id: string;
  label: string;
  icon: string;
  earnedAt: string;
}

export function GamifiedLearningDashboard() {
  const { data: stats, isLoading } = useQuery<LearningStats>({
    queryKey: ["/api/learning-stats"],
    initialData: {
      lessonsCompleted: 12,
      averageScore: 87,
      currentStreak: 5,
      totalTimeSpent: 420,
      certificatesEarned: 2,
      badges: [
        { id: "1", label: "First Step", icon: "🎯", earnedAt: "2024-01-15" },
        { id: "2", label: "Perfect 100%", icon: "⭐", earnedAt: "2024-01-18" },
        { id: "3", label: "Week Warrior", icon: "🔥", earnedAt: "2024-01-22" },
      ],
      recentScores: [
        { date: "Mon", score: 85 },
        { date: "Tue", score: 92 },
        { date: "Wed", score: 88 },
        { date: "Thu", score: 95 },
        { date: "Fri", score: 90 },
      ],
      courseProgress: [
        { name: "Finding Deals", value: 100 },
        { name: "Operations", value: 75 },
        { name: "Scaling", value: 40 },
      ],
    },
  });

  if (isLoading || !stats) return <div>Loading...</div>;

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <div className="w-full space-y-8">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Lessons</span>
              </div>
              <p className="text-3xl font-bold">{stats.lessonsCompleted}</p>
              <Progress value={(stats.lessonsCompleted / 50) * 100} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-muted-foreground">Avg Score</span>
              </div>
              <p className="text-3xl font-bold">{stats.averageScore}%</p>
              <p className="text-xs text-green-600 font-semibold">↑ 5% this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Certificates</span>
              </div>
              <p className="text-3xl font-bold">{stats.certificatesEarned}</p>
              <p className="text-xs text-muted-foreground">earned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Time</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(stats.totalTimeSpent / 60)}</p>
              <p className="text-xs text-muted-foreground">hours learned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Score Trend This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.recentScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
                name="Quiz Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Progress & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.courseProgress.map((course, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">{course.name}</span>
                  <span className="text-xs text-muted-foreground">{course.value}%</span>
                </div>
                <Progress value={course.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-3 bg-muted rounded-lg hover-elevate"
                  data-testid={`badge-${badge.id}`}
                >
                  <span className="text-3xl mb-1">{badge.icon}</span>
                  <p className="text-xs text-center font-semibold line-clamp-2">
                    {badge.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Your Next Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div>
              <p className="font-semibold text-sm">Complete 20 Lessons</p>
              <p className="text-xs text-muted-foreground">{stats.lessonsCompleted}/20</p>
            </div>
            <Progress value={(stats.lessonsCompleted / 20) * 100} className="w-20" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div>
              <p className="font-semibold text-sm">Earn 3 Certificates</p>
              <p className="text-xs text-muted-foreground">{stats.certificatesEarned}/3</p>
            </div>
            <Badge variant="outline" className="gap-1">
              {3 - stats.certificatesEarned} left
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div>
              <p className="font-semibold text-sm">7-Day Streak</p>
              <p className="text-xs text-muted-foreground">{stats.currentStreak}/7 days</p>
            </div>
            <Progress value={(stats.currentStreak / 7) * 100} className="w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
