import { Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RequirePermission } from "@/components/auth/require-permission";
import { LoginPage } from "@/pages/auth/login.page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password.page";
import { ResetPasswordPage } from "@/pages/auth/reset-password.page";
import { DashboardPage } from "@/pages/dashboard/dashboard.page";
import { ProfilePage } from "@/pages/profile/profile.page";
import { SchoolsPage } from "@/pages/schools/schools.page";
import { SchoolDetailPage } from "@/pages/schools/school-detail.page";
import { PlansPage } from "@/pages/plans/plans.page";
import { TeamPage } from "@/pages/team/team.page";
import { ContactPage } from "@/pages/contact/contact.page";
import { SupportTicketsPage } from "@/pages/support/support-tickets.page";
import { FeatureRequestsPage } from "@/pages/features/feature-requests.page";

function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <h1 className="text-lg font-semibold">{t(titleKey)}</h1>
      <p className="text-sm text-muted-foreground">{t("common.comingSoon")}</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="schools"
            element={
              <RequirePermission permission="platform.schools.read">
                <SchoolsPage />
              </RequirePermission>
            }
          />
          <Route
            path="schools/:schoolId"
            element={
              <RequirePermission permission="platform.schools.read">
                <SchoolDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="plans"
            element={
              <RequirePermission permission="platform.billing.read">
                <PlansPage />
              </RequirePermission>
            }
          />
          <Route
            path="subscriptions"
            element={
              <RequirePermission permission="platform.billing.read">
                <Placeholder titleKey="nav.subscriptions" />
              </RequirePermission>
            }
          />
          <Route
            path="team"
            element={
              <RequirePermission permission="platform.users.read">
                <TeamPage />
              </RequirePermission>
            }
          />
          <Route
            path="contact-messages"
            element={
              <RequirePermission permission="platform.contact.read">
                <ContactPage />
              </RequirePermission>
            }
          />
          <Route
            path="support-tickets"
            element={
              <RequirePermission permission="platform.support.read">
                <SupportTicketsPage />
              </RequirePermission>
            }
          />
          <Route
            path="feature-requests"
            element={
              <RequirePermission permission="platform.features.manage">
                <FeatureRequestsPage />
              </RequirePermission>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
