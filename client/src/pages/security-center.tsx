import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SecurityBadge, DataProtectionNotice, SecurityBadgeRow } from "@/components/SecurityBadges";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Shield, Lock, Smartphone, Monitor, Globe, LogOut,
  CheckCircle, AlertTriangle, Clock, MapPin, Key,
  Fingerprint, Bell, Eye, EyeOff, RefreshCw, Trash2,
  ChevronRight, ExternalLink
} from "lucide-react";
import { SiGoogle, SiStripe } from "react-icons/si";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginActivity {
  id: string;
  action: string;
  device: string;
  location: string;
  timestamp: string;
  success: boolean;
}

interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  connectedAt: string;
  icon: typeof SiGoogle;
}

export default function SecurityCenter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C8A661]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const mockSessions: Session[] = [
    {
      id: "1",
      device: "MacBook Pro",
      browser: "Chrome 120",
      location: "New York, NY",
      ip: "192.168.1.***",
      lastActive: "Active now",
      isCurrent: true
    },
    {
      id: "2",
      device: "iPhone 15",
      browser: "Safari Mobile",
      location: "New York, NY",
      ip: "192.168.1.***",
      lastActive: "2 hours ago",
      isCurrent: false
    }
  ];

  const mockActivity: LoginActivity[] = [
    {
      id: "1",
      action: "Sign in",
      device: "MacBook Pro - Chrome",
      location: "New York, NY",
      timestamp: "Today at 2:34 PM",
      success: true
    },
    {
      id: "2",
      action: "Sign in",
      device: "iPhone 15 - Safari",
      location: "New York, NY",
      timestamp: "Yesterday at 10:15 AM",
      success: true
    },
    {
      id: "3",
      action: "Failed sign in attempt",
      device: "Unknown - Firefox",
      location: "Los Angeles, CA",
      timestamp: "3 days ago",
      success: false
    }
  ];

  const connectedAccounts: ConnectedAccount[] = [
    {
      id: "google",
      provider: "Google",
      email: user?.email || "user@example.com",
      connectedAt: "Connected",
      icon: SiGoogle
    }
  ];

  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: "Session revoked",
      description: "The device has been signed out successfully.",
    });
  };

  const handleRevokeAllSessions = () => {
    toast({
      title: "All sessions revoked",
      description: "All other devices have been signed out.",
    });
  };

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled 
        ? "Two-factor authentication is now active on your account."
        : "Two-factor authentication has been disabled.",
    });
  };

  return (
    <>
      <SEO
        title="Security Center | WashBizHub"
        description="Manage your account security settings, view login activity, and control connected devices."
        canonicalUrl="/security"
      />

      <div className="min-h-screen bg-muted/30 py-8 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Security Center
              </h1>
              <p className="text-muted-foreground">
                Manage your account security and monitor activity
              </p>
            </div>
            <SecurityBadgeRow badges={["ssl", "encrypted", "soc2"]} size="sm" />
          </div>

          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security Score</CardTitle>
                  <CardDescription>Your account security status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">A</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Excellent</p>
                    <p className="text-xs text-muted-foreground">Your account is well protected</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Email verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Strong password</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {twoFactorEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-muted-foreground">2FA {twoFactorEnabled ? "enabled" : "disabled"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Recent activity</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                  data-testid="switch-2fa"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Login Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone signs in to your account
                  </p>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                  data-testid="switch-login-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">New Device Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new device accesses your account
                  </p>
                </div>
                <Switch
                  checked={sessionAlerts}
                  onCheckedChange={setSessionAlerts}
                  data-testid="switch-session-alerts"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Active Sessions</CardTitle>
                    <CardDescription>Devices where you're currently signed in</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  className="text-destructive hover:text-destructive"
                  data-testid="button-revoke-all"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    data-testid={`session-${session.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                        {session.device.includes("iPhone") ? (
                          <Smartphone className="h-5 w-5 text-foreground" />
                        ) : (
                          <Monitor className="h-5 w-5 text-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">
                            {session.device}
                          </p>
                          {session.isCurrent && (
                            <Badge variant="secondary" className="text-[10px]">
                              This device
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.browser} · {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.lastActive} · IP: {session.ip}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-revoke-${session.id}`}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Login Activity</CardTitle>
                  <CardDescription>Recent account activity and sign-in history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border-b last:border-0"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.success 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {activity.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.device}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Connected Accounts</CardTitle>
                  <CardDescription>Third-party accounts linked to WashBizHub</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      data-testid={`account-${account.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{account.provider}</p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {account.connectedAt}
                      </Badge>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <SiStripe className="h-5 w-5 text-[#635BFF]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Stripe</p>
                      <p className="text-xs text-muted-foreground">Connect for POS payments</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-connect-stripe">
                    Connect
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <DataProtectionNotice />

          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Questions about security?{" "}
              <a href="/support" className="text-[#C8A661] hover:underline">
                Contact our security team
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
