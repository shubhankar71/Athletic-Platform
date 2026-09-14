import React, { useState } from "react";
import { X, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";
import { submitReportApi } from "../../api/reportApi.js";
import Button from "./Button.jsx";
import "./ReportModal.css";

export default function ReportModal({ isOpen, onClose }) {
  const [category, setCategory] = useState("Technical Issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [relatedAnalysisId, setRelatedAnalysisId] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await submitReportApi({
        category,
        subject: subject.trim(),
        description: description.trim(),
        relatedAnalysisId: relatedAnalysisId.trim(),
      });

      setLoading(false);
      setSuccessMsg("Your issue report has been submitted to administrators!");
      setTimeout(() => {
        setSuccessMsg(null);
        setSubject("");
        setDescription("");
        setRelatedAnalysisId("");
        onClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to submit report. Please try again.");
    }
  };

  return (
    <div className="report-issue-modal__overlay">
      <div className="report-issue-modal__content">
        <div className="report-issue-modal__header">
          <div className="report-issue-modal__icon">
            <HelpCircle size={22} color="var(--accent-teal)" />
          </div>
          <div>
            <h3>Report an Issue / Support</h3>
            <p>Submit feedback or technical issues directly to platform administrators.</p>
          </div>
          <button type="button" className="report-issue-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="report-issue-modal__alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="report-issue-modal__alert success">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-issue-modal__form">
          <div className="report-issue-modal__field">
            <label htmlFor="category">Issue Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="report-issue-modal__select"
            >
              <option value="Technical Issue">Technical Issue</option>
              <option value="Video Upload Problem">Video Upload Problem</option>
              <option value="ML Analysis Problem">ML Analysis Problem</option>
              <option value="Incorrect Result">Incorrect Result</option>
              <option value="Account Problem">Account Problem</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="report-issue-modal__field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              required
              placeholder="Brief summary of the problem..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="report-issue-modal__field">
            <label htmlFor="relatedId">Related Analysis ID (Optional)</label>
            <input
              id="relatedId"
              type="text"
              placeholder="e.g. 66e5f1a2b4c3..."
              value={relatedAnalysisId}
              onChange={(e) => setRelatedAnalysisId(e.target.value)}
            />
          </div>

          <div className="report-issue-modal__field">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              rows={4}
              required
              placeholder="Please describe what happened, steps to reproduce, or any relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="report-issue-modal__actions">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
