import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Clock,
  Trash2,
  MoreVertical,
  Loader2,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  avatar: string | null;
  status: "active" | "invited" | "inactive";
  joinedAt: string;
  lastActive: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: "manager" | "staff";
  sentAt: string;
  expiresAt: string;
}

interface TeamProps {
  user: any;
}

export default function TeamManagementTab({ user }: TeamProps) {
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "staff">("staff");

  const isScale = user?.subscriptionTier === "scale" || user?.subscriptionTier === "summit";

  const teamMembers: TeamMember[] = [
    {
      id: "user_1",
      name: "John Owner",
      email: user?.email || "owner@example.com",
      role: "owner",
      avatar: null,
      status: "active",
      joinedAt: "2024-01-15",
      lastActive: "2024-12-10T15:30:00Z",
    },
    {
      id: "user_2",
      name: "Sarah Manager",
      email: "sarah@example.com",
      role: "manager",
      avatar: null,
      status: "active",
      joinedAt: "2024-06-01",
      lastActive: "2024-12-10T12:00:00Z",
    },
    {
      id: "user_3",
      name: "Mike Staff",
      email: "mike@example.com",
      role: "staff",
      avatar: null,
      status: "active",
      joinedAt: "2024-09-15",
      lastActive: "2024-12-09T18:00:00Z",
    },
  ];

  const pendingInvitations: Invitation[] = [
    {
      id: "inv_1",
      email: "newstaff@example.com",
      role: "staff",
      sentAt: "2024-12-08",
      expiresAt: "2024-12-15",
    },
  ];

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/team/invite", {
        email: inviteEmail,
        role: inviteRole,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("staff");
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest("DELETE", `/api/team/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Member Removed",
        description: "Team member has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await apiRequest("DELETE", `/api/team/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/team/members/${memberId}`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Role Updated",
        description: "Team member role has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-[#C8A661]" />;
      case "manager":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-[#C8A661] text-[#0A1628]">Owner</Badge>;
      case "manager":
        return <Badge variant="default">Manager</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isScale) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scale+ Feature</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Team management is available on Scale and Summit plans.
              Upgrade to invite team members and assign roles.
            </p>
            <Button data-testid="button-upgrade-for-team">
              Upgrade to Manage Team
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Users className="h-5 w-5 text-[#C8A661]" />
              </div>
              Team Members
            </CardTitle>
            <CardDescription>
              {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in your organization
            </CardDescription>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-invite-member">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    data-testid="input-invite-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "manager" | "staff")}>
                    <SelectTrigger data-testid="select-invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Staff
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {inviteRole === "manager"
                      ? "Managers can view reports, manage locations, and invite staff"
                      : "Staff can view assigned locations and basic reports"}
                  </p>
                </div>
                <Button
                  onClick={() => inviteMutation.mutate()}
                  disabled={!inviteEmail || inviteMutation.isPending}
                  className="w-full"
                  data-testid="button-send-invite"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`team-member-${member.id}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    {member.avatar && <AvatarImage src={member.avatar} />}
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      {getRoleBadge(member.role)}
                      {member.email === user?.email && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.lastActive && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active {new Date(member.lastActive).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {member.role !== "owner" && member.email !== user?.email && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-member-menu-${member.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateRoleMutation.mutate({
                          memberId: member.id,
                          role: member.role === "manager" ? "staff" : "manager",
                        })}
                      >
                        {member.role === "manager" ? (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Change to Staff
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Promote to Manager
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {member.name} from your organization. They will lose access to all data and features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg border-dashed"
                  data-testid={`invitation-${invitation.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{invitation.email}</h4>
                        {getRoleBadge(invitation.role)}
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(invitation.sentAt).toLocaleDateString()} • 
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => inviteMutation.mutate()}
                      data-testid={`button-resend-${invitation.id}`}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-cancel-invitation-${invitation.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-[#C8A661]" />
                <span className="font-medium">Owner</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Full access to all features, billing, and team management
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Manager</span>
              </div>
              <p className="text-xs text-muted-foreground">
                View reports, manage locations, invite staff members
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Staff</span>
              </div>
              <p className="text-xs text-muted-foreground">
                View assigned locations and basic operational reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
