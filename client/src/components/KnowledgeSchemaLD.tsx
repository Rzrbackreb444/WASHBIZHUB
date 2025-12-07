import { useEffect, useRef } from "react";

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

const SCHEMA_ID = "knowledge-schema-ld";

export function KnowledgeSchemaLD({ knowledge, url }: KnowledgeSchemaLDProps) {
  const injectedRef = useRef(false);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const existingScripts = document.querySelectorAll(`script[data-schema-id="${SCHEMA_ID}"]`);
    existingScripts.forEach(script => script.remove());
    
    const currentUrl = url || window.location.href;
    const schemaId = `${knowledge.manufacturer}-${knowledge.errorCode || knowledge.title}`.toLowerCase().replace(/\s+/g, '-');
    
    const howToSteps = (knowledge.troubleshootingSteps || []).map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
    }));

    const faqEntries = (knowledge.possibleCauses || []).slice(0, 5).map((cause, index) => ({
      "@type": "Question",
      name: `What causes ${knowledge.errorCode || knowledge.title} error ${index + 1}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: cause,
      },
    }));

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `https://washbizhub.com/knowledge/${schemaId}#howto`,
      name: `How to Fix ${knowledge.manufacturer} ${knowledge.errorCode || knowledge.title}`,
      description: knowledge.description,
      totalTime: knowledge.estimatedRepairTime ? `PT${knowledge.estimatedRepairTime}M` : undefined,
      step: howToSteps.length > 0 ? howToSteps : undefined,
      tool: [
        { "@type": "HowToTool", name: "Multimeter" },
        { "@type": "HowToTool", name: "Socket set" },
      ],
    };

    const techArticleSchema = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "@id": `https://washbizhub.com/knowledge/${schemaId}#article`,
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

    const combinedSchema = {
      "@context": "https://schema.org",
      "@graph": [howToSchema, techArticleSchema],
    };

    if (faqEntries.length > 0) {
      (combinedSchema["@graph"] as unknown[]).push({
        "@type": "FAQPage",
        "@id": `https://washbizhub.com/knowledge/${schemaId}#faq`,
        mainEntity: faqEntries,
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema-id", SCHEMA_ID);
    script.textContent = JSON.stringify(combinedSchema);
    document.head.appendChild(script);
    injectedRef.current = true;

    return () => {
      const scripts = document.querySelectorAll(`script[data-schema-id="${SCHEMA_ID}"]`);
      scripts.forEach(s => s.remove());
      injectedRef.current = false;
    };
  }, [knowledge, url]);

  return null;
}

