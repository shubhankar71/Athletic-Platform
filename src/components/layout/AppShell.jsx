import { ROLES, useRole } from "../../context/RoleContext.jsx";
import Sidebar from "./Sidebar.jsx";
import AthleteDashboard from "../athlete/AthleteDashboard.jsx";
import CoachDashboard from "../coach/CoachDashboard.jsx";
import AdminDashboard from "../admin/AdminDashboard.jsx";
import "./AppShell.css";

const DASHBOARDS = {
  [ROLES.ATHLETE]: AthleteDashboard,
  [ROLES.COACH]: CoachDashboard,
  [ROLES.ADMIN]: AdminDashboard,
};

export default function AppShell() {
  const { role } = useRole();
  const ActiveDashboard = DASHBOARDS[role];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__content">
        <ActiveDashboard />
      </main>
    </div>
  );
}
