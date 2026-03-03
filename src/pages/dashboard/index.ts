import { lazy } from "react";

// Lazy-loaded dashboard pages
export const UploadPage = lazy(() => import("./UploadPage"));
export const ReportsPage = lazy(() => import("./ReportsPage"));
export const IssuesPage = lazy(() => import("./IssuesPage"));
export const DisputesPage = lazy(() => import("./DisputesPage"));
export const ScoresPage = lazy(() => import("./ScoresPage"));
export const MentorPage = lazy(() => import("./MentorPage"));
export const AdvisorPage = lazy(() => import("./AdvisorPage"));
export const LearnPage = lazy(() => import("./LearnPage"));
export const SimulatorPage = lazy(() => import("./SimulatorPage"));
export const BuilderPage = lazy(() => import("./BuilderPage"));
export const TimelinePage = lazy(() => import("./TimelinePage"));
export const PayoffPage = lazy(() => import("./PayoffPage"));
export const GoodwillPage = lazy(() => import("./GoodwillPage"));
export const ResponsesPage = lazy(() => import("./ResponsesPage"));
export const WeeklyPage = lazy(() => import("./WeeklyPage"));
export const AnalyticsPage = lazy(() => import("./AnalyticsPage"));
export const StoriesPage = lazy(() => import("./StoriesPage"));
export const GamificationPage = lazy(() => import("./GamificationPage"));
export const QuizPage = lazy(() => import("./QuizPage"));
export const BatchPage = lazy(() => import("./BatchPage"));
export const CalendarPage = lazy(() => import("./CalendarPage"));
export const JourneyPage = lazy(() => import("./JourneyPage"));
export const SubscriptionPage = lazy(() => import("./SubscriptionPage"));
