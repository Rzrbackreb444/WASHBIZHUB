import { Users, Star, BarChart3, Globe } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "72,000+",
    label: "Industry Professionals",
    color: "text-blue-500"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "User Rating",
    color: "text-amber-500"
  },
  {
    icon: BarChart3,
    value: "10,000+",
    label: "Deals Analyzed",
    color: "text-green-500"
  },
  {
    icon: Globe,
    value: "220+",
    label: "Countries",
    color: "text-purple-500"
  }
];

export function CredibilityBar() {
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
}
