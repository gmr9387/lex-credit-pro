import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, TrendingUp, Brain, Upload, AlertCircle, LogOut, MessageSquare, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DisputeGenerator } from "@/components/DisputeGenerator";
import { CreditReportList } from "@/components/CreditReportList";
import { FlaggedItemsList } from "@/components/FlaggedItemsList";
import { DisputeTracker } from "@/components/DisputeTracker";
import { ScoreTracker } from "@/components/ScoreTracker";
import { CreditMentor } from "@/components/CreditMentor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditRecommendations } from "@/components/CreditRecommendations";
import { EducationCenter } from "@/components/EducationCenter";
import { OnboardingTour } from "@/components/OnboardingTour";
import { EmailPreferences } from "@/components/EmailPreferences";
import { analytics } from "@/lib/analytics";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Only PDF files are supported",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    setUploadingFile(true);

    toast({
      title: "Uploading...",
      description: "Processing your credit report",
    });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('credit-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data: reportData, error: dbError } = await supabase
        .from('credit_reports')
        .insert({
          user_id: user.id,
          file_url: fileName,
          file_name: file.name,
          status: 'analyzing',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Analyzing...",
        description: "AI is scanning your credit report for errors",
        duration: Infinity,
      });

      // Parse PDF and analyze with AI
      try {
        // Get file for parsing
        const fileReader = new FileReader();
        
        fileReader.onload = async (e) => {
          const base64 = e.target?.result as string;
          
          // Call analyze edge function
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'analyze-credit-report',
            {
              body: {
                reportText: base64,
                fileName: file.name,
              },
            }
          );

          if (analysisError) {
            console.error('Analysis error:', analysisError);
            
            // Update status to analyzed but with error
            await supabase
              .from('credit_reports')
              .update({ status: 'error' })
              .eq('id', reportData.id);

            if (analysisError.message?.includes('429')) {
              toast({
                title: "Rate Limit Exceeded",
                description: "Please wait a moment and try uploading again.",
                variant: "destructive",
              });
            } else if (analysisError.message?.includes('402')) {
              toast({
                title: "AI Credits Depleted",
                description: "Please add credits to continue analysis.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Analysis Failed",
                description: "Could not analyze credit report. You can still view the file.",
                variant: "destructive",
              });
            }
            return;
          }

          // Insert flagged items
          if (analysisData?.flaggedItems && analysisData.flaggedItems.length > 0) {
            const flaggedItems = analysisData.flaggedItems.map((item: any) => ({
              user_id: user.id,
              report_id: reportData.id,
              account_name: item.accountName,
              account_type: item.accountType || 'Unknown',
              issue_type: item.issueType,
              description: item.description,
              confidence_score: item.confidenceScore,
              balance: item.balance,
              date_opened: item.dateOpened,
            }));

            const { error: flaggedError } = await supabase
              .from('flagged_items')
              .insert(flaggedItems);

            if (flaggedError) {
              console.error('Error inserting flagged items:', flaggedError);
            }
          }

          // Update report status
          await supabase
            .from('credit_reports')
            .update({ status: 'analyzed' })
            .eq('id', reportData.id);

          // Track analytics
          analytics.reportUploaded(file.name, file.size);

          toast({
            title: "Analysis Complete!",
            description: `Found ${analysisData?.count || 0} potential issues to review`,
          });
        };

        fileReader.readAsDataURL(file);

      } catch (parseError: any) {
        console.error('Parse error:', parseError);
        
        await supabase
          .from('credit_reports')
          .update({ status: 'uploaded' })
          .eq('id', reportData.id);

        toast({
          title: "Upload Successful",
          description: "File uploaded but automatic analysis is unavailable",
        });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload credit report",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Credit Repair AI</span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Your credit optimization command center</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Issues</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Disputes</span>
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Scores</span>
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Mentor</span>
            </TabsTrigger>
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Advisor</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Upload Credit Report
                </CardTitle>
                <CardDescription>
                  Upload your credit report for AI-powered analysis and error detection
                </CardDescription>
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
                      {uploadingFile 
                        ? 'Please wait while we process your report' 
                        : 'Supports PDF files from Experian, TransUnion, or Equifax (Max 20MB)'}
                    </p>
                    {!uploadingFile && (
                      <Button type="button">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </label>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Your Data is Secure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All files are encrypted and processed securely. Your credit information is protected.
                  </p>
                </div>
              </CardContent>
            </Card>

            {user && <DisputeGenerator userId={user.id} />}
          </TabsContent>

          <TabsContent value="reports">
            <CreditReportList />
          </TabsContent>

          <TabsContent value="issues">
            <FlaggedItemsList />
          </TabsContent>

          <TabsContent value="disputes">
            <DisputeTracker />
          </TabsContent>

          <TabsContent value="scores">
            <ScoreTracker />
          </TabsContent>

          <TabsContent value="mentor">
            <CreditMentor />
          </TabsContent>

          <TabsContent value="advisor">
            <CreditRecommendations />
          </TabsContent>

          <TabsContent value="learn">
            <EducationCenter />
          </TabsContent>
        </Tabs>
      </div>

      <OnboardingTour />
    </div>
  );
};

export default Dashboard;
