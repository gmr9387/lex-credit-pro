import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, Shield, TrendingUp, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Credit Repair AI',
    description: 'This quick tour will help you understand how to use the platform to improve your credit score. You can skip this tour anytime or restart it from your settings.',
    icon: Shield,
  },
  {
    title: 'Upload Your Credit Report',
    description: 'Start by uploading your credit report PDF from Equifax, Experian, or TransUnion. Our AI will automatically scan it for errors and inaccuracies that could be hurting your score.',
    icon: Upload,
  },
  {
    title: 'Review Flagged Issues',
    description: 'The AI will identify potential issues like duplicate accounts, incorrect balances, obsolete information, and inaccuracies. Each item is scored by confidence level to help you prioritize.',
    icon: AlertCircle,
  },
  {
    title: 'Generate Dispute Letters',
    description: 'Select the issues you want to dispute and our AI will generate professional, legally compliant dispute letters. You can customize them before sending to the credit bureaus.',
    icon: FileText,
  },
  {
    title: 'Track Your Progress',
    description: 'Monitor your disputes, record your credit scores over time, and see projections based on your improvement trends. Stay organized with deadline reminders.',
    icon: TrendingUp,
  },
  {
    title: 'Get AI Guidance',
    description: 'Chat with our Credit Mentor AI anytime for personalized advice, explanations of credit concepts, and answers to your questions. Get smart recommendations based on your profile.',
    icon: MessageSquare,
  },
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenTour) {
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
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

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
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
                'Get Started'
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
