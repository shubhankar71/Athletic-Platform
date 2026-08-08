import { ShieldAlert } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getUserReports, updateReportStatus } from "../../api/mockApi.js";
import "./AdminPanels.css";

const SEVERITY_TONE = { high: "red", medium: "amber", low: "neutral" };
const STATUS_TONE = { open: "red", in_review: "amber", resolved: "teal" };

const NEXT_ACTION = {
  open: { label: "Start review", next: "in_review" },
  in_review: { label: "Mark resolved", next: "resolved" },
  resolved: null,
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ReportsPanel() {
  const { data: reports, isLoading, refetch } = useAsyncData(getUserReports, []);

  function handleAction(reportId, nextStatus) {
    updateReportStatus(reportId, nextStatus).then(() => refetch());
  }

  return (
    <Card
      eyebrow="Moderation"
      title="User reports"
      action={<ShieldAlert size={16} color="var(--text-tertiary)" />}
    >
      {isLoading ? (
        <LoadingBlock label="Loading reports…" />
      ) : (
        <ul className="admin-list">
          {reports.map((r) => {
            const action = NEXT_ACTION[r.status];
            return (
              <li key={r.id} className="admin-list__row admin-list__row--report">
                <div>
                  <p className="admin-list__title">{r.subject}</p>
                  <p className="admin-list__meta">
                    Reported {formatDate(r.createdAt)} · account {r.reportedUser}
                  </p>
                  <div className="admin-list__badges">
                    <Badge tone={SEVERITY_TONE[r.severity]}>{r.severity}</Badge>
                    <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
                  </div>
                </div>
                {action && (
                  <Button variant="secondary" size="sm" onClick={() => handleAction(r.id, action.next)}>
                    {action.label}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
