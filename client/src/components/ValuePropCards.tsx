import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Settings, Shield, TrendingUp, Users } from "lucide-react";

const valueProps = [
  {
    icon: Settings,
    title: "CLEAN",
    description: "Polished templates and reports that build trust",
    link: "/cleanbi",
  },
  {
    icon: Shield,
    title: "RELIABLE",
    description: "Data-driven valuations and error-proof workflows",
    link: "/cleanbi",
  },
  {
    icon: TrendingUp,
    title: "PROFITABLE",
    description: "Monetization hooks built into every asset",
    link: "/roi-calculator",
  },
  {
    icon: Users,
    title: "COMMUNITY",
    description: "A hub for operators, vendors, and buyers",
    link: "/forum",
  },
];

export function ValuePropCards() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <Link key={idx} href={prop.link}>
                <Card
                  className="p-8 text-center hover-elevate active-elevate-2 transition-all duration-300 border-border cursor-pointer"
                  data-testid={`card-valueprop-${prop.title.toLowerCase()}`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 
                    className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground"
                    data-testid={`text-valueprop-title-${idx}`}
                  >
                    {prop.title}
                  </h3>
                  <p 
                    className="text-sm text-muted-foreground leading-relaxed"
                    data-testid={`text-valueprop-desc-${idx}`}
                  >
                    {prop.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
