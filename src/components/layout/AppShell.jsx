import React, { useState, useEffect } from "react";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import AthleteDashboard from "../athlete/AthleteDashboard.jsx";
import CoachDashboard from "../coach/CoachDashboard.jsx";
import AdminDashboard from "../admin/AdminDashboard.jsx";
import SystemSettings from "../admin/SystemSettings.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import AuthModal from "../auth/AuthModal.jsx";
import ReportModal from "../ui/ReportModal.jsx";
import CricketHome from "../public/CricketHome.jsx";
import "./AppShell.css";

export default function AppShell() {
  const { role, setRole } = useRole();
  const { user, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [adminView, setAdminView] = useState("dashboard"); // 'dashboard' or 'settings'
  const [coachTab, setCoachTab] = useState("roster");
  const [athleteTab, setAthleteTab] = useState("analysis");
  const [publicTab, setPublicTab] = useState("home");

  // Synchronize active role view with authenticated user's actual role from AuthContext
  useEffect(() => {
    if (isAuthenticated && user?.role && role !== user.role) {
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role, role, setRole]);

  const targetAllowedRole = [role];

  const handleNavigatePostAuth = (redirectUrl, userRole) => {
    if (userRole) {
      setRole(userRole);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
        adminView={adminView}
        setAdminView={setAdminView}
        coachTab={coachTab}
        setCoachTab={setCoachTab}
        athleteTab={athleteTab}
        setAthleteTab={setAthleteTab}
        publicTab={publicTab}
        setPublicTab={setPublicTab}
      />
      <main className="app-shell__content">
        {!isAuthenticated ? (
          <CricketHome
            onOpenAuthModal={() => setIsAuthOpen(true)}
            activeTabFilter={publicTab}
          />
        ) : (
          <ProtectedRoute
            allowedRoles={targetAllowedRole}
            onOpenLogin={() => setIsAuthOpen(true)}
          >
            {role === ROLES.ADMIN ? (
              adminView === "settings" ? (
                <SystemSettings />
              ) : (
                <AdminDashboard onNavigateSettings={() => setAdminView("settings")} />
              )
            ) : role === ROLES.COACH ? (
              <CoachDashboard
                onOpenReportModal={() => setIsReportOpen(true)}
                defaultTab={coachTab}
              />
            ) : (
              <AthleteDashboard
                onOpenAuthModal={() => setIsAuthOpen(true)}
                onOpenReportModal={() => setIsReportOpen(true)}
                defaultTab={athleteTab}
              />
            )}
          </ProtectedRoute>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigate={handleNavigatePostAuth}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
