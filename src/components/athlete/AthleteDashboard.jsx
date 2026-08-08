import { useState } from "react";
import { LineChart as ChartIcon, Rss } from "lucide-react";
import { useRole } from "../../context/RoleContext.jsx";
import Tabs from "../ui/Tabs.jsx";
import AIAnalysisTab from "./AIAnalysisTab.jsx";
import OpportunityFeed from "./OpportunityFeed.jsx";

const TABS = [
  { key: "analysis", label: "AI Analysis", icon: ChartIcon },
  { key: "feed", label: "Opportunity Feed", icon: Rss },
];

export default function AthleteDashboard() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState("analysis");

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">{user.team}</p>
          <h1 className="dashboard__title">{user.sport}</h1>
        </div>
      </header>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="dashboard__panel">
        {activeTab === "analysis" && <AIAnalysisTab />}
        {activeTab === "feed" && <OpportunityFeed />}
      </div>
    </div>
  );
}
