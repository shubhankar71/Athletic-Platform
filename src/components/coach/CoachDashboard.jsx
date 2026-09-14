import { useState, useEffect } from "react";
import { Rss, Users, HelpCircle, History } from "lucide-react";
import { useRole } from "../../context/RoleContext.jsx";
import Tabs from "../ui/Tabs.jsx";
import Button from "../ui/Button.jsx";
import AthleteRoster from "./AthleteRoster.jsx";
import CoachOpportunities from "./CoachOpportunities.jsx";
import CoachHistory from "./CoachHistory.jsx";

const TABS = [
  { key: "roster", label: "Athletes", icon: Users },
  { key: "opportunities", label: "Opportunities", icon: Rss },
  { key: "history", label: "History", icon: History },
];

export default function CoachDashboard({ onOpenReportModal, defaultTab = "roster" }) {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">{user?.team || "FieldSignal Coach"} · Cricket Batting Platform</p>
          <h1 className="dashboard__title">Cricket Batting Talent & Player Operations</h1>
        </div>

        {onOpenReportModal && (
          <Button variant="ghost" size="sm" onClick={onOpenReportModal}>
            <HelpCircle size={15} color="var(--accent-coral)" />
            <span>Report Issue</span>
          </Button>
        )}
      </header>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="dashboard__panel">
        {activeTab === "roster" && <AthleteRoster />}
        {activeTab === "opportunities" && <CoachOpportunities />}
        {activeTab === "history" && <CoachHistory />}
      </div>
    </div>
  );
}
