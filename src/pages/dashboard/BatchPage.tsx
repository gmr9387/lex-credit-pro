import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { ProGate } from "@/components/ProGate";
import { BatchDisputeGenerator } from "@/components/BatchDisputeGenerator";
export default function BatchPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <ProGate featureName="Batch Dispute Generator"><BatchDisputeGenerator userId={user.id} /></ProGate>;
}
