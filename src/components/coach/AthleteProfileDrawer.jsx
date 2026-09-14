import { X, Award, Shield, UserCheck, Calendar, Briefcase } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getAccuracyErrorTrend, getAiFeedback } from "../../api/mockApi.js";
import AccuracyErrorChart from "../charts/AccuracyErrorChart.jsx";
import { LoadingBlock, SkeletonLines } from "../ui/LoadingState.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import "./AthleteProfileDrawer.css";

export default function AthleteProfileDrawer({ athlete, onClose }) {
  const athId = athlete.athleteId || athlete.id || athlete._id;
  const { data: trend, isLoading: trendLoading } = useAsyncData(getAccuracyErrorTrend, [athId]);
  const { data: feedback, isLoading: feedbackLoading } = useAsyncData(getAiFeedback, [athId]);

  const bRole = athlete.battingRole || athlete.event || "Opening Batter";
  const bStyle = athlete.battingStyle || "Right-Handed";
  const gender = athlete.gender || "Male";
  const score = athlete.lastSessionScore ?? athlete.lastScore ?? 78;
  const formattedDate = athlete.applicationDate
    ? new Date(athlete.applicationDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__header">
          <div>
            <p className="eyebrow">{athlete.team || "Delhi Cricket Club"} · Cricket Athlete</p>
            <h2 className="drawer__name">{athlete.name}</h2>
            <p className="drawer__event" style={{ color: "var(--accent-teal)", fontWeight: 600 }}>
              🏏 {bRole} ({bStyle}) · {gender}
            </p>
            {athlete.email && (
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                {athlete.email}
              </p>
            )}
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>

        {/* Application Banner */}
        {athlete.opportunityTitle && (
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
              <Briefcase size={14} color="var(--accent-teal)" />
              <span>Applied Opportunity</span>
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {athlete.opportunityTitle}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "12px" }}>
              <span style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={12} /> {formattedDate}
              </span>
              <Badge tone="teal">{athlete.status || "Applied"}</Badge>
            </div>
          </div>
        )}

        <div className="drawer__stats">
          <div className="drawer__stat">
            <p className="eyebrow">Batting Score</p>
            <p className="mono-stat drawer__stat-value">{score}</p>
          </div>
          <div className="drawer__stat">
            <p className="eyebrow">Trend</p>
            <p className="drawer__stat-value drawer__stat-value--label">
              {athlete.trend === "up" ? "↗ Improving" : athlete.trend === "down" ? "↘ Needs Work" : "→ Steady"}
            </p>
          </div>
          <div className="drawer__stat">
            <p className="eyebrow">Status</p>
            {athlete.flagged ? (
              <Badge tone="amber">Needs Review</Badge>
            ) : (
              <Badge tone="teal">On Track</Badge>
            )}
          </div>
        </div>

        <div className="drawer__section">
          <p className="drawer__section-title">Batting Pose & Accuracy Trend</p>
          {trendLoading ? <LoadingBlock label="Loading batting trend…" /> : <AccuracyErrorChart data={trend} />}
        </div>

        <div className="drawer__section">
          <p className="drawer__section-title">Latest ML Stroke Analysis & Feedback</p>
          {feedbackLoading ? (
            <SkeletonLines count={3} />
          ) : (
            <>
              <p className="drawer__summary">{feedback.summary}</p>
              <ul className="drawer__focus-list">
                {feedback.focusAreas.slice(0, 3).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="drawer__actions">
          <Button variant="secondary" fullWidth onClick={() => alert(`Message sent to ${athlete.name}`)}>
            Message Athlete
          </Button>
          <Button variant="primary" fullWidth onClick={() => alert(`Application status updated for ${athlete.name}`)}>
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
