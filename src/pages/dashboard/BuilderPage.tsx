import { NotificationCenter } from "@/components/NotificationCenter";
import { CreditBuilderTools } from "@/components/CreditBuilderTools";
export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <NotificationCenter />
      <CreditBuilderTools />
    </div>
  );
}
