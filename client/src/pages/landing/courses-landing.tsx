import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Users, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function CoursesLanding() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: "WashBizHub Premium Courses",
    description: "Interactive courses on finding deals, operations, and scaling laundromats",
    url: "https://washbizhub.com/courses-landing",
    provider: {
      "@type": "Organization",
      name: "WashBizHub",
    },
  };

  return (
    <>
      <SEOHead
        title="Online Courses for Laundromat Business - Interactive Learning"
        description="Master laundromat entrepreneurship with interactive courses on finding deals, operations, scaling. Get certificates, lifetime access, and personal support."
        keywords={[
          "laundromat course",
          "online course",
          "business course",
          "laundromat training",
          "interactive learning",
          "entrepreneurship",
          "certificate course",
        ]}
        canonical="https://washbizhub.com/courses-landing"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center space-y-6 py-20">
            <Badge className="mx-auto">Interactive Learning</Badge>
            <h1 className="text-5xl md:text-6xl font-bold">
              Master the Laundromat Business
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from industry experts with interactive courses, real-time quizzes, and certification.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/courses">
                <Button size="lg" className="gap-2">
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  View Free Lessons
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Courses */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Our Courses</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Finding Deals",
                  desc: "Location analysis, due diligence, negotiation tactics",
                  level: "Beginner",
                  lessons: 12,
                },
                {
                  title: "Operations Mastery",
                  desc: "POS systems, IoT monitoring, cost optimization",
                  level: "Intermediate",
                  lessons: 18,
                },
                {
                  title: "Scaling Strategy",
                  desc: "Multi-store management, financing, exit planning",
                  level: "Advanced",
                  lessons: 15,
                },
              ].map((course, i) => (
                <Card key={i} className="hover-elevate">
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course.desc}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{course.level}</span>
                      <span className="font-semibold">{course.lessons} lessons</span>
                    </div>
                    <Button className="w-full">View Course</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold">Why Choose Our Courses</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Interactive lessons with real-world scenarios",
                "Gamified learning with badges & achievements",
                "Real-time quizzes with instant feedback",
                "Certificates recognized in the industry",
                "Lifetime access to all course materials",
                "Exclusive community of laundromat entrepreneurs",
              ].map((benefit, i) => (
                <div key={i} className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">5,000+</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Award className="w-8 h-8 text-accent mb-2" />
                <p className="text-2xl font-bold">2,400+</p>
                <p className="text-sm text-muted-foreground">Certificates Issued</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">4.9/5</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <GraduationCap className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </CardContent>
            </Card>
          </div>

          {/* Premium Bundle */}
          <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-lg text-center space-y-6">
            <h2 className="text-3xl font-bold text-primary-foreground">Premium Bundle</h2>
            <p className="text-primary-foreground/80 text-lg">
              All Courses + The Laundromat Bible + Lifetime Updates
            </p>
            <div className="space-y-2">
              <p className="text-primary-foreground text-4xl font-bold">$297</p>
              <p className="text-primary-foreground/70">Save $300+ (50% off)</p>
            </div>
            <Button size="lg" variant="secondary">
              Get Unlimited Access
            </Button>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 py-12">
            <h2 className="text-3xl font-bold">Start Learning Today</h2>
            <p className="text-muted-foreground text-lg">
              Your journey to laundromat success starts here
            </p>
            <Link href="/courses">
              <Button size="lg">Browse All Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
