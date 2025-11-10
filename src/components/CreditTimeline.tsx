import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, TrendingUp, CheckCircle2, Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Milestone {
  id: string;
  milestone_type: string;
  target_score: number | null;
  target_date: string | null;
  achieved: boolean;
  achieved_at: string | null;
  description: string | null;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  action_type: string;
  priority: string;
  estimated_impact: number | null;
  due_date: string | null;
  completed: boolean;
}

export const CreditTimeline = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [currentScore, setCurrentScore] = useState(650);
  const [targetScore, setTargetScore] = useState(710);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch milestones
    const { data: milestonesData } = await supabase
      .from("credit_milestones")
      .select("*")
      .order("target_date", { ascending: true });

    if (milestonesData) setMilestones(milestonesData);

    // Fetch action plans
    const { data: plansData } = await supabase
      .from("action_plans")
      .select("*")
      .eq("completed", false)
      .order("due_date", { ascending: true })
      .limit(5);

    if (plansData) setActionPlans(plansData);

    // Fetch latest score
    const { data: scoreData } = await supabase
      .from("score_snapshots")
      .select("score")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    if (scoreData) setCurrentScore(scoreData.score);
  };

  const createInitialPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const initialActions = [
      {
        user_id: user.id,
        title: "Upload Credit Reports",
        description: "Get reports from all 3 bureaus to identify errors",
        action_type: "dispute",
        priority: "high",
        estimated_impact: 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: user.id,
        title: "Dispute Inaccurate Items",
        description: "File disputes for all flagged errors",
        action_type: "dispute",
        priority: "high",
        estimated_impact: 40,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: user.id,
        title: "Start Rent Reporting",
        description: "Sign up for RentTrack or similar service",
        action_type: "application",
        priority: "medium",
        estimated_impact: 35,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: user.id,
        title: "Open Secured Credit Card",
        description: "Apply for Discover or Capital One secured card",
        action_type: "application",
        priority: "medium",
        estimated_impact: 30,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const initialMilestones = [
      {
        user_id: user.id,
        milestone_type: "score_goal",
        target_score: 620,
        target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Reach Fair Credit (620+)"
      },
      {
        user_id: user.id,
        milestone_type: "score_goal",
        target_score: 670,
        target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Reach Good Credit (670+)"
      },
      {
        user_id: user.id,
        milestone_type: "score_goal",
        target_score: 710,
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Reach Target Score (710+)"
      }
    ];

    const { error: actionsError } = await supabase.from("action_plans").insert(initialActions);
    const { error: milestonesError } = await supabase.from("credit_milestones").insert(initialMilestones);

    if (!actionsError && !milestonesError) {
      toast({ title: "Success!", description: "Your personalized action plan has been created" });
      fetchData();
    }
  };

  const completeAction = async (actionId: string) => {
    const { error } = await supabase
      .from("action_plans")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", actionId);

    if (!error) {
      toast({ title: "Action Completed!", description: "Great progress! Keep going." });
      fetchData();
    }
  };

  const progress = Math.min(100, ((currentScore - 300) / (targetScore - 300)) * 100);
  const scoreGap = targetScore - currentScore;
  const estimatedDays = Math.ceil(scoreGap / 0.8); // ~0.8 points per day with aggressive strategy

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Credit Journey: {currentScore} → {targetScore}
          </CardTitle>
          <CardDescription>
            Estimated timeline: {estimatedDays} days ({Math.ceil(estimatedDays / 30)} months) with aggressive strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Target</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentScore}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">+{scoreGap}</div>
              <div className="text-xs text-muted-foreground">Points Needed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{targetScore}</div>
              <div className="text-xs text-muted-foreground">Target</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Week's Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              This Week's Actions
            </CardTitle>
            {actionPlans.length === 0 && (
              <Button onClick={createInitialPlan} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            )}
          </div>
          <CardDescription>Complete these to stay on track</CardDescription>
        </CardHeader>
        <CardContent>
          {actionPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No action plan yet. Click "Create Plan" to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actionPlans.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{action.title}</h4>
                      <Badge variant={action.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {action.estimated_impact && (
                        <span className="text-success font-medium">+{action.estimated_impact} pts</span>
                      )}
                      {action.due_date && (
                        <span>Due {formatDistanceToNow(new Date(action.due_date), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => completeAction(action.id)} size="sm" variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Credit Score Milestones
          </CardTitle>
          <CardDescription>Key targets on your journey to {targetScore}+</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  milestone.achieved ? "bg-success/10 border-success/20" : "bg-card"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  milestone.achieved ? "bg-success text-white" : "bg-muted"
                }`}>
                  {milestone.achieved ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{milestone.description}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {milestone.target_score && (
                      <span className="font-semibold text-foreground">{milestone.target_score} score</span>
                    )}
                    {milestone.target_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(milestone.target_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Achieved
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
