import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableBlock } from "./SortableBlock";
import { BlockPreview } from "./BlockPreview";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export interface Block {
  id: string;
  type: string;
  content: any;
  position: number;
}

interface DroppableCanvasProps {
  projectId: string;
  onBlocksChange?: (blocks: Block[]) => void;
  onAISuggest?: () => void;
}

export function DroppableCanvas({ projectId, onBlocksChange, onAISuggest }: DroppableCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    setBlocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newBlocks = arrayMove(items, oldIndex, newIndex).map((block, idx) => ({
        ...block,
        position: idx,
      }));
      
      onBlocksChange?.(newBlocks);
      return newBlocks;
    });
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: blocks.length,
    };
    
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onBlocksChange?.(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    onBlocksChange?.(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(newBlocks);
    onBlocksChange?.(newBlocks);
  };

  const activeBlock = blocks.find((block) => block.id === activeId);

  if (blocks.length === 0) {
    return (
      <div className="bg-white min-h-[600px] rounded-lg p-8 shadow-2xl">
        <div className="text-center py-20">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-8 rounded-2xl">
                <Plus className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Building</h3>
              <p className="text-gray-500 mb-6">
                Add your first block to create an amazing website
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => addBlock("hero")}
                className="bg-primary hover-elevate active-elevate-2"
                data-testid="button-add-hero"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hero Section
              </Button>
              <Button 
                onClick={onAISuggest}
                variant="outline"
                className="border-primary/30 hover-elevate active-elevate-2"
                data-testid="button-ai-suggest"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                AI Suggestions
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white min-h-[600px] rounded-lg shadow-2xl overflow-hidden">
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </div>
      
      <DragOverlay>
        {activeId && activeBlock ? (
          <div className="opacity-50">
            <BlockPreview block={activeBlock} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getDefaultContent(type: string): any {
  switch (type) {
    case "hero":
      return {
        headline: "Welcome to Our Laundromat",
        subheadline: "Clean clothes, happy customers",
        ctaText: "Get Started",
        ctaLink: "#",
        backgroundImage: null,
      };
    case "features":
      return {
        title: "Our Features",
        features: [
          { icon: "star", title: "Quality Service", description: "Top-notch cleaning" },
          { icon: "clock", title: "Fast Turnaround", description: "Same-day service available" },
          { icon: "dollar", title: "Affordable Prices", description: "Best rates in town" },
        ],
      };
    case "testimonials":
      return {
        title: "What Our Customers Say",
        testimonials: [
          { name: "John D.", quote: "Best laundromat in town!", rating: 5 },
          { name: "Sarah M.", quote: "Always clean and professional", rating: 5 },
        ],
      };
    case "cta":
      return {
        headline: "Ready to Get Started?",
        text: "Visit us today and experience the difference",
        buttonText: "Contact Us",
        buttonLink: "#",
      };
    case "gallery":
      return {
        title: "Our Facilities",
        images: [],
      };
    case "text":
      return {
        html: "<h2>Your Heading Here</h2><p>Add your content...</p>",
      };
    default:
      return {};
  }
}
