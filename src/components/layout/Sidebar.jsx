import { Activity, ShieldCheck, Users, Zap, LogIn, LogOut, User } from "lucide-react";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Sidebar.css";

const ROLE_SWITCH_ITEMS = [
  { role: ROLES.ATHLETE, label: "Athlete", icon: Zap, route: "/dashboard/athlete" },
  { role: ROLES.COACH, label: "Coach", icon: Users, route: "/dashboard/coach" },
  { role: ROLES.ADMIN, label: "Admin", icon: ShieldCheck, route: "/dashboard/admin" },
];

export default function Sidebar({ onOpenAuthModal }) {
  const { role, setRole, user } = useRole();
  const { isAuthenticated, logout, user: authUser } = useAuth();

  const activeUser = authUser || user;
  const initials = activeUser?.name
    ? activeUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SP";

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Activity size={20} strokeWidth={2.5} color="var(--accent-teal)" />
        <span className="sidebar__brand-name">FieldSignal</span>
      </div>

      <div className="sidebar__user">
        <div className="sidebar__avatar">{initials}</div>
        <div>
          <p className="sidebar__user-name">{activeUser?.name || "Guest User"}</p>
          <p className="sidebar__user-meta">
            {activeUser?.email || (activeUser?.sport || activeUser?.title)}
          </p>
        </div>
      </div>

      <nav className="sidebar__switcher" aria-label="Dashboard view switcher">
        <p className="eyebrow sidebar__switcher-label">
          {isAuthenticated ? "Current RBAC Role" : "Role Dashboard Routes"}
        </p>
        {ROLE_SWITCH_ITEMS.map((item) => {
          const isActive = item.role === role;
          const Icon = item.icon;
          return (
            <button
              key={item.role}
              className={`sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`}
              onClick={() => setRole(item.role)}
            >
              {isActive && (
                <span className="lane-rail" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              )}
              <Icon size={16} strokeWidth={2.25} />
              <span>{item.label}</span>
              <span className="sidebar__route-badge">{item.route}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        {isAuthenticated ? (
          <div className="sidebar__auth-status">
            <div className="sidebar__badge authenticated">
              <User size={12} /> Logged in as <strong>{authUser?.role}</strong>
            </div>
            <button className="sidebar__auth-btn logout" onClick={logout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        ) : (
          <div className="sidebar__auth-status">
            <div className="sidebar__badge unauthenticated">
              Role Auth Active
            </div>
            <button className="sidebar__auth-btn login" onClick={onOpenAuthModal}>
              <LogIn size={16} /> Sign In / Register
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
