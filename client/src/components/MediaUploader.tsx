import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Film, FileText, GripVertical } from "lucide-react";
import { Star } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface MediaFile {
  id: string;
  file?: File;
  url: string;
  type: "image" | "video" | "document" | "floor_plan";
  title?: string;
  description?: string;
  sortOrder: number;
  requiresNDA?: boolean;
  thumbnail?: string;
  uploadProgress?: number;
  uploading?: boolean;
}

interface MediaUploaderProps {
  listingId: string;
  media: MediaFile[];
  onChange: (media: MediaFile[]) => void;
  onUpload: (file: File, metadata: Partial<MediaFile>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  requiresNDA?: boolean;
}

function MediaItem({
  item,
  onDelete,
  onToggleFeatured,
  isFeatured,
}: {
  item: MediaFile;
  onDelete: () => void;
  onToggleFeatured: () => void;
  isFeatured: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
    switch (item.type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Film className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPreview = () => {
    if (item.uploading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Uploading...</div>
            <Progress value={item.uploadProgress || 0} className="w-32" />
          </div>
        </div>
      );
    }

    if (item.type === "image" && item.url) {
      return (
        <img
          src={item.url}
          alt={item.title || "Listing media"}
          className="w-full h-full object-cover"
        />
      );
    }

    if (item.type === "video" && item.thumbnail) {
      return (
        <div className="relative w-full h-full">
          <img
            src={item.thumbnail}
            alt={item.title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Film className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        {getIcon()}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isDragging && "opacity-50"
      )}
    >
      <Card className="overflow-hidden">
        <div className="flex gap-3 p-3">
          <button
            className="cursor-grab active:cursor-grabbing hover-elevate"
            {...attributes}
            {...listeners}
            data-testid={`drag-handle-${item.id}`}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
            {getPreview()}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.title || item.file?.name || "Untitled"}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleFeatured}
                  className={cn(
                    "h-8 w-8",
                    isFeatured && "text-amber-500"
                  )}
                  data-testid={`set-featured-${item.id}`}
                >
                  <Star className={cn("w-4 h-4", isFeatured && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={item.uploading}
                  data-testid={`delete-media-${item.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{item.type}</span>
              {item.requiresNDA && (
                <span className="text-amber-600">• NDA Required</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function MediaUploader({
  listingId,
  media,
  onChange,
  onUpload,
  onDelete,
  maxFiles = 20,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"],
  requiresNDA = false,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      await handleFiles(files);
    },
    [media, maxFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        await handleFiles(files);
      }
    },
    [media, maxFiles]
  );

  const handleFiles = async (files: File[]) => {
    if (media.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} not accepted`);
        continue;
      }

      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large (max ${maxFileSize / 1024 / 1024}MB)`);
        continue;
      }

      const type = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "document";

      const newMedia: MediaFile = {
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        type,
        title: file.name,
        sortOrder: media.length,
        requiresNDA,
        uploading: true,
        uploadProgress: 0,
      };

      onChange([...media, newMedia]);

      try {
        await onUpload(file, {
          id: newMedia.id,
          type,
          title: file.name,
          sortOrder: media.length,
          requiresNDA,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        onChange(media.filter((m) => m.id !== newMedia.id));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((m) => m.id === active.id);
      const newIndex = media.findIndex((m) => m.id === over.id);

      const newMedia = arrayMove(media, oldIndex, newIndex).map((m, i) => ({
        ...m,
        sortOrder: i,
      }));

      onChange(newMedia);

      // Update featured index if needed
      if (oldIndex === featuredIndex) {
        setFeaturedIndex(newIndex);
      } else if (oldIndex < featuredIndex && newIndex >= featuredIndex) {
        setFeaturedIndex(featuredIndex - 1);
      } else if (oldIndex > featuredIndex && newIndex <= featuredIndex) {
        setFeaturedIndex(featuredIndex + 1);
      }
    }
  };

  const handleToggleFeatured = (index: number) => {
    setFeaturedIndex(index);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="media-dropzone"
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Max {maxFiles} files • {maxFileSize / 1024 / 1024}MB per file
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          data-testid="browse-files-button"
        >
          Browse Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          data-testid="file-input"
        />
      </div>

      {media.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {media.length} {media.length === 1 ? "file" : "files"} uploaded
            </p>
            {featuredIndex >= 0 && media[featuredIndex] && (
              <p className="text-xs text-muted-foreground">
                Featured: {media[featuredIndex].title || media[featuredIndex].file?.name}
              </p>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={media.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {media.map((item, index) => (
                  <MediaItem
                    key={item.id}
                    item={item}
                    onDelete={() => onDelete(item.id)}
                    onToggleFeatured={() => handleToggleFeatured(index)}
                    isFeatured={index === featuredIndex}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
