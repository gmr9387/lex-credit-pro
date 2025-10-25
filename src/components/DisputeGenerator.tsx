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
import { FileText, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { disputeFormSchema, type DisputeFormData } from "@/lib/validations";
import { analytics } from "@/lib/analytics";

interface DisputeGeneratorProps {
  userId: string;
  onSuccess?: () => void;
}

export const DisputeGenerator = ({ userId, onSuccess }: DisputeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [apiError, setApiError] = useState<{ message: string; code?: string } | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
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

  const handleEvidenceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive",
        });
        return;
      }
    }

    setEvidenceFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    const formValues = form.getValues();
    setUploadingEvidence(true);

    try {
      let evidenceUrls: string[] = [];

      // Upload evidence files if any
      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}_${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from('dispute-evidence')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          evidenceUrls.push(fileName);
        }
      }

      const { error } = await supabase
        .from('disputes')
        .insert({
          user_id: userId,
          bureau: formValues.bureau,
          letter_content: generatedLetter,
          status: 'draft',
          round_number: 1,
          evidence_urls: evidenceUrls,
        });

      if (error) throw error;

      analytics.disputeGenerated('draft', formValues.issueType);

      toast({
        title: "Saved!",
        description: "Dispute letter and evidence saved to your account",
      });

      if (onSuccess) onSuccess();

      // Reset form
      form.reset();
      setGeneratedLetter("");
      setEvidenceFiles([]);
      setApiError(null);

    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingEvidence(false);
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="evidence-upload" className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">Upload Supporting Evidence (Optional)</p>
                      <p className="text-xs text-muted-foreground">
                        Add documents, screenshots, or other evidence (Max 20MB per file)
                      </p>
                    </div>
                    <input
                      id="evidence-upload"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleEvidenceUpload}
                    />
                  </label>

                  {evidenceFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {evidenceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvidenceFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
              </div>
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
              <Button onClick={handleSave} disabled={uploadingEvidence} className="flex-1">
                {uploadingEvidence ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Letter'
                )}
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
