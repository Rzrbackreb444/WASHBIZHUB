import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/Hero";
import { ValuePropCards } from "@/components/ValuePropCards";
import { Footer } from "@/components/Footer";
import { 
  BookOpen, GraduationCap, Phone, Download, DollarSign, 
  Building2, Rocket, TrendingUp, ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch templates for display
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <Hero />
      
      {/* Value Props */}
      <ValuePropCards />

      {/* Templates Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-templates-heading"
            >
              Start With Proven Templates & Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional resources to launch and grow your business
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(templates || []).slice(0, 4).map((template: any, idx: number) => (
              <Card 
                key={template.id}
                className="overflow-hidden hover-elevate transition-all"
                data-testid={`card-template-${idx}`}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {template.imageUrl && (
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {!template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-background text-foreground"
                      data-testid={`badge-free-${idx}`}
                    >
                      Free
                    </Badge>
                  )}
                  {template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-primary text-primary-foreground"
                      data-testid={`badge-premium-${idx}`}
                    >
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {template.category}
                  </div>
                  <h3 
                    className="mb-2 text-sm font-bold uppercase text-foreground"
                    data-testid={`text-template-title-${idx}`}
                  >
                    {template.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {template.isPremium ? `$${template.price}` : 'FREE'}
                    </span>
                    <Button 
                      size="sm" 
                      variant={template.isPremium ? "default" : "outline"}
                      data-testid={`button-template-${idx}`}
                    >
                      {template.isPremium ? (
                        <>Purchase</>
                      ) : (
                        <>
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/templates">
              <Button 
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-see-all-templates"
              >
                See All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-financing-heading"
            >
              Secure Financing For Your Laundromat
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore financing options and get funded faster
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "SBA 7(A) LOAN", description: "Government-backed financing with favorable terms" },
              { icon: Building2, title: "COMMERCIAL REAL ESTATE", description: "Traditional commercial property financing" },
              { icon: DollarSign, title: "EQUIPMENT FINANCING", description: "Loans specifically for laundry equipment" },
              { icon: Rocket, title: "STARTUP FINANCING", description: "Funding packages for new laundromat builds" },
            ].map((option, idx) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-financing-${idx}`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/funding-matcher">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-start-application"
              >
                Start Application
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-book-consultation"
              >
                Book a Funding Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-education-heading"
            >
              Learn From The Experts
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive education and guidance for every stage
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "THE ULTIMATE LAUNDROMAT GUIDEBOOK",
                description: "The definitive guide to buying, operating, and scaling profitable laundromats",
                action: "Get the Book",
                link: "/book",
              },
              {
                icon: GraduationCap,
                title: "ONLINE COURSES",
                description: "Self-paced courses to master every aspect of the laundromat business",
                action: "Enroll Now",
                link: "/courses",
              },
              {
                icon: Phone,
                title: "CONSULTATIONS",
                description: "One-on-one guidance on acquisitions, operations, and growth strategy",
                action: "Book a Call",
                link: "/consultation",
              },
            ].map((edu, idx) => {
              const Icon = edu.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-education-${idx}`}
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
                    {edu.title}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    {edu.description}
                  </p>
                  <Link href={edu.link}>
                    <Button 
                      className={idx === 2 ? "bg-primary text-primary-foreground" : ""}
                      variant={idx === 2 ? "default" : "outline"}
                      data-testid={`button-education-${idx}`}
                    >
                      {edu.action}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 
            className="text-3xl font-bold uppercase tracking-tight text-foreground mb-6"
            data-testid="text-cta-heading"
          >
            Ready To Build A Stronger Laundry Business?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/templates">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-cta-templates"
              >
                Get Free Templates
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-cta-consultation"
              >
                Book a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
