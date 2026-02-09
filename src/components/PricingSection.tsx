import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Settings } from 'lucide-react';
import { useSubscription, STRIPE_PRO_PLAN } from '@/hooks/useSubscription';

const freeFeatures = [
  'Upload 1 credit report',
  'Basic AI analysis',
  'Generate 3 dispute letters/month',
  'Score tracking',
];

const proFeatures = [
  'Unlimited credit report uploads',
  'Advanced AI analysis & coaching',
  'Unlimited dispute letters',
  'Goodwill letter generator',
  'CFPB escalation wizard',
  'Score simulator & predictions',
  'Priority support',
  'Weekly action plans',
];

export const PricingSection = () => {
  const { isPro, subscribed, isLoading, handleCheckout, handleManageSubscription, subscriptionEnd } = useSubscription();

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Free Plan */}
      <Card className={`relative ${!isPro ? 'border-primary' : ''}`}>
        {!isPro && !isLoading && (
          <Badge className="absolute -top-3 left-4">Current Plan</Badge>
        )}
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>Get started with credit repair</CardDescription>
          <div className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Pro Plan */}
      <Card className={`relative ${isPro ? 'border-primary ring-2 ring-primary/20' : 'border-primary/50'}`}>
        {isPro && (
          <Badge className="absolute -top-3 left-4 bg-primary">Your Plan</Badge>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <CardTitle>Pro</CardTitle>
          </div>
          <CardDescription>Everything you need to repair your credit</CardDescription>
          <div className="text-3xl font-bold mt-2">${STRIPE_PRO_PLAN.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isLoading ? (
            <Button className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>
          ) : isPro ? (
            <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
              <Settings className="mr-2 h-4 w-4" />Manage Subscription
            </Button>
          ) : (
            <Button className="w-full" onClick={() => handleCheckout()}>
              <Crown className="mr-2 h-4 w-4" />Upgrade to Pro
            </Button>
          )}
        </CardFooter>
        {isPro && subscriptionEnd && (
          <p className="text-xs text-muted-foreground text-center pb-4">
            Renews {new Date(subscriptionEnd).toLocaleDateString()}
          </p>
        )}
      </Card>
    </div>
  );
};
