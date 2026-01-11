import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, BellRing, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    // Only show prompt if permission hasn't been decided and not dismissed
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (Notification.permission === 'default' && !dismissed) {
      setTimeout(() => setShowPrompt(true), 10000); // Show after 10 seconds
    }
  }, []);

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register for push notifications
        const registration = await navigator.serviceWorker.ready;
        
        toast({
          title: 'Notifications Enabled',
          description: 'You\'ll receive alerts for dispute deadlines and important updates',
        });

        // Show a test notification
        new Notification('Credit Repair AI', {
          body: 'Notifications are now enabled! You\'ll stay informed about your credit journey.',
          icon: '/placeholder.svg',
        });
      } else if (result === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable them later in your browser settings',
          variant: 'destructive',
        });
      }

      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Could not enable notifications',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push-notification-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg animate-fade-in border-primary/20">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <BellRing className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg">Stay Updated</CardTitle>
        <CardDescription>
          Get notified about important deadlines and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Dispute deadline reminders
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Bureau response alerts
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Score change notifications
          </li>
        </ul>
        <div className="flex gap-2">
          <Button onClick={handleEnable} className="flex-1">
            <Bell className="h-4 w-4 mr-2" />
            Enable
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
