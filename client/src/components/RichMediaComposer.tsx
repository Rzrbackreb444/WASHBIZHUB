import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GifPicker } from "./GifPicker";
import { FileUpload } from "./FileUpload";
import { 
  Image as ImageIcon, 
  Video, 
  Paperclip, 
  X, 
  Smile,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Code,
  AtSign,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

interface AttachedMedia {
  type: "image" | "gif" | "video" | "file";
  url: string;
  previewUrl?: string;
  filename?: string;
  contentType?: string;
}

export interface RichMediaComposerRef {
  focus: () => void;
  clear: () => void;
  getContent: () => { text: string; media: AttachedMedia[] };
  insertText: (text: string) => void;
}

interface RichMediaComposerProps {
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  onSubmit?: (content: { text: string; media: AttachedMedia[] }) => Promise<void>;
  submitLabel?: string;
  showToolbar?: boolean;
  showSubmitButton?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const RichMediaComposer = forwardRef<RichMediaComposerRef, RichMediaComposerProps>(({
  placeholder = "Write something...",
  minRows = 3,
  maxRows = 10,
  onSubmit,
  submitLabel = "Post",
  showToolbar = true,
  showSubmitButton = true,
  disabled = false,
  className,
  autoFocus = false,
}, ref) => {
  const [text, setText] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    clear: () => {
      setText("");
      setAttachedMedia([]);
    },
    getContent: () => ({ text, media: attachedMedia }),
    insertText: (insertText: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + insertText + text.substring(end);
      setText(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 0);
    },
  }));

  const handleGifSelect = useCallback((gifUrl: string, previewUrl: string) => {
    setAttachedMedia(prev => [...prev, {
      type: "gif",
      url: gifUrl,
      previewUrl,
    }]);
  }, []);

  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    const newMedia: AttachedMedia[] = files.map(file => {
      let type: AttachedMedia["type"] = "file";
      if (file.contentType.startsWith("image/")) type = "image";
      else if (file.contentType.startsWith("video/")) type = "video";
      
      return {
        type,
        url: file.url,
        filename: file.filename,
        contentType: file.contentType,
      };
    });
    setAttachedMedia(prev => [...prev, ...newMedia]);
    setShowFileUpload(false);
  }, []);

  const removeMedia = useCallback((index: number) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setText(newText);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, end + before.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }
    }, 0);
  }, [text]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit || (!text.trim() && attachedMedia.length === 0)) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), media: attachedMedia });
      setText("");
      setAttachedMedia([]);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, attachedMedia, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const hasContent = text.trim().length > 0 || attachedMedia.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          autoFocus={autoFocus}
          className={cn(
            "resize-none transition-all pr-2",
            minRows && `min-h-[${minRows * 1.5}rem]`
          )}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`,
          }}
          data-testid="textarea-composer"
        />
      </div>

      {attachedMedia.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedMedia.map((media, index) => (
            <div 
              key={`${media.url}-${index}`}
              className="relative group"
            >
              {media.type === "image" || media.type === "gif" ? (
                <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                  <img
                    src={media.previewUrl || media.url}
                    alt={media.filename || "Attached media"}
                    className="w-full h-full object-cover"
                  />
                  {media.type === "gif" && (
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-[10px] px-1 py-0"
                    >
                      GIF
                    </Badge>
                  )}
                </div>
              ) : media.type === "video" ? (
                <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-1 left-1 text-[10px] px-1 py-0"
                  >
                    Video
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border bg-muted/50">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs truncate max-w-[100px]">
                    {media.filename}
                  </span>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
                data-testid={`button-remove-media-${index}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showFileUpload && (
        <Card className="p-3">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            existingFiles={[]}
            maxFiles={5}
            maxSizeMB={10}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => insertMarkdown("**", "**")}
              disabled={disabled || isSubmitting}
              title="Bold (Ctrl+B)"
              data-testid="button-bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => insertMarkdown("*", "*")}
              disabled={disabled || isSubmitting}
              title="Italic (Ctrl+I)"
              data-testid="button-italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => insertMarkdown("[", "](url)")}
              disabled={disabled || isSubmitting}
              title="Insert Link"
              data-testid="button-link"
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => insertMarkdown("> ")}
              disabled={disabled || isSubmitting}
              title="Quote"
              data-testid="button-quote"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => insertMarkdown("`", "`")}
              disabled={disabled || isSubmitting}
              title="Inline Code"
              data-testid="button-code"
            >
              <Code className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-5 bg-border mx-1" />
            
            <GifPicker
              onSelect={handleGifSelect}
              className={cn(disabled || isSubmitting ? "pointer-events-none opacity-50" : "")}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover-elevate"
              onClick={() => setShowFileUpload(prev => !prev)}
              disabled={disabled || isSubmitting}
              title="Attach Files"
              data-testid="button-attach"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </div>

          {showSubmitButton && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || isSubmitting || !hasContent}
              className="gap-2"
              data-testid="button-submit-composer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

RichMediaComposer.displayName = "RichMediaComposer";
