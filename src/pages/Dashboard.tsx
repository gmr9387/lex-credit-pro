import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, TrendingUp, Brain, Upload, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Credit Repair AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="outline">Sign Out</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Your credit optimization command center</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">---</div>
              <p className="text-xs text-muted-foreground mt-1">Upload report to track</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-success mt-1">Ready to start</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Items Flagged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Upload to analyze</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projected Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">+0</div>
              <p className="text-xs text-muted-foreground mt-1">Points potential</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="mirror" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="mirror" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Mirror</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Disputes</span>
            </TabsTrigger>
            <TabsTrigger value="score" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="rebuild" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Rebuild</span>
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Mentor</span>
            </TabsTrigger>
          </TabsList>

          {/* Credit Mirror Tab */}
          <TabsContent value="mirror" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Credit Mirror - Report Analysis
                </CardTitle>
                <CardDescription>
                  Upload your credit report for AI-powered analysis and error detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drag & Drop Your Credit Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF files from Experian, TransUnion, or Equifax
                  </p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Your Data is Secure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All files are encrypted with AES-256 and processed locally. Your credit information never leaves your control.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Clerk Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Legal Clerk - Dispute Generation
                </CardTitle>
                <CardDescription>
                  FCRA-compliant dispute letters generated automatically with legal citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Items to Dispute Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a credit report in the Mirror tab to identify disputable items
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="#mirror">Go to Credit Mirror</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ScoreVault Tab */}
          <TabsContent value="score" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  ScoreVault - Analytics & Predictions
                </CardTitle>
                <CardDescription>
                  Track your credit score journey and see projected improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Score tracking will appear here after your first upload</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rebuilder Tab */}
          <TabsContent value="rebuild" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Smart Rebuilder - Credit Building
                </CardTitle>
                <CardDescription>
                  Curated recommendations and payment optimization strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Personalized Recommendations Coming Soon</h3>
                  <p className="text-muted-foreground">
                    After analyzing your report, we'll suggest optimal credit-building strategies
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentor Tab */}
          <TabsContent value="mentor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Credit Mentor AI - Your Personal Coach
                </CardTitle>
                <CardDescription>
                  Ask questions, get strategies, and receive motivation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-96 border border-border rounded-lg p-4 overflow-y-auto bg-muted/30">
                    <div className="text-center py-20">
                      <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Start a conversation to get expert credit advice</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ask me anything about credit repair..."
                      className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
