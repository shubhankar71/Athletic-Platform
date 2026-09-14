import { useState, useEffect } from "react";
import { LineChart as ChartIcon, Rss, HelpCircle, History } from "lucide-react";
import { useRole } from "../../context/RoleContext.jsx";
import Tabs from "../ui/Tabs.jsx";
import Button from "../ui/Button.jsx";
import AIAnalysisTab from "./AIAnalysisTab.jsx";
import OpportunityFeed from "./OpportunityFeed.jsx";
import AthleteHistory from "./AthleteHistory.jsx";

const TABS = [
  { key: "analysis", label: "AI Analysis", icon: ChartIcon },
  { key: "feed", label: "Opportunity Feed", icon: Rss },
  { key: "history", label: "History", icon: History },
];

export default function AthleteDashboard({ onOpenAuthModal, onOpenReportModal, defaultTab = "analysis" }) {
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
          <p className="eyebrow">{user?.team || "FieldSignal Athlete"}</p>
          <h1 className="dashboard__title">{user?.sport || "Cricket Analysis"}</h1>
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
        {activeTab === "analysis" && <AIAnalysisTab onOpenAuthModal={onOpenAuthModal} />}
        {activeTab === "feed" && <OpportunityFeed />}
        {activeTab === "history" && <AthleteHistory />}
      </div>
    </div>
  );
}
