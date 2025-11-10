import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface BureauResponse {
  id: string;
  bureau: string;
  response_type: string;
  response_date: string | null;
  items_affected: any;
  next_action: string | null;
  notes: string | null;
  created_at: string;
}

interface Dispute {
  id: string;
  bureau: string;
  letter_content: string;
  status: string;
  sent_date: string | null;
}

export const BureauResponseTracker = () => {
  const [responses, setResponses] = useState<BureauResponse[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    disputeId: "",
    bureau: "",
    responseType: "",
    responseDate: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch responses
    const { data: responsesData } = await supabase
      .from("bureau_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (responsesData) setResponses(responsesData);

    // Fetch disputes
    const { data: disputesData } = await supabase
      .from("disputes")
      .select("id, bureau, letter_content, status, sent_date")
      .eq("status", "sent");

    if (disputesData) setDisputes(disputesData);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const nextAction = getNextAction(formData.responseType);

    const { error } = await supabase.from("bureau_responses").insert({
      user_id: user.id,
      dispute_id: formData.disputeId,
      bureau: formData.bureau,
      response_type: formData.responseType,
      response_date: formData.responseDate,
      notes: formData.notes,
      next_action: nextAction,
      items_affected: {}
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Update dispute status
    await supabase
      .from("disputes")
      .update({ 
        status: formData.responseType === "deleted" ? "resolved" : "pending",
        response_date: formData.responseDate
      })
      .eq("id", formData.disputeId);

    toast({
      title: "Response Logged!",
      description: `Next action: ${nextAction}`
    });

    setShowForm(false);
    setFormData({ disputeId: "", bureau: "", responseType: "", responseDate: "", notes: "" });
    fetchData();
  };

  const getNextAction = (responseType: string): string => {
    const actions: { [key: string]: string } = {
      deleted: "✅ Victory! Monitor your credit report to confirm deletion",
      verified: "📝 File second dispute with additional evidence or escalate to CFPB",
      updated: "🔍 Review the update - if still inaccurate, dispute again with proof",
      no_response: "📞 Follow up immediately - bureaus must respond within 30 days"
    };
    return actions[responseType] || "Review response and determine next steps";
  };

  const getResponseIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      deleted: <CheckCircle2 className="w-5 h-5 text-success" />,
      verified: <XCircle className="w-5 h-5 text-destructive" />,
      updated: <AlertCircle className="w-5 h-5 text-warning" />,
      no_response: <AlertCircle className="w-5 h-5 text-muted-foreground" />
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  const getResponseColor = (type: string) => {
    const colors: { [key: string]: string } = {
      deleted: "border-success/20 bg-success/5",
      verified: "border-destructive/20 bg-destructive/5",
      updated: "border-warning/20 bg-warning/5",
      no_response: "border-muted"
    };
    return colors[type] || "border-muted";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Bureau Response Tracker
              </CardTitle>
              <CardDescription>
                Log and track responses from credit bureaus to optimize your strategy
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Log Response
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Dispute</Label>
                    <Select value={formData.disputeId} onValueChange={(v) => setFormData({ ...formData, disputeId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose dispute" />
                      </SelectTrigger>
                      <SelectContent>
                        {disputes.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.bureau} - {d.sent_date ? new Date(d.sent_date).toLocaleDateString() : "Pending"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bureau</Label>
                    <Select value={formData.bureau} onValueChange={(v) => setFormData({ ...formData, bureau: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bureau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equifax">Equifax</SelectItem>
                        <SelectItem value="Experian">Experian</SelectItem>
                        <SelectItem value="TransUnion">TransUnion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Response Type</Label>
                    <Select value={formData.responseType} onValueChange={(v) => setFormData({ ...formData, responseType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="What happened?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deleted">✅ Item Deleted</SelectItem>
                        <SelectItem value="verified">❌ Item Verified (Not Removed)</SelectItem>
                        <SelectItem value="updated">🔄 Item Updated</SelectItem>
                        <SelectItem value="no_response">⏰ No Response Yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Date</Label>
                    <Input
                      type="date"
                      value={formData.responseDate}
                      onChange={(e) => setFormData({ ...formData, responseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any details about the response..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={!formData.disputeId || !formData.responseType}>
                    Save Response
                  </Button>
                  <Button onClick={() => setShowForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {responses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bureau responses logged yet</p>
              <p className="text-sm mt-2">Start tracking responses to optimize your dispute strategy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id} className={getResponseColor(response.response_type)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getResponseIcon(response.response_type)}</div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg capitalize">
                              {response.response_type.replace("_", " ")}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {response.bureau} • {response.response_date ? new Date(response.response_date).toLocaleDateString() : "Date not set"}
                            </p>
                          </div>
                          <Badge variant={response.response_type === "deleted" ? "default" : "secondary"}>
                            {response.bureau}
                          </Badge>
                        </div>

                        {response.notes && (
                          <p className="text-sm bg-background/50 rounded p-3">{response.notes}</p>
                        )}

                        {response.next_action && (
                          <div className="bg-primary/10 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-1">Next Action:</p>
                            <p>{response.next_action}</p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Logged {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">💡 Response Strategy Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Deleted:</strong> Huge win! Verify removal on all 3 bureaus within 30 days</li>
              <li><strong>Verified:</strong> Don't give up - re-dispute with stronger evidence or escalate to CFPB</li>
              <li><strong>Updated:</strong> Check if the update resolves the issue, if not, dispute again</li>
              <li><strong>No Response:</strong> Bureaus must respond in 30 days - follow up aggressively</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
