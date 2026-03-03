import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { CalendarDeadlineView } from "@/components/CalendarDeadlineView";
export default function CalendarPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <CalendarDeadlineView userId={user.id} />;
}
