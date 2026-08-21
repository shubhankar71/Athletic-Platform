import { Loader2 } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import { SkeletonLines } from "../ui/LoadingState.jsx";
import "./SessionList.css";

const STATUS_BADGE = {
  complete: { tone: "teal", label: "Complete" },
  completed: { tone: "teal", label: "Complete" },
  processing: { tone: "amber", label: "Processing" },
  queued: { tone: "neutral", label: "Queued" },
  failed: { tone: "coral", label: "Failed" },
};

function formatDate(iso) {
  if (!iso) return "Recent";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function SessionList({ sessions, isLoading, activeId, onSelect }) {
  if (isLoading) {
    return (
      <div className="session-list">
        <SkeletonLines count={3} />
      </div>
    );
  }

  return (
    <div className="session-list">
      {sessions.map((s) => {
        const statusKey = (s.status || "complete").toLowerCase();
        const status = STATUS_BADGE[statusKey] || { tone: "teal", label: "Complete" };
        const sessionId = s._id || s.id;
        const isActive = sessionId === activeId;
        const drillName = s.stroke ? `${s.stroke} Session` : (s.title || s.drill || "Cricket Drill");
        const dateStr = formatDate(s.createdAt || s.uploadedAt || s.date);
        const duration = Math.round(s.durationSec || s.videoMetadata?.duration || 12);
        const overallScore = Math.round(s.scores?.overall || s.overallScore || s.score || 85);
        const isComplete = statusKey === "complete" || statusKey === "completed";

        return (
          <button
            key={sessionId}
            type="button"
            className={`session-item${isActive ? " session-item--active" : ""}`}
            onClick={() => onSelect(sessionId)}
            disabled={!isComplete}
          >
            <div className="session-item__top">
              <span className="session-item__drill">{drillName}</span>
              {statusKey === "processing" ? (
                <Loader2 size={13} className="spin" color="var(--signal-amber)" />
              ) : (
                <Badge tone={status.tone}>{status.label}</Badge>
              )}
            </div>
            <div className="session-item__meta">
              <span>{dateStr}</span>
              <span>·</span>
              <span>{duration}s</span>
              {overallScore != null && (
                <>
                  <span>·</span>
                  <span className="mono-stat session-item__score">{overallScore}</span>
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

