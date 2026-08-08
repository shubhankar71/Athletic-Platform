import { X } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getAccuracyErrorTrend, getAiFeedback } from "../../api/mockApi.js";
import AccuracyErrorChart from "../charts/AccuracyErrorChart.jsx";
import { LoadingBlock, SkeletonLines } from "../ui/LoadingState.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import "./AthleteProfileDrawer.css";

export default function AthleteProfileDrawer({ athlete, onClose }) {
  // In production this would key off athlete.id — mock API returns the
  // same fixture regardless of id since this is a single-athlete demo dataset.
  const { data: trend, isLoading: trendLoading } = useAsyncData(getAccuracyErrorTrend, [athlete.id]);
  const { data: feedback, isLoading: feedbackLoading } = useAsyncData(getAiFeedback, [athlete.id]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__header">
          <div>
            <p className="eyebrow">{athlete.team}</p>
            <h2 className="drawer__name">{athlete.name}</h2>
            <p className="drawer__event">
              {athlete.event} · {athlete.sport}
            </p>
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>

        <div className="drawer__stats">
          <div className="drawer__stat">
            <p className="eyebrow">Last score</p>
            <p className="mono-stat drawer__stat-value">{athlete.lastSessionScore}</p>
          </div>
          <div className="drawer__stat">
            <p className="eyebrow">Trend</p>
            <p className="drawer__stat-value drawer__stat-value--label">{athlete.trend}</p>
          </div>
          <div className="drawer__stat">
            <p className="eyebrow">Status</p>
            {athlete.flagged ? (
              <Badge tone="amber">Needs review</Badge>
            ) : (
              <Badge tone="teal">On track</Badge>
            )}
          </div>
        </div>

        <div className="drawer__section">
          <p className="drawer__section-title">Accuracy vs. error trend</p>
          {trendLoading ? <LoadingBlock label="Loading trend…" /> : <AccuracyErrorChart data={trend} />}
        </div>

        <div className="drawer__section">
          <p className="drawer__section-title">Latest AI analysis summary</p>
          {feedbackLoading ? (
            <SkeletonLines count={3} />
          ) : (
            <>
              <p className="drawer__summary">{feedback.summary}</p>
              <ul className="drawer__focus-list">
                {feedback.focusAreas.slice(0, 2).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="drawer__actions">
          <Button variant="secondary" fullWidth>
            Message athlete
          </Button>
          <Button variant="primary" fullWidth>
            Invite to opportunity
          </Button>
        </div>
      </div>
    </div>
  );
}
