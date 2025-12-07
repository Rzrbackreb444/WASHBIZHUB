import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  GraduationCap, 
  Award, 
  Lock, 
  BookOpen, 
  Wrench, 
  CreditCard, 
  Briefcase, 
  Star,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
  Zap,
  Loader2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AcademyDisclaimer } from '@/components/LegalDisclaimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface ServiceTechCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  level: string;
  track: string;
  tier: 'FREE' | 'STARTER' | 'PRO';
  duration: number;
  enrollmentCount: number;
  certificateEnabled: boolean;
  instructorName: string;
}

interface Track {
  id: string;
  name: string;
  description: string;
  icon: typeof Wrench;
  courseCount: number;
  color: string;
}

interface Certification {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  imageUrl?: string;
}

const TRACKS: Track[] = [
  {
    id: 'core-tech',
    name: 'Core Tech',
    description: 'Master essential laundry equipment repair fundamentals, electrical systems, and mechanical components.',
    icon: Wrench,
    courseCount: 0,
    color: '#C8A661',
  },
  {
    id: 'brand-specialist',
    name: 'Brand Specialist',
    description: 'Become certified in specific equipment brands: Dexter, Speed Queen, Maytag, and more.',
    icon: Star,
    courseCount: 0,
    color: '#3B82F6',
  },
  {
    id: 'payment-systems',
    name: 'Payment Systems',
    description: 'Learn to install, configure, and troubleshoot modern payment systems and card readers.',
    icon: CreditCard,
    courseCount: 0,
    color: '#10B981',
  },
  {
    id: 'business-skills',
    name: 'Business Skills',
    description: 'Develop customer service, business management, and professional development skills.',
    icon: Briefcase,
    courseCount: 0,
    color: '#8B5CF6',
  },
];

const TIER_CONFIG = {
  FREE: { label: 'Free', color: 'bg-green-500', textColor: 'text-white' },
  STARTER: { label: 'Starter', color: 'bg-[#C8A661]', textColor: 'text-[#0A1628]' },
  PRO: { label: 'Pro', color: 'bg-[#0A1628]', textColor: 'text-white' },
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

function TrackCard({ track }: { track: Track }) {
  const Icon = track.icon;
  
  return (
    <Card 
      className="bg-card border shadow-sm overflow-hidden hover-elevate cursor-pointer group"
      data-testid={`card-track-${track.id}`}
    >
      <div className="h-1" style={{ backgroundColor: track.color }} />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#0A1628' }}
          >
            <Icon className="h-6 w-6" style={{ color: track.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-[#C8A661] transition-colors">
              {track.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {track.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{track.courseCount} courses</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#C8A661] transition-colors flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCard({ 
  course, 
  userTier,
  onLockedClick 
}: { 
  course: ServiceTechCourse; 
  userTier: string;
  onLockedClick: () => void;
}) {
  const tierConfig = TIER_CONFIG[course.tier];
  const levelColor = LEVEL_COLORS[course.level.toLowerCase()] || '#8B5CF6';
  
  const isLocked = 
    (course.tier === 'STARTER' && userTier === 'free') ||
    (course.tier === 'PRO' && userTier !== 'pro');
  
  const thumbnail = course.thumbnailUrl || 
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop';
  
  const handleEnrollClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      onLockedClick();
    }
  };
  
  return (
    <Card 
      className="bg-card border shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
      data-testid={`card-course-${course.slug}`}
    >
      <div 
        className="h-40 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${thumbnail})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge className={`${tierConfig.color} ${tierConfig.textColor}`}>
            {course.tier === 'FREE' && <CheckCircle className="w-3 h-3 mr-1" />}
            {tierConfig.label}
          </Badge>
          {isLocked && (
            <div className="bg-black/60 p-1.5 rounded-full">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge 
            variant="secondary"
            className="text-white border-white/20"
            style={{ backgroundColor: levelColor }}
          >
            {course.level}
          </Badge>
          {course.certificateEnabled && (
            <div className="flex items-center gap-1 text-white text-xs bg-black/40 px-2 py-1 rounded">
              <Award className="w-3 h-3" />
              Certificate
            </div>
          )}
        </div>
      </div>
      
      <CardHeader className="flex-1 pb-2">
        <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{course.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.round(course.duration / 60)}h
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.enrollmentCount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Instructor: {course.instructorName}
          </p>
        </div>
        
        {isLocked ? (
          <Button 
            className="w-full bg-muted hover:bg-muted/80 text-muted-foreground"
            onClick={handleEnrollClick}
            data-testid={`button-enroll-${course.slug}`}
          >
            <Lock className="w-4 h-4 mr-2" />
            Upgrade to Access
          </Button>
        ) : (
          <Link href={`/courses/${course.id}`}>
            <Button 
              className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
              data-testid={`button-enroll-${course.slug}`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {course.tier === 'FREE' ? 'Start Free Course' : 'Enroll Now'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function CertificationBadge({ cert }: { cert: Certification }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="h-14 w-14 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
        <Award className="h-7 w-7 text-[#C8A661]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{cert.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-1">{cert.description}</p>
        {cert.earnedAt && (
          <p className="text-xs text-[#C8A661] mt-1">
            Earned on {new Date(cert.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {cert.earnedAt && (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      )}
    </div>
  );
}

export default function ServiceTechAcademy() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  
  const userTier = user?.subscriptionTier || 'free';
  
  const { data: courses = [], isLoading } = useQuery<ServiceTechCourse[]>({
    queryKey: ['/api/service-tech/courses'],
  });
  
  const tracksWithCounts = TRACKS.map(track => ({
    ...track,
    courseCount: courses.filter(c => c.track === track.id).length,
  }));
  
  const featuredCourses = courses.slice(0, 6);
  
  const sampleCertifications: Certification[] = [
    {
      id: '1',
      title: 'Certified Laundry Technician',
      description: 'Complete the Core Tech track to earn this professional certification.',
    },
    {
      id: '2',
      title: 'Payment Systems Specialist',
      description: 'Master modern payment system installation and troubleshooting.',
    },
    {
      id: '3',
      title: 'Brand Expert - Dexter',
      description: 'Demonstrated expertise in Dexter equipment service and repair.',
    },
  ];
  
  if (isLoading) {
    return (
      <>
        <SEO
          title="Service Tech Academy | Professional Laundry Equipment Training"
          description="Master commercial laundry equipment repair with expert-led courses. Earn professional certifications in equipment service, payment systems, and business skills."
          canonicalUrl="/service-tech-academy"
        />
        <div className="min-h-screen bg-background flex items-center justify-center" data-testid="page-service-tech-academy">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C8A661]" />
            <p className="text-muted-foreground">Loading academy...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <SEO
        title="Service Tech Academy | Professional Laundry Equipment Training"
        description="Master commercial laundry equipment repair with expert-led courses. Earn professional certifications in equipment service, payment systems, and business skills."
        canonicalUrl="/service-tech-academy"
        keywords={['laundry equipment training', 'service technician certification', 'commercial laundry repair', 'equipment diagnostics course']}
      />
      
      <div className="min-h-screen bg-background" data-testid="page-service-tech-academy">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Academy", url: "/academy" },
              { name: "Service Tech Academy", url: "/service-tech-academy" }
            ]} />
          </div>
        </div>

        <section className="relative bg-[#0A1628] text-white py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8A661] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C8A661] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                  <GraduationCap className="w-3 h-3 mr-1.5" />
                  Professional Certification
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Service Tech Academy
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl">
                  Master commercial laundry equipment repair and earn industry-recognized certifications. 
                  Expert-led courses for technicians at every level.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Learning Free
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    View All Courses
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C8A661]">{courses.length}+</div>
                    <div className="text-xs text-gray-400">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C8A661]">4</div>
                    <div className="text-xs text-gray-400">Learning Tracks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C8A661]">3</div>
                    <div className="text-xs text-gray-400">Certifications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C8A661]">24/7</div>
                    <div className="text-xs text-gray-400">Access</div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A661]/20 to-[#C8A661]/5 rounded-2xl border border-[#C8A661]/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-[#C8A661]/10 flex items-center justify-center border-2 border-[#C8A661]/30">
                      <GraduationCap className="h-16 w-16 text-[#C8A661]" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#0A1628] border border-[#C8A661]/30 rounded-lg p-2">
                    <Award className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-[#0A1628] border border-[#C8A661]/30 rounded-lg p-2">
                    <Wrench className="h-6 w-6 text-[#C8A661]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <BookOpen className="w-3 h-3 mr-1.5" />
                Learning Paths
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Choose Your Track
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Structured learning paths designed to take you from fundamentals to expert-level mastery.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {tracksWithCounts.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Star className="w-3 h-3 mr-1.5" />
                Featured Courses
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Start Learning Today
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Expert-led courses with hands-on projects and real-world applications.
              </p>
            </div>
            
            {featuredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map(course => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    userTier={userTier}
                    onLockedClick={() => setShowUpgradeModal(true)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Courses Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Our expert instructors are preparing comprehensive training content.
                </p>
                <Button variant="outline">
                  Get Notified
                </Button>
              </Card>
            )}
            
            {featuredCourses.length > 0 && (
              <div className="text-center mt-8">
                <Link href="/courses">
                  <Button variant="outline" className="border-[#0A1628] text-[#0A1628]">
                    View All Courses
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Award className="w-3 h-3 mr-1.5" />
                Professional Recognition
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Earn Industry Certifications
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete learning tracks to earn recognized certifications that demonstrate your expertise.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleCertifications.map(cert => (
                <CertificationBadge key={cert.id} cert={cert} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#0A1628]">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Advance Your Career?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of service technicians who have upgraded their skills and 
              increased their earning potential through Service Tech Academy.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                <GraduationCap className="w-4 h-4 mr-2" />
                Start Free Trial
              </Button>
              <Link href="/pricing">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <AcademyDisclaimer />
          </div>
        </section>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C8A661]" />
              Premium Course
            </DialogTitle>
            <DialogDescription>
              This course requires a higher subscription tier to access. Upgrade your plan to unlock all premium courses and certifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">What you'll get with an upgrade:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Access to all premium courses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Earn professional certifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority support from instructors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Downloadable resources & materials
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
              <Link href="/pricing" className="flex-1">
                <Button className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
