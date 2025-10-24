import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlaggedItemSkeleton } from '@/components/ui/skeletons';
import { ExportButton } from './ExportButton';
import { formatFlaggedItemsForExport } from '@/lib/exportUtils';

interface FlaggedItem {
  id: string;
  account_name: string;
  account_type: string;
  issue_type: string;
  description: string;
  confidence_score: number;
  balance: number;
  date_opened: string;
}

export const FlaggedItemsList = () => {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedItems();
  }, []);

  const fetchFlaggedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('flagged_items')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading flagged items',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FlaggedItemSkeleton />;
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-success mb-4" />
          <p className="text-muted-foreground">No issues detected - looking good!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Flagged Issues</h3>
          <p className="text-sm text-muted-foreground">Issues detected in your credit report</p>
        </div>
        <ExportButton 
          data={items}
          filename="flagged_credit_issues"
          formatter={formatFlaggedItemsForExport}
          label="Export Issues"
        />
      </div>
      
      {items.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-destructive">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">{item.account_name}</CardTitle>
              </div>
              <Badge variant="destructive">{item.issue_type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Account Type:</span>
                  <p className="font-medium">{item.account_type}</p>
                </div>
                {item.balance && (
                  <div>
                    <span className="text-muted-foreground">Balance:</span>
                    <p className="font-medium">${item.balance.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <p className="font-medium">{(item.confidence_score * 100).toFixed(0)}%</p>
                </div>
                {item.date_opened && (
                  <div>
                    <span className="text-muted-foreground">Date Opened:</span>
                    <p className="font-medium">{new Date(item.date_opened).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
