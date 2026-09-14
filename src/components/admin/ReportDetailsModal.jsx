import React, { useState } from "react";
import { X, MessageSquare, CheckCircle, AlertCircle, Save } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import "./ReportDetailsModal.css";

export default function ReportDetailsModal({ isOpen, onClose, report, onUpdateReport }) {
  const [status, setStatus] = useState(report?.status || "open");
  const [adminResponse, setAdminResponse] = useState(report?.adminResponse || "");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !report) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      await onUpdateReport(report._id, { status, adminResponse });
      setSaving(false);
      setSuccessMsg("Report status & response updated successfully.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      setSaving(false);
      setError(err.message || "Failed to update report.");
    }
  };

  return (
    <div className="report-modal__overlay">
      <div className="report-modal__content">
        <div className="report-modal__header">
          <div className="report-modal__icon">
            <MessageSquare size={22} color="var(--accent-teal)" />
          </div>
          <div>
            <h3>Report #{report._id?.slice(-6)}</h3>
            <p>Submitted by {report.userName} ({report.userRole?.toUpperCase()})</p>
          </div>
          <button type="button" className="report-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="report-modal__alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="report-modal__alert success">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="report-modal__details-grid">
          <div className="report-modal__detail-item">
            <span className="eyebrow">Category</span>
            <strong>{report.category}</strong>
          </div>

          <div className="report-modal__detail-item">
            <span className="eyebrow">Submitted On</span>
            <strong>{report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A"}</strong>
          </div>

          <div className="report-modal__detail-item">
            <span className="eyebrow">User Email</span>
            <strong className="mono-stat">{report.userEmail}</strong>
          </div>

          {report.relatedAnalysisId && (
            <div className="report-modal__detail-item">
              <span className="eyebrow">Related Analysis ID</span>
              <strong className="mono-stat">#{report.relatedAnalysisId}</strong>
            </div>
          )}
        </div>

        <div className="report-modal__section">
          <span className="eyebrow">Subject</span>
          <h4 className="report-modal__subject">{report.subject}</h4>
        </div>

        <div className="report-modal__section">
          <span className="eyebrow">Description</span>
          <div className="report-modal__description">{report.description}</div>
        </div>

        <form onSubmit={handleSave} className="report-modal__form">
          <div className="report-modal__field">
            <label htmlFor="reportStatus">Update Status</label>
            <select
              id="reportStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="report-modal__select"
            >
              <option value="open">Open (Unresolved)</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="report-modal__field">
            <label htmlFor="adminResponse">Admin Response / Resolution Note</label>
            <textarea
              id="adminResponse"
              rows={4}
              placeholder="Write feedback or resolution response for the reporter..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
            />
          </div>

          <div className="report-modal__actions">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Response"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
