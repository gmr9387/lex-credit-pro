import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { ReactNode } from "react";

interface ProGateProps {
  children: ReactNode;
  featureName: string;
}

export const ProGate = ({ children, featureName }: ProGateProps) => {
  const { isPro, isLoading, handleCheckout } = useSubscription();

  if (isLoading) return null;

  if (isPro) return <>{children}</>;

  return (
    <Card className="border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Pro Feature
        </CardTitle>
        <CardDescription className="text-base">
          <strong>{featureName}</strong> is available exclusively for Pro subscribers.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Upgrade to Pro for $29/month to unlock all premium tools including batch disputes, score simulator, goodwill letters, advanced analytics, and more.
        </p>
        <Button onClick={() => handleCheckout()} size="lg" className="gap-2">
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
};
