import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, Download, Copy, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GoodwillLetterGenerator = () => {
  const [formData, setFormData] = useState({
    creditorName: "",
    accountNumber: "",
    latePaymentDate: "",
    reason: "",
    relationshipLength: "",
    positiveHistory: ""
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateLetter = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-goodwill-letter", {
        body: formData
      });

      if (error) throw error;

      setGeneratedLetter(data.letter);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("goodwill_letters").insert({
          user_id: user.id,
          creditor_name: formData.creditorName,
          account_number: formData.accountNumber,
          late_payment_date: formData.latePaymentDate,
          letter_content: data.letter,
          reason: formData.reason,
          relationship_length: formData.relationshipLength
        });
      }

      toast({
        title: "Letter Generated!",
        description: "Your personalized goodwill letter is ready"
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({ title: "Copied!", description: "Letter copied to clipboard" });
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goodwill-letter-${formData.creditorName.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Goodwill Letter Generator
          </CardTitle>
          <CardDescription>
            Generate AI-powered letters to request removal of accurate late payments based on your positive history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">📝 What is a Goodwill Letter?</p>
            <p className="text-muted-foreground">
              A goodwill letter is a formal request asking your creditor to remove accurate late payments from your credit report 
              as a gesture of goodwill, based on your otherwise positive payment history. Success rates vary but can be effective 
              for one-time mistakes.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditor">Creditor Name *</Label>
                <Input
                  id="creditor"
                  placeholder="e.g., Chase Bank"
                  value={formData.creditorName}
                  onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account Number (last 4 digits)</Label>
                <Input
                  id="account"
                  placeholder="e.g., 1234"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Late Payment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.latePaymentDate}
                  onChange={(e) => setFormData({ ...formData, latePaymentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">How Long Have You Been a Customer?</Label>
                <Input
                  id="relationship"
                  placeholder="e.g., 5 years"
                  value={formData.relationshipLength}
                  onChange={(e) => setFormData({ ...formData, relationshipLength: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Why Did the Late Payment Occur? *</Label>
              <Textarea
                id="reason"
                placeholder="Explain your circumstances honestly (e.g., medical emergency, job loss, family crisis). Be specific and sincere."
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Honesty matters. Explain the one-time nature of the situation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positive">Your Positive Payment History</Label>
              <Textarea
                id="positive"
                placeholder="Highlight your otherwise perfect record (e.g., 'I've made 60+ on-time payments before this incident' or 'Never missed a payment in 3 years')"
                rows={3}
                value={formData.positiveHistory}
                onChange={(e) => setFormData({ ...formData, positiveHistory: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={generateLetter}
            disabled={loading || !formData.creditorName || !formData.reason}
            className="w-full"
            size="lg"
          >
            {loading ? "Generating..." : "Generate Goodwill Letter"}
          </Button>
        </CardContent>
      </Card>

      {generatedLetter && (
        <Card className="border-success/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Goodwill Letter</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadLetter} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <CardDescription>
              Review, customize if needed, then mail via certified mail with return receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white text-black p-6 rounded-lg border font-mono text-sm whitespace-pre-wrap">
              {generatedLetter}
            </div>

            <div className="mt-6 bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">📬 Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Review and personalize the letter if needed</li>
                <li>Print on quality paper and sign in blue ink</li>
                <li>Mail via USPS Certified Mail with Return Receipt Requested</li>
                <li>Keep copies and tracking number for your records</li>
                <li>Follow up after 30 days if no response</li>
                <li>Success rate: ~30-40% for first-time offenders with good history</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
