import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@assets/big_dexter_laundromat_1764704943944.jpg";
import twinCitiesInterior from "@assets/Twin_Cities_Laundromat_1764705357211.jpg";

const INDUSTRY_PARTNERS = [
  "Speed Queen",
  "Dexter Laundry", 
  "Huebsch",
  "Electrolux",
  "Maytag Commercial",
  "Alliance Laundry",
  "PayRange",
  "Ecolab"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const cardRevealVariants = {
  hidden: { opacity: 0, x: 60, rotateY: -15 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    transition: { 
      duration: 0.9, 
      delay: 0.6,
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

const secondCardVariants = {
  hidden: { opacity: 0, x: 80, rotateY: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    transition: { 
      duration: 0.9, 
      delay: 0.9,
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

export function PremiumHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden min-h-[90vh]">
      {/* Premium gradient mesh background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Navy overlay with mesh gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/95 via-[#1e3a5f]/85 to-[#0f2744]/90" />
        {/* Gold accent glow */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-1/2"
          style={{ background: 'radial-gradient(circle at center, rgba(184,134,11,0.2) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-1/3 h-1/3"
          style={{ background: 'radial-gradient(circle at center, rgba(184,134,11,0.1) 0%, transparent 70%)' }}
        />
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      <motion.div 
        className="relative max-w-7xl mx-auto px-6 lg:px-8"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh] py-24 lg:py-32">
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8860b]/20 border border-[#b8860b]/30 text-[#b8860b] text-sm font-semibold tracking-wide uppercase"
              >
                <Star className="w-4 h-4 fill-current" />
                Your Laundromat Headquarters
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-white leading-[1.05] mb-8"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              <span className="block text-[clamp(3rem,8vw,5.25rem)] tracking-tight">
                KNOW BEFORE YOU BUY
              </span>
              <span className="block text-[clamp(2rem,5vw,3rem)] text-white/70 tracking-wide mt-2">
                SCORE ANY LOCATION INSTANTLY
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl lg:text-2xl text-white/70 leading-relaxed mb-10 font-light"
            >
              Enter any address and get an instant investment grade. 
              Our AI analyzes demographics, competition, traffic patterns, 
              and 50+ data points to reveal hidden opportunities.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-12">
              <Link href="/cleanbi-explorer">
                <Button 
                  size="lg"
                  className="h-14 px-8 text-base font-semibold bg-[#b8860b] hover:bg-[#9a7209] text-white shadow-xl shadow-[#b8860b]/25 transition-all duration-300 hover:shadow-2xl hover:shadow-[#b8860b]/30 hover:-translate-y-0.5"
                  data-testid="button-analyze-location"
                >
                  Score Any Location Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-8 text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                  data-testid="button-view-plans"
                >
                  <Play className="mr-2 h-4 w-4" />
                  See Plans & Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-[#1e3a5f] flex items-center justify-center text-white/60 text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#b8860b] text-[#b8860b]" />
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  <span className="text-white font-semibold">2,400+</span> operators trust WashBizHub
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right floating cards - Layered device mockups */}
          <div className="hidden lg:block relative h-[600px] perspective-1000">
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-[#b8860b]/20 rounded-full blur-[100px]" />
            </div>
            
            {/* Main CLEANBI Card */}
            <motion.div
              variants={cardRevealVariants}
              initial="hidden"
              animate="visible"
              style={{ y: y1 }}
              className="absolute top-12 left-8 z-20"
            >
              <motion.div
                variants={floatVariants}
                initial="initial"
                animate="animate"
              >
                <div className="relative">
                  {/* Card shadow */}
                  <div className="absolute inset-0 bg-black/20 rounded-3xl blur-2xl translate-y-8 translate-x-4" />
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 transform hover:scale-[1.02] transition-transform duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] rounded-xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#b8860b] uppercase tracking-wider">CLEANBI</p>
                          <p className="text-sm font-semibold text-gray-900">Location Score</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 rounded-full">
                        <span className="text-xs font-bold text-green-700">LIVE</span>
                      </div>
                    </div>
                    
                    {/* Score display */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overall Grade</p>
                          <div className="flex items-baseline gap-2">
                            <span 
                              className="text-5xl font-black text-[#22C55E]"
                              style={{ fontFamily: 'var(--font-bebas)' }}
                            >
                              A
                            </span>
                            <span className="text-lg text-gray-600 font-medium">Excellent</span>
                          </div>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-black text-white">87</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Demographics", value: "8.2", color: "text-[#1e3a5f]" },
                        { label: "Competition", value: "7.9", color: "text-[#b8860b]" },
                        { label: "Traffic", value: "9.1", color: "text-green-600" }
                      ].map((metric) => (
                        <div key={metric.label} className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{metric.label}</p>
                          <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
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
              className="absolute bottom-16 right-0 z-10"
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
                  
                  {/* Listing card */}
                  <div className="relative bg-white rounded-xl shadow-xl overflow-hidden w-72 transform hover:scale-[1.02] transition-transform duration-500">
                    <div className="relative h-32">
                      <img 
                        src={twinCitiesInterior} 
                        alt="Premium laundromat" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-[#b8860b] text-white text-xs font-bold rounded-md shadow-lg">
                          FEATURED
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/95 text-gray-900 text-sm font-bold rounded-md shadow-lg">
                          $425K
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-2">Modern Coin Laundry</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Seattle, WA
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> $92K/yr CF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Trusted by section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="relative border-t border-white/10 bg-[#0f2744]/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-white/40 uppercase text-center mb-6">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {INDUSTRY_PARTNERS.map((partner, i) => (
              <motion.span 
                key={partner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="text-sm font-bold text-white/30 hover:text-[#b8860b] transition-colors duration-300 uppercase tracking-[0.15em] cursor-pointer"
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
