import "./Badge.css";

/**
 * @param {"neutral"|"teal"|"coral"|"red"|"amber"} tone
 */
export default function Badge({ children, tone = "neutral", dot = false }) {
  const safeTone = (typeof tone === "string" && tone.trim()) ? tone.trim() : "neutral";
  return (
    <span className={`badge badge--${safeTone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

