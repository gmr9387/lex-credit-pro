import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface OverdueDispute {
  id: string;
  bureau: string;
  sent_date: string;
  response_deadline: string;
  item_id: string | null;
  cfpb_complaint_filed: boolean;
}

export const DeadlineMonitor = () => {
  const [overdueDisputes, setOverdueDisputes] = useState<OverdueDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOverdueDisputes();
  }, []);

  const fetchOverdueDisputes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "sent")
        .lt("response_deadline", today)
        .is("outcome", null);

      if (error) throw error;
      setOverdueDisputes(data || []);
    } catch (error: any) {
      console.error("Error fetching overdue disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fileEscalation = async (disputeId: string, bureau: string) => {
    try {
      // Generate CFPB escalation letter
      const { data, error } = await supabase.functions.invoke("generate-dispute-letter", {
        body: {
          itemDetails: {
            accountName: "Bureau Non-Response",
            issueType: "Failure to Respond",
            description: `${bureau} failed to respond within 30 days as required by 15 USC § 1681i(a)(1)`
          },
          bureau,
          roundNumber: 2,
          isEscalation: true
        }
      });

      if (error) throw error;

      // Update dispute record
      await supabase
        .from("disputes")
        .update({
          cfpb_complaint_filed: true,
          cfpb_complaint_date: new Date().toISOString(),
          round_number: 2,
          letter_content: data.letterContent
        })
        .eq("id", disputeId);

      toast({
        title: "Escalation Letter Generated",
        description: `CFPB complaint letter created for ${bureau}`,
      });

      fetchOverdueDisputes();
    } catch (error: any) {
      toast({
        title: "Escalation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading deadline monitor...</p>
        </CardContent>
      </Card>
    );
  }

  if (overdueDisputes.length === 0) {
    return (
      <Card className="border-success/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Clock className="w-5 h-5" />
            All Deadlines Current
          </CardTitle>
          <CardDescription>
            No bureaus have missed their 30-day response deadline
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Overdue Responses: {overdueDisputes.length}
        </CardTitle>
        <CardDescription>
          These bureaus have exceeded the 30-day FCRA response deadline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueDisputes.map((dispute) => {
          const daysOverdue = Math.floor(
            (Date.now() - new Date(dispute.response_deadline).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={dispute.id}
              className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{dispute.bureau}</span>
                  <Badge variant="destructive">{daysOverdue} days overdue</Badge>
                  {dispute.cfpb_complaint_filed && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/50">
                      CFPB Escalation Filed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Sent: {new Date(dispute.sent_date).toLocaleDateString()} • 
                  Deadline: {new Date(dispute.response_deadline).toLocaleDateString()}
                </p>
              </div>

              {!dispute.cfpb_complaint_filed && (
                <Button
                  onClick={() => fileEscalation(dispute.id, dispute.bureau)}
                  size="sm"
                  variant="destructive"
                >
                  <Send className="w-4 h-4 mr-2" />
                  File CFPB Complaint
                </Button>
              )}
              
              {dispute.cfpb_complaint_filed && (
                <Button size="sm" variant="outline" asChild>
                  <a href={`https://www.consumerfinance.gov/complaint/`} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View CFPB Portal
                  </a>
                </Button>
              )}
            </div>
          );
        })}

        <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
          <p className="font-medium">📋 What Happens Next:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>File CFPB complaint citing 15 USC § 1681i(a)(1)</li>
            <li>Bureau must respond within 15 days to CFPB</li>
            <li>Potential penalty: $1,000 per violation</li>
            <li>Automatic removal if no response</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};