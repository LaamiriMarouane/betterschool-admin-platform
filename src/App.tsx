import { Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoginPage } from "@/pages/auth/login.page";
import { SchoolsPage } from "@/pages/schools/schools.page";
import { SchoolDetailPage } from "@/pages/schools/school-detail.page";
import { PlansPage } from "@/pages/plans/plans.page";
import { TeamPage } from "@/pages/team/team.page";
import { ContactPage } from "@/pages/contact/contact.page";

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
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Placeholder titleKey="nav.dashboard" />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/:schoolId" element={<SchoolDetailPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="subscriptions" element={<Placeholder titleKey="nav.subscriptions" />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="contact-messages" element={<ContactPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
