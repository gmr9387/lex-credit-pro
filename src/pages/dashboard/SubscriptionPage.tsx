import { PricingSection } from "@/components/PricingSection";
export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Upgrade to unlock all premium credit repair features</p>
      </div>
      <PricingSection />
    </div>
  );
}
