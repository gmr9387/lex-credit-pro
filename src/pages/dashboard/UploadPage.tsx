import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Shield, Loader2 } from "lucide-react";
import { DisputeGenerator } from "@/components/DisputeGenerator";
import { analytics } from "@/lib/analytics";

export default function UploadPage() {
  const { user, awardAchievement } = useOutletContext<DashboardContext>();
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "File size must be less than 20MB", variant: "destructive" });
      event.target.value = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      toast({ title: "Invalid File Type", description: "Only PDF files are supported", variant: "destructive" });
      event.target.value = '';
      return;
    }

    setUploadingFile(true);
    toast({ title: "Uploading...", description: "Processing your credit report" });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('credit-reports').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: reportData, error: dbError } = await supabase
        .from('credit_reports')
        .insert({ user_id: user.id, file_url: fileName, file_name: file.name, status: 'analyzing' })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({ title: "Analyzing...", description: "AI is scanning your credit report for errors", duration: Infinity });

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-credit-report', {
          body: { reportText: base64, fileName: file.name },
        });

        if (analysisError) {
          await supabase.from('credit_reports').update({ status: 'error' }).eq('id', reportData.id);
          toast({ title: "Analysis Failed", description: "Could not analyze credit report.", variant: "destructive" });
          return;
        }

        if (analysisData?.flaggedItems?.length > 0) {
          const flaggedItems = analysisData.flaggedItems.map((item: any) => ({
            user_id: user.id, report_id: reportData.id, account_name: item.accountName,
            account_type: item.accountType || 'Unknown', issue_type: item.issueType,
            description: item.description, confidence_score: item.confidenceScore,
            balance: item.balance, date_opened: item.dateOpened,
          }));
          await supabase.from('flagged_items').insert(flaggedItems);
        }

        await supabase.from('credit_reports').update({ status: 'analyzed' }).eq('id', reportData.id);
        analytics.reportUploaded(file.name, file.size);
        awardAchievement('first_upload');
        toast({ title: "Analysis Complete!", description: `Found ${analysisData?.count || 0} potential issues to review` });
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message || "Failed to upload credit report", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Upload Credit Report</h2>
        <p className="text-muted-foreground">Upload and analyze your credit report with AI</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload Credit Report
          </CardTitle>
          <CardDescription>Upload your credit report for AI-powered analysis and error detection</CardDescription>
        </CardHeader>
        <CardContent>
          <label htmlFor="file-upload" className="block">
            <div className={`border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              {uploadingFile ? (
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              ) : (
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold mb-2">
                {uploadingFile ? 'Uploading & Analyzing...' : 'Drag & Drop Your Credit Report'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {uploadingFile ? 'Please wait while we process your report' : 'Supports PDF files from Experian, TransUnion, or Equifax (Max 20MB)'}
              </p>
              {!uploadingFile && (
                <Button type="button"><Upload className="w-4 h-4 mr-2" />Choose File</Button>
              )}
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploadingFile} />
          </label>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />Your Data is Secure
            </h4>
            <p className="text-sm text-muted-foreground">All files are encrypted and processed securely.</p>
          </div>
        </CardContent>
      </Card>
      <DisputeGenerator userId={user.id} />
    </div>
  );
}
