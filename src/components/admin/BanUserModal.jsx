import React, { useState } from "react";
import { X, ShieldAlert, AlertTriangle } from "lucide-react";
import Button from "../ui/Button.jsx";
import "./BanUserModal.css";

export default function BanUserModal({ isOpen, onClose, user, onConfirmBan }) {
  const [banType, setBanType] = useState("temporary"); // 'temporary' | 'permanent'
  const [durationDays, setDurationDays] = useState("7");
  const [customDays, setCustomDays] = useState("14");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let days = Number(durationDays);
      if (durationDays === "custom") {
        days = Number(customDays) || 1;
      }

      await onConfirmBan(user._id, {
        banType,
        durationDays: banType === "temporary" ? days : null,
        reason: reason.trim(),
      });

      setSubmitting(false);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || "Failed to complete ban operation.");
    }
  };

  return (
    <div className="ban-modal__overlay">
      <div className="ban-modal__content">
        <div className="ban-modal__header">
          <div className="ban-modal__icon">
            <ShieldAlert size={22} color="var(--signal-red)" />
          </div>
          <div>
            <h3>Ban Account — {user.name}</h3>
            <p>{user.email} ({user.role?.toUpperCase()})</p>
          </div>
          <button type="button" className="ban-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="ban-modal__alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ban-modal__form">
          <div className="ban-modal__field">
            <label>Ban Severity</label>
            <div className="ban-modal__type-group">
              <label className={`ban-type-option ${banType === "temporary" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="banType"
                  value="temporary"
                  checked={banType === "temporary"}
                  onChange={() => setBanType("temporary")}
                />
                <div>
                  <strong>Temporary Ban</strong>
                  <span>Suspends account for a set duration</span>
                </div>
              </label>

              <label className={`ban-type-option ${banType === "permanent" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="banType"
                  value="permanent"
                  checked={banType === "permanent"}
                  onChange={() => setBanType("permanent")}
                />
                <div>
                  <strong style={{ color: "var(--signal-red)" }}>Permanent Ban</strong>
                  <span>Blocks account indefinitely until manual unban</span>
                </div>
              </label>
            </div>
          </div>

          {banType === "temporary" && (
            <div className="ban-modal__field">
              <label htmlFor="duration">Ban Duration</label>
              <select
                id="duration"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="ban-modal__select"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days (Default)</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="custom">Custom Duration...</option>
              </select>

              {durationDays === "custom" && (
                <div className="ban-modal__custom-days">
                  <label htmlFor="customDays">Enter Days:</label>
                  <input
                    id="customDays"
                    type="number"
                    min="1"
                    max="365"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {banType === "permanent" && (
            <div className="ban-modal__warning">
              <AlertTriangle size={18} color="var(--signal-red)" />
              <p>
                <strong>Warning:</strong> Permanent ban prevents this user from accessing their account indefinitely. Require explicit admin unban to restore access.
              </p>
            </div>
          )}

          <div className="ban-modal__field">
            <label htmlFor="reason">Reason for Ban</label>
            <textarea
              id="reason"
              rows={3}
              placeholder="e.g. Terms of Service violation, inappropriate behavior..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="ban-modal__actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={submitting}>
              {submitting ? "Applying Ban..." : banType === "permanent" ? "Confirm Permanent Ban" : "Confirm Temporary Ban"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
