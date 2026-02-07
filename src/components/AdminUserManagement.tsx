import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Shield, 
  ShieldOff, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
  role?: string;
  reportCount?: number;
  disputeCount?: number;
  latestScore?: number;
}

interface UserDetails {
  reports: any[];
  disputes: any[];
  scores: any[];
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Load user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Load report counts
      const { data: reports } = await supabase
        .from("credit_reports")
        .select("user_id");

      // Load dispute counts
      const { data: disputes } = await supabase
        .from("disputes")
        .select("user_id");

      // Load latest scores
      const { data: scores } = await supabase
        .from("score_snapshots")
        .select("user_id, score, snapshot_date")
        .order("snapshot_date", { ascending: false });

      // Combine data
      const enrichedUsers = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        const userReports = reports?.filter(r => r.user_id === profile.user_id) || [];
        const userDisputes = disputes?.filter(d => d.user_id === profile.user_id) || [];
        const latestScore = scores?.find(s => s.user_id === profile.user_id);

        return {
          ...profile,
          role: userRole?.role || "user",
          reportCount: userReports.length,
          disputeCount: userDisputes.length,
          latestScore: latestScore?.score,
        };
      });

      setUsers(enrichedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "admin") {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;

        // Ensure user role exists
        await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "user" });

        toast({
          title: "Role Updated",
          description: "Admin privileges removed",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" });

        if (error) throw error;

        toast({
          title: "Role Updated",
          description: "Admin privileges granted",
        });
      }

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewUserDetails = async (user: UserData) => {
    setSelectedUser(user);
    setDetailsLoading(true);

    try {
      const [reportsRes, disputesRes, scoresRes] = await Promise.all([
        supabase
          .from("credit_reports")
          .select("*")
          .eq("user_id", user.user_id)
          .order("uploaded_at", { ascending: false })
          .limit(10),
        supabase
          .from("disputes")
          .select("*")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("score_snapshots")
          .select("*")
          .eq("user_id", user.user_id)
          .order("snapshot_date", { ascending: false })
          .limit(10),
      ]);

      setUserDetails({
        reports: reportsRes.data || [],
        disputes: disputesRes.data || [],
        scores: scoresRes.data || [],
      });
    } catch (error) {
      console.error("Error loading user details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage platform users ({users.length} total)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Disputes</TableHead>
                <TableHead>Latest Score</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {user.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : null}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {user.reportCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                      {user.disputeCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.latestScore ? (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                        {user.latestScore}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewUserDetails(user)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant={user.role === "admin" ? "destructive" : "outline"}
                        onClick={() => toggleAdminRole(user.user_id, user.role || "user")}
                      >
                        {user.role === "admin" ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedUser?.full_name}
              </DialogTitle>
              <DialogDescription>
                User ID: {selectedUser?.user_id}
              </DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="text-center py-8">Loading details...</div>
            ) : userDetails && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{userDetails.reports.length}</p>
                      <p className="text-sm text-muted-foreground">Reports</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{userDetails.disputes.length}</p>
                      <p className="text-sm text-muted-foreground">Disputes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">
                        {userDetails.scores[0]?.score || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">Latest Score</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Disputes */}
                <div>
                  <h4 className="font-medium mb-2">Recent Disputes</h4>
                  {userDetails.disputes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No disputes yet</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.disputes.slice(0, 5).map((dispute) => (
                        <div
                          key={dispute.id}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div>
                            <Badge variant="outline">{dispute.bureau}</Badge>
                            <span className="ml-2 text-sm">Round {dispute.round_number}</span>
                          </div>
                          <Badge
                            variant={
                              dispute.outcome === "removed"
                                ? "default"
                                : dispute.status === "sent"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {dispute.outcome || dispute.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score History */}
                <div>
                  <h4 className="font-medium mb-2">Score History</h4>
                  {userDetails.scores.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No scores recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.scores.slice(0, 5).map((score) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{score.score}</span>
                            {score.bureau && (
                              <Badge variant="outline">{score.bureau}</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(score.snapshot_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
