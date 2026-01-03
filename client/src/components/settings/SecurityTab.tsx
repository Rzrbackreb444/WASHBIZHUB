import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Shield,
  Key,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  MapPin,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Check,
  X,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

function getPasswordStrength(password: string): { 
  label: string; 
  color: string; 
  bgColor: string; 
  progress: number;
  tips: string[];
} {
  if (!password) return { label: "", color: "", bgColor: "", progress: 0, tips: [] };
  
  let score = 0;
  const tips: string[] = [];
  
  if (password.length >= 8) score++;
  else tips.push("At least 8 characters");
  
  if (password.length >= 12) score++;
  
  if (/[A-Z]/.test(password)) score++;
  else tips.push("Add uppercase letter");
  
  if (/[a-z]/.test(password)) score++;
  else tips.push("Add lowercase letter");
  
  if (/[0-9]/.test(password)) score++;
  else tips.push("Add a number");
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else tips.push("Add special character (!@#$%)");
  
  if (score <= 2) return { 
    label: "Weak", 
    color: "text-red-500", 
    bgColor: "bg-red-500", 
    progress: 33,
    tips
  };
  if (score <= 4) return { 
    label: "Medium", 
    color: "text-amber-500", 
    bgColor: "bg-amber-500", 
    progress: 66,
    tips
  };
  return { 
    label: "Strong", 
    color: "text-green-500", 
    bgColor: "bg-green-500", 
    progress: 100,
    tips: []
  };
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginHistory {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ip: string;
  success: boolean;
}

interface SecurityProps {
  user: any;
}

export default function SecurityTab({ user }: SecurityProps) {
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSetPasswordForm, setShowSetPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const hasPassword = user?.hasPassword ?? true;
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const sessions: Session[] = [
    {
      id: "sess_1",
      device: "Desktop",
      browser: "Chrome 120",
      location: "New York, US",
      ip: "192.168.1.xxx",
      lastActive: "2024-12-10T15:30:00Z",
      isCurrent: true,
    },
    {
      id: "sess_2",
      device: "Mobile",
      browser: "Safari iOS",
      location: "New York, US",
      ip: "192.168.1.xxx",
      lastActive: "2024-12-09T10:15:00Z",
      isCurrent: false,
    },
  ];

  const loginHistory: LoginHistory[] = [
    {
      id: "log_1",
      timestamp: "2024-12-10T15:30:00Z",
      device: "Desktop - Chrome",
      location: "New York, US",
      ip: "192.168.1.xxx",
      success: true,
    },
    {
      id: "log_2",
      timestamp: "2024-12-09T10:15:00Z",
      device: "Mobile - Safari",
      location: "New York, US",
      ip: "192.168.1.xxx",
      success: true,
    },
    {
      id: "log_3",
      timestamp: "2024-12-08T22:45:00Z",
      device: "Desktop - Firefox",
      location: "Unknown",
      ip: "203.45.67.xxx",
      success: false,
    },
  ];

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/set-password", {
        newPassword,
        confirmPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowSetPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Password Set Successfully",
        description: "You can now sign in with email and password too!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("POST", `/api/auth/sessions/${sessionId}/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/sessions"] });
      toast({
        title: "Session Revoked",
        description: "The session has been logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke session",
        variant: "destructive",
      });
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/sessions/revoke-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/sessions"] });
      toast({
        title: "All Sessions Revoked",
        description: "All other sessions have been logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke sessions",
        variant: "destructive",
      });
    },
  });

  const toggleTwoFactorMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("POST", "/api/auth/two-factor", { enabled });
      return res.json();
    },
    onSuccess: (_, enabled) => {
      setTwoFactorEnabled(enabled);
      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled
          ? "Two-factor authentication is now active."
          : "Two-factor authentication has been disabled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update 2FA settings",
        variant: "destructive",
      });
    },
  });

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Laptop className="w-5 h-5" />;
  };

  const isChangePasswordValid = 
    newPassword.length >= 8 && 
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    newPassword === confirmPassword &&
    currentPassword.length > 0;

  const isSetPasswordValid = 
    newPassword.length >= 8 && 
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    newPassword === confirmPassword;

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(newPassword), text: "One number" },
  ];

  const PasswordStrengthIndicator = () => (
    newPassword ? (
      <div className="space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
        </div>
        <Progress value={passwordStrength.progress} className="h-1.5" />
        <div className="grid grid-cols-2 gap-1 mt-2">
          {passwordRequirements.map((req, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              {req.met ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Key className="h-5 w-5 text-[#C8A661]" />
            </div>
            Password
          </CardTitle>
          <CardDescription>
            {hasPassword 
              ? "Update your password to keep your account secure" 
              : "Add a password to enable email login alongside Google"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasPassword && !showSetPasswordForm ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <SiGoogle className="w-5 h-5 text-[#4285F4]" />
                <div>
                  <p className="text-sm font-medium">Signed in with Google</p>
                  <p className="text-xs text-muted-foreground">Add a password to also sign in with email</p>
                </div>
              </div>
              <Button onClick={() => setShowSetPasswordForm(true)} data-testid="button-set-password">
                <Plus className="w-4 h-4 mr-2" />
                Add Password for Email Login
              </Button>
            </div>
          ) : showSetPasswordForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPasswords(!showPasswords)}
                    data-testid="button-toggle-password"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <PasswordStrengthIndicator />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    data-testid="input-confirm-password"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPasswordMutation.mutate()}
                  disabled={!isSetPasswordValid || setPasswordMutation.isPending}
                  data-testid="button-save-password"
                >
                  {setPasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Set Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSetPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : showPasswordForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    data-testid="input-current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPasswords(!showPasswords)}
                    data-testid="button-toggle-password"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                  />
                </div>
                <PasswordStrengthIndicator />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => changePasswordMutation.mutate()}
                  disabled={!isChangePasswordValid || changePasswordMutation.isPending}
                  data-testid="button-save-password"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowPasswordForm(true)} data-testid="button-change-password">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${twoFactorEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                <Shield className={`h-5 w-5 ${twoFactorEnabled ? "text-green-600" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"} className={twoFactorEnabled ? "bg-green-600" : ""}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Protect your account with authenticator app"}
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => toggleTwoFactorMutation.mutate(checked)}
              disabled={toggleTwoFactorMutation.isPending}
              data-testid="switch-two-factor"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            When enabled, you'll need to enter a code from your authenticator app when signing in.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>Manage devices where you're currently logged in</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-logout-all">
                <LogOut className="w-4 h-4 mr-2" />
                Logout All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout All Sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out from all devices except the current one. You'll need to sign in again on those devices.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => revokeAllSessionsMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Logout All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`session-row-${session.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.device}</h4>
                      <span className="text-sm text-muted-foreground">• {session.browser}</span>
                      {session.isCurrent && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.lastActive).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSessionMutation.mutate(session.id)}
                    disabled={revokeSessionMutation.isPending}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-revoke-session-${session.id}`}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Login History
          </CardTitle>
          <CardDescription>Recent login activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div
                key={login.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`login-history-${login.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${login.success ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {login.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {login.success ? "Successful login" : "Failed login attempt"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{login.device}</span>
                      <span>• {login.location}</span>
                      <span>• {new Date(login.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={login.success ? "secondary" : "destructive"}>
                  {login.success ? "Success" : "Failed"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
