import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Dispute {
  id: string;
  bureau: string;
  status: string;
  round_number: number;
  sent_date: string | null;
  response_deadline: string | null;
  outcome: string | null;
  created_at: string;
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

  if (loading) {
    return <div className="text-muted-foreground">Loading disputes...</div>;
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
              <Badge variant={getStatusColor(dispute.status || 'draft')}>
                {dispute.status || 'draft'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(dispute.response_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {dispute.outcome && (
                <div>
                  <p className="text-muted-foreground">Outcome</p>
                  <p className="font-medium">{dispute.outcome}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
