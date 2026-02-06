import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, FileStack, Loader2, CheckCircle2 } from 'lucide-react';
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

interface FlaggedItemsListProps {
  userId?: string;
  onDisputesGenerated?: () => void;
}

const BUREAUS = ['experian', 'transunion', 'equifax'] as const;

export const FlaggedItemsList = ({ userId, onDisputesGenerated }: FlaggedItemsListProps) => {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedBureaus, setSelectedBureaus] = useState<Set<string>>(new Set(['experian', 'transunion', 'equifax']));
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
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

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleBureauSelection = (bureau: string) => {
    setSelectedBureaus(prev => {
      const next = new Set(prev);
      if (next.has(bureau)) {
        next.delete(bureau);
      } else {
        next.add(bureau);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const generateBatchDisputes = async () => {
    if (!userId || selectedItems.size === 0 || selectedBureaus.size === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select items and at least one bureau',
        variant: 'destructive',
      });
      return;
    }

    const selectedItemsList = items.filter(item => selectedItems.has(item.id));
    const bureausList = Array.from(selectedBureaus);
    const totalLetters = selectedItemsList.length * bureausList.length;

    setGenerating(true);
    setGenerationProgress({ current: 0, total: totalLetters });

    let successCount = 0;
    let errorCount = 0;

    for (const item of selectedItemsList) {
      for (const bureau of bureausList) {
        try {
          const { data: responseData, error } = await supabase.functions.invoke('generate-dispute-letter', {
            body: {
              itemDetails: {
                accountName: item.account_name,
                issueType: item.issue_type,
                description: item.description || `Disputing ${item.issue_type} for ${item.account_name}`,
                balance: item.balance || null,
                dateOpened: item.date_opened || null,
              },
              bureau,
              roundNumber: 1,
            },
          });

          if (error) throw error;

          // Save the dispute with reference to the flagged item
          const { error: saveError } = await supabase
            .from('disputes')
            .insert({
              user_id: userId,
              bureau,
              letter_content: responseData.letterContent,
              status: 'draft',
              round_number: 1,
              item_id: item.id,
            });

          if (saveError) throw saveError;

          successCount++;
        } catch (error: any) {
          console.error('Error generating letter for', item.account_name, bureau, error);
          errorCount++;
        }

        setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    }

    setGenerating(false);
    setSelectedItems(new Set());

    if (successCount > 0) {
      toast({
        title: 'Batch Generation Complete!',
        description: `Generated ${successCount} dispute letters${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      });
      if (onDisputesGenerated) onDisputesGenerated();
    } else {
      toast({
        title: 'Generation Failed',
        description: 'No letters were generated. Please try again.',
        variant: 'destructive',
      });
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

  const totalLettersToGenerate = selectedItems.size * selectedBureaus.size;

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

      {/* Batch Generation Controls */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileStack className="w-4 h-4" />
            Batch Dispute Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} of {items.length} items selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Send to:</span>
            {BUREAUS.map(bureau => (
              <div key={bureau} className="flex items-center gap-2">
                <Checkbox
                  id={`bureau-${bureau}`}
                  checked={selectedBureaus.has(bureau)}
                  onCheckedChange={() => toggleBureauSelection(bureau)}
                />
                <label htmlFor={`bureau-${bureau}`} className="text-sm capitalize cursor-pointer">
                  {bureau}
                </label>
              </div>
            ))}
          </div>

          {generating && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Generating letters... {generationProgress.current}/{generationProgress.total}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={generateBatchDisputes}
            disabled={generating || selectedItems.size === 0 || selectedBureaus.size === 0 || !userId}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating ({generationProgress.current}/{generationProgress.total})...
              </>
            ) : (
              <>
                <FileStack className="w-4 h-4 mr-2" />
                Generate {totalLettersToGenerate} Dispute Letters
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Flagged Items List */}
      {items.map((item) => (
        <Card 
          key={item.id} 
          className={`border-l-4 transition-colors cursor-pointer ${
            selectedItems.has(item.id) 
              ? 'border-l-primary bg-primary/5' 
              : 'border-l-destructive hover:bg-muted/50'
          }`}
          onClick={() => toggleItemSelection(item.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center gap-2">
                  {selectedItems.has(item.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <CardTitle className="text-lg">{item.account_name}</CardTitle>
                </div>
              </div>
              <Badge variant={selectedItems.has(item.id) ? 'default' : 'destructive'}>
                {item.issue_type}
              </Badge>
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
