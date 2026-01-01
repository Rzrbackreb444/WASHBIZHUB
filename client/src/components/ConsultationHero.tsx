import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Calendar, Star, Award, Phone, ArrowRight, MessageCircle } from "lucide-react";
import larryLarsenPhoto from "@assets/image_1765341641648.png";

export function ConsultationHero() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,166,97,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,166,97,0.1),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0 text-center lg:text-left"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#C8A661]/30 to-[#C8A661]/10 rounded-full blur-2xl" />
              <Avatar className="relative w-40 h-40 md:w-48 md:h-48 shadow-2xl shadow-[#C8A661]/30 border-4 border-[#C8A661]/40">
                <AvatarImage 
                  src={larryLarsenPhoto} 
                  alt="Larry 'Laundromat Larry' Larsen - 50+ Year Industry Expert" 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#C8A661] to-[#9a7209] text-5xl font-bold text-white">
                  LL
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
                <Phone className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center lg:items-start gap-2">
              <Badge className="bg-[#C8A661] text-black font-bold px-3 py-1 text-xs">
                <Award className="w-3 h-3 mr-1" />
                50+ Years Experience
              </Badge>
              <div className="flex items-center gap-0.5 text-[#C8A661]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10">
              Featured Industry Expert
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Work with <span className="text-[#C8A661]">Larry Larsen</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              Get 1-on-1 expert guidance from a 50-year industry veteran
            </p>
            <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
              Whether you're buying your first laundromat, optimizing operations, or evaluating a new opportunity, 
              Larry's five decades of hands-on experience can save you thousands and help you avoid costly mistakes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/larry-larsen">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-[#C8A661] hover:bg-[#9a7209] text-white font-semibold shadow-xl shadow-[#C8A661]/25 transition-all duration-300"
                  data-testid="button-book-consultation"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book 1-on-1 Strategy Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                  data-testid="button-view-services"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  View All Services
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Available this week</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">200+</span>
                <span>consultations completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">$50M+</span>
                <span>in deals advised</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
