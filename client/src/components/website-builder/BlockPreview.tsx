import { useState } from "react";
import ContentEditable from "react-contenteditable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Image as ImageIcon } from "lucide-react";
import { Star } from "@/lib/icon-registry";
import type { Block } from "./DroppableCanvas";

interface BlockPreviewProps {
  block: Block;
  onUpdate?: (id: string, updates: Partial<Block>) => void;
}

export function BlockPreview({ block, onUpdate }: BlockPreviewProps) {
  const updateContent = (key: string, value: any) => {
    if (!onUpdate) return;
    
    onUpdate(block.id, {
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  switch (block.type) {
    case "hero":
      return (
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-12 rounded-lg text-center">
          <ContentEditable
            html={block.content.headline || ""}
            onChange={(e) => updateContent("headline", e.target.value)}
            tagName="h1"
            className="text-4xl font-bold text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`hero-headline-${block.id}`}
          />
          <ContentEditable
            html={block.content.subheadline || ""}
            onChange={(e) => updateContent("subheadline", e.target.value)}
            tagName="p"
            className="text-xl text-gray-600 mb-8 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`hero-subheadline-${block.id}`}
          />
          <Button className="bg-primary hover-elevate" data-testid={`hero-cta-${block.id}`}>
            {block.content.ctaText || "Get Started"}
          </Button>
        </div>
      );

    case "features":
      return (
        <div className="p-8">
          <ContentEditable
            html={block.content.title || ""}
            onChange={(e) => updateContent("title", e.target.value)}
            tagName="h2"
            className="text-3xl font-bold text-gray-900 mb-8 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`features-title-${block.id}`}
          />
          <div className="grid md:grid-cols-3 gap-6">
            {(block.content.features || []).map((feature: any, idx: number) => (
              <div key={idx} className="text-center p-6 rounded-lg bg-gray-50">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon === "star" && <Star className="w-6 h-6 text-primary" />}
                  {feature.icon === "clock" && <Clock className="w-6 h-6 text-primary" />}
                  {feature.icon === "dollar" && <DollarSign className="w-6 h-6 text-primary" />}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "testimonials":
      return (
        <div className="p-8 bg-gray-50 rounded-lg">
          <ContentEditable
            html={block.content.title || ""}
            onChange={(e) => updateContent("title", e.target.value)}
            tagName="h2"
            className="text-3xl font-bold text-gray-900 mb-8 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`testimonials-title-${block.id}`}
          />
          <div className="grid md:grid-cols-2 gap-6">
            {(block.content.testimonials || []).map((testimonial: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="bg-primary/10 p-12 rounded-lg text-center">
          <ContentEditable
            html={block.content.headline || ""}
            onChange={(e) => updateContent("headline", e.target.value)}
            tagName="h2"
            className="text-3xl font-bold text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`cta-headline-${block.id}`}
          />
          <ContentEditable
            html={block.content.text || ""}
            onChange={(e) => updateContent("text", e.target.value)}
            tagName="p"
            className="text-lg text-gray-600 mb-6 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`cta-text-${block.id}`}
          />
          <Button size="lg" className="bg-primary hover-elevate" data-testid={`cta-button-${block.id}`}>
            {block.content.buttonText || "Get Started"}
          </Button>
        </div>
      );

    case "gallery":
      return (
        <div className="p-8">
          <ContentEditable
            html={block.content.title || ""}
            onChange={(e) => updateContent("title", e.target.value)}
            tagName="h2"
            className="text-3xl font-bold text-gray-900 mb-8 text-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`gallery-title-${block.id}`}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(block.content.images || []).length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No images yet</p>
                <Button variant="outline" size="sm" className="mt-4" data-testid={`gallery-upload-${block.id}`}>
                  Upload Images
                </Button>
              </div>
            ) : (
              block.content.images.map((img: any, idx: number) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))
            )}
          </div>
        </div>
      );

    case "text":
      return (
        <div className="p-8">
          <ContentEditable
            html={block.content.html || ""}
            onChange={(e) => updateContent("html", e.target.value)}
            tagName="div"
            className="prose max-w-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            data-testid={`text-content-${block.id}`}
          />
        </div>
      );

    default:
      return (
        <div className="p-8 text-center">
          <Badge variant="outline">Unknown Block Type: {block.type}</Badge>
        </div>
      );
  }
}
