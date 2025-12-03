import { useState, useEffect, useRef, useCallback, useId } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  FileText,
  Calculator,
  BookOpen,
  Newspaper,
  Building2,
  GraduationCap,
  MapPin,
  Wrench,
  LayoutDashboard,
  TrendingUp,
  Clock,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  description: string | null;
  url: string;
  category: string | null;
  relevanceScore: number;
  highlights: {
    title?: string;
    description?: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  searchTimeMs: number;
}

const ENTITY_ICONS: Record<string, typeof FileText> = {
  page: LayoutDashboard,
  calculator: Calculator,
  resource: BookOpen,
  article: Newspaper,
  blog: Newspaper,
  listing: Building2,
  course: GraduationCap,
  location: MapPin,
  equipment: Wrench,
};

const ENTITY_COLORS: Record<string, string> = {
  page: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  calculator: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  resource: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  article: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  blog: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  listing: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  course: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  location: "bg-red-500/10 text-red-500 border-red-500/30",
  equipment: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

const popularSuggestions = [
  { query: "laundromat valuation", icon: Calculator },
  { query: "CLEANBI score", icon: MapPin },
  { query: "due diligence checklist", icon: FileText },
  { query: "laundromats for sale", icon: Building2 },
  { query: "ROI calculator", icon: TrendingUp },
  { query: "equipment financing", icon: TrendingUp },
  { query: "SBA loan", icon: TrendingUp },
  { query: "startup funding", icon: TrendingUp },
];

interface PredictiveSearchProps {
  placeholder?: string;
  className?: string;
  showPopularSuggestions?: boolean;
  onResultSelect?: (url: string) => void;
}

export function PredictiveSearch({
  placeholder = "Search laundromats, calculators, resources...",
  className = "",
  showPopularSuggestions = true,
  onResultSelect,
}: PredictiveSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;
      const res = await apiRequest("POST", "/api/search", {
        query: debouncedQuery,
        limit: 8,
      });
      return res.json() as Promise<SearchResponse>;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const results = searchResults?.results || [];
  const hasResults = results.length > 0;
  const showSuggestions = !query && showPopularSuggestions;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const itemCount = hasResults ? results.length : showSuggestions ? popularSuggestions.length : 0;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % itemCount);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + itemCount) % itemCount);
          break;
        case "Enter":
          e.preventDefault();
          if (hasResults && selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex].url);
          } else if (showSuggestions && selectedIndex >= 0 && popularSuggestions[selectedIndex]) {
            setQuery(popularSuggestions[selectedIndex].query);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, hasResults, results, selectedIndex, showSuggestions]
  );

  const handleSelect = (url: string) => {
    setQuery("");
    setIsOpen(false);
    if (onResultSelect) {
      onResultSelect(url);
    } else {
      if (url.startsWith("http")) {
        window.open(url, "_blank");
      } else {
        setLocation(url);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-4 h-12 text-base bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          data-testid="input-predictive-search"
        />
        {isFetching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && (
        <Card
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full z-50 shadow-xl border-border bg-background overflow-hidden"
          data-testid="predictive-search-dropdown"
        >
          {query.length >= 2 && isFetching && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          )}

          {query.length >= 2 && !isFetching && !hasResults && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try different keywords</p>
            </div>
          )}

          {hasResults && (
            <div className="py-2 max-h-[400px] overflow-y-auto">
              <div className="px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Results
                </span>
              </div>
              {results.map((result, index) => {
                const Icon = ENTITY_ICONS[result.entityType] || FileText;
                const colorClass = ENTITY_COLORS[result.entityType] || "bg-muted text-muted-foreground";
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.url)}
                    className={`w-full px-3 py-3 flex items-start gap-3 text-left transition-colors ${
                      isSelected ? "bg-accent" : "hover:bg-muted/50"
                    }`}
                    data-testid={`search-result-${index}`}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${colorClass} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium text-foreground text-sm truncate"
                          dangerouslySetInnerHTML={{
                            __html: result.highlights?.title || result.title,
                          }}
                        />
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.description.slice(0, 80)}
                        </p>
                      )}
                      {result.category && (
                        <Badge variant="outline" className="mt-1.5 text-[10px] h-5">
                          {result.category}
                        </Badge>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-2" />
                  </button>
                );
              })}
              {searchResults && searchResults.totalCount > results.length && (
                <div className="px-3 py-2 border-t border-border">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation(`/search?q=${encodeURIComponent(query)}`);
                    }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    data-testid="button-view-all-results"
                  >
                    View all {searchResults.totalCount} results
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {showSuggestions && !query && (
            <div className="py-2">
              <div className="px-3 py-1.5 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Popular Searches
                </span>
              </div>
              {popularSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={suggestion.query}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                      isSelected ? "bg-accent" : "hover:bg-muted/50"
                    }`}
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-foreground">{suggestion.query}</span>
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto" />
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
