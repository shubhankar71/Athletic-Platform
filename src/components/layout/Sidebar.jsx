import React from "react";
import { Activity, ShieldCheck, Zap, LogIn, LogOut, User, FileVideo, BarChart3, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import "./Sidebar.css";

export default function Sidebar({ onOpenAuthModal }) {
  const { user: authUser, isAuthenticated, logout, role: currentRole } = useAuth();
  const { setRole } = useRole();

  const activeUser = authUser;
  const initials = activeUser?.name
    ? activeUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  const handleRoleSelect = (r) => {
    setRole(r);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Activity size={22} strokeWidth={2.5} color="var(--accent-teal)" />
        <span className="sidebar__brand-name">FieldSignal</span>
      </div>

      {/* User Info Header */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">{initials}</div>
        <div>
          <p className="sidebar__user-name">{activeUser?.name || "Guest Visitor"}</p>
          <p className="sidebar__user-meta">
            {activeUser ? `${activeUser.email} (${activeUser.role.toUpperCase()})` : "Unauthenticated"}
          </p>
        </div>
      </div>

      {/* Dynamic Navigation Items */}
      <nav className="sidebar__switcher" aria-label="Main Navigation">
        <p className="eyebrow sidebar__switcher-label">
          {isAuthenticated ? `${currentRole.toUpperCase()} NAVIGATION` : "PLATFORM ACCESS"}
        </p>

        {/* Guest View */}
        {!isAuthenticated && (
          <>
            <button className="sidebar__nav-item sidebar__nav-item--active" onClick={onOpenAuthModal}>
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          </>
        )}

        {/* Athlete Navigation */}
        {isAuthenticated && currentRole === ROLES.ATHLETE && (
          <>
            <button
              className="sidebar__nav-item sidebar__nav-item--active"
              onClick={() => handleRoleSelect(ROLES.ATHLETE)}
            >
              <Zap size={16} color="var(--accent-teal)" />
              <span>Athlete Dashboard</span>
            </button>
            <button
              className="sidebar__nav-item"
              onClick={() => handleRoleSelect(ROLES.ATHLETE)}
            >
              <FileVideo size={16} color="var(--accent-teal)" />
              <span>Video Analysis</span>
            </button>
            <button
              className="sidebar__nav-item"
              onClick={() => handleRoleSelect(ROLES.ATHLETE)}
            >
              <BarChart3 size={16} color="var(--accent-teal)" />
              <span>My Analyses</span>
            </button>
          </>
        )}

        {/* Admin Navigation (STRICTLY NO Video Analysis!) */}
        {isAuthenticated && currentRole === ROLES.ADMIN && (
          <>
            <button
              className="sidebar__nav-item sidebar__nav-item--active"
              onClick={() => handleRoleSelect(ROLES.ADMIN)}
            >
              <ShieldCheck size={16} color="var(--accent-coral, #e63946)" />
              <span>Admin Dashboard</span>
            </button>
            <button
              className="sidebar__nav-item"
              onClick={() => handleRoleSelect(ROLES.ADMIN)}
            >
              <Settings size={16} color="var(--accent-coral, #e63946)" />
              <span>System Settings</span>
            </button>
          </>
        )}
      </nav>

      {/* Auth Status Footer */}
      <div className="sidebar__footer">
        {isAuthenticated ? (
          <div className="sidebar__auth-status">
            <div className="sidebar__badge authenticated">
              <User size={12} /> Logged in: <strong>{activeUser?.role}</strong>
            </div>
            <button className="sidebar__auth-btn logout" onClick={logout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        ) : (
          <div className="sidebar__auth-status">
            <div className="sidebar__badge unauthenticated">
              Authentication Required
            </div>
            <button className="sidebar__auth-btn login" onClick={onOpenAuthModal}>
              <LogIn size={16} /> Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
