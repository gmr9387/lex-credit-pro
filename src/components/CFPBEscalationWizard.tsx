import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Scale,
  Clock,
  DollarSign,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CFPBEscalationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: {
    id: string;
    bureau: string;
    sent_date: string;
    response_deadline: string;
    letter_content: string;
  };
  onComplete: () => void;
}

const steps = [
  { title: 'Understand Your Rights', icon: Scale },
  { title: 'Prepare Evidence', icon: FileText },
  { title: 'File CFPB Complaint', icon: ExternalLink },
  { title: 'Track & Follow Up', icon: Clock },
];

export const CFPBEscalationWizard = ({ open, onOpenChange, dispute, onComplete }: CFPBEscalationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [checklist, setChecklist] = useState({
    understoodRights: false,
    gatheredEvidence: false,
    copiedLetter: false,
    filedComplaint: false,
    savedConfirmation: false,
  });
  const [complaintNumber, setComplaintNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const daysOverdue = Math.floor(
    (Date.now() - new Date(dispute.response_deadline).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleCopyLetter = async () => {
    const escalationText = `
CFPB COMPLAINT: Failure to Respond to Dispute

Bureau: ${dispute.bureau}
Original Dispute Date: ${new Date(dispute.sent_date).toLocaleDateString()}
Response Deadline: ${new Date(dispute.response_deadline).toLocaleDateString()}
Days Overdue: ${daysOverdue}

VIOLATION: 15 USC § 1681i(a)(1) - The credit reporting agency has failed to respond to my dispute within the legally mandated 30-day period.

REQUESTED REMEDY:
1. Immediate deletion of the disputed item(s)
2. Written confirmation of deletion
3. Updated credit report reflecting changes

ORIGINAL DISPUTE DETAILS:
${dispute.letter_content}
    `.trim();

    await navigator.clipboard.writeText(escalationText);
    setCopied(true);
    setChecklist(prev => ({ ...prev, copiedLetter: true }));
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied to Clipboard',
      description: 'CFPB complaint text ready to paste',
    });
  };

  const handleFiledComplaint = async () => {
    if (!complaintNumber.trim()) {
      toast({
        title: 'Enter Confirmation Number',
        description: 'Please enter your CFPB complaint confirmation number',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabase
        .from('disputes')
        .update({
          cfpb_complaint_filed: true,
          cfpb_complaint_date: new Date().toISOString(),
        })
        .eq('id', dispute.id);

      setChecklist(prev => ({ ...prev, filedComplaint: true, savedConfirmation: true }));
      
      toast({
        title: 'CFPB Complaint Recorded',
        description: `Confirmation #${complaintNumber} saved`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const progress = (currentStep / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Scale className="w-5 h-5 text-primary" />
                  Your Legal Rights Under FCRA
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Credit bureaus MUST respond within <strong>30 days</strong> (15 USC § 1681i)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Failure to respond = automatic <strong>deletion requirement</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Willful violations: <strong>$100-$1,000</strong> statutory damages per violation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>CFPB complaints receive <strong>priority response</strong> within 15 days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-semibold">{dispute.bureau} is {daysOverdue} days overdue</p>
                    <p className="text-sm text-muted-foreground">
                      Deadline was {new Date(dispute.response_deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="understood" 
                checked={checklist.understoodRights}
                onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, understoodRights: !!checked }))}
              />
              <label htmlFor="understood" className="text-sm cursor-pointer">
                I understand my rights and want to proceed with filing a CFPB complaint
              </label>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Before filing, ensure you have the following evidence ready:
            </p>

            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Original Dispute Letter</p>
                      <p className="text-sm text-muted-foreground">
                        Sent on {new Date(dispute.sent_date).toLocaleDateString()}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={handleCopyLetter}>
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Escalation Letter'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Proof of Delivery (if available)</p>
                      <p className="text-sm text-muted-foreground">
                        Certified mail receipt or email confirmation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Evidence of Harm (optional but recommended)</p>
                      <p className="text-sm text-muted-foreground">
                        Credit denials, higher interest rates, or other damages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="evidence" 
                checked={checklist.gatheredEvidence}
                onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, gatheredEvidence: !!checked }))}
              />
              <label htmlFor="evidence" className="text-sm cursor-pointer">
                I have gathered my evidence and am ready to file
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Steps to File Your CFPB Complaint:</h4>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <span>Click the button below to open the CFPB complaint portal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <span>Select "Credit reporting" as the product category</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <span>Choose "Problem with a credit reporting company's investigation"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <span>Paste the escalation letter (already copied) into the description</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">5</Badge>
                    <span>Upload your evidence documents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">6</Badge>
                    <span>Submit and save your confirmation number</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" asChild>
              <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open CFPB Complaint Portal
              </a>
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">CFPB Confirmation Number:</label>
              <Textarea 
                placeholder="Enter your confirmation number after filing..."
                value={complaintNumber}
                onChange={(e) => setComplaintNumber(e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-semibold">What Happens Next</p>
                    <p className="text-sm text-muted-foreground">Your complaint is now being processed</p>
                  </div>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Day 1-2</Badge>
                    <span>CFPB acknowledges receipt and forwards to {dispute.bureau}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Day 3-15</Badge>
                    <span>Bureau must respond to CFPB (faster than regular disputes!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Day 15+</Badge>
                    <span>You can review their response and dispute further if unsatisfied</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 Your Next Steps:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Check your email for CFPB updates</li>
                  <li>• Monitor your credit reports for changes</li>
                  <li>• Keep all documentation for potential legal action</li>
                  <li>• Consider consulting a consumer rights attorney</li>
                </ul>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              <Check className="w-4 h-4 mr-2" />
              Complete & Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return checklist.understoodRights;
      case 1:
        return checklist.gatheredEvidence && checklist.copiedLetter;
      case 2:
        return complaintNumber.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            CFPB Escalation for {dispute.bureau}
          </DialogTitle>
          <DialogDescription>
            File a formal complaint for failure to respond within legal timeframe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-1 ${i === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => {
                if (currentStep === 2) {
                  handleFiledComplaint();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed()}
            >
              {currentStep === 2 ? 'Save & Continue' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
