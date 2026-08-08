import "./Badge.css";

/**
 * @param {"neutral"|"teal"|"coral"|"red"|"amber"} tone
 */
export default function Badge({ children, tone = "neutral", dot = false }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}
