import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { Heart, MessageSquare, TrendingUp, Bell, BarChart3, Clock, Trash2, Plus, ChevronRight, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedSearch, BuyerMessageThread } from "@shared/schema";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["/api/buyer/dashboard-stats"],
    enabled: !!user
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/buyer/favorites"],
    enabled: !!user
  });

  const { data: searches = [] } = useQuery({
    queryKey: ["/api/buyer/saved-searches"],
    enabled: !!user
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/buyer/messages/threads"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/buyer/messages/threads?role=buyer");
      return res.json();
    }
  });

  const { data: comparisons = [] } = useQuery({
    queryKey: ["/api/buyer/comparisons"],
    enabled: !!user
  });

  const deleteSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/buyer/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/saved-searches"] });
      toast({ title: "Search deleted" });
    }
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/buyer/favorites/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/favorites"] });
      toast({ title: "Removed from watchlist" });
    }
  });

  return (
    <AuthGuard 
      title="Sign In to Access Buyer Dashboard" 
      description="Sign in to access your dashboard."
    >
      <SEO title="Buyer Dashboard | WashBizHub" description="Manage your property search" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="text-page-title">
                  Buyer Dashboard
                </h1>
                <p className="text-sm text-slate-400 mt-1">Track properties, manage communications, and organize your search</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-12">
            {[
              { label: 'Watchlist', value: stats?.favoritesCount || 0, icon: Heart, color: 'from-rose-500/10 to-rose-500/5' },
              { label: 'Saved Searches', value: stats?.savedSearchesCount || 0, icon: Bell, color: 'from-amber-500/10 to-amber-500/5' },
              { label: 'Conversations', value: stats?.activeThreadsCount || 0, icon: MessageSquare, color: 'from-blue-500/10 to-blue-500/5' },
              { label: 'Unread', value: stats?.unreadMessages || 0, icon: Zap, color: 'from-violet-500/10 to-violet-500/5' },
              { label: 'Comparisons', value: stats?.comparisonsCount || 0, icon: BarChart3, color: 'from-cyan-500/10 to-cyan-500/5' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className={`border-slate-700/50 bg-gradient-to-br ${color} backdrop-blur-sm`} data-testid={`stat-${label.toLowerCase()}`}>
                <CardContent className="p-4">
                  <Icon className="w-5 h-5 text-slate-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8 bg-slate-800/50 border border-slate-700/50 p-1">
              {[
                { value: 'overview', label: 'Overview', icon: '📊' },
                { value: 'searches', label: 'Searches', icon: '🔔' },
                { value: 'favorites', label: 'Watchlist', icon: '❤️' },
                { value: 'messages', label: 'Messages', icon: '💬' },
                { value: 'comparisons', label: 'Compare', icon: '📈' },
              ].map(({ value, label }) => (
                <TabsTrigger 
                  key={value} 
                  value={value}
                  className="text-xs sm:text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  data-testid={`tab-${value}`}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Messages */}
                <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Conversations</span>
                      {messages.length > 0 && <Badge variant="outline">{Math.min(messages.length, 3)}</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {messages.slice(0, 3).map((thread: any) => (
                      <Link key={thread.id} href={`/buyer/messages/${thread.id}`}>
                        <div className="p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition-colors cursor-pointer border border-slate-700/50">
                          <p className="text-sm font-medium text-white line-clamp-1">{thread.subject}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{thread.lastMessagePreview}</p>
                        </div>
                      </Link>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No conversations yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Favorites */}
                <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span>Watchlist Highlights</span>
                      {favorites.length > 0 && <Badge variant="outline">{Math.min(favorites.length, 3)}</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {favorites.slice(0, 3).map((fav: any) => (
                      <Link key={fav.id} href={`/listing/${fav.listing?.id}`}>
                        <div className="p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition-colors cursor-pointer border border-slate-700/50">
                          <p className="text-sm font-medium text-white line-clamp-1">{fav.listing?.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{fav.listing?.city}, {fav.listing?.region}</p>
                        </div>
                      </Link>
                    ))}
                    {favorites.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No watchlist items yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Saved Searches Tab */}
            <TabsContent value="searches" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Saved Searches</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" data-testid="button-new-search">
                      <Plus className="w-4 h-4" />
                      New Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-slate-700/50 bg-slate-900">
                    <DialogHeader>
                      <DialogTitle>Create Saved Search</DialogTitle>
                    </DialogHeader>
                    <SaveSearchForm />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {searches.length === 0 ? (
                  <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <CardContent className="py-12 text-center text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      Create a saved search to get email alerts for new listings
                    </CardContent>
                  </Card>
                ) : (
                  searches.map((search: SavedSearch) => (
                    <Card key={search.id} className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-colors" data-testid={`card-search-${search.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg text-white">{search.name}</CardTitle>
                            <p className="text-xs text-slate-400 mt-1 capitalize">
                              {search.alertFrequency} alerts • {search.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSearchMutation.mutate(search.id)}
                            data-testid="button-delete-search"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <h2 className="text-xl font-bold text-white">Watchlist</h2>
              <div className="grid gap-4">
                {favorites.length === 0 ? (
                  <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <CardContent className="py-12 text-center text-slate-400">
                      <Heart className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      Add properties to your watchlist to keep track
                    </CardContent>
                  </Card>
                ) : (
                  favorites.map((fav: any) => (
                    <Link key={fav.id} href={`/listing/${fav.listing?.id}`}>
                      <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-colors cursor-pointer" data-testid={`card-favorite-${fav.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg text-white line-clamp-2">{fav.listing?.title}</CardTitle>
                              <p className="text-sm text-slate-400 mt-2">{fav.listing?.city}, {fav.listing?.region}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteFavoriteMutation.mutate(fav.listingId);
                              }}
                              data-testid="button-remove-favorite"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <h2 className="text-xl font-bold text-white">Conversations</h2>
              <div className="grid gap-4">
                {messages.length === 0 ? (
                  <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <CardContent className="py-12 text-center text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      Contact sellers to inquire about properties
                    </CardContent>
                  </Card>
                ) : (
                  messages.map((thread: BuyerMessageThread) => (
                    <Link key={thread.id} href={`/buyer/messages/${thread.id}`}>
                      <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-colors cursor-pointer" data-testid={`card-thread-${thread.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-white">{thread.subject}</CardTitle>
                              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{thread.lastMessagePreview}</p>
                            </div>
                            {thread.buyerUnreadCount > 0 && (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex-shrink-0">
                                {thread.buyerUnreadCount}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Comparisons Tab */}
            <TabsContent value="comparisons" className="space-y-6">
              <h2 className="text-xl font-bold text-white">Comparisons</h2>
              <div className="grid gap-4">
                {comparisons.length === 0 ? (
                  <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                    <CardContent className="py-12 text-center text-slate-400">
                      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      Compare properties side-by-side to evaluate your options
                    </CardContent>
                  </Card>
                ) : (
                  comparisons.map((comp: any) => (
                    <Link key={comp.id} href={`/buyer/comparison/${comp.id}`}>
                      <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-colors cursor-pointer" data-testid={`card-comparison-${comp.id}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white flex items-center justify-between">
                            <span>{comp.name}</span>
                            <ChevronRight className="w-4 h-4" />
                          </CardTitle>
                          <p className="text-xs text-slate-400 mt-2">{comp.listingIds.length} properties</p>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}

function SaveSearchForm() {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/buyer/saved-searches", {
        name,
        filters: {},
        alertFrequency: frequency
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/saved-searches"] });
      toast({ title: "Search saved!" });
      setName("");
    }
  });

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-white">Search Name</Label>
        <Input
          placeholder="e.g., High ROI Properties in Texas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          data-testid="input-search-name"
        />
      </div>
      <div>
        <Label className="text-white">Alert Frequency</Label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
          data-testid="select-frequency"
        >
          <option value="instant">Instant</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={!name || mutation.isPending}
        className="w-full"
        data-testid="button-save-search"
      >
        {mutation.isPending ? "Saving..." : "Create Search"}
      </Button>
    </div>
  );
}
