import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Wrench, FileText, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchResult {
  type: "part" | "diagnostic" | "repair" | "amazon";
  id: string;
  title: string;
  description: string;
  category?: string;
  severity?: string;
  price?: string;
  url?: string;
  image?: string;
}

interface SmartSearchProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SmartSearch({ 
  onSelect, 
  placeholder = "Search parts, diagnostics, repairs, or equipment...",
  autoFocus = false,
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['/api/smart-search', debouncedQuery],
    queryFn: async ({ queryKey }) => {
      const [url, searchQuery] = queryKey;
      if (!searchQuery || (searchQuery as string).length < 2) return [];
      
      const response = await fetch(`${url}?q=${encodeURIComponent(searchQuery as string)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "amazon" && result.url) {
      // Track click and open Amazon link
      fetch('/api/amazon/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin: result.id })
      }).catch(() => {});
      
      window.open(result.url, '_blank');
    }
    
    onSelect?.(result);
    setQuery("");
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "part": return Package;
      case "diagnostic": return AlertCircle;
      case "repair": return Wrench;
      case "amazon": return ExternalLink;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "part": return "bg-blue-500/10 text-blue-500";
      case "diagnostic": return "bg-red-500/10 text-red-500";
      case "repair": return "bg-green-500/10 text-green-500";
      case "amazon": return "bg-orange-500/10 text-orange-500";
      default: return "bg-muted-foreground/10 text-muted-foreground";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          autoFocus={autoFocus}
          className="pl-10 pr-4"
          data-testid="input-smart-search"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <Card 
          ref={resultsRef}
          className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-lg"
          data-testid="search-results-dropdown"
        >
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = getIcon(result.type);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full px-4 py-3 text-left hover-elevate active-elevate-2 flex items-start gap-3 ${
                      isSelected ? "bg-accent" : ""
                    }`}
                    data-testid={`search-result-${result.type}-${index}`}
                  >
                    <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.severity && (
                          <Badge 
                            variant={
                              result.severity === "critical" ? "destructive" :
                              result.severity === "high" ? "default" :
                              "outline"
                            }
                            className="text-xs"
                          >
                            {result.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                      {result.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Category: {result.category}
                        </p>
                      )}
                      {result.price && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          {result.price}
                        </p>
                      )}
                    </div>

                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
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
