import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Target, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  action_type: string;
  priority: string;
  estimated_impact: number | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
}

export const WeeklyActionPlan = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const { data } = await supabase
      .from("action_plans")
      .select("*")
      .lte("due_date", weekFromNow.toISOString())
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true });

    if (data) setActions(data);
  };

  const toggleComplete = async (actionId: string, completed: boolean) => {
    const { error } = await supabase
      .from("action_plans")
      .update({ 
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null
      })
      .eq("id", actionId);

    if (!error) {
      fetchActions();
      if (!completed) {
        toast({
          title: "Nice work! 🎉",
          description: "Action completed. You're making progress!"
        });
      }
    }
  };

  const generateWeeklyPlan = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch user's current disputes, reports, etc.
      const { data: disputes } = await supabase
        .from("disputes")
        .select("*")
        .eq("status", "sent");

      const { data: reports } = await supabase
        .from("credit_reports")
        .select("*");

      const weeklyActions = [];
      const now = new Date();

      // Check for overdue dispute responses
      if (disputes && disputes.length > 0) {
        disputes.forEach((dispute: any) => {
          if (dispute.response_deadline) {
            const deadline = new Date(dispute.response_deadline);
            if (deadline < now) {
              weeklyActions.push({
                user_id: user.id,
                title: `Follow up on ${dispute.bureau} dispute`,
                description: "30+ days passed - call bureau or file CFPB complaint",
                action_type: "follow_up",
                priority: "high",
                estimated_impact: 25,
                due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
              });
            }
          }
        });
      }

      // Suggest credit building if no recent activity
      if (!reports || reports.length === 0) {
        weeklyActions.push({
          user_id: user.id,
          title: "Upload your credit reports",
          description: "Get free reports from AnnualCreditReport.com",
          action_type: "dispute",
          priority: "high",
          estimated_impact: 0,
          due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Add general credit building actions
      weeklyActions.push({
        user_id: user.id,
        title: "Check credit utilization",
        description: "Aim to pay down balances to under 30% utilization",
        action_type: "payment",
        priority: "medium",
        estimated_impact: 20,
        due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      weeklyActions.push({
        user_id: user.id,
        title: "Review dispute responses",
        description: "Log any mail received from credit bureaus",
        action_type: "follow_up",
        priority: "medium",
        estimated_impact: 0,
        due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      const { error } = await supabase.from("action_plans").insert(weeklyActions);

      if (!error) {
        toast({
          title: "Weekly Plan Created!",
          description: "Your personalized action plan is ready"
        });
        fetchActions();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completedActions = actions.filter(a => a.completed).length;
  const totalActions = actions.length;
  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  const totalImpact = actions
    .filter(a => !a.completed && a.estimated_impact)
    .reduce((sum, a) => sum + (a.estimated_impact || 0), 0);

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    };
    return colors[priority] || "secondary";
  };

  const getActionIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      dispute: "📝",
      payment: "💳",
      application: "📋",
      follow_up: "📞"
    };
    return icons[type] || "✅";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                This Week's Action Plan
              </CardTitle>
              <CardDescription>
                Prioritized tasks to maximize your credit score progress
              </CardDescription>
            </div>
            {actions.length === 0 && (
              <Button onClick={generateWeeklyPlan} disabled={loading}>
                {loading ? "Generating..." : "Generate Plan"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          {totalActions > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedActions}/{totalActions}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">+{totalImpact}</div>
                <div className="text-xs text-muted-foreground">Potential Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          )}

          {totalActions > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Progress</span>
                <span className="font-semibold">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          )}

          {/* Action Items */}
          {actions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No action plan yet</p>
              <p className="text-sm mt-2">Generate a personalized weekly plan based on your credit profile</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <Card
                  key={action.id}
                  className={`border ${action.completed ? "bg-muted/30 opacity-60" : "bg-card"}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={action.completed}
                        onCheckedChange={() => toggleComplete(action.id, action.completed)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getActionIcon(action.action_type)}</span>
                            <h4 className={`font-medium ${action.completed ? "line-through" : ""}`}>
                              {action.title}
                            </h4>
                          </div>
                          <Badge variant={getPriorityColor(action.priority) as any} className="text-xs">
                            {action.priority}
                          </Badge>
                        </div>

                        {action.description && (
                          <p className="text-sm text-muted-foreground pl-7">
                            {action.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pl-7">
                          {action.estimated_impact && action.estimated_impact > 0 && (
                            <span className="flex items-center gap-1 text-success font-medium">
                              <TrendingUp className="w-3 h-3" />
                              +{action.estimated_impact} pts
                            </span>
                          )}
                          {action.due_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due {formatDistanceToNow(new Date(action.due_date), { addSuffix: true })}
                            </span>
                          )}
                          {action.completed && action.completed_at && (
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed {formatDistanceToNow(new Date(action.completed_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalActions > 0 && completedActions === totalActions && (
            <Card className="bg-success/10 border-success/20">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
                <h3 className="text-lg font-semibold mb-2">Week Complete! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Excellent work! Generate next week's plan to keep the momentum going.
                </p>
                <Button onClick={generateWeeklyPlan} className="mt-4" disabled={loading}>
                  Generate Next Week
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
