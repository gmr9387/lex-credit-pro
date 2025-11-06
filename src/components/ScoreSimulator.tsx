import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ScoreSimulator = () => {
  const [currentScore, setCurrentScore] = useState(650);
  const [payOffAmount, setPayOffAmount] = useState(50);
  const [itemsToRemove, setItemsToRemove] = useState(0);
  const [newAccounts, setNewAccounts] = useState(0);
  const { toast } = useToast();

  // Credit score impact algorithm (simplified)
  const calculateProjectedScore = () => {
    let projected = currentScore;
    
    // Pay off debt impact: ~5-15 points per 10% utilization reduction
    const debtImpact = Math.floor((payOffAmount / 10) * 1.2);
    projected += debtImpact;
    
    // Remove negative items: 10-30 points per item
    const removalImpact = itemsToRemove * 18;
    projected += removalImpact;
    
    // New accounts: -5 points per inquiry, but +10 long term
    const accountImpact = newAccounts * -3;
    projected += accountImpact;
    
    return Math.min(850, Math.max(300, Math.round(projected)));
  };

  const projectedScore = calculateProjectedScore();
  const scoreDiff = projectedScore - currentScore;
  const impactColor = scoreDiff > 0 ? "text-success" : scoreDiff < 0 ? "text-destructive" : "text-muted-foreground";

  const saveSimulation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("score_simulations").insert({
        user_id: user.id,
        simulation_data: {
          currentScore,
          payOffAmount,
          itemsToRemove,
          newAccounts,
          actions: [
            payOffAmount > 0 && `Pay off ${payOffAmount}% of debt`,
            itemsToRemove > 0 && `Remove ${itemsToRemove} negative items`,
            newAccounts > 0 && `Open ${newAccounts} new accounts`,
          ].filter(Boolean)
        },
        projected_score: projectedScore
      });

      if (error) throw error;

      toast({
        title: "Simulation Saved!",
        description: `Your ${projectedScore} score projection has been saved.`
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Credit Score Simulator
        </CardTitle>
        <CardDescription>
          See how different actions would impact your credit score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Score Display */}
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold">{currentScore}</div>
          <Progress value={(currentScore - 300) / 5.5} className="h-2" />
          <p className="text-sm text-muted-foreground">Current Score</p>
        </div>

        {/* Simulation Controls */}
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label>Pay Off Debt: {payOffAmount}% of total balance</Label>
            <Slider
              value={[payOffAmount]}
              onValueChange={(v) => setPayOffAmount(v[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower credit utilization improves your score
            </p>
          </div>

          <div className="space-y-3">
            <Label>Remove Negative Items: {itemsToRemove}</Label>
            <Slider
              value={[itemsToRemove]}
              onValueChange={(v) => setItemsToRemove(v[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Dispute and remove errors, late payments, collections
            </p>
          </div>

          <div className="space-y-3">
            <Label>Open New Credit Accounts: {newAccounts}</Label>
            <Slider
              value={[newAccounts]}
              onValueChange={(v) => setNewAccounts(v[0])}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Short-term dip, long-term benefit with on-time payments
            </p>
          </div>
        </div>

        {/* Projected Score */}
        <div className="rounded-lg bg-muted p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Projected Score</span>
            <div className={`flex items-center gap-2 ${impactColor} font-bold text-2xl`}>
              {scoreDiff > 0 && <TrendingUp className="w-5 h-5" />}
              {scoreDiff < 0 && <TrendingDown className="w-5 h-5" />}
              {scoreDiff === 0 && <Minus className="w-5 h-5" />}
              {projectedScore}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expected Change</span>
            <span className={`font-semibold ${impactColor}`}>
              {scoreDiff > 0 && "+"}{scoreDiff} points
            </span>
          </div>

          <Progress 
            value={(projectedScore - 300) / 5.5} 
            className="h-2"
          />

          {scoreDiff > 0 && (
            <p className="text-xs text-muted-foreground pt-2">
              💡 Timeline: Most improvements take 30-90 days to reflect on your report
            </p>
          )}
        </div>

        <Button onClick={saveSimulation} className="w-full" size="lg">
          Save This Simulation
        </Button>
      </CardContent>
    </Card>
  );
};