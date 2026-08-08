import { CheckCircle2, CircleAlert } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { SkeletonLines } from "../ui/LoadingState.jsx";
import "./AIFeedbackPanel.css";

export default function AIFeedbackPanel({ feedback, isLoading }) {
  return (
    <Card
      eyebrow="AI-generated feedback"
      title="Latest session breakdown"
      action={
        !isLoading && feedback && (
          <Badge tone="teal" dot>
            {Math.round(feedback.confidence * 100)}% confidence
          </Badge>
        )
      }
    >
      {isLoading && <SkeletonLines count={4} />}

      {!isLoading && feedback && (
        <div className="feedback">
          <p className="feedback__summary">{feedback.summary}</p>

          <div className="feedback__columns">
            <div>
              <p className="feedback__col-label">
                <CheckCircle2 size={14} color="var(--accent-teal)" /> Strengths
              </p>
              <ul className="feedback__list">
                {feedback.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="feedback__col-label">
                <CircleAlert size={14} color="var(--accent-coral)" /> Focus areas
              </p>
              <ul className="feedback__list">
                {feedback.focusAreas.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
