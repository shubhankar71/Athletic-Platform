import "./LoadingState.css";

export function Spinner({ size = 18 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Full-block loading state with label, for cards/panels awaiting data. */
export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="loading-block">
      <Spinner />
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/** Skeleton line(s) for content that has a known shape while data loads. */
export function SkeletonLines({ count = 3 }) {
  return (
    <div className="skeleton-lines">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${92 - i * 14}%` }} />
      ))}
    </div>
  );
}
