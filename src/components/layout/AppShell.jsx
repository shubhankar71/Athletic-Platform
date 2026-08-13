import React, { useState } from "react";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import Sidebar from "./Sidebar.jsx";
import AthleteDashboard from "../athlete/AthleteDashboard.jsx";
import CoachDashboard from "../coach/CoachDashboard.jsx";
import AdminDashboard from "../admin/AdminDashboard.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import AuthModal from "../auth/AuthModal.jsx";
import "./AppShell.css";

const DASHBOARDS = {
  [ROLES.ATHLETE]: AthleteDashboard,
  [ROLES.COACH]: CoachDashboard,
  [ROLES.ADMIN]: AdminDashboard,
};

export default function AppShell() {
  const { role, setRole } = useRole();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const ActiveDashboard = DASHBOARDS[role] || AthleteDashboard;

  // Handle post-login programmatic redirection based on role
  const handleNavigatePostAuth = (redirectUrl, userRole) => {
    if (userRole && DASHBOARDS[userRole]) {
      setRole(userRole);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar onOpenAuthModal={() => setIsAuthOpen(true)} />
      <main className="app-shell__content">
        <ProtectedRoute
          allowedRoles={[role]}
          onOpenLogin={() => setIsAuthOpen(true)}
        >
          <ActiveDashboard />
        </ProtectedRoute>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigate={handleNavigatePostAuth}
      />
    </div>
  );
}
