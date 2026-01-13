import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Printer, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';
import { CFPBEscalationWizard } from './CFPBEscalationWizard';
import { generateDisputePDF } from '@/lib/exportUtils';

interface DisputeActionsProps {
  disputeId: string;
  bureau: string;
  letterContent: string;
  status: string;
  sentDate?: string | null;
  responseDeadline?: string | null;
  onUpdate: () => void;
}

export const DisputeActions = ({ 
  disputeId, 
  bureau, 
  letterContent, 
  status, 
  sentDate: existingSentDate,
  responseDeadline: existingDeadline,
  onUpdate 
}: DisputeActionsProps) => {
  const [sentDate, setSentDate] = useState<Date>();
  const [outcome, setOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [cfpbWizardOpen, setCfpbWizardOpen] = useState(false);
  const { toast } = useToast();

  const isOverdue = existingDeadline && new Date(existingDeadline) < new Date() && status !== 'resolved';

  const handleDownloadPDF = () => {
    try {
      generateDisputePDF(letterContent, bureau);
      toast({
        title: 'PDF Downloaded',
        description: `Dispute letter for ${bureau} saved as PDF`,
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Dispute Letter - ${bureau}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { font-size: 18px; margin-bottom: 20px; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <h1>Dispute Letter - ${bureau}</h1>
          <pre>${letterContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleMarkSent = async () => {
    if (!sentDate) {
      toast({ title: 'Please select a sent date', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Calculate deadline (30 days from sent date)
      const deadline = new Date(sentDate);
      deadline.setDate(deadline.getDate() + 30);

      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'sent',
          sent_date: sentDate.toISOString(),
          response_deadline: deadline.toISOString(),
        })
        .eq('id', disputeId);

      if (error) throw error;

      analytics.disputeMarkedSent(disputeId);

      toast({
        title: 'Dispute marked as sent',
        description: `Response deadline: ${deadline.toLocaleDateString()}`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error updating dispute',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!outcome.trim()) {
      toast({ title: 'Please enter an outcome', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          outcome,
          response_date: new Date().toISOString(),
        })
        .eq('id', disputeId);

      if (error) throw error;

      analytics.disputeResolved(disputeId);

      toast({
        title: 'Dispute marked as resolved',
        description: 'Outcome has been recorded',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error updating dispute',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>

      {status === 'draft' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Mark as Sent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Dispute as Sent</DialogTitle>
              <DialogDescription>
                Select the date you sent this dispute letter to {bureau}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sent Date</Label>
                <Calendar
                  mode="single"
                  selected={sentDate}
                  onSelect={setSentDate}
                  className="rounded-md border"
                  disabled={(date) => date > new Date()}
                />
              </div>
              <Button onClick={handleMarkSent} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Mark as Sent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {(status === 'sent' || status === 'pending_response') && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Dispute as Resolved</DialogTitle>
              <DialogDescription>
                Record the outcome of this dispute from {bureau}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="Describe the bureau's response and resolution..."
                  rows={4}
                />
              </div>
              <Button onClick={handleMarkResolved} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Mark as Resolved'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isOverdue && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setCfpbWizardOpen(true)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          CFPB Escalation
        </Button>
      )}
    </div>

    {existingSentDate && existingDeadline && (
      <CFPBEscalationWizard
        open={cfpbWizardOpen}
        onOpenChange={setCfpbWizardOpen}
        dispute={{
          id: disputeId,
          bureau,
          sent_date: existingSentDate,
          response_deadline: existingDeadline,
          letter_content: letterContent,
        }}
        onComplete={() => {
          setCfpbWizardOpen(false);
          onUpdate();
        }}
      />
    )}
    </>
  );
};
