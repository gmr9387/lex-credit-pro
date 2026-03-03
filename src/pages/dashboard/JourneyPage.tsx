import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { ProGate } from "@/components/ProGate";
import { JourneyReportExport } from "@/components/JourneyReportExport";
export default function JourneyPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <ProGate featureName="Journey Report Export"><JourneyReportExport userId={user.id} /></ProGate>;
}
