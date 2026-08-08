import "./Card.css";

export default function Card({
  children,
  title,
  eyebrow,
  action,
  padded = true,
  className = "",
}) {
  return (
    <div className={`card ${className}`}>
      {(title || eyebrow || action) && (
        <div className="card__header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h3 className="card__title">{title}</h3>}
          </div>
          {action && <div className="card__action">{action}</div>}
        </div>
      )}
      <div className={padded ? "card__body" : ""}>{children}</div>
    </div>
  );
}
