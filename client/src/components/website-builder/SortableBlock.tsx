import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockPreview } from "./BlockPreview";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Settings } from "lucide-react";
import type { Block } from "./DroppableCanvas";

interface SortableBlockProps {
  block: Block;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
}

export function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative hover:bg-gray-50 transition-colors"
      data-testid={`block-${block.id}`}
    >
      {/* Drag Handle & Actions */}
      <div className="absolute left-2 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 cursor-grab active:cursor-grabbing bg-white shadow-sm hover-elevate"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-${block.id}`}
        >
          <GripVertical className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-white shadow-sm hover-elevate"
          onClick={() => onDelete(block.id)}
          data-testid={`delete-block-${block.id}`}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      {/* Block Content */}
      <div className="pl-16 pr-4 py-4">
        <BlockPreview block={block} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
