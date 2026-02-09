import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const STRIPE_PRO_PLAN = {
  price_id: 'price_1Syt1UIbv0XVKztYJQ1763UV',
  product_id: 'prod_TwmaIZdRNnNGZB',
  name: 'Pro',
  price: 29,
};

interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({ isLoading: false, subscribed: false, productId: null, subscriptionEnd: null });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setState({
        isLoading: false,
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch (error) {
      console.error('Subscription check failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const handleCheckout = async (priceId: string = STRIPE_PRO_PLAN.price_id) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Checkout Error', description: 'Failed to start checkout. Please try again.', variant: 'destructive' });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({ title: 'Error', description: 'Failed to open subscription management.', variant: 'destructive' });
    }
  };

  return {
    ...state,
    checkSubscription,
    handleCheckout,
    handleManageSubscription,
    isPro: state.subscribed && state.productId === STRIPE_PRO_PLAN.product_id,
  };
}
