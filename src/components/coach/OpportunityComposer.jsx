import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { createOpportunityApi } from "../../api/coachApi.js";
import "./OpportunityComposer.css";

const POST_TYPES = [
  { value: "recruitment", label: "Recruitment" },
  { value: "trial", label: "Trial" },
];

const BATTING_ROLES = [
  "Opening Batter",
  "Middle-Order Batter",
  "Wicketkeeper-Batter",
  "Finisher",
  "Top-Order Batter",
  "All-Rounder",
];

const BATTING_STYLES = ["Either", "Right-Handed", "Left-Handed"];
const AGE_GROUPS = ["U16", "U19", "U23", "Senior", "All Ages"];

const EMPTY_FORM = {
  title: "",
  type: "recruitment",
  battingRole: "Opening Batter",
  battingStyle: "Either",
  ageGroup: "U19",
  location: "",
  summary: "",
};

export default function OpportunityComposer({ onPosted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justPosted, setJustPosted] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.summary.trim() || !form.location.trim()) {
      setError("Please fill in title, location, and details.");
      return;
    }

    setIsSubmitting(true);
    createOpportunityApi(form)
      .then((res) => {
        setIsSubmitting(false);
        setJustPosted(true);
        setForm(EMPTY_FORM);
        onPosted?.();
        setTimeout(() => setJustPosted(false), 3000);
      })
      .catch((err) => {
        setIsSubmitting(false);
        setError(err.message || "Failed to post opportunity.");
      });
  }

  return (
    <Card eyebrow="Cricket Recruitment & Trials" title="Create Cricket Opportunity">
      <form className="composer-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: "var(--signal-red)", fontSize: "13px", padding: "8px 12px", background: "var(--signal-red-wash)", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <label className="composer-field">
          <span>Opportunity Title</span>
          <input
            type="text"
            placeholder="e.g. Opening Batter — U19 Selection"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>

        <label className="composer-field">
          <span>Category / Type</span>
          <div className="composer-type-group">
            {POST_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={`composer-type${form.type === t.value ? " composer-type--active" : ""}`}
                onClick={() => update("type", t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
          <label className="composer-field">
            <span>Batter Role Needed</span>
            <select
              value={form.battingRole}
              onChange={(e) => update("battingRole", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-3)", color: "var(--text-primary)" }}
            >
              {BATTING_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <label className="composer-field">
            <span>Preferred Batting Style</span>
            <select
              value={form.battingStyle}
              onChange={(e) => update("battingStyle", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-3)", color: "var(--text-primary)" }}
            >
              {BATTING_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="composer-field">
            <span>Age Group</span>
            <select
              value={form.ageGroup}
              onChange={(e) => update("ageGroup", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-3)", color: "var(--text-primary)" }}
            >
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label className="composer-field">
            <span>Location / Ground</span>
            <input
              type="text"
              placeholder="e.g. Delhi Cricket Academy"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              required
            />
          </label>
        </div>

        <label className="composer-field">
          <span>Details & Technical Requirements</span>
          <textarea
            rows={4}
            placeholder="Describe what you are looking for (e.g. technically sound opening batter who can handle pace & swing)..."
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            required
          />
        </label>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Posting Opportunity…" : "Post Opportunity"}
        </Button>

        {justPosted && (
          <p className="composer-success">
            <CheckCircle2 size={14} color="var(--accent-teal)" /> Opportunity posted to feed successfully!
          </p>
        )}
      </form>
    </Card>
  );
}
