import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Invalid credentials");
        return;
      }

      const data = await response.json();
      
      // Store admin session
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      toast({
        title: "Success",
        description: "Welcome to Admin Dashboard",
      });

      setLocation("/admin");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <Lock className="w-12 h-12 text-red-500" />
              <Badge className="absolute -top-2 -right-2 bg-red-600">Admin</Badge>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Restricted access for administrators only</p>
        </div>

        {/* Login Card */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Admin Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@washbizhub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-admin-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-admin-password"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 gap-2"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ This area is restricted to authorized administrators only. All access is logged and monitored.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
