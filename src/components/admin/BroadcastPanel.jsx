import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { createBroadcast, getBroadcastUpdates } from "../../api/mockApi.js";
import "./AdminPanels.css";

const STATUS_TONE = { sent: "teal", scheduled: "amber", draft: "neutral" };

const AUDIENCES = ["All users", "Athletes", "Coaches"];

function formatDateTime(iso) {
  if (!iso) return "Not scheduled";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BroadcastPanel() {
  const { data: broadcasts, isLoading, refetch } = useAsyncData(getBroadcastUpdates, []);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    createBroadcast({ title, audience }).then(() => {
      setIsSubmitting(false);
      setTitle("");
      refetch();
    });
  }

  return (
    <Card
      eyebrow="Notifications"
      title="Broadcast updates"
      action={<Megaphone size={16} color="var(--text-tertiary)" />}
    >
      <form className="admin-inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New broadcast title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" icon={Send} disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Sending…" : "Draft"}
        </Button>
      </form>

      {isLoading ? (
        <LoadingBlock label="Loading broadcasts…" />
      ) : (
        <ul className="admin-list">
          {broadcasts.map((b) => (
            <li key={b.id} className="admin-list__row">
              <div>
                <p className="admin-list__title">{b.title}</p>
                <p className="admin-list__meta">
                  {b.audience} · {formatDateTime(b.scheduledFor)}
                </p>
              </div>
              <Badge tone={STATUS_TONE[b.status]}>{b.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
