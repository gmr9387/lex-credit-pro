import { DeadlineMonitor } from "@/components/DeadlineMonitor";
import { DisputeTracker } from "@/components/DisputeTracker";
export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <DeadlineMonitor />
      <DisputeTracker />
    </div>
  );
}
