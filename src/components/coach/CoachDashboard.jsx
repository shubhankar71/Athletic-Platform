import { useState } from "react";
import { Rss, Users } from "lucide-react";
import { useRole } from "../../context/RoleContext.jsx";
import Tabs from "../ui/Tabs.jsx";
import AthleteRoster from "./AthleteRoster.jsx";
import CoachOpportunities from "./CoachOpportunities.jsx";

const TABS = [
  { key: "roster", label: "Athletes", icon: Users },
  { key: "opportunities", label: "Opportunities", icon: Rss },
];

export default function CoachDashboard() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState("roster");

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">{user.team}</p>
          <h1 className="dashboard__title">{user.title}</h1>
        </div>
      </header>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="dashboard__panel">
        {activeTab === "roster" && <AthleteRoster />}
        {activeTab === "opportunities" && <CoachOpportunities />}
      </div>
    </div>
  );
}
