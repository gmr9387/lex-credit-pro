import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileStack, Plus, Trash2, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface DisputeItem {
  id: string;
  accountName: string;
  issueType: string;
  description: string;
  balance: string;
  bureaus: string[];
}

interface BatchDisputeGeneratorProps {
  userId: string;
  onSuccess?: () => void;
}

const ISSUE_TYPES = [
  { value: 'duplicate', label: 'Duplicate Reporting' },
  { value: 'obsolete', label: 'Obsolete (>7 years)' },
  { value: 'inaccurate_balance', label: 'Inaccurate Balance' },
  { value: 'identity_mismatch', label: 'Identity Mismatch' },
  { value: 'unauthorized', label: 'Unauthorized Account' },
  { value: 'other', label: 'Other Error' },
];

const BUREAUS = ['experian', 'transunion', 'equifax'];

export const BatchDisputeGenerator = ({ userId, onSuccess }: BatchDisputeGeneratorProps) => {
  const [items, setItems] = useState<DisputeItem[]>([
    { id: '1', accountName: '', issueType: '', description: '', balance: '', bureaus: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [progress, setProgress] = useState<{ id: string; status: 'pending' | 'generating' | 'done' | 'error' }[]>([]);
  const { toast } = useToast();

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), accountName: '', issueType: '', description: '', balance: '', bureaus: [] },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof DisputeItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleBureau = (id: string, bureau: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const bureaus = item.bureaus.includes(bureau)
        ? item.bureaus.filter(b => b !== bureau)
        : [...item.bureaus, bureau];
      return { ...item, bureaus };
    }));
  };

  const isValid = (item: DisputeItem) => {
    return item.accountName && item.issueType && item.description && item.bureaus.length > 0;
  };

  const validItems = items.filter(isValid);
  const totalLetters = validItems.reduce((sum, item) => sum + item.bureaus.length, 0);

  const handleGenerate = async () => {
    if (validItems.length === 0) {
      toast({ title: 'No valid items', description: 'Please complete at least one dispute item', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setGeneratedCount(0);
    
    // Initialize progress tracking
    const progressItems = validItems.flatMap(item => 
      item.bureaus.map(bureau => ({ id: `${item.id}-${bureau}`, status: 'pending' as const }))
    );
    setProgress(progressItems);

    let successCount = 0;

    for (const item of validItems) {
      for (const bureau of item.bureaus) {
        const progressId = `${item.id}-${bureau}`;
        setProgress(prev => prev.map(p => p.id === progressId ? { ...p, status: 'generating' } : p));

        try {
          const { data: responseData, error } = await supabase.functions.invoke('generate-dispute-letter', {
            body: {
              itemDetails: {
                accountName: item.accountName,
                issueType: item.issueType,
                description: item.description,
                balance: item.balance ? parseFloat(item.balance) : null,
              },
              bureau,
              roundNumber: 1,
            },
          });

          if (error) throw error;

          // Save the dispute
          const { error: saveError } = await supabase
            .from('disputes')
            .insert({
              user_id: userId,
              bureau,
              letter_content: responseData.letterContent,
              status: 'draft',
              round_number: 1,
            });

          if (saveError) throw saveError;

          successCount++;
          setGeneratedCount(successCount);
          setProgress(prev => prev.map(p => p.id === progressId ? { ...p, status: 'done' } : p));

        } catch (error: any) {
          console.error('Error generating letter:', error);
          setProgress(prev => prev.map(p => p.id === progressId ? { ...p, status: 'error' } : p));
        }
      }
    }

    setLoading(false);
    
    if (successCount > 0) {
      toast({
        title: 'Batch Generation Complete!',
        description: `Successfully generated ${successCount} dispute letters`,
      });
      if (onSuccess) onSuccess();
    } else {
      toast({
        title: 'Generation Failed',
        description: 'No letters were generated. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="w-5 h-5 text-primary" />
            Batch Dispute Generator
          </CardTitle>
          <CardDescription>
            Generate multiple dispute letters at once for different accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item, index) => (
            <Card key={item.id} className="border-dashed">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account #{index + 1}</span>
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Name *</Label>
                    <Input
                      placeholder="e.g., ABC Collections"
                      value={item.accountName}
                      onChange={(e) => updateItem(item.id, 'accountName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Type *</Label>
                    <Select
                      value={item.issueType}
                      onValueChange={(value) => updateItem(item.id, 'issueType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ISSUE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the error or inaccuracy..."
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Balance (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1500"
                      value={item.balance}
                      onChange={(e) => updateItem(item.id, 'balance', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Send to Bureaus *</Label>
                    <div className="flex gap-4 pt-2">
                      {BUREAUS.map((bureau) => (
                        <div key={bureau} className="flex items-center gap-2">
                          <Checkbox
                            id={`${item.id}-${bureau}`}
                            checked={item.bureaus.includes(bureau)}
                            onCheckedChange={() => toggleBureau(item.id, bureau)}
                          />
                          <label
                            htmlFor={`${item.id}-${bureau}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {bureau}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {isValid(item) && (
                  <div className="flex gap-2">
                    {item.bureaus.map((bureau) => (
                      <Badge key={bureau} variant="secondary" className="capitalize">
                        <FileText className="w-3 h-3 mr-1" />
                        {bureau}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Account
          </Button>

          {progress.length > 0 && loading && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Generating letters...</span>
                    <span>{generatedCount}/{totalLetters}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {progress.map((p) => (
                      <Badge
                        key={p.id}
                        variant={
                          p.status === 'done' ? 'default' :
                          p.status === 'error' ? 'destructive' :
                          p.status === 'generating' ? 'secondary' :
                          'outline'
                        }
                      >
                        {p.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {p.status === 'done' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {p.id.split('-')[1]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {validItems.length} valid item(s) • {totalLetters} letter(s) to generate
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || totalLetters === 0}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating ({generatedCount}/{totalLetters})...
                </>
              ) : (
                <>
                  <FileStack className="w-4 h-4 mr-2" />
                  Generate {totalLetters} Letters
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
