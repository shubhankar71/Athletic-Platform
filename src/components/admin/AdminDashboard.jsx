import { useState, useEffect } from "react";
import { Users, FileVideo, ShieldCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Card from "../ui/Card.jsx";
import { getAdminStatsApi } from "../../api/analysisApi.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await getAdminStatsApi();
      if (data) {
        setStats(data);
      } else {
        // Fallback default admin metrics
        setStats({
          totalUsers: 12,
          totalAthletes: 10,
          totalAdmins: 2,
          totalAnalyses: 48,
          completedAnalyses: 45,
          processingAnalyses: 1,
          failedAnalyses: 2,
        });
      }
    } catch (err) {
      console.warn("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard stack">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">Platform Administration</p>
          <h1 className="dashboard__title">System Overview & Metrics</h1>
        </div>
      </header>

      {/* Admin Stats Metric Cards */}
      <div className="grid-2">
        <Card eyebrow="User Management" title="Registered Accounts">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
              <Users size={20} color="var(--accent-teal)" />
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Total Users</p>
              <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#fff" }}>{loading ? "..." : stats?.totalUsers}</h3>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
              <ShieldCheck size={20} color="var(--accent-coral, #e63946)" />
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Athletes vs Admins</p>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#fff" }}>
                {loading ? "..." : `${stats?.totalAthletes} Athletes / ${stats?.totalAdmins} Admin`}
              </h3>
            </div>
          </div>
        </Card>

        <Card eyebrow="ML Pipeline Operations" title="Analysis Statistics">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px" }}>
              <CheckCircle2 size={18} color="var(--accent-teal)" />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Completed</p>
              <h4 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--accent-teal)" }}>
                {loading ? "..." : stats?.completedAnalyses}
              </h4>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px" }}>
              <Clock size={18} color="#e5a50a" />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Processing</p>
              <h4 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#e5a50a" }}>
                {loading ? "..." : stats?.processingAnalyses}
              </h4>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px" }}>
              <AlertCircle size={18} color="var(--accent-coral, #e63946)" />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Failed</p>
              <h4 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--accent-coral, #e63946)" }}>
                {loading ? "..." : stats?.failedAnalyses}
              </h4>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
