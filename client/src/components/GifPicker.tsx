import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Smile, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: { url: string; dims: number[] };
    tinygif: { url: string; dims: number[] };
    nanogif: { url: string; dims: number[] };
  };
}

interface GifPickerProps {
  onSelect: (gifUrl: string, previewUrl: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const TRENDING_CATEGORIES = [
  "agree", "applause", "aww", "dance", 
  "excited", "facepalm", "happy", "high five",
  "laugh", "mic drop", "ok", "sad", "shocked", "thumbs up"
];

export function GifPicker({ onSelect, trigger, className }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSelectedCategory(null);
      }
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const queryString = debouncedQuery || selectedCategory || "";
  const isTrending = !queryString;

  const { data: gifs, isLoading, error } = useQuery<TenorGif[]>({
    queryKey: ["/api/gifs", queryString],
    queryFn: async () => {
      const url = queryString 
        ? `/api/gifs?q=${encodeURIComponent(queryString)}`
        : "/api/gifs";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch GIFs");
      return response.json();
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleCategoryClick = useCallback((category: string) => {
    setSearchQuery("");
    setSelectedCategory(category);
  }, []);

  const handleGifSelect = useCallback((gif: TenorGif) => {
    const fullUrl = gif.media_formats.gif.url;
    const previewUrl = gif.media_formats.tinygif.url;
    onSelect(fullUrl, previewUrl);
    setOpen(false);
    setSearchQuery("");
    setSelectedCategory(null);
  }, [onSelect]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSelectedCategory(null);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("text-muted-foreground hover-elevate", className)}
            data-testid="button-gif-picker"
          >
            <Smile className="w-5 h-5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="start"
        side="top"
        sideOffset={8}
      >
        <div className="flex flex-col h-[400px]">
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search GIFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
                data-testid="input-gif-search"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {!searchQuery && (
              <ScrollArea className="w-full" orientation="horizontal">
                <div className="flex gap-1.5 pb-1">
                  {TRENDING_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0 text-xs capitalize"
                      onClick={() => handleCategoryClick(category)}
                      data-testid={`button-gif-category-${category.replace(' ', '-')}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <ScrollArea className="flex-1 p-2">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-md" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Failed to load GIFs</p>
                <p className="text-xs">Please try again</p>
              </div>
            ) : gifs && gifs.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    className="relative aspect-video overflow-hidden rounded-md hover-elevate active-elevate-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={() => handleGifSelect(gif)}
                    data-testid={`button-gif-${gif.id}`}
                  >
                    <img
                      src={gif.media_formats.nanogif.url}
                      alt={gif.title || "GIF"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <TrendingUp className="w-8 h-8 mb-2" />
                <p>{isTrending ? "Loading trending GIFs..." : "No GIFs found"}</p>
                {!isTrending && (
                  <p className="text-xs">Try a different search term</p>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t bg-muted/30 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              Powered by
              <img
                src="https://www.gstatic.com/tenor/web/attribution/PB_tenor_logo_blue_horizontal.png"
                alt="Tenor"
                className="h-3"
              />
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
