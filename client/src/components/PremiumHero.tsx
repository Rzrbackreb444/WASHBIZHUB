import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Plus } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useMemo, useEffect, useState } from "react";
import heroImage from "@assets/big_dexter_laundromat_1765733391377.jpg";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
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
  const shouldReduceMotion = prefersReducedMotion || isMobile;
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, shouldReduceMotion ? 1 : 0]);
  
  const containerVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  }, [shouldReduceMotion]);

  const itemVariants = useMemo(() => shouldReduceMotion ? {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 }
  } : {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  }, [shouldReduceMotion]);

  return (
    <section 
      ref={containerRef} 
      className="relative overflow-hidden min-h-[75vh]"
      itemScope
      itemType="https://schema.org/SoftwareApplication"
      aria-label="WashBizHub - The #1 Laundromat Marketplace & Expert Platform"
    >
      {/* SEO metadata */}
      <div className="sr-only" role="complementary" aria-label="SEO metadata">
        <meta itemProp="name" content="WashBizHub" />
        <meta itemProp="applicationCategory" content="BusinessApplication" />
        <meta itemProp="operatingSystem" content="Web" />
        <span itemProp="description">WashBizHub is the #1 laundromat marketplace connecting buyers, sellers, and operators with expert consultation from Larry Larsen with 50+ years of industry experience.</span>
      </div>
      
      {/* Obsidian Glass Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
          role="img"
          aria-label="Modern laundromat interior"
        />
        
        {/* Dark Obsidian overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/85 via-[#09090b]/80 to-[#09090b]/95" />
        
        {/* Subtle gold accent glow */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)' }}
        />
      </div>
      
      <motion.div 
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        <div className="flex flex-col items-center justify-center text-center min-h-[70vh] py-20 sm:py-24 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            {/* Clean, centered headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-white leading-[1.05] mb-6 sm:mb-8"
              style={{ fontFamily: 'var(--font-bebas)' }}
              data-testid="heading-hero-title"
            >
              <span className="block text-[clamp(2.75rem,8vw,6rem)] tracking-tight">
                THE #1 LAUNDROMAT
              </span>
              <span className="block text-[clamp(2.75rem,8vw,6rem)] tracking-tight text-[#d4af37]">
                MARKETPLACE
              </span>
            </motion.h1>
            
            {/* Single tagline */}
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-white/60 mb-10 sm:mb-12 font-light max-w-2xl mx-auto"
              data-testid="text-hero-description"
            >
              Buy, sell, and analyze laundromats with expert guidance from industry veterans
            </motion.p>
            
            {/* Two CTAs only - Primary Gold + Secondary Outline */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
            >
              <Link href="/list-your-laundromat">
                <Button 
                  size="lg"
                  variant="default"
                  style={{ 
                    backgroundColor: '#d4af37',
                    borderColor: '#d4af37',
                    color: '#000'
                  }}
                  className="font-semibold text-base px-8 h-12 shadow-lg"
                  data-testid="button-list-laundromat"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  List Your Laundromat
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  variant="outline"
                  size="lg"
                  className="font-medium text-base px-8 h-12 border-[#d4af37]/50 text-white bg-white/10 hover:bg-white/20 hover:border-[#d4af37]"
                  data-testid="button-book-larry"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Strategy Session with Larry
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
