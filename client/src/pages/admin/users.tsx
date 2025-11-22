import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Crown, Shield, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isPro: boolean;
  isAdmin: boolean;
  subscriptionTier: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, { isAdmin });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "User role updated" });
    },
  });

  const toggleProMutation = useMutation({
    mutationFn: async ({ id, isPro }: { id: string; isPro: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, { isPro });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Pro status updated" });
    },
  });

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <Card key={u.id} data-testid={`card-user-${u.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email || u.id}
                      </CardTitle>
                      {u.isAdmin && (
                        <Badge variant="default" className="bg-red-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {u.isPro && (
                        <Badge variant="default" className="bg-purple-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                      <Badge variant="outline">{u.subscriptionTier}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {u.email} · @{u.username || 'no-username'} · Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProMutation.mutate({ id: u.id, isPro: !u.isPro })}
                      data-testid={`button-toggle-pro-${u.id}`}
                    >
                      <Crown className={`w-4 h-4 ${u.isPro ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminMutation.mutate({ id: u.id, isAdmin: !u.isAdmin })}
                      data-testid={`button-toggle-admin-${u.id}`}
                    >
                      <Shield className={`w-4 h-4 ${u.isAdmin ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
