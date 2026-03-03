import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { GamificationSystem } from "@/components/GamificationSystem";
export default function GamificationPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <GamificationSystem userId={user.id} />;
}
