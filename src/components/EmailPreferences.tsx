import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    notify_analysis_complete: true,
    notify_dispute_deadline: true,
    notify_score_update: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no preferences exist, create default ones
        if (error.code === 'PGRST116') {
          await supabase.from('email_preferences').insert({
            user_id: user.id,
            notify_analysis_complete: true,
            notify_dispute_deadline: true,
            notify_score_update: true,
          });
        } else {
          throw error;
        }
      } else if (data) {
        setPreferences({
          notify_analysis_complete: data.notify_analysis_complete,
          notify_dispute_deadline: data.notify_dispute_deadline,
          notify_score_update: data.notify_score_update,
        });
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('email_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [key]: value }));
      toast({
        title: 'Preferences Updated',
        description: 'Your email notification preferences have been saved.',
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>Choose which email notifications you'd like to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="analysis-complete" className="flex-1">
            <div className="font-medium">Analysis Complete</div>
            <div className="text-sm text-muted-foreground">When your credit report analysis finishes</div>
          </Label>
          <Switch
            id="analysis-complete"
            checked={preferences.notify_analysis_complete}
            onCheckedChange={(checked) => updatePreference('notify_analysis_complete', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="dispute-deadline" className="flex-1">
            <div className="font-medium">Dispute Deadlines</div>
            <div className="text-sm text-muted-foreground">Reminders for upcoming response deadlines</div>
          </Label>
          <Switch
            id="dispute-deadline"
            checked={preferences.notify_dispute_deadline}
            onCheckedChange={(checked) => updatePreference('notify_dispute_deadline', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="score-update" className="flex-1">
            <div className="font-medium">Score Updates</div>
            <div className="text-sm text-muted-foreground">When you record a new credit score</div>
          </Label>
          <Switch
            id="score-update"
            checked={preferences.notify_score_update}
            onCheckedChange={(checked) => updatePreference('notify_score_update', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
