import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { InstallPrompt } from "./components/InstallPrompt";
import DashboardLayout from "./components/DashboardLayout";
import { Shield } from "lucide-react";
import {
  UploadPage, ReportsPage, IssuesPage, DisputesPage, ScoresPage,
  MentorPage, AdvisorPage, LearnPage, SimulatorPage, BuilderPage,
  TimelinePage, PayoffPage, GoodwillPage, ResponsesPage, WeeklyPage,
  AnalyticsPage, StoriesPage, GamificationPage, QuizPage, BatchPage,
  CalendarPage, JourneyPage, SubscriptionPage,
} from "./pages/dashboard";

const queryClient = new QueryClient();

function DashboardFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <Shield className="w-8 h-8 text-primary animate-pulse" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Suspense fallback={<DashboardFallback />}><UploadPage /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<DashboardFallback />}><ReportsPage /></Suspense>} />
              <Route path="issues" element={<Suspense fallback={<DashboardFallback />}><IssuesPage /></Suspense>} />
              <Route path="disputes" element={<Suspense fallback={<DashboardFallback />}><DisputesPage /></Suspense>} />
              <Route path="scores" element={<Suspense fallback={<DashboardFallback />}><ScoresPage /></Suspense>} />
              <Route path="mentor" element={<Suspense fallback={<DashboardFallback />}><MentorPage /></Suspense>} />
              <Route path="advisor" element={<Suspense fallback={<DashboardFallback />}><AdvisorPage /></Suspense>} />
              <Route path="learn" element={<Suspense fallback={<DashboardFallback />}><LearnPage /></Suspense>} />
              <Route path="simulator" element={<Suspense fallback={<DashboardFallback />}><SimulatorPage /></Suspense>} />
              <Route path="builder" element={<Suspense fallback={<DashboardFallback />}><BuilderPage /></Suspense>} />
              <Route path="timeline" element={<Suspense fallback={<DashboardFallback />}><TimelinePage /></Suspense>} />
              <Route path="payoff" element={<Suspense fallback={<DashboardFallback />}><PayoffPage /></Suspense>} />
              <Route path="goodwill" element={<Suspense fallback={<DashboardFallback />}><GoodwillPage /></Suspense>} />
              <Route path="responses" element={<Suspense fallback={<DashboardFallback />}><ResponsesPage /></Suspense>} />
              <Route path="weekly" element={<Suspense fallback={<DashboardFallback />}><WeeklyPage /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<DashboardFallback />}><AnalyticsPage /></Suspense>} />
              <Route path="stories" element={<Suspense fallback={<DashboardFallback />}><StoriesPage /></Suspense>} />
              <Route path="gamification" element={<Suspense fallback={<DashboardFallback />}><GamificationPage /></Suspense>} />
              <Route path="quiz" element={<Suspense fallback={<DashboardFallback />}><QuizPage /></Suspense>} />
              <Route path="batch" element={<Suspense fallback={<DashboardFallback />}><BatchPage /></Suspense>} />
              <Route path="calendar" element={<Suspense fallback={<DashboardFallback />}><CalendarPage /></Suspense>} />
              <Route path="journey" element={<Suspense fallback={<DashboardFallback />}><JourneyPage /></Suspense>} />
              <Route path="subscription" element={<Suspense fallback={<DashboardFallback />}><SubscriptionPage /></Suspense>} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
