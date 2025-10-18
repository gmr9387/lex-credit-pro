import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { disputeFormSchema, type DisputeFormData } from "@/lib/validations";

interface DisputeGeneratorProps {
  userId: string;
  onSuccess?: () => void;
}

export const DisputeGenerator = ({ userId, onSuccess }: DisputeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [apiError, setApiError] = useState<{ message: string; code?: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<DisputeFormData>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      accountName: "",
      bureau: undefined,
      issueType: undefined,
      description: "",
      balance: "",
    },
  });

  const handleGenerate = async (data: DisputeFormData) => {
    setLoading(true);
    setApiError(null);

    try {
      const { data: responseData, error } = await supabase.functions.invoke('generate-dispute-letter', {
        body: {
          itemDetails: {
            accountName: data.accountName,
            issueType: data.issueType,
            description: data.description,
            balance: data.balance ? parseFloat(data.balance) : null,
          },
          bureau: data.bureau,
          roundNumber: 1,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          setApiError({ 
            message: 'Rate limit exceeded. Please wait a moment and try again.',
            code: 'RATE_LIMIT'
          });
        } else if (error.message?.includes('402')) {
          setApiError({ 
            message: 'AI credits depleted. Please add credits to continue.',
            code: 'CREDITS_DEPLETED'
          });
        } else {
          throw error;
        }
        return;
      }

      setGeneratedLetter(responseData.letterContent);
      
      toast({
        title: "Letter Generated!",
        description: "Review your FCRA-compliant dispute letter below",
      });

    } catch (error: any) {
      console.error('Error generating letter:', error);
      setApiError({
        message: error.message || "Failed to generate dispute letter",
        code: 'GENERATION_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    const formValues = form.getValues();

    try {
      const { error } = await supabase
        .from('disputes')
        .insert({
          user_id: userId,
          bureau: formValues.bureau,
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
      form.reset();
      setGeneratedLetter("");
      setApiError(null);

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
        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError.message}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Collections" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bureau"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bureau *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bureau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="experian">Experian</SelectItem>
                          <SelectItem value="transunion">TransUnion</SelectItem>
                          <SelectItem value="equifax">Equifax</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="duplicate">Duplicate Reporting</SelectItem>
                          <SelectItem value="obsolete">Obsolete (&gt;7 years)</SelectItem>
                          <SelectItem value="inaccurate_balance">Inaccurate Balance</SelectItem>
                          <SelectItem value="identity_mismatch">Identity Mismatch</SelectItem>
                          <SelectItem value="unauthorized">Unauthorized Account</SelectItem>
                          <SelectItem value="other">Other Error</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Error *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the specific error or inaccuracy..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
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
            </form>
          </Form>
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
