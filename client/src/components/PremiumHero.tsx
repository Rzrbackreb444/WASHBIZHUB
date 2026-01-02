import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, TrendingUp, MapPin, DollarSign, Users, BarChart3, Navigation, Shield } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useMemo, useEffect, useState } from "react";
import heroImage from "@assets/big_dexter_laundromat_1765733391377.jpg";
import twinCitiesInterior from "@assets/Twin_Cities_Laundromat_1764705357211.jpg";

// SSR-safe hook to detect mobile devices for performance optimization
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Only access window in browser environment
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export function PremiumHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // Disable expensive animations on mobile or when reduced motion is preferred
  const shouldReduceMotion = prefersReducedMotion || isMobile;
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Disable parallax on mobile for performance
  const y1 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, shouldReduceMotion ? 1 : 0]);
  
  // Optimized animation variants - simplified on mobile
  const containerVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }, [shouldReduceMotion]);

  const itemVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  } : {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  }, [shouldReduceMotion]);

  const floatVariants = useMemo(() => shouldReduceMotion ? {
    initial: { y: 0 },
    animate: { y: 0 }
  } : {
    initial: { y: 0 },
    animate: {
      y: [-8, 8, -8],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  }, [shouldReduceMotion]);

  const cardRevealVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1, x: 0, rotateY: 0 },
    visible: { opacity: 1, x: 0, rotateY: 0 }
  } : {
    hidden: { opacity: 0, x: 60, rotateY: -15 },
    visible: { 
      opacity: 1, x: 0, rotateY: 0,
      transition: { duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  }, [shouldReduceMotion]);

  const secondCardVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1, x: 0, rotateY: 0 },
    visible: { opacity: 1, x: 0, rotateY: 0 }
  } : {
    hidden: { opacity: 0, x: 80, rotateY: -20 },
    visible: { 
      opacity: 1, x: 0, rotateY: 0,
      transition: { duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }
    }
  }, [shouldReduceMotion]);

  return (
    <section 
      ref={containerRef} 
      className="relative overflow-hidden min-h-[90vh]"
      itemScope
      itemType="https://schema.org/SoftwareApplication"
      aria-label="CLEANBI Location Intelligence Platform - Score any laundromat location instantly"
    >
      {/* Hidden SEO content for crawlers - using meta tags only to avoid duplicate h1 */}
      <div className="sr-only" role="complementary" aria-label="SEO metadata">
        <meta itemProp="name" content="CLEANBI Location Intelligence" />
        <meta itemProp="applicationCategory" content="BusinessApplication" />
        <meta itemProp="operatingSystem" content="Web" />
        <span itemProp="description">CLEANBI analyzes demographics, competition density, foot traffic patterns, and 50+ data points to provide investment-grade scores for laundromat locations. Trusted by 73,000+ industry professionals for location intelligence, market analysis, and due diligence.</span>
      </div>
      {/* Premium image background */}
      <div className="absolute inset-0">
        {/* Static image background for all devices - faster loading than video */}
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
          role="img"
          aria-label="NYC skyline at night"
        />
        
        {/* Dynamic overlay - darker on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-[#0A1628]/75 to-[#0A1628]/50" />
        {/* Additional bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/85 via-transparent to-transparent" />
        {/* Gold accent glow - enhanced */}
        <div 
          className="absolute top-1/4 right-0 w-2/3 h-2/3"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(200,166,97,0.12) 0%, transparent 60%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/2"
          style={{ background: 'radial-gradient(circle at 20% 80%, rgba(200,166,97,0.08) 0%, transparent 50%)' }}
        />
        {/* Subtle vignette effect */}
        <div 
          className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 150px 50px rgba(10,22,40,0.4)' }}
        />
      </div>
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        <div className="flex flex-col items-center justify-center text-center min-h-[85vh] py-16 sm:py-20 lg:py-32">
          {/* Centered Hero Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
              <span 
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#C8A661]/20 border border-[#C8A661]/30 text-[#C8A661] text-xs sm:text-sm font-semibold tracking-wide uppercase"
                data-testid="badge-hero-tagline"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                <span className="speakable">The Industry's Complete Expert Platform</span>
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-white leading-[1.05] mb-6 sm:mb-8 speakable"
              style={{ fontFamily: 'var(--font-bebas)' }}
              data-testid="heading-hero-title"
            >
              <span className="block text-[clamp(2.5rem,7vw,5.25rem)] tracking-tight">
                LEARN. START. OPERATE. EXPAND.
              </span>
              <span className="block text-[clamp(1.5rem,4vw,3rem)] text-white/70 tracking-wide mt-1 sm:mt-2">
                ONE PLATFORM FOR YOUR ENTIRE JOURNEY
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-xl lg:text-2xl text-white/70 leading-relaxed mb-10 sm:mb-12 font-light speakable max-w-3xl mx-auto"
              data-testid="text-hero-description"
            >
              Funding, calculators, guides, courses, listings, marketplace — 
              everything you need in one place. Expert tools with human-verified 
              intelligence, connecting 73,000+ industry professionals.
            </motion.p>
            
            {/* Centered CTA Section - Primary + Secondary */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-12">
              <Link href="/list-your-laundromat">
                <Button 
                  size="lg"
                  className="bg-[#C8A661] text-[#0A1628] shadow-lg shadow-[#C8A661]/25"
                  data-testid="button-list-laundromat"
                >
                  List Your Laundromat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cleanbi-explorer">
                <Button 
                  variant="ghost"
                  size="lg"
                  className="text-white/80"
                  data-testid="link-analyze-deal"
                >
                  Analyze a Deal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators - Centered */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { grade: "A", color: "from-green-500/30 to-green-600/20 border-green-500/50" },
                    { grade: "B", color: "from-lime-500/30 to-lime-600/20 border-lime-500/50" },
                    { grade: "C", color: "from-amber-500/30 to-amber-600/20 border-amber-500/50" },
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} border-2 flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {item.grade}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/60">CLEANBI Grades</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C8A661] text-[#C8A661]" />
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  <span className="text-white font-semibold">2,400+</span> operators trust WashBizHub
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating cards hidden for centered hero design */}
          <div className="hidden" style={{ perspective: '1000px' }}>
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 xl:w-80 h-64 xl:h-80 bg-[#C8A661]/20 rounded-full blur-[100px]" />
            </div>
            
            {/* Main CLEANBI Card - Fixed containment */}
            <motion.div
              variants={cardRevealVariants}
              initial="hidden"
              animate="visible"
              style={{ y: y1 }}
              className="absolute top-8 xl:top-12 left-0 xl:left-8 z-20"
            >
              <motion.div
                variants={floatVariants}
                initial="initial"
                animate="animate"
              >
                <div className="relative">
                  {/* Card shadow */}
                  <div className="absolute inset-0 bg-black/20 rounded-3xl blur-2xl translate-y-8 translate-x-4" />
                  
                  {/* Main card with overflow containment */}
                  <div 
                    className="relative bg-white rounded-2xl shadow-2xl p-4 xl:p-6 w-[280px] xl:w-[320px] transform hover:scale-[1.02] transition-transform duration-500 overflow-hidden"
                    itemScope
                    itemType="https://schema.org/AnalysisNewsArticle"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 xl:mb-6 gap-2">
                      <div className="flex items-center gap-2 xl:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] xl:text-xs font-bold text-[#C8A661] uppercase tracking-wider">CLEANBI</p>
                          <p className="text-xs xl:text-sm font-semibold text-gray-900 truncate">Location Score</p>
                        </div>
                      </div>
                      <div className="px-2 xl:px-3 py-1 bg-green-100 rounded-full flex-shrink-0">
                        <span className="text-[10px] xl:text-xs font-bold text-green-700">LIVE</span>
                      </div>
                    </div>
                    
                    {/* Score display */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 xl:p-5 mb-4 xl:mb-5 overflow-hidden">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] xl:text-xs text-gray-500 uppercase tracking-wider mb-0.5 xl:mb-1">Overall Grade</p>
                          <div className="flex items-baseline gap-1 xl:gap-2">
                            <span 
                              className="text-4xl xl:text-5xl font-black text-[#22C55E]"
                              style={{ fontFamily: 'var(--font-bebas)' }}
                            >
                              A
                            </span>
                            <span className="text-sm xl:text-lg text-gray-600 font-medium truncate">Excellent</span>
                          </div>
                        </div>
                        <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-2xl xl:text-3xl font-black text-white">87</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics grid - Contained with overflow hidden */}
                    <div className="grid grid-cols-3 gap-2 xl:gap-3">
                      {[
                        { label: "Demographics", value: "8.2", color: "text-[#1e3a5f]", icon: Users },
                        { label: "Competition", value: "7.9", color: "text-[#C8A661]", icon: BarChart3 },
                        { label: "Traffic", value: "9.1", color: "text-green-600", icon: Navigation }
                      ].map((metric) => (
                        <div 
                          key={metric.label} 
                          className="text-center p-2 xl:p-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5 xl:mb-1">
                            <metric.icon className={`w-2.5 h-2.5 xl:w-3 xl:h-3 ${metric.color} flex-shrink-0`} />
                            <p className="xl:text-[10px] text-gray-500 uppercase tracking-wider truncate text-[12px]">{metric.label}</p>
                          </div>
                          <p className={`text-lg xl:text-xl font-bold ${metric.color}`}>{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Secondary listing card */}
            <motion.div
              variants={secondCardVariants}
              initial="hidden"
              animate="visible"
              style={{ y: y2 }}
              className="absolute bottom-8 xl:bottom-16 right-0 z-10"
            >
              <motion.div
                variants={floatVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: '2s' }}
              >
                <div className="relative">
                  {/* Card shadow */}
                  <div className="absolute inset-0 bg-black/15 rounded-2xl blur-xl translate-y-6 translate-x-3" />
                  
                  {/* Listing card with overflow containment */}
                  <div className="relative bg-white rounded-xl shadow-xl overflow-hidden w-[240px] xl:w-72 transform hover:scale-[1.02] transition-transform duration-500">
                    <div className="relative h-28 xl:h-32 overflow-hidden">
                      <img 
                        src={twinCitiesInterior} 
                        alt="Premium laundromat interior with modern equipment" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 xl:top-3 left-2 xl:left-3">
                        <span className="px-2 py-0.5 xl:py-1 bg-[#C8A661] text-white text-[10px] xl:text-xs font-bold rounded-md shadow-lg">
                          FEATURED
                        </span>
                      </div>
                      <div className="absolute top-2 xl:top-3 right-2 xl:right-3">
                        <span className="px-2 xl:px-3 py-0.5 xl:py-1 bg-white/95 text-gray-900 text-xs xl:text-sm font-bold rounded-md shadow-lg">
                          $425K
                        </span>
                      </div>
                    </div>
                    <div className="p-3 xl:p-4">
                      <h3 className="font-bold text-gray-900 text-xs xl:text-sm mb-1.5 xl:mb-2 truncate">Modern Coin Laundry</h3>
                      <div className="flex items-center gap-3 xl:gap-4 text-[10px] xl:text-xs text-gray-600">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 xl:w-3 xl:h-3 flex-shrink-0" /> Seattle, WA
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <DollarSign className="w-2.5 h-2.5 xl:w-3 xl:h-3 flex-shrink-0" /> $92K/yr CF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] xl:w-[500px] h-[400px] xl:h-[500px] border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] xl:w-[400px] h-[320px] xl:h-[400px] border border-white/5 rounded-full" />
          </div>

          {/* Mobile CLEANBI Card - Shown only on small screens */}
          <motion.div
            variants={cardRevealVariants}
            initial="hidden"
            animate="visible"
            className="lg:hidden col-span-full"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-5 max-w-sm mx-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#C8A661] uppercase tracking-wider">CLEANBI</p>
                    <p className="text-xs font-semibold text-gray-900 truncate">Location Score</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-100 rounded-full flex-shrink-0">
                  <span className="text-[10px] font-bold text-green-700">LIVE</span>
                </div>
              </div>
              
              {/* Score display */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Overall Grade</p>
                    <div className="flex items-baseline gap-1.5">
                      <span 
                        className="text-4xl font-black text-[#22C55E]"
                        style={{ fontFamily: 'var(--font-bebas)' }}
                      >
                        A
                      </span>
                      <span className="text-sm text-gray-600 font-medium">Excellent</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-2xl font-black text-white">87</span>
                  </div>
                </div>
              </div>
              
              {/* Metrics grid - Mobile optimized */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Demo", value: "8.2", color: "text-[#1e3a5f]", icon: Users },
                  { label: "Comp", value: "7.9", color: "text-[#C8A661]", icon: BarChart3 },
                  { label: "Traffic", value: "9.1", color: "text-green-600", icon: Navigation }
                ].map((metric) => (
                  <div 
                    key={metric.label} 
                    className="text-center p-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <metric.icon className={`w-2.5 h-2.5 ${metric.color} flex-shrink-0`} />
                      <p className="text-[8px] text-gray-500 uppercase tracking-wider">{metric.label}</p>
                    </div>
                    <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Trusted by section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative border-t border-white/10 bg-[#0f2744]/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C8A661]" />
              <span className="text-xs sm:text-sm text-white/50 font-medium">
                Trusted by 73,000+ Industry Professionals
              </span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C8A661]" />
              <span className="text-xs sm:text-sm text-white/50 font-medium">
                Owners, Operators & Brokers
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
