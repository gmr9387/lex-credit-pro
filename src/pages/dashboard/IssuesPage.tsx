import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { FlaggedItemsList } from "@/components/FlaggedItemsList";
export default function IssuesPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <FlaggedItemsList userId={user.id} />;
}
