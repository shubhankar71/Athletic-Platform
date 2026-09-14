import React, { useState, useEffect } from "react";
import { Users, MessageSquare, Shield } from "lucide-react";
import Tabs from "../ui/Tabs.jsx";
import UserManagement from "./UserManagement.jsx";
import ReportsManagement from "./ReportsManagement.jsx";
import { getUnresolvedCountApi } from "../../api/reportApi.js";
import "./SystemSettings.css";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("users");
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    async function loadUnresolvedCount() {
      const count = await getUnresolvedCountApi();
      setUnresolvedCount(count);
    }
    loadUnresolvedCount();
  }, []);

  const TABS = [
    { key: "users", label: "User Management", icon: Users },
    {
      key: "reports",
      label: unresolvedCount > 0 ? `Reports & Issues (${unresolvedCount})` : "Reports & Issues",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="dashboard stack">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">Platform Administration</p>
          <h1 className="dashboard__title">System Settings & Management</h1>
        </div>
      </header>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="dashboard__panel">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "reports" && <ReportsManagement />}
      </div>
    </div>
  );
}
