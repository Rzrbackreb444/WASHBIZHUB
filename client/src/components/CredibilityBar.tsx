import { memo } from "react";
import { Users, Wrench, MapPin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "73,000+",
    label: "Industry Professionals",
    color: "text-blue-500"
  },
  {
    icon: Wrench,
    value: "50+",
    label: "Expert Tools",
    color: "text-amber-500"
  },
  {
    icon: MapPin,
    value: "2,500+",
    label: "US Locations Analyzed",
    color: "text-green-500"
  },
  {
    icon: ShieldCheck,
    value: "Human",
    label: "Verified Intelligence",
    color: "text-purple-500"
  }
];

export const CredibilityBar = memo(function CredibilityBar() {
  return (
    <section className="py-8 bg-gradient-to-b from-[#1e3a5f]/5 to-white border-b border-gray-100" data-testid="section-credibility-bar">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-xs md:text-sm text-gray-500">{stat.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

CredibilityBar.displayName = 'CredibilityBar';
