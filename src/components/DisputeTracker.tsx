import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, CheckCircle, Clock, AlertCircle, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DisputeSkeleton } from '@/components/ui/skeletons';
import { DisputeActions } from './DisputeActions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExportButton } from './ExportButton';
import { formatDisputesForExport } from '@/lib/exportUtils';

interface Dispute {
  id: string;
  bureau: string;
  status: string;
  round_number: number;
  sent_date: string | null;
  response_deadline: string | null;
  response_date: string | null;
  outcome: string | null;
  letter_content: string;
  created_at: string;
  evidence_urls: string[] | null;
}

export const DisputeTracker = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading disputes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'pending_response':
        return 'secondary';
      case 'resolved':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const isDeadlineApproaching = (deadline: string | null) => {
    if (!deadline) return false;
    const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return <DisputeSkeleton />;
  }

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No disputes created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Disputes</h3>
          <p className="text-sm text-muted-foreground">Track all your credit dispute letters</p>
        </div>
        <ExportButton 
          data={disputes}
          filename="credit_disputes"
          formatter={formatDisputesForExport}
          label="Export Disputes"
        />
      </div>
      
      {disputes.map((dispute) => (
        <Card key={dispute.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{dispute.bureau} - Round {dispute.round_number}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(dispute.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dispute.response_deadline && isDeadlineApproaching(dispute.response_deadline) && (
                  <Badge variant="outline" className="text-chart-3">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Deadline Soon
                  </Badge>
                )}
                {dispute.response_deadline && isOverdue(dispute.response_deadline) && dispute.status !== 'resolved' && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
                <Badge variant={getStatusColor(dispute.status || 'draft')}>
                  {dispute.status || 'draft'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {dispute.sent_date && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-muted-foreground">Sent Date</p>
                    <p className="font-medium">{new Date(dispute.sent_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {dispute.response_deadline && (
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${isOverdue(dispute.response_deadline) ? 'text-destructive' : 'text-primary'}`} />
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(dispute.response_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {dispute.response_date && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-muted-foreground">Response Date</p>
                    <p className="font-medium">{new Date(dispute.response_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {dispute.outcome && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Outcome</p>
                <p className="text-sm text-muted-foreground">{dispute.outcome}</p>
              </div>
            )}

            {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Supporting Evidence ({dispute.evidence_urls.length})
                </p>
                <div className="space-y-1">
                  {dispute.evidence_urls.map((url, index) => (
                    <p key={index} className="text-xs text-muted-foreground truncate">
                      {url.split('/').pop()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Collapsible>
              <CollapsibleTrigger className="text-sm text-primary hover:underline">
                View Letter Content
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{dispute.letter_content}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <DisputeActions
              disputeId={dispute.id}
              bureau={dispute.bureau}
              letterContent={dispute.letter_content}
              status={dispute.status || 'draft'}
              onUpdate={fetchDisputes}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
