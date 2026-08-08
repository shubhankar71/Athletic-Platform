import "./Button.css";

/**
 * @param {"primary"|"secondary"|"ghost"|"danger"} variant
 * @param {"sm"|"md"} size
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size}${fullWidth ? " btn--full" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}
