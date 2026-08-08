import { Activity, ShieldCheck, Users, Zap } from "lucide-react";
import { ROLES, useRole } from "../../context/RoleContext.jsx";
import "./Sidebar.css";

const ROLE_SWITCH_ITEMS = [
  { role: ROLES.ATHLETE, label: "Athlete", icon: Zap },
  { role: ROLES.COACH, label: "Coach", icon: Users },
  { role: ROLES.ADMIN, label: "Admin", icon: ShieldCheck },
];

export default function Sidebar() {
  const { role, setRole, user } = useRole();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Activity size={20} strokeWidth={2.5} color="var(--accent-teal)" />
        <span className="sidebar__brand-name">FieldSignal</span>
      </div>

      <div className="sidebar__user">
        <div className="sidebar__avatar">{user.avatarInitials}</div>
        <div>
          <p className="sidebar__user-name">{user.name}</p>
          <p className="sidebar__user-meta">{user.sport || user.title}</p>
        </div>
      </div>

      <nav className="sidebar__switcher" aria-label="Dashboard view switcher">
        <p className="eyebrow sidebar__switcher-label">Demo — view as</p>
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
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <p className="eyebrow">Frontend prototype</p>
        <p className="sidebar__footer-note">Mock data · no backend connected</p>
      </div>
    </aside>
  );
}
