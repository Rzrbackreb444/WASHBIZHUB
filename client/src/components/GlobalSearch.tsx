import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  FileText,
  Calculator,
  BookOpen,
  Newspaper,
  Store,
  Building2,
  GraduationCap,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  ExternalLink,
  MapPin,
  Wrench,
  LayoutDashboard,
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
    content?: string;
  };
  metadata?: Record<string, any>;
  imageUrl?: string | null;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  searchTimeMs: number;
}

interface PopularSearch {
  query: string;
  count: number;
}

const ENTITY_ICONS: Record<string, typeof FileText> = {
  page: LayoutDashboard,
  calculator: Calculator,
  resource: BookOpen,
  article: Newspaper,
  blog: Newspaper,
  listing: Building2,
  course: GraduationCap,
  vendor: Store,
  forum: Users,
  location: MapPin,
  equipment: Wrench,
};

const ENTITY_LABELS: Record<string, string> = {
  page: "Page",
  calculator: "Calculator",
  resource: "Resource",
  article: "Article",
  blog: "Blog",
  listing: "Listing",
  course: "Course",
  vendor: "Vendor",
  forum: "Community",
  location: "Location",
  equipment: "Equipment",
};

const ENTITY_COLORS: Record<string, string> = {
  page: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  calculator: "bg-gold-500/20 text-gold-300 border-gold-500/30",
  resource: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  article: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  blog: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  listing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  course: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  vendor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  forum: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  location: "bg-red-500/20 text-red-300 border-red-500/30",
  equipment: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const RECENT_SEARCHES_KEY = "washbizhub_recent_searches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  try {
    const searches = getRecentSearches().filter((s) => s !== query);
    searches.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {}
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange }: GlobalSearchProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching,
  } = useQuery({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return null;
      }
      const res = await apiRequest("POST", "/api/search", {
        query: debouncedQuery,
        limit: 20,
      });
      return res.json() as Promise<SearchResponse>;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const { data: popularSearches } = useQuery({
    queryKey: ["/api/search/popular"],
    queryFn: async () => {
      const res = await fetch("/api/search/popular?limit=8");
      if (!res.ok) return [];
      return res.json() as Promise<PopularSearch[]>;
    },
    staleTime: 60000 * 5,
  });

  const trackClickMutation = useMutation({
    mutationFn: async ({
      resultId,
      query,
      position,
    }: {
      resultId: string;
      query: string;
      position: number;
    }) => {
      await apiRequest("POST", "/api/search/click", { resultId, query, position });
    },
  });

  const handleSelect = useCallback(
    (result: SearchResult, index: number) => {
      addRecentSearch(query);
      trackClickMutation.mutate({
        resultId: result.id,
        query,
        position: index,
      });
      setOpen(false);
      setQuery("");
      if (result.url.startsWith("http")) {
        window.open(result.url, "_blank");
      } else {
        setLocation(result.url);
      }
    },
    [query, setOpen, setLocation, trackClickMutation]
  );

  const handleRecentSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
    },
    []
  );

  const handlePopularSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
    },
    []
  );

  const groupedResults = useMemo(() => {
    if (!searchResults?.results?.length) return {};

    const groups: Record<string, SearchResult[]> = {};
    const categoryOrder = ["page", "calculator", "resource", "article", "blog", "listing", "course", "vendor"];

    for (const result of searchResults.results) {
      const type = result.entityType || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(result);
    }

    const sortedGroups: Record<string, SearchResult[]> = {};
    for (const category of categoryOrder) {
      if (groups[category]) {
        sortedGroups[category] = groups[category];
      }
    }
    for (const [key, value] of Object.entries(groups)) {
      if (!sortedGroups[key]) {
        sortedGroups[key] = value;
      }
    }

    return sortedGroups;
  }, [searchResults]);

  const hasResults = Object.keys(groupedResults).length > 0;
  const showLoading = isFetching && debouncedQuery.length >= 2;
  const showEmpty = debouncedQuery.length >= 2 && !showLoading && !hasResults;
  const showSuggestions = !debouncedQuery || debouncedQuery.length < 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 shadow-2xl max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl"
        data-testid="global-search-dialog"
      >
        <VisuallyHidden>
          <DialogTitle>Search WashBizHub</DialogTitle>
          <DialogDescription>
            Search for pages, calculators, resources, articles, listings, courses, and more
          </DialogDescription>
        </VisuallyHidden>

        <Command
          className="bg-transparent [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-gold-400"
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-white/10 px-4">
            {showLoading ? (
              <Loader2 className="mr-3 h-5 w-5 shrink-0 text-gold-400 animate-spin" />
            ) : (
              <Search className="mr-3 h-5 w-5 shrink-0 text-white/50" />
            )}
            <CommandInput
              placeholder="Search WashBizHub..."
              className="flex h-14 w-full rounded-md bg-transparent py-4 text-base text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
              value={query}
              onValueChange={setQuery}
              data-testid="input-global-search"
            />
            <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded bg-white/10 px-2 font-mono text-xs text-white/60">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[60vh] overflow-y-auto p-2">
            {showLoading && (
              <div className="p-4 space-y-3" data-testid="search-loading-skeleton">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-1/2 bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showEmpty && (
              <CommandEmpty className="py-12 text-center" data-testid="search-empty-state">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-white/30" />
                </div>
                <p className="text-white/60 text-sm">
                  No results found for "{debouncedQuery}"
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Try different keywords or browse categories
                </p>
              </CommandEmpty>
            )}

            {showSuggestions && (
              <>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches" data-testid="recent-searches-group">
                    {recentSearches.map((search) => (
                      <CommandItem
                        key={`recent-${search}`}
                        value={`recent-${search}`}
                        onSelect={() => handleRecentSearch(search)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-white/80 data-[selected=true]:bg-gold-500/20 data-[selected=true]:text-white hover:bg-white/5"
                        data-testid={`recent-search-${search}`}
                      >
                        <Clock className="h-4 w-4 text-white/40" />
                        <span className="flex-1 truncate">{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {popularSearches && popularSearches.length > 0 && (
                  <>
                    {recentSearches.length > 0 && <CommandSeparator className="my-2 bg-white/10" />}
                    <CommandGroup heading="Popular Searches" data-testid="popular-searches-group">
                      {popularSearches.slice(0, 6).map((item) => (
                        <CommandItem
                          key={`popular-${item.query}`}
                          value={`popular-${item.query}`}
                          onSelect={() => handlePopularSearch(item.query)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-white/80 data-[selected=true]:bg-gold-500/20 data-[selected=true]:text-white hover:bg-white/5"
                          data-testid={`popular-search-${item.query}`}
                        >
                          <TrendingUp className="h-4 w-4 text-gold-400/60" />
                          <span className="flex-1 truncate">{item.query}</span>
                          <span className="text-xs text-white/30">{item.count} searches</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {recentSearches.length === 0 && (!popularSearches || popularSearches.length === 0) && (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-white/30" />
                    </div>
                    <p className="text-white/60 text-sm">Start typing to search</p>
                    <p className="text-white/40 text-xs mt-1">
                      Find pages, calculators, resources, and more
                    </p>
                  </div>
                )}
              </>
            )}

            {hasResults &&
              Object.entries(groupedResults).map(([type, results], groupIndex) => {
                const Icon = ENTITY_ICONS[type] || FileText;
                const label = ENTITY_LABELS[type] || type;

                return (
                  <CommandGroup
                    key={type}
                    heading={label}
                    data-testid={`search-group-${type}`}
                  >
                    {results.map((result, resultIndex) => {
                      const ResultIcon = ENTITY_ICONS[result.entityType] || FileText;
                      const colorClass = ENTITY_COLORS[result.entityType] || "bg-white/10 text-white/80 border-white/20";
                      const globalIndex =
                        Object.values(groupedResults)
                          .slice(0, groupIndex)
                          .reduce((acc, arr) => acc + arr.length, 0) + resultIndex;

                      return (
                        <CommandItem
                          key={result.id}
                          value={`${result.id}-${result.title}`}
                          onSelect={() => handleSelect(result, globalIndex)}
                          className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer text-white/90 data-[selected=true]:bg-gold-500/20 data-[selected=true]:text-white hover:bg-white/5 group"
                          data-testid={`search-result-${result.id}`}
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} border`}
                          >
                            <ResultIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-medium truncate"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    result.highlights?.title || result.title,
                                }}
                              />
                              {result.url.startsWith("http") && (
                                <ExternalLink className="h-3 w-3 text-white/30 flex-shrink-0" />
                              )}
                            </div>
                            {result.description && (
                              <p
                                className="text-sm text-white/50 truncate mt-0.5 group-data-[selected=true]:text-white/70"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    result.highlights?.description?.slice(0, 100) ||
                                    result.description.slice(0, 100),
                                }}
                              />
                            )}
                            {result.category && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 h-4 ${colorClass}`}
                                >
                                  {result.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}

            {searchResults && searchResults.totalCount > 0 && (
              <div className="px-4 py-3 text-xs text-white/40 border-t border-white/10 mt-2">
                Found {searchResults.totalCount} results in {searchResults.searchTimeMs}ms
              </div>
            )}
          </CommandList>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 bg-white/5">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <kbd className="h-5 min-w-[20px] inline-flex items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[10px]">
                  ↑
                </kbd>
                <kbd className="h-5 min-w-[20px] inline-flex items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[10px]">
                  ↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="h-5 min-w-[20px] inline-flex items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[10px]">
                  ↵
                </kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="h-5 min-w-[20px] inline-flex items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[10px]">
                  esc
                </kbd>
                close
              </span>
            </div>
            <div className="text-xs text-gold-400/60 font-medium">WashBizHub</div>
          </div>
        </Command>
      </DialogContent>

      <style>{`
        [cmdk-item] mark {
          background-color: rgb(184 134 11 / 0.4);
          color: rgb(253 230 138);
          border-radius: 2px;
          padding: 0 2px;
        }
      `}</style>
    </Dialog>
  );
}

export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 group"
        data-testid="button-global-search"
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline text-white/50">Search...</span>
        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] text-white/40 group-hover:bg-white/20 group-hover:text-white/60">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
}
