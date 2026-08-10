import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthGuard } from "./components/layout/AuthGuard";
import { AdminGuard } from "./components/layout/AdminGuard";
import { PlatformGuard } from "./components/layout/PlatformGuard";
import { PlatformLayout } from "./components/layout/PlatformLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { InscriptionPage } from "./pages/auth/InscriptionPage";
import { InvitationAccepterPage } from "./pages/auth/InvitationAccepterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { NouveauDossierPage } from "./pages/dossiers/NouveauDossierPage";
import { DossierDetailPage } from "./pages/dossiers/DossierDetailPage";
import { PortailClientPage } from "./pages/portail/PortailClientPage";
import { FacturationPage } from "./pages/facturation/FacturationPage";
import { WebhooksPage } from "./pages/webhooks/WebhooksPage";
import { EquipePage } from "./pages/admin/EquipePage";
import { TypesDossierPage } from "./pages/admin/TypesDossierPage";
import { PlatformLoginPage } from "./pages/platform/PlatformLoginPage";
import { PlatformDashboardPage } from "./pages/platform/PlatformDashboardPage";

export function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
      <Route path="/portail/:token" element={<PortailClientPage />} />
      <Route path="/invitation/:token" element={<InvitationAccepterPage />} />
      <Route path="/plateforme/connexion" element={<PlatformLoginPage />} />

      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dossiers/nouveau" element={<NouveauDossierPage />} />
        <Route path="/dossiers/:id" element={<DossierDetailPage />} />
        <Route path="/facturation" element={<FacturationPage />} />
        <Route path="/webhooks" element={<WebhooksPage />} />
        <Route
          path="/admin/equipe"
          element={
            <AdminGuard>
              <EquipePage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/types-dossier"
          element={
            <AdminGuard>
              <TypesDossierPage />
            </AdminGuard>
          }
        />
      </Route>

      <Route
        element={
          <PlatformGuard>
            <PlatformLayout />
          </PlatformGuard>
        }
      >
        <Route path="/plateforme" element={<PlatformDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
