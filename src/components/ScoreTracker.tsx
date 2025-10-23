import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScoreAnalytics } from './ScoreAnalytics';

interface ScoreSnapshot {
  id: string;
  score: number;
  bureau: string;
  snapshot_date: string;
  notes: string | null;
}

export const ScoreTracker = () => {
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState('');
  const [bureau, setBureau] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('score_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      setSnapshots(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading scores',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('score_snapshots').insert({
        user_id: user.id,
        score: parseInt(score),
        bureau,
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: 'Score saved',
        description: 'Your credit score snapshot has been recorded.',
      });

      setScore('');
      setBureau('');
      setNotes('');
      setShowForm(false);
      fetchSnapshots();
    } catch (error: any) {
      toast({
        title: 'Error saving score',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Credit Score Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor and analyze your credit score progress</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Score
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Record New Score</CardTitle>
            <CardDescription>Add a credit score snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Credit Score</Label>
                  <Input
                    id="score"
                    type="number"
                    min="300"
                    max="850"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g., 720"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bureau">Bureau</Label>
                  <Select value={bureau} onValueChange={setBureau} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bureau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equifax">Equifax</SelectItem>
                      <SelectItem value="Experian">Experian</SelectItem>
                      <SelectItem value="TransUnion">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any changes or observations..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Score'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {snapshots.length > 0 ? (
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Analytics & Projections</TabsTrigger>
            <TabsTrigger value="history">Score History</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <ScoreAnalytics snapshots={snapshots} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>All Recorded Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">{snapshot.score}</div>
                        <div>
                          <p className="font-medium">{snapshot.bureau}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(snapshot.snapshot_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {snapshot.notes && (
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {snapshot.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No score snapshots yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
