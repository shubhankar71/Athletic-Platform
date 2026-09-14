import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Zap,
  LogIn,
  LogOut,
  User,
  Settings,
  HelpCircle,
  History,
  Rss,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import { getUnresolvedCountApi } from "../../api/reportApi.js";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import "./Sidebar.css";

export default function Sidebar({
  onOpenAuthModal,
  onOpenReportModal,
  adminView = "dashboard",
  setAdminView,
  coachTab = "roster",
  setCoachTab,
  athleteTab = "analysis",
  setAthleteTab,
  publicTab = "home",
  setPublicTab,
}) {
  const { user: authUser, isAuthenticated, logout, role: currentRole } = useAuth();
  const { setRole } = useRole();
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  const activeUser = authUser;
  const initials = activeUser?.name
    ? activeUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  useEffect(() => {
    if (isAuthenticated && currentRole === ROLES.ADMIN) {
      async function loadBadge() {
        const count = await getUnresolvedCountApi();
        setUnresolvedCount(count);
      }
      loadBadge();
      const interval = setInterval(loadBadge, 15000); // refresh unresolved reports badge every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentRole]);

  const handleRoleSelect = (r) => {
    setRole(r);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand-row">
        <div className="sidebar__brand">
          <Activity size={22} strokeWidth={2.5} color="var(--accent-teal)" />
          <span className="sidebar__brand-name">FieldSignal</span>
        </div>
        <ThemeToggle compact={true} />
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
          {isAuthenticated ? `${currentRole.toUpperCase()} NAVIGATION` : "PUBLIC CRICKET"}
        </p>

        {/* Guest View Navigation (Requirement 2) */}
        {!isAuthenticated && (
          <>
            <button
              className={`sidebar__nav-item ${publicTab === "home" || !publicTab ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                setPublicTab?.("home");
                const el = document.getElementById("news-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Activity size={16} color="var(--accent-teal)" />
              <span>Cricket Home</span>
            </button>

            <button
              className={`sidebar__nav-item ${publicTab === "news" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                setPublicTab?.("news");
                const el = document.getElementById("news-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Rss size={16} color="var(--accent-teal)" />
              <span>Cricket News</span>
            </button>

            <button
              className={`sidebar__nav-item ${publicTab === "scores" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                setPublicTab?.("scores");
                const el = document.getElementById("scores-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Zap size={16} color="var(--accent-coral)" />
              <span>Live Scores</span>
            </button>

            <button
              className={`sidebar__nav-item ${publicTab === "opps" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                setPublicTab?.("opps");
                const el = document.getElementById("opp-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <User size={16} color="var(--accent-teal)" />
              <span>Opportunities</span>
            </button>
          </>
        )}

        {/* Athlete Navigation */}
        {isAuthenticated && currentRole === ROLES.ATHLETE && (
          <>
            <button
              className={`sidebar__nav-item ${athleteTab === "analysis" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                handleRoleSelect(ROLES.ATHLETE);
                setAthleteTab?.("analysis");
              }}
            >
              <Zap size={16} color="var(--accent-teal)" />
              <span>Athlete Dashboard</span>
            </button>

            <button
              className={`sidebar__nav-item ${athleteTab === "feed" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                handleRoleSelect(ROLES.ATHLETE);
                setAthleteTab?.("feed");
              }}
            >
              <Rss size={16} color="var(--accent-teal)" />
              <span>Opportunities</span>
            </button>

            <button
              className={`sidebar__nav-item ${athleteTab === "history" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                handleRoleSelect(ROLES.ATHLETE);
                setAthleteTab?.("history");
              }}
            >
              <History size={16} color="var(--accent-teal)" />
              <span>History</span>
            </button>

            <button
              className="sidebar__nav-item"
              onClick={onOpenReportModal}
            >
              <HelpCircle size={16} color="var(--accent-coral)" />
              <span>Report Issue / Support</span>
            </button>
          </>
        )}

        {/* Coach Navigation */}
        {isAuthenticated && currentRole === ROLES.COACH && (
          <>
            <button
              className={`sidebar__nav-item ${coachTab !== "history" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                handleRoleSelect(ROLES.COACH);
                setCoachTab?.("roster");
              }}
            >
              <Zap size={16} color="var(--accent-teal)" />
              <span>Coach Dashboard</span>
            </button>

            <button
              className={`sidebar__nav-item ${coachTab === "history" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => {
                handleRoleSelect(ROLES.COACH);
                setCoachTab?.("history");
              }}
            >
              <History size={16} color="var(--accent-teal)" />
              <span>History</span>
            </button>

            <button
              className="sidebar__nav-item"
              onClick={onOpenReportModal}
            >
              <HelpCircle size={16} color="var(--accent-coral)" />
              <span>Report Issue / Support</span>
            </button>
          </>
        )}

        {/* Admin Navigation */}
        {isAuthenticated && currentRole === ROLES.ADMIN && (
          <>
            <button
              className={`sidebar__nav-item ${adminView === "dashboard" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => setAdminView && setAdminView("dashboard")}
            >
              <ShieldCheck size={16} color="var(--accent-coral)" />
              <span>Admin Dashboard</span>
            </button>
            <button
              className={`sidebar__nav-item ${adminView === "settings" ? "sidebar__nav-item--active" : ""}`}
              onClick={() => setAdminView && setAdminView("settings")}
            >
              <Settings size={16} color="var(--accent-coral)" />
              <span>System Settings</span>
              {unresolvedCount > 0 && (
                <span className="sidebar__badge-count" title={`${unresolvedCount} unresolved reports`}>
                  {unresolvedCount}
                </span>
              )}
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
