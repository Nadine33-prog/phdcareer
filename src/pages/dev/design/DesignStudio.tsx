import { useParams } from "react-router-dom";
import {
  AdminBenchmarksScreen,
  AdminCatsScreen,
  AdminDashScreen,
  AdminInsightsScreen,
  AdminJobsScreen,
  AdminNormScreen,
  AdminRulesScreen,
  AdminUsersScreen,
  AdminWeightsScreen,
} from "./adminScreens";
import {
  CareerDetailScreen,
  CareersScreen,
  HomeScreen,
  LoginScreen,
  MeScreen,
} from "./frontScreens";
import { InsightsScreen } from "./insightScreens";
import { JobDetailScreen, JobsScreen } from "./jobScreens";
import {
  AssessmentScreen,
  ThresholdScreen,
  ToolsScreen,
  WarningScreen,
} from "./toolScreens";

function Screen({ id }: { id: string }) {
  switch (id) {
    case "home": return <HomeScreen />;
    case "careers": return <CareersScreen />;
    case "career-detail": return <CareerDetailScreen />;
    case "jobs": return <JobsScreen />;
    case "job-detail": return <JobDetailScreen />;
    case "insights": return <InsightsScreen />;
    case "tools": return <ToolsScreen />;
    case "threshold": return <ThresholdScreen />;
    case "threshold-result": return <ThresholdScreen result />;
    case "warning": return <WarningScreen />;
    case "assessment": return <AssessmentScreen />;
    case "assessment-result": return <AssessmentScreen result />;
    case "login": return <LoginScreen />;
    case "me": return <MeScreen />;
    case "admin-dash": return <AdminDashScreen />;
    case "admin-cats": return <AdminCatsScreen />;
    case "admin-jobs": return <AdminJobsScreen />;
    case "admin-insights": return <AdminInsightsScreen />;
    case "admin-weights": return <AdminWeightsScreen />;
    case "admin-rules": return <AdminRulesScreen />;
    case "admin-benchmarks": return <AdminBenchmarksScreen />;
    case "admin-norm": return <AdminNormScreen />;
    case "admin-users": return <AdminUsersScreen />;
    default: return <HomeScreen />;
  }
}

export default function DesignStudio() {
  const { screen = "home" } = useParams();
  return (
    <div className="min-h-screen bg-cadmus-cream">
      <Screen id={screen} />
    </div>
  );
}
