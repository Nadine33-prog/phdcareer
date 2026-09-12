import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "@/pages/HomePage";
import MapPage from "@/pages/MapPage";
import CategoryDetailPage from "@/pages/CategoryDetailPage";
import JobsPage from "@/pages/JobsPage";
import JobDetailPage from "@/pages/JobDetailPage";
import InsightsPage from "@/pages/InsightsPage";
import ToolsHubPage from "@/pages/ToolsHubPage";
import ThresholdPage from "@/pages/ThresholdPage";
import WarningPage from "@/pages/WarningPage";
import AssessmentPage from "@/pages/AssessmentPage";
import AssessmentResultPage from "@/pages/AssessmentResultPage";
import LoginPage from "@/pages/LoginPage";
import UserCenterPage from "@/pages/UserCenterPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminJobsPage from "@/pages/admin/AdminJobsPage";
import AdminInsightsPage from "@/pages/admin/AdminInsightsPage";
import AdminWeightsPage from "@/pages/admin/AdminWeightsPage";
import AdminRulesPage from "@/pages/admin/AdminRulesPage";
import AdminBenchmarksPage from "@/pages/admin/AdminBenchmarksPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminThresholdNormPage from "@/pages/admin/AdminThresholdNormPage";
import UiGalleryPage from "@/pages/dev/UiGalleryPage";
import DesignStudio from "@/pages/dev/design/DesignStudio";
import { DesignFooter, DesignNav } from "@/pages/dev/design/chrome";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_token");
  if (!token) { window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname); return null; }
  try { const payload = JSON.parse(atob(token.split(".")[1])); if (payload.exp * 1000 < Date.now()) { localStorage.removeItem("admin_token"); window.location.href = "/login"; return null; } } catch { localStorage.removeItem("admin_token"); window.location.href = "/login"; return null; }
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Routes>
        {/* 管理后台 — 独立布局，不用前台 Nav */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="insights" element={<AdminInsightsPage />} />
          <Route path="weights" element={<AdminWeightsPage />} />
          <Route path="rules" element={<AdminRulesPage />} />
          <Route path="benchmarks" element={<AdminBenchmarksPage />} />
          <Route path="threshold-norm" element={<AdminThresholdNormPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* 设计预览，验收后可删 */}
        <Route path="/dev/ui" element={<UiGalleryPage />} />
        <Route path="/dev/design" element={<DesignStudio />} />
        <Route path="/dev/design/:screen" element={<DesignStudio />} />

        {/* 前台 — 统一 Nav + Footer 布局 */}
        <Route path="*" element={<FrontLayout />} />
      </Routes>
    </div>
  );
}

function FrontLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isFlush = pathname.startsWith("/tools") || pathname.startsWith("/careers") || pathname.startsWith("/jobs") || pathname.startsWith("/insights");

  const pages = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/careers" element={<MapPage />} />
      <Route path="/careers/:id" element={<CategoryDetailPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/tools" element={<ToolsHubPage />} />
      <Route path="/tools/threshold" element={<ThresholdPage />} />
      <Route path="/tools/threshold/result" element={<ThresholdPage />} />
      <Route path="/tools/warning" element={<WarningPage />} />
      <Route path="/tools/assessment" element={<AssessmentPage />} />
      <Route path="/tools/assessment/result" element={<AssessmentResultPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/me" element={<UserCenterPage />} />
    </Routes>
  );

  return (
    <div className={isHome ? "min-h-screen bg-cadmus-wine" : "min-h-screen bg-cadmus-cream"}>
      <div className={isHome ? "relative" : undefined} style={isHome ? { backgroundColor: "#5B0D1C" } : undefined}>
        <DesignNav tone={isHome ? "wine" : "cream"} narrow={isHome} flush={isFlush} />
        <main key={pathname} className={isHome ? undefined : "page-enter"}>
          {pages}
        </main>
      </div>
      <DesignFooter />
    </div>
  );
}
