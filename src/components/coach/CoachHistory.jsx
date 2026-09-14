import { useState, useMemo } from "react";
import { Trash2, AlertTriangle, Calendar, MapPin, Users, CheckCircle, ShieldAlert } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getOpportunitiesApi, deleteOpportunityApi } from "../../api/coachApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./CoachHistory.css";

export default function CoachHistory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("live"); // 'live' or 'previous'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const { data: opportunities, isLoading, refetch } = useAsyncData(getOpportunitiesApi, []);

  // Filter opportunities belonging strictly to current logged-in Coach
  const coachOpps = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.filter((opp) => {
      // In MongoDB, createdBy is matching req.user._id
      const isOwner = !opp.createdBy || !user || String(opp.createdBy) === String(user._id);
      return isOwner && opp.status !== "deleted";
    });
  }, [opportunities, user]);

  const liveOpps = useMemo(() => {
    return coachOpps.filter((opp) => opp.status === "published" || !opp.status);
  }, [coachOpps]);

  const previousOpps = useMemo(() => {
    return coachOpps.filter((opp) => opp.status === "closed" || opp.status === "expired" || opp.status === "completed");
  }, [coachOpps]);

  const displayList = activeTab === "live" ? liveOpps : previousOpps;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteOpportunityApi(deleteTarget._id || deleteTarget.id);
      setIsDeleting(false);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err.message || "Failed to delete opportunity.");
    }
  };

  return (
    <div className="coach-history stack">
      <Card padded={true}>
        <div className="coach-history__header">
          <div>
            <p className="eyebrow">Coach Management</p>
            <h2 className="coach-history__title">Opportunity History</h2>
          </div>

          <div className="coach-history__tabs">
            <button
              className={`coach-history__tab${activeTab === "live" ? " coach-history__tab--active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              Live Opportunities ({liveOpps.length})
            </button>
            <button
              className={`coach-history__tab${activeTab === "previous" ? " coach-history__tab--active" : ""}`}
              onClick={() => setActiveTab("previous")}
            >
              Previous Opportunities ({previousOpps.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingBlock label="Loading opportunity history…" />
        ) : (
          <div className="coach-history__grid">
            {displayList.map((opp) => {
              const formattedDate = opp.createdAt
                ? new Date(opp.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <div key={opp._id || opp.id} className="history-card">
                  <div className="history-card__header">
                    <div>
                      <div className="history-card__tags">
                        <Badge variant={opp.type === "recruitment" ? "teal" : "coral"}>
                          {opp.type === "recruitment" ? "RECRUITMENT" : "TRIAL"}
                        </Badge>
                        <Badge tone="neutral">{opp.battingRole || "Opening Batter"}</Badge>
                        <Badge tone="amber">Gender: {opp.gender || "Any"}</Badge>
                      </div>
                      <h3 className="history-card__title">{opp.title}</h3>
                    </div>

                    <button
                      className="history-card__delete-btn"
                      onClick={() => setDeleteTarget(opp)}
                      title="Delete opportunity permanently"
                    >
                      <Trash2 size={16} color="var(--signal-red)" />
                    </button>
                  </div>

                  <p className="history-card__summary">{opp.summary}</p>

                  <div className="history-card__meta">
                    <span>
                      <MapPin size={13} /> {opp.location}
                    </span>
                    <span>
                      <Calendar size={13} /> {formattedDate}
                    </span>
                    <span>
                      <Users size={13} /> {opp.applicants || 0} Applicants
                    </span>
                  </div>

                  <div className="history-card__footer">
                    <span className="history-card__style">
                      Style: <strong>{opp.battingStyle || "Either"}</strong> | Age: <strong>{opp.ageGroup || "U19"}</strong>
                    </span>
                    <Badge tone={opp.status === "published" ? "teal" : "neutral"}>
                      {opp.status === "published" ? "ACTIVE" : (opp.status || "CLOSED").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {displayList.length === 0 && (
              <div className="coach-history__empty">
                <p>No {activeTab} opportunities found in your history.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="history-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal__icon">
              <AlertTriangle size={28} color="var(--signal-red)" />
            </div>

            <h3 className="history-modal__title">Delete Opportunity</h3>
            <p className="history-modal__message">
              Delete this opportunity permanently? This action cannot be undone and will remove it from the Athlete Opportunity Feed.
            </p>

            <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px", marginTop: "8px" }}>
              "{deleteTarget.title}"
            </p>

            {deleteError && (
              <div style={{ color: "var(--signal-red)", fontSize: "13px", marginTop: "12px", background: "var(--signal-red-wash)", padding: "8px 12px", borderRadius: "6px" }}>
                {deleteError}
              </div>
            )}

            <div className="history-modal__actions">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ background: "var(--signal-red)", borderColor: "var(--signal-red)" }}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
