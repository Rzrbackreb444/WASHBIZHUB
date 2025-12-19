import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Wrench, 
  Cpu, 
  Camera, 
  Mic, 
  FileText, 
  Package,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  DollarSign,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ServicePage() {
  const features = [
    {
      icon: Cpu,
      title: "AI-Powered Diagnostics",
      description: "Describe the problem or upload a photo. Get instant troubleshooting steps for any equipment.",
      highlight: true
    },
    {
      icon: Camera,
      title: "Photo Diagnosis",
      description: "Take a photo of the error code or issue. Gemini Vision AI identifies the problem instantly.",
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Describe the issue hands-free while you're working. AI transcribes and diagnoses.",
    },
    {
      icon: Package,
      title: "Parts Recommendations",
      description: "Get the exact parts you need with links to order. Show up prepared, no return trips.",
    },
    {
      icon: FileText,
      title: "Job Tracking",
      description: "Log repairs, track labor hours, and generate invoices from your phone.",
    },
    {
      icon: DollarSign,
      title: "Quote Generator",
      description: "Create professional repair quotes on-site. Email directly to customers.",
    }
  ];

  const stats = [
    { value: "50%", label: "Fewer Return Trips" },
    { value: "24/7", label: "AI Available" },
    { value: "100+", label: "Equipment Models" },
    { value: "10min", label: "Avg Diagnosis Time" }
  ];

  const benefits = [
    "Works with all major brands: Dexter, Speed Queen, Continental, Huebsch",
    "Photo-based error code recognition",
    "Parts ordering integration",
    "Repair history tracking per machine",
    "Preventative maintenance alerts",
    "Invoice and quote generation"
  ];

  const equipmentBrands = [
    "Dexter", "Speed Queen", "Continental Girbau", "Huebsch", 
    "Maytag Commercial", "Wascomat", "Electrolux", "IPSO"
  ];

  return (
    <>
      <Helmet>
        <title>Service Guy AI | Equipment Diagnostics & Repair Tools | WashBizHub</title>
        <meta 
          name="description" 
          content="AI-powered laundromat equipment diagnostics. Photo diagnosis, parts recommendations, job tracking, and invoicing. For service technicians and owners." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-[#0A1628] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1e3a5f] to-[#0A1628] opacity-80" />
          
          <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10"
              >
                <Wrench className="w-3 h-3 mr-1.5" />
                Service Guy AI
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                AI-Powered Equipment
                <span className="block text-[#C8A661]">Diagnostics & Repair</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Diagnose issues instantly with AI. Photo recognition, parts recommendations, 
                job tracking, and invoicing — all from your phone.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/service-guy-ai">
                  <Button 
                    size="lg"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-try-service-ai"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Try Service Guy AI
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-[#C8A661]">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-card border rounded-lg p-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#C8A661] shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <Cpu className="w-3 h-3 mr-1.5" />
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Everything You Need in the Field
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional tools that save time, reduce return trips, and increase first-time fix rates.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`bg-card border shadow-sm overflow-hidden h-full ${feature.highlight ? 'ring-2 ring-[#C8A661]/50' : ''}`}>
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                        <feature.icon className="w-5 h-5 text-[#C8A661]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Equipment */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-6">Works With All Major Brands</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {equipmentBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="text-sm py-2 px-4">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#0A1628]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Clock className="w-12 h-12 text-[#C8A661] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop Wasting Time on Return Trips
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Show up prepared with the right parts and diagnosis. Service Guy AI helps you fix it right the first time.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/service-guy-ai">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold">
                  <Wrench className="w-4 h-4 mr-2" />
                  Try Free Diagnosis
                </Button>
              </Link>
              <Link href="/distributors">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Users className="w-4 h-4 mr-2" />
                  For Distributors
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
