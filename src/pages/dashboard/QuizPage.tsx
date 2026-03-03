import { useOutletContext } from "react-router-dom";
import { DashboardContext } from "@/components/DashboardLayout";
import { CreditEducationQuiz } from "@/components/CreditEducationQuiz";
export default function QuizPage() {
  const { user } = useOutletContext<DashboardContext>();
  return <CreditEducationQuiz userId={user.id} />;
}
