import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const chartData = snapshots.map((s) => ({
    date: new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.score,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Score History</h3>
          <p className="text-sm text-muted-foreground">Track your credit score progress over time</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[300, 850]} className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
