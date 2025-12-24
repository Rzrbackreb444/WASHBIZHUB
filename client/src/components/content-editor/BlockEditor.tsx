import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Type,
  Image,
  Video,
  Code,
  Quote,
  List,
  ListOrdered,
  Link,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FileText,
  Table,
  Sparkles,
} from "lucide-react";

export type BlockType = 
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "code"
  | "quote"
  | "list"
  | "ordered-list"
  | "embed"
  | "divider"
  | "table"
  | "callout";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    level?: 1 | 2 | 3;
    language?: string;
    url?: string;
    alt?: string;
    caption?: string;
    items?: string[];
    embedType?: "youtube" | "twitter" | "instagram" | "generic";
    calloutType?: "info" | "warning" | "success" | "error";
  };
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  readOnly?: boolean;
}

const BLOCK_TYPES: { type: BlockType; icon: any; label: string }[] = [
  { type: "heading", icon: Type, label: "Heading" },
  { type: "paragraph", icon: FileText, label: "Paragraph" },
  { type: "image", icon: Image, label: "Image" },
  { type: "video", icon: Video, label: "Video" },
  { type: "code", icon: Code, label: "Code" },
  { type: "quote", icon: Quote, label: "Quote" },
  { type: "list", icon: List, label: "Bullet List" },
  { type: "ordered-list", icon: ListOrdered, label: "Numbered List" },
  { type: "embed", icon: Link, label: "Embed" },
  { type: "callout", icon: Sparkles, label: "Callout" },
  { type: "table", icon: Table, label: "Table" },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function BlockRenderer({ 
  block, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast,
  readOnly 
}: { 
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
}) {
  const updateContent = (content: string) => {
    onUpdate({ ...block, content });
  };

  const updateMetadata = (key: string, value: any) => {
    onUpdate({ 
      ...block, 
      metadata: { ...block.metadata, [key]: value } 
    });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        const level = block.metadata?.level || 2;
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant={level === l ? "default" : "outline"}
                  onClick={() => updateMetadata("level", l as 1 | 2 | 3)}
                  disabled={readOnly}
                  data-testid={`heading-level-${l}`}
                >
                  H{l}
                </Button>
              ))}
            </div>
            <Input
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Heading text..."
              className={`font-bold ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'}`}
              disabled={readOnly}
              data-testid="heading-input"
            />
          </div>
        );

      case "paragraph":
        return (
          <Textarea
            value={block.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Start writing..."
            className="min-h-[100px] resize-none"
            disabled={readOnly}
            data-testid="paragraph-input"
          />
        );

      case "image":
        return (
          <div className="space-y-2">
            <Input
              value={block.metadata?.url || ""}
              onChange={(e) => updateMetadata("url", e.target.value)}
              placeholder="Image URL..."
              disabled={readOnly}
              data-testid="image-url-input"
            />
            <Input
              value={block.metadata?.alt || ""}
              onChange={(e) => updateMetadata("alt", e.target.value)}
              placeholder="Alt text..."
              disabled={readOnly}
              data-testid="image-alt-input"
            />
            <Input
              value={block.metadata?.caption || ""}
              onChange={(e) => updateMetadata("caption", e.target.value)}
              placeholder="Caption (optional)..."
              disabled={readOnly}
              data-testid="image-caption-input"
            />
            {block.metadata?.url && (
              <div className="relative">
                <img 
                  src={block.metadata.url} 
                  alt={block.metadata.alt || ""} 
                  className="max-h-64 rounded-md object-cover"
                />
                {block.metadata.caption && (
                  <p className="text-sm text-muted-foreground mt-1 italic">{block.metadata.caption}</p>
                )}
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="space-y-2">
            <Input
              value={block.metadata?.url || ""}
              onChange={(e) => updateMetadata("url", e.target.value)}
              placeholder="Video URL (YouTube, Vimeo, etc.)..."
              disabled={readOnly}
              data-testid="video-url-input"
            />
            {block.metadata?.url && (
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(block.metadata.url)}
                  className="w-full h-full rounded-md"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );

      case "code":
        return (
          <div className="space-y-2">
            <Input
              value={block.metadata?.language || ""}
              onChange={(e) => updateMetadata("language", e.target.value)}
              placeholder="Language (javascript, python, etc.)..."
              disabled={readOnly}
              data-testid="code-language-input"
            />
            <Textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="// Your code here..."
              className="min-h-[150px] font-mono text-sm bg-muted"
              disabled={readOnly}
              data-testid="code-input"
            />
          </div>
        );

      case "quote":
        return (
          <div className="border-l-4 border-primary pl-4 space-y-2">
            <Textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Quote text..."
              className="italic min-h-[80px]"
              disabled={readOnly}
              data-testid="quote-input"
            />
            <Input
              value={block.metadata?.caption || ""}
              onChange={(e) => updateMetadata("caption", e.target.value)}
              placeholder="Attribution (optional)..."
              className="text-sm text-muted-foreground"
              disabled={readOnly}
              data-testid="quote-attribution-input"
            />
          </div>
        );

      case "list":
      case "ordered-list":
        const items = block.metadata?.items || [""];
        return (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-muted-foreground w-6 text-center">
                  {block.type === "ordered-list" ? `${index + 1}.` : "•"}
                </span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = e.target.value;
                    updateMetadata("items", newItems);
                  }}
                  placeholder="List item..."
                  disabled={readOnly}
                  data-testid={`list-item-${index}`}
                />
                {!readOnly && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== index);
                      updateMetadata("items", newItems.length ? newItems : [""]);
                    }}
                    data-testid={`list-item-delete-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateMetadata("items", [...items, ""])}
                data-testid="list-add-item"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            )}
          </div>
        );

      case "embed":
        return (
          <div className="space-y-2">
            <Input
              value={block.metadata?.url || ""}
              onChange={(e) => updateMetadata("url", e.target.value)}
              placeholder="Embed URL (Twitter, Instagram, etc.)..."
              disabled={readOnly}
              data-testid="embed-url-input"
            />
            {block.metadata?.url && (
              <div className="p-4 border rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">Embedded content: {block.metadata.url}</p>
              </div>
            )}
          </div>
        );

      case "callout":
        const calloutType = block.metadata?.calloutType || "info";
        const calloutColors: Record<string, string> = {
          info: "border-blue-500 bg-blue-500/10",
          warning: "border-amber-500 bg-amber-500/10",
          success: "border-green-500 bg-green-500/10",
          error: "border-red-500 bg-red-500/10",
        };
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              {(["info", "warning", "success", "error"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={calloutType === t ? "default" : "outline"}
                  onClick={() => updateMetadata("calloutType", t)}
                  disabled={readOnly}
                  data-testid={`callout-type-${t}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
            <div className={`border-l-4 p-4 rounded-r-md ${calloutColors[calloutType]}`}>
              <Textarea
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Callout content..."
                className="bg-transparent border-0 resize-none"
                disabled={readOnly}
                data-testid="callout-input"
              />
            </div>
          </div>
        );

      case "divider":
        return <hr className="my-4 border-muted" />;

      case "table":
        return (
          <div className="text-sm text-muted-foreground p-4 border rounded-md">
            Table editor coming soon...
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="group relative" data-testid={`block-${block.id}`}>
      <CardContent className="p-4">
        {!readOnly && (
          <div className="absolute -left-10 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 cursor-grab"
              data-testid={`block-drag-${block.id}`}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onMoveUp}
              disabled={isFirst}
              data-testid={`block-move-up-${block.id}`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onMoveDown}
              disabled={isLast}
              data-testid={`block-move-down-${block.id}`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {block.type.replace("-", " ")}
          </Badge>
          {!readOnly && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6 text-destructive hover:text-destructive"
              data-testid={`block-delete-${block.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {renderBlockContent()}
      </CardContent>
    </Card>
  );
}

function getEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export function BlockEditor({ blocks, onChange, readOnly }: BlockEditorProps) {
  const addBlock = (type: BlockType, afterIndex: number = blocks.length - 1) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: "",
      metadata: type === "heading" ? { level: 2 } : 
               type === "list" || type === "ordered-list" ? { items: [""] } :
               type === "callout" ? { calloutType: "info" } :
               undefined,
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const updateBlock = (id: string, updatedBlock: ContentBlock) => {
    onChange(blocks.map(b => b.id === id ? updatedBlock : b));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4 pl-12">
      {blocks.length === 0 && !readOnly && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Start creating your content</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="add-first-block">
                <Plus className="h-4 w-4 mr-2" /> Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => addBlock(type, -1)}
                  data-testid={`add-block-${type}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id}>
          <BlockRenderer
            block={block}
            onUpdate={(updated) => updateBlock(block.id, updated)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, "up")}
            onMoveDown={() => moveBlock(block.id, "down")}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            readOnly={readOnly}
          />
          
          {!readOnly && (
            <div className="flex justify-center my-2 opacity-0 hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" data-testid={`add-block-after-${block.id}`}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                    <DropdownMenuItem 
                      key={type} 
                      onClick={() => addBlock(type, index)}
                      data-testid={`add-${type}-after-${block.id}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BlockEditor;
