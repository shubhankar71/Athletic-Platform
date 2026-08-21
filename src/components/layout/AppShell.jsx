import React, { useState, useEffect } from "react";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
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
  const { user, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronize active role view with authenticated user's actual role from AuthContext
  useEffect(() => {
    if (isAuthenticated && user?.role && role !== user.role) {
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role, role, setRole]);

  const ActiveDashboard = DASHBOARDS[role] || AthleteDashboard;
  const targetAllowedRole = [role];


  const handleNavigatePostAuth = (redirectUrl, userRole) => {
    if (userRole) {
      setRole(userRole);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar onOpenAuthModal={() => setIsAuthOpen(true)} />
      <main className="app-shell__content">
        <ProtectedRoute
          allowedRoles={targetAllowedRole}
          onOpenLogin={() => setIsAuthOpen(true)}
        >
          <ActiveDashboard onOpenAuthModal={() => setIsAuthOpen(true)} />
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
