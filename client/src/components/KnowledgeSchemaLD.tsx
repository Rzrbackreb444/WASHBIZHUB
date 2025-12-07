import { Helmet } from "react-helmet-async";

interface KnowledgeData {
  title: string;
  manufacturer: string;
  errorCode?: string;
  machineType?: string;
  description: string;
  possibleCauses?: string[];
  troubleshootingSteps?: string[];
  estimatedRepairTime?: number;
  skillLevel?: string;
}

interface KnowledgeSchemaLDProps {
  knowledge: KnowledgeData;
  url?: string;
}

export function KnowledgeSchemaLD({ knowledge, url }: KnowledgeSchemaLDProps) {
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const howToSteps = (knowledge.troubleshootingSteps || []).map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: `Step ${index + 1}`,
    text: step,
  }));

  const faqEntries = (knowledge.possibleCauses || []).slice(0, 5).map((cause) => ({
    "@type": "Question",
    name: `What causes ${knowledge.errorCode || knowledge.title}?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: cause,
    },
  }));

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Fix ${knowledge.manufacturer} ${knowledge.errorCode || knowledge.title}`,
    description: knowledge.description,
    totalTime: knowledge.estimatedRepairTime ? `PT${knowledge.estimatedRepairTime}M` : undefined,
    step: howToSteps,
    tool: [
      { "@type": "HowToTool", name: "Multimeter" },
      { "@type": "HowToTool", name: "Socket set" },
    ],
  };

  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${knowledge.manufacturer} ${knowledge.errorCode || ""} - ${knowledge.title}`.trim(),
    description: knowledge.description,
    articleSection: "Equipment Repair",
    proficiencyLevel: knowledge.skillLevel === "basic" ? "Beginner" : knowledge.skillLevel === "professional" ? "Expert" : "Intermediate",
    author: {
      "@type": "Organization",
      name: "WashBizHub Service Guy AI",
      url: "https://washbizhub.com/service-guy-ai",
    },
    publisher: {
      "@type": "Organization",
      name: "WashBizHub",
      url: "https://washbizhub.com",
      logo: {
        "@type": "ImageObject",
        url: "https://washbizhub.com/logo.png",
      },
    },
    mainEntityOfPage: currentUrl,
    datePublished: new Date().toISOString().split("T")[0],
    dateModified: new Date().toISOString().split("T")[0],
  };

  const faqSchema = faqEntries.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries,
  } : null;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Commercial Laundry Equipment Repair Guidance",
    provider: {
      "@type": "Organization",
      name: "WashBizHub",
    },
    serviceType: "Equipment Diagnostic Service",
    areaServed: "Worldwide",
    description: "AI-powered diagnostic guidance for commercial laundry equipment including Speed Queen, Dexter, Maytag, and 70+ other manufacturers.",
  };

  return (
    <Helmet>
      <title>{`${knowledge.manufacturer} ${knowledge.errorCode || ""} Fix - ${knowledge.title} | Service Guy AI`}</title>
      <meta name="description" content={`Professional repair guide for ${knowledge.manufacturer} ${knowledge.errorCode || knowledge.title}. ${knowledge.description.substring(0, 150)}...`} />
      <meta name="keywords" content={`${knowledge.manufacturer}, ${knowledge.errorCode || ""}, repair, troubleshooting, laundromat, commercial laundry, ${knowledge.machineType || "washer dryer"}`} />
      
      <meta property="og:title" content={`${knowledge.manufacturer} ${knowledge.errorCode || ""} Repair Guide`} />
      <meta property="og:description" content={knowledge.description.substring(0, 200)} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={currentUrl} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${knowledge.manufacturer} ${knowledge.errorCode || ""} Repair Guide`} />
      <meta name="twitter:description" content={knowledge.description.substring(0, 200)} />
      
      <link rel="canonical" href={currentUrl} />
      
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(techArticleSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
    </Helmet>
  );
}

export function ServiceGuyAISchemaLD() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Service Guy AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        description: "3 lookups/month with basic diagnostics",
      },
      {
        "@type": "Offer",
        name: "Starter Plan",
        price: "29",
        priceCurrency: "USD",
        description: "50 lookups/month with extended diagnostics",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "79",
        priceCurrency: "USD",
        description: "500 lookups/month with full troubleshooting",
      },
      {
        "@type": "Offer",
        name: "Enterprise Plan",
        price: "199",
        priceCurrency: "USD",
        description: "Unlimited lookups with complete access",
      },
    ],
    author: {
      "@type": "Organization",
      name: "WashBizHub",
    },
    description: "AI-powered diagnostic tool for commercial laundry equipment. Access 2,388+ error codes from 74+ manufacturers including Speed Queen, Dexter, Maytag, and more.",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WashBizHub",
    url: "https://washbizhub.com",
    description: "The #1 resource for laundromat industry professionals. Market intelligence, business tools, and AI-powered diagnostics.",
    sameAs: [
      "https://www.facebook.com/washbizhub",
      "https://www.linkedin.com/company/washbizhub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@washbizhub.com",
    },
  };

  return (
    <Helmet>
      <title>Service Guy AI - Commercial Laundry Equipment Diagnostics | WashBizHub</title>
      <meta name="description" content="AI-powered diagnostic tool for commercial laundry equipment. Search 2,388+ error codes from 74+ manufacturers. Voice input, photo diagnosis, parts ordering, and job tracking for service technicians." />
      <meta name="keywords" content="laundromat repair, commercial laundry diagnostics, Speed Queen error codes, Dexter troubleshooting, washer repair guide, dryer error codes, laundry equipment service" />
      
      <meta property="og:title" content="Service Guy AI - Commercial Laundry Equipment Diagnostics" />
      <meta property="og:description" content="AI-powered diagnostic tool with 2,388+ error codes from 74+ manufacturers. Voice input, photo diagnosis, and one-click parts ordering." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://washbizhub.com/service-guy-ai" />
      
      <link rel="canonical" href="https://washbizhub.com/service-guy-ai" />
      
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
}
