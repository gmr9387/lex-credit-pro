import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Lightbulb, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { analytics } from '@/lib/analytics';

export const CreditRecommendations = () => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [creditProfile, setCreditProfile] = useState<any>(null);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('credit-recommendations');

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Please wait a moment and try again.',
            variant: 'destructive',
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: 'AI Credits Depleted',
            description: 'Please add credits to continue using AI features.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      setRecommendations(data.recommendations);
      setCreditProfile(data.creditProfile);
      
      analytics.recommendationsViewed();
      
      toast({
        title: 'Recommendations Generated',
        description: 'AI has analyzed your credit profile',
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Credit Advisor
              </CardTitle>
              <CardDescription>
                Get personalized recommendations based on your credit profile
              </CardDescription>
            </div>
            <Button onClick={generateRecommendations} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {creditProfile && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Current Score
                </div>
                <div className="text-2xl font-bold">{creditProfile.currentScore || 'N/A'}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <AlertCircle className="h-4 w-4" />
                  Issues Found
                </div>
                <div className="text-2xl font-bold">{creditProfile.flaggedItemsCount}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" />
                  Active Disputes
                </div>
                <div className="text-2xl font-bold">{creditProfile.disputesCount}</div>
              </div>
            </div>

            {recommendations && (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                  {recommendations}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {!recommendations && !loading && (
          <CardContent>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Click "Get Recommendations" to receive AI-powered insights on improving your credit score,
                prioritizing disputes, and building better credit habits.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
