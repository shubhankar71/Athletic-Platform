import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { createOpportunityPost } from "../../api/mockApi.js";
import "./OpportunityComposer.css";

const POST_TYPES = [
  { value: "recruitment", label: "Recruitment" },
  { value: "competition", label: "Competition" },
  { value: "workshop", label: "Workshop" },
];

const EMPTY_FORM = { title: "", type: "recruitment", location: "", summary: "" };

export default function OpportunityComposer({ onPosted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) return;

    setIsSubmitting(true);
    createOpportunityPost(form).then(() => {
      setIsSubmitting(false);
      setJustPosted(true);
      setForm(EMPTY_FORM);
      onPosted?.();
      setTimeout(() => setJustPosted(false), 2500);
    });
  }

  return (
    <Card eyebrow="New post" title="Create an opportunity">
      <form className="composer-form" onSubmit={handleSubmit}>
        <label className="composer-field">
          <span>Title</span>
          <input
            type="text"
            placeholder="e.g. Walk-on Tryout — Sprints"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>

        <label className="composer-field">
          <span>Type</span>
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

        <label className="composer-field">
          <span>Location</span>
          <input
            type="text"
            placeholder="e.g. Riverstone Athletic Complex"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </label>

        <label className="composer-field">
          <span>Details</span>
          <textarea
            rows={4}
            placeholder="What are you looking for, and who should apply?"
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            required
          />
        </label>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Posting…" : "Post opportunity"}
        </Button>

        {justPosted && (
          <p className="composer-success">
            <CheckCircle2 size={14} color="var(--accent-teal)" /> Posted to your feed
          </p>
        )}
      </form>
    </Card>
  );
}
