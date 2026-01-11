import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        toast({
          title: 'Back Online',
          description: 'Your connection has been restored',
        });
        setTimeout(() => setShowReconnected(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast({
        title: 'You\'re Offline',
        description: 'Some features may be unavailable',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, toast]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-fade-in">
      <Alert variant={isOnline ? 'default' : 'destructive'} className="shadow-lg">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <div className="flex-1">
            <AlertDescription>
              {isOnline 
                ? 'Connection restored! Syncing your data...'
                : 'You\'re offline. Changes will sync when reconnected.'
              }
            </AlertDescription>
          </div>
          {!isOnline && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};
