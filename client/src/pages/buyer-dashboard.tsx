import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { Heart, MessageSquare, TrendingUp, FileText, BarChart3, Clock, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { SavedSearch, FavoriteListing, BuyerMessageThread } from "@shared/schema";

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
    enabled: !!user
  });

  const { data: comparisons = [] } = useQuery({
    queryKey: ["/api/buyer/comparisons"],
    enabled: !!user
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/buyer/favorites/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/favorites"] });
      toast({ title: "Removed from favorites" });
    }
  });

  const createSearchMutation = useMutation({
    mutationFn: async (data: { name: string; filters: Record<string, any>; alertFrequency: string }) => {
      return await apiRequest("POST", "/api/buyer/saved-searches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/saved-searches"] });
      toast({ title: "Saved search created" });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access your buyer dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Buyer Dashboard | WashBizHub"
        description="Manage your saved searches, favorite listings, messages, and comparisons"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Buyer Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your search, favorites, and communications
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-favorites">{stats?.favoritesCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Watchlist items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-searches">{stats?.savedSearchesCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active alerts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-threads">{stats?.activeThreadsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active threads</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600" data-testid="stat-unread">{stats?.unreadMessages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Unread</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Comparisons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-comparisons">{stats?.comparisonsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="searches" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Searches</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="comparisons" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Quick actions to get started with your search</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 text-left justify-start" data-testid="button-create-search">
                      <Plus className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-semibold">Create Saved Search</div>
                        <div className="text-sm text-muted-foreground">Get email alerts for new listings</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 text-left justify-start" data-testid="button-browse">
                      <TrendingUp className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-semibold">Browse Listings</div>
                        <div className="text-sm text-muted-foreground">Explore available opportunities</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    No recent activity. Start exploring listings to begin!
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Searches Tab */}
            <TabsContent value="searches" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Saved Searches</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-search">
                      <Plus className="w-4 h-4 mr-2" />
                      New Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Saved Search</DialogTitle>
                      <DialogDescription>Set up alerts for new listings matching your criteria</DialogDescription>
                    </DialogHeader>
                    <SavedSearchForm />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {searches.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No saved searches yet. Create one to get started!
                    </CardContent>
                  </Card>
                ) : (
                  searches.map((search: SavedSearch) => (
                    <Card key={search.id} data-testid={`card-search-${search.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{search.name}</CardTitle>
                            <CardDescription>
                              {search.alertFrequency === "daily" && "Daily alerts"}
                              {search.alertFrequency === "weekly" && "Weekly alerts"}
                              {search.alertFrequency === "instant" && "Instant alerts"}
                            </CardDescription>
                          </div>
                          <Badge variant={search.isActive ? "default" : "outline"}>
                            {search.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <h2 className="text-2xl font-bold">Favorite Listings</h2>

              <div className="grid gap-4">
                {favorites.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No favorites yet. Add listings you like to your watchlist!
                    </CardContent>
                  </Card>
                ) : (
                  favorites.map((fav: any) => (
                    <Card key={fav.id} data-testid={`card-favorite-${fav.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="line-clamp-2">{fav.listing?.title || "Listing"}</CardTitle>
                            <CardDescription className="mt-1">
                              {fav.listing?.city}, {fav.listing?.region}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFavoriteMutation.mutate(fav.listingId)}
                            data-testid="button-remove-favorite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {fav.notes && (
                        <CardContent className="text-sm text-muted-foreground">
                          {fav.notes}
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <h2 className="text-2xl font-bold">Conversations</h2>

              <div className="grid gap-4">
                {messages.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No conversations yet. Contact sellers to inquire about listings.
                    </CardContent>
                  </Card>
                ) : (
                  messages.map((thread: BuyerMessageThread) => (
                    <Card key={thread.id} data-testid={`card-thread-${thread.id}`} className="hover-elevate cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{thread.subject}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {thread.lastMessagePreview}
                            </CardDescription>
                          </div>
                          {thread.buyerUnreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {thread.buyerUnreadCount}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(thread.lastMessageAt).toLocaleDateString()}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Comparisons Tab */}
            <TabsContent value="comparisons" className="space-y-6">
              <h2 className="text-2xl font-bold">Listing Comparisons</h2>

              <div className="grid gap-4">
                {comparisons.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No comparisons yet. Compare multiple listings side-by-side.
                    </CardContent>
                  </Card>
                ) : (
                  comparisons.map((comp: any) => (
                    <Card key={comp.id} data-testid={`card-comparison-${comp.id}`}>
                      <CardHeader>
                        <CardTitle>{comp.name}</CardTitle>
                        <CardDescription>{comp.listingIds.length} listings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {comp.notes && <p className="text-sm text-muted-foreground">{comp.notes}</p>}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function SavedSearchForm() {
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
    <div className="space-y-4">
      <div>
        <Label htmlFor="search-name">Search Name</Label>
        <Input
          id="search-name"
          placeholder="e.g., High ROI Laundromats"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-search-name"
        />
      </div>
      <div>
        <Label htmlFor="alert-freq">Alert Frequency</Label>
        <select
          id="alert-freq"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
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
        {mutation.isPending ? "Saving..." : "Save Search"}
      </Button>
    </div>
  );
}
