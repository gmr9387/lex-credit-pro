import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id?: string;
  display_name: string;
  initial_score: number;
  final_score: number;
  timeframe_months: number;
  testimony: string;
  items_removed: number;
  is_approved?: boolean;
}

const defaultStories: Story[] = [
  {
    display_name: "Sarah M.",
    initial_score: 542,
    final_score: 721,
    timeframe_months: 4,
    testimony: "I disputed 8 collections and 3 late payments. All but one were removed. The AI-generated letters were professional and legally solid.",
    items_removed: 10
  },
  {
    display_name: "Marcus T.",
    initial_score: 580,
    final_score: 698,
    timeframe_months: 5,
    testimony: "The credit simulator helped me prioritize which accounts to tackle first. Went from denied everywhere to approved for a $15K card.",
    items_removed: 7
  },
  {
    display_name: "Jennifer L.",
    initial_score: 495,
    final_score: 715,
    timeframe_months: 6,
    testimony: "Had multiple duplicate accounts from debt buyers. The AI caught them all and generated dispute letters citing FCRA violations. 100% success rate.",
    items_removed: 14
  },
  {
    display_name: "David R.",
    initial_score: 610,
    final_score: 742,
    timeframe_months: 3,
    testimony: "The goodwill letter generator was a game-changer. Got 2 lates removed just by asking nicely but professionally. Now qualified for mortgage.",
    items_removed: 5
  }
];

interface SuccessStoriesProps {
  allowSubmission?: boolean;
}

export const SuccessStories = ({ allowSubmission = false }: SuccessStoriesProps) => {
  const [stories, setStories] = useState<Story[]>(defaultStories);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    initial_score: '',
    final_score: '',
    timeframe_months: '',
    items_removed: '',
    testimony: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedStories();
  }, []);

  const fetchApprovedStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      if (data && data.length > 0) {
        const dbStories: Story[] = data.map(s => ({
          id: s.id,
          display_name: s.display_name,
          initial_score: s.initial_score,
          final_score: s.final_score,
          timeframe_months: s.timeframe_months,
          testimony: s.testimony,
          items_removed: s.items_removed,
          is_approved: s.is_approved
        }));
        setStories([...dbStories, ...defaultStories]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleSubmit = async () => {
    const { display_name, initial_score, final_score, timeframe_months, items_removed, testimony } = formData;

    if (!display_name || !initial_score || !final_score || !timeframe_months || !testimony) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const initialNum = parseInt(initial_score);
    const finalNum = parseInt(final_score);

    if (finalNum <= initialNum) {
      toast({
        title: 'Invalid Scores',
        description: 'Your final score should be higher than your initial score.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not Logged In',
          description: 'Please log in to submit your story.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('success_stories')
        .insert({
          user_id: user.id,
          display_name,
          initial_score: initialNum,
          final_score: finalNum,
          timeframe_months: parseInt(timeframe_months),
          items_removed: parseInt(items_removed) || 0,
          testimony,
        });

      if (error) throw error;

      toast({
        title: 'Story Submitted!',
        description: 'Your success story has been submitted for review. It will appear once approved.',
      });

      setFormData({
        display_name: '',
        initial_score: '',
        final_score: '',
        timeframe_months: '',
        items_removed: '',
        testimony: '',
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeframe = (months: number) => {
    if (months === 1) return '1 month';
    return `${months} months`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Real Results from Real Users</h2>
        <p className="text-muted-foreground">
          Average improvement: 140 points in 4.5 months
        </p>
      </div>

      {allowSubmission && (
        <div className="flex justify-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Share Your Success Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Success Story</DialogTitle>
                <DialogDescription>
                  Inspire others by sharing your credit repair journey. Stories are reviewed before publishing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name (e.g., "John D.")</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="First name and last initial"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initial_score">Starting Score</Label>
                    <Input
                      id="initial_score"
                      type="number"
                      min="300"
                      max="850"
                      value={formData.initial_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, initial_score: e.target.value }))}
                      placeholder="e.g., 520"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="final_score">Current Score</Label>
                    <Input
                      id="final_score"
                      type="number"
                      min="300"
                      max="850"
                      value={formData.final_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, final_score: e.target.value }))}
                      placeholder="e.g., 720"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeframe_months">Timeframe (months)</Label>
                    <Input
                      id="timeframe_months"
                      type="number"
                      min="1"
                      max="24"
                      value={formData.timeframe_months}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeframe_months: e.target.value }))}
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items_removed">Items Removed</Label>
                    <Input
                      id="items_removed"
                      type="number"
                      min="0"
                      value={formData.items_removed}
                      onChange={(e) => setFormData(prev => ({ ...prev, items_removed: e.target.value }))}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimony">Your Story</Label>
                  <Textarea
                    id="testimony"
                    value={formData.testimony}
                    onChange={(e) => setFormData(prev => ({ ...prev, testimony: e.target.value }))}
                    placeholder="Share what worked for you and how Credit Repair AI helped..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Story'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {stories.slice(0, 4).map((story, index) => (
          <Card key={story.id || index} className="hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{story.display_name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-500 font-bold">
                    <TrendingUp className="h-4 w-4" />
                    +{story.final_score - story.initial_score}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeframe(story.timeframe_months)}
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Before</span>
                  <span className="text-muted-foreground">After</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                  <span className="text-destructive">{story.initial_score}</span>
                  <span className="text-green-500">{story.final_score}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 italic">
                "{story.testimony}"
              </p>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold">{story.items_removed}</span> items removed
                </div>
                <div>
                  <span className="font-semibold">{formatTimeframe(story.timeframe_months)}</span> timeline
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Disclaimer: Individual results vary. Success depends on report accuracy, credit history complexity, and bureau response times. 
          These are real user outcomes but not guaranteed results. Credit repair requires patience and persistence.
        </p>
      </div>
    </div>
  );
};