import { useRole } from "../../context/RoleContext.jsx";
import BroadcastPanel from "./BroadcastPanel.jsx";
import ReportsPanel from "./ReportsPanel.jsx";

export default function AdminDashboard() {
  const { user } = useRole();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">{user.title}</p>
          <h1 className="dashboard__title">Platform overview</h1>
        </div>
      </header>

      <div className="dashboard__panel grid-2">
        <BroadcastPanel />
        <ReportsPanel />
      </div>
    </div>
  );
}
