import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserCog,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Activity,
  BarChart2,
  ChevronRight,
  Settings,
} from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { getAdminStatsApi } from "../../api/adminApi.js";

export default function AdminDashboard({ onNavigateSettings }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminStatsApi();
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn("Failed to fetch admin stats:", err);
      setError(err.message || "Unable to load live admin statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Periodic auto-refresh every 15 seconds for live status updates
    const timer = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  const stats = data?.stats || {};
  const recentAnalyses = data?.recentAnalyses || [];
  const analysisByUser = data?.analysisByUser || [];

  return (
    <div className="dashboard stack">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">Platform Administration</p>
          <h1 className="dashboard__title">System Overview & Real-Time Metrics</h1>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </Button>

          {onNavigateSettings && (
            <Button variant="primary" size="sm" onClick={onNavigateSettings}>
              <Settings size={14} />
              <span>User Management & Reports</span>
            </Button>
          )}
        </div>
      </header>

      {error && (
        <div style={{ padding: "12px 16px", background: "var(--signal-red-wash)", border: "1px solid var(--signal-red)", borderRadius: "8px", color: "var(--signal-red)", fontSize: "13px" }}>
          <AlertCircle size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: USER ACCOUNTS BREAKDOWN */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)", padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">Athletes</span>
            <UserCheck size={18} color="var(--accent-teal)" />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>REGISTERED ATHLETES</p>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-teal)", marginTop: "0.2rem" }}>
            {loading && !data ? "..." : stats.totalAthletes ?? 0}
          </h3>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)", padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">Coaches</span>
            <UserCog size={18} color="var(--accent-coral)" />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>REGISTERED COACHES</p>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-coral)", marginTop: "0.2rem" }}>
            {loading && !data ? "..." : stats.totalCoaches ?? 0}
          </h3>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)", padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">Admins</span>
            <ShieldCheck size={18} color="#60a5fa" />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>TOTAL ADMINISTRATORS</p>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "#60a5fa", marginTop: "0.2rem" }}>
            {loading && !data ? "..." : stats.totalAdmins ?? 0}
          </h3>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)", padding: "1.25rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="eyebrow">Platform</span>
            <Users size={18} color="var(--text-primary)" />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>TOTAL USERS</p>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.2rem" }}>
            {loading && !data ? "..." : stats.totalUsers ?? 0}
          </h3>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
            {stats.totalAthletes ?? 0} Athletes • {stats.totalCoaches ?? 0} Coaches • {stats.totalAdmins ?? 0} Admins
          </div>
        </div>
      </div>

      {/* SECTION 2: ML PIPELINE & ANALYSIS METRICS */}
      <Card eyebrow="ML Pipeline Operations" title="Analysis Statistics">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginTop: "0.5rem" }}>
          <div style={{ background: "var(--bg-3)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <Activity size={18} color="var(--text-primary)" />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Total Analyses</p>
            <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.1rem" }}>
              {loading && !data ? "..." : stats.totalAnalyses ?? 0}
            </h4>
          </div>

          <div style={{ background: "var(--bg-3)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <CheckCircle2 size={18} color="var(--accent-teal)" />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Completed</p>
            <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-teal)", marginTop: "0.1rem" }}>
              {loading && !data ? "..." : stats.completedAnalyses ?? 0}
            </h4>
          </div>

          <div style={{ background: "var(--bg-3)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <Clock size={18} color="var(--signal-amber)" />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Processing</p>
            <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--signal-amber)", marginTop: "0.1rem" }}>
              {loading && !data ? "..." : stats.processingAnalyses ?? 0}
            </h4>
          </div>

          <div style={{ background: "var(--bg-3)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <AlertCircle size={18} color="var(--signal-red)" />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Failed</p>
            <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--signal-red)", marginTop: "0.1rem" }}>
              {loading && !data ? "..." : stats.failedAnalyses ?? 0}
            </h4>
          </div>
        </div>
      </Card>

      {/* SECTION 3: TABLES - RECENT ACTIVITY & ANALYSIS BY USER */}
      <div className="grid-2">
        {/* Recent Analysis Activity Table */}
        <Card eyebrow="ML Pipeline Logs" title="Recent Analysis Activity">
          <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
            {recentAnalyses.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)", padding: "1rem 0" }}>
                No video analysis activity recorded yet.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Athlete</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Analysis ID</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Stroke</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((item) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: "600", color: "var(--text-primary)" }}>
                        {item.user?.name || "Athlete"}
                      </td>
                      <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                        #{item._id?.slice(-6)}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-tertiary)" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--accent-teal)", fontWeight: "600" }}>
                        {item.stroke || "Analysis"}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>
                        <Badge
                          variant={
                            item.status === "completed"
                              ? "teal"
                              : item.status === "failed"
                              ? "red"
                              : "amber"
                          }
                        >
                          {item.status?.toUpperCase() || "COMPLETED"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Analysis Counts by User Table */}
        <Card eyebrow="Athlete Participation" title="Analysis by User">
          <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
            {analysisByUser.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)", padding: "1rem 0" }}>
                No athlete analysis breakdown available.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Athlete Name</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "center" }}>Completed</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "center" }}>Failed</th>
                    <th style={{ padding: "8px", fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisByUser.map((row) => (
                    <tr key={row._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{row.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{row.email}</div>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--accent-teal)", fontWeight: "600" }}>
                        {row.completed}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--signal-red)", fontWeight: "600" }}>
                        {row.failed}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "700", color: "var(--text-primary)", fontSize: "14px" }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
