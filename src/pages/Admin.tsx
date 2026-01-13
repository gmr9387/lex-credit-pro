import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Activity, AlertCircle, Users, ArrowLeft, BarChart3, Trophy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";

interface SuccessStory {
  id: string;
  display_name: string;
  initial_score: number;
  final_score: number;
  timeframe_months: number;
  items_removed: number;
  testimony: string;
  is_approved: boolean;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadAdminData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load analytics events
      const { data: analyticsData } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setAnalytics(analyticsData || []);

      // Load error logs
      const { data: errorData } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setErrorLogs(errorData || []);

      // Load profiles for user management
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setUsers(profilesData || []);

      // Load success stories for moderation
      const { data: storiesData } = await supabase
        .from("success_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setStories(storiesData || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const handleApproveStory = async (storyId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("success_stories")
        .update({ is_approved: approve })
        .eq("id", storyId);

      if (error) throw error;

      setStories(prev => prev.map(s => 
        s.id === storyId ? { ...s, is_approved: approve } : s
      ));

      toast({
        title: approve ? "Story Approved" : "Story Rejected",
        description: approve ? "The story is now visible to all users" : "The story has been hidden",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System monitoring and management</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertCircle className="h-4 w-4 mr-2" />
              Error Logs
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="stories">
              <Trophy className="h-4 w-4 mr-2" />
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Events</CardTitle>
                <CardDescription>Recent user activity and events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.event_name}</TableCell>
                        <TableCell className="font-mono text-xs">{event.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell className="text-xs">
                          {event.event_data ? JSON.stringify(event.event_data).slice(0, 50) : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(event.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>Application errors and exceptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="max-w-md truncate">{log.error_message}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.component_name || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.user_id?.slice(0, 8) || "Anonymous"}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Registered users and their profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="font-mono text-xs">{user.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stories">
            <Card>
              <CardHeader>
                <CardTitle>Success Story Moderation</CardTitle>
                <CardDescription>Approve or reject user-submitted success stories</CardDescription>
              </CardHeader>
              <CardContent>
                {stories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No stories submitted yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Score Change</TableHead>
                        <TableHead>Timeframe</TableHead>
                        <TableHead>Testimony</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stories.map((story) => (
                        <TableRow key={story.id}>
                          <TableCell className="font-medium">{story.display_name}</TableCell>
                          <TableCell>
                            <span className="text-destructive">{story.initial_score}</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-500">{story.final_score}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (+{story.final_score - story.initial_score})
                            </span>
                          </TableCell>
                          <TableCell>{story.timeframe_months} months</TableCell>
                          <TableCell className="max-w-xs truncate">{story.testimony}</TableCell>
                          <TableCell>
                            <Badge variant={story.is_approved ? "default" : "secondary"}>
                              {story.is_approved ? "Approved" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!story.is_approved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => handleApproveStory(story.id, true)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {story.is_approved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive"
                                  onClick={() => handleApproveStory(story.id, false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
