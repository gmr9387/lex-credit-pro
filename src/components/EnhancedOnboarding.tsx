import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Shield, 
  TrendingUp, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  Target,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  tips: string[];
  action?: {
    label: string;
    tab?: string;
  };
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Credit Repair AI',
    subtitle: 'Your journey to better credit starts here',
    description: 'This platform uses AI to analyze your credit reports, identify errors, and generate legally-compliant dispute letters. Most users see results within 30-45 days.',
    icon: Shield,
    tips: [
      '🎯 Average user removes 3-5 negative items',
      '📈 Typical score increase: 50-100 points',
      '⚡ AI-powered analysis in seconds, not hours',
    ],
  },
  {
    title: 'Upload Your Credit Report',
    subtitle: 'Step 1 of your credit repair journey',
    description: 'Get your free credit reports from AnnualCreditReport.com, then upload the PDFs here. Our AI will scan for errors, duplicates, and inaccuracies.',
    icon: Upload,
    tips: [
      '📋 Supported: Equifax, Experian, TransUnion PDFs',
      '🔒 Bank-level encryption protects your data',
      '🤖 AI identifies issues in under 60 seconds',
    ],
    action: {
      label: 'Go to Upload',
      tab: 'upload',
    },
  },
  {
    title: 'Review Flagged Issues',
    subtitle: 'AI-identified problems on your report',
    description: 'Each flagged item shows the issue type, affected account, and a confidence score. Higher confidence = stronger dispute case.',
    icon: AlertCircle,
    tips: [
      '🔴 Red = High priority (dispute first)',
      '🟡 Yellow = Medium priority',
      '📊 Confidence score shows dispute success likelihood',
    ],
    action: {
      label: 'View Issues',
      tab: 'issues',
    },
  },
  {
    title: 'Generate Dispute Letters',
    subtitle: 'FCRA-compliant letters in one click',
    description: 'Select issues and generate professional dispute letters citing specific legal violations. Customize if needed, then send to credit bureaus.',
    icon: FileText,
    tips: [
      '⚖️ Letters cite 15 USC § 1681 (FCRA)',
      '📬 Track sent dates and deadlines automatically',
      '🔄 Round 2 & 3 letters escalate pressure',
    ],
    action: {
      label: 'Generate Letters',
      tab: 'disputes',
    },
  },
  {
    title: 'Track Your Progress',
    subtitle: 'Monitor scores and dispute outcomes',
    description: 'Log your credit scores over time, track dispute responses, and see your improvement trajectory. Set goals and celebrate milestones!',
    icon: TrendingUp,
    tips: [
      '📅 Log scores monthly for best tracking',
      '🏆 Earn achievement badges for progress',
      '📉 Visual charts show your credit journey',
    ],
    action: {
      label: 'View Scores',
      tab: 'scores',
    },
  },
  {
    title: 'Get AI Guidance',
    subtitle: 'Your personal credit coach',
    description: 'Chat with the Credit Mentor for personalized advice, explanations of credit concepts, and strategic recommendations based on your profile.',
    icon: MessageSquare,
    tips: [
      '💬 Ask anything about credit repair',
      '🧠 AI learns from your credit profile',
      '📚 Access educational resources anytime',
    ],
    action: {
      label: 'Chat with Mentor',
      tab: 'mentor',
    },
  },
  {
    title: "You're Ready!",
    subtitle: 'Start your credit repair journey',
    description: 'You now have all the tools to repair your credit. Start by uploading a credit report, and the AI will guide you from there.',
    icon: Sparkles,
    tips: [
      '🚀 Upload your first report to begin',
      '📧 Enable email alerts for deadline reminders',
      '🎯 Set a target score in the simulator',
    ],
  },
];

interface EnhancedOnboardingProps {
  onTabChange?: (tab: string) => void;
}

export const EnhancedOnboarding = ({ onTabChange }: EnhancedOnboardingProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const hasSeenTour = localStorage.getItem('hasSeenEnhancedOnboarding');
    if (hasSeenTour) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0]);
      }

      // Delay showing for smoother experience
      setTimeout(() => setOpen(true), 1500);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenEnhancedOnboarding', 'true');
    setOpen(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const action = steps[currentStep].action;
    if (action?.tab && onTabChange) {
      handleComplete();
      onTabChange(action.tab);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="mb-2">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Badge variant="secondary" className="mb-2">
              <Clock className="w-3 h-3 mr-1" />
              ~{steps.length - currentStep} min left
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {currentStep === 0 && userName ? `Welcome, ${userName}!` : step.title}
              </DialogTitle>
              <DialogDescription className="text-primary font-medium">
                {step.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{step.description}</p>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {step.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {step.action && (
            <Button variant="outline" className="w-full" onClick={handleAction}>
              <Zap className="w-4 h-4 mr-2" />
              {step.action.label}
            </Button>
          )}

          <Progress value={progress} className="h-2" />
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <Award className="h-4 w-4 mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
