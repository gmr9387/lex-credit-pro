import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";

interface DisputeGeneratorProps {
  userId: string;
  onSuccess?: () => void;
}

export const DisputeGenerator = ({ userId, onSuccess }: DisputeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [balance, setBalance] = useState("");
  const [bureau, setBureau] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!accountName || !issueType || !description || !bureau) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-dispute-letter', {
        body: {
          itemDetails: {
            accountName,
            issueType,
            description,
            balance: balance ? parseFloat(balance) : null,
          },
          bureau,
          roundNumber: 1,
        },
      });

      if (error) throw error;

      setGeneratedLetter(data.letterContent);
      
      toast({
        title: "Letter Generated!",
        description: "Review your FCRA-compliant dispute letter below",
      });

    } catch (error: any) {
      console.error('Error generating letter:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate dispute letter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    try {
      const { error } = await supabase
        .from('disputes')
        .insert({
          user_id: userId,
          bureau,
          letter_content: generatedLetter,
          status: 'draft',
          round_number: 1,
        });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Dispute letter saved to your account",
      });

      if (onSuccess) onSuccess();

      // Reset form
      setAccountName("");
      setIssueType("");
      setDescription("");
      setBalance("");
      setBureau("");
      setGeneratedLetter("");

    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Dispute Letter
          </CardTitle>
          <CardDescription>
            AI will generate an FCRA-compliant dispute letter based on your input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name *</Label>
              <Input
                id="account-name"
                placeholder="e.g., ABC Collections"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bureau">Bureau *</Label>
              <Select value={bureau} onValueChange={setBureau}>
                <SelectTrigger id="bureau">
                  <SelectValue placeholder="Select bureau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experian">Experian</SelectItem>
                  <SelectItem value="transunion">TransUnion</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type *</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duplicate">Duplicate Reporting</SelectItem>
                  <SelectItem value="obsolete">Obsolete (&gt;7 years)</SelectItem>
                  <SelectItem value="inaccurate_balance">Inaccurate Balance</SelectItem>
                  <SelectItem value="identity_mismatch">Identity Mismatch</SelectItem>
                  <SelectItem value="unauthorized">Unauthorized Account</SelectItem>
                  <SelectItem value="other">Other Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Balance (Optional)</Label>
              <Input
                id="balance"
                type="number"
                placeholder="e.g., 1500"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description of Error *</Label>
            <Textarea
              id="description"
              placeholder="Describe the specific error or inaccuracy..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Letter...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate FCRA Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Dispute Letter</CardTitle>
            <CardDescription>
              Review and save your legally compliant dispute letter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-6 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {generatedLetter}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Letter
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(generatedLetter)}
              >
                Copy to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
