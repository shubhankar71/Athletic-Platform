import { Loader2 } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import { SkeletonLines } from "../ui/LoadingState.jsx";
import "./SessionList.css";

const STATUS_BADGE = {
  complete: { tone: "teal", label: "Complete" },
  processing: { tone: "amber", label: "Processing" },
  queued: { tone: "neutral", label: "Queued" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
        const status = STATUS_BADGE[s.status];
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            className={`session-item${isActive ? " session-item--active" : ""}`}
            onClick={() => onSelect(s.id)}
            disabled={s.status !== "complete"}
          >
            <div className="session-item__top">
              <span className="session-item__drill">{s.drill}</span>
              {s.status === "processing" ? (
                <Loader2 size={13} className="spin" color="var(--signal-amber)" />
              ) : (
                <Badge tone={status.tone}>{status.label}</Badge>
              )}
            </div>
            <div className="session-item__meta">
              <span>{formatDate(s.uploadedAt)}</span>
              <span>·</span>
              <span>{s.durationSec}s</span>
              {s.overallScore != null && (
                <>
                  <span>·</span>
                  <span className="mono-stat session-item__score">{s.overallScore}</span>
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
