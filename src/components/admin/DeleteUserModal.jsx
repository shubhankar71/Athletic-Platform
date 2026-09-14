import React, { useState } from "react";
import { X, Trash2, AlertOctagon } from "lucide-react";
import Button from "../ui/Button.jsx";
import "./DeleteUserModal.css";

export default function DeleteUserModal({ isOpen, onClose, user, onConfirmDelete }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirmDelete(user._id);
      setSubmitting(false);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || "Failed to delete user account.");
    }
  };

  return (
    <div className="delete-modal__overlay">
      <div className="delete-modal__content">
        <div className="delete-modal__header">
          <div className="delete-modal__icon">
            <Trash2 size={24} color="var(--signal-red)" />
          </div>
          <div>
            <h3>Delete Account — {user.name}?</h3>
            <p>{user.email} ({user.role?.toUpperCase()})</p>
          </div>
          <button type="button" className="delete-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="delete-modal__alert">
            <AlertOctagon size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="delete-modal__body">
          <p>
            This action will permanently revoke access and remove the user's account access from the platform.
          </p>
          <div className="delete-modal__warning-box">
            <AlertOctagon size={16} color="var(--signal-red)" />
            <span>This action cannot be undone. Historical analysis records remain safely audited.</span>
          </div>
        </div>

        <div className="delete-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
