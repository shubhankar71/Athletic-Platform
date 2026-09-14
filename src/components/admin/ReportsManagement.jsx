import React, { useState, useEffect, useCallback } from "react";
import { Search, MessageSquare, AlertCircle, RefreshCw, Eye, CheckCircle2 } from "lucide-react";
import { getReportsApi, updateReportApi } from "../../api/reportApi.js";
import ReportDetailsModal from "./ReportDetailsModal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import "./ReportsManagement.css";

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected report for modal
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportsApi({ role: roleFilter, status: statusFilter, search });
      setReports(data.reports || []);
      setUnresolvedCount(data.unresolvedCount || 0);
    } catch (err) {
      console.error("fetchReports error:", err);
      setError(err.message || "Failed to load submitted reports.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const handleUpdateReport = async (reportId, updateData) => {
    await updateReportApi(reportId, updateData);
    fetchReports();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <Badge variant="red">OPEN</Badge>;
      case "in_progress":
        return <Badge variant="amber">IN PROGRESS</Badge>;
      case "resolved":
        return <Badge variant="teal">RESOLVED</Badge>;
      case "closed":
        return <Badge variant="neutral">CLOSED</Badge>;
      default:
        return <Badge variant="neutral">{status?.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="reports-mgmt">
      {/* Unresolved Count Banner */}
      <div className="reports-mgmt__banner">
        <div className="reports-mgmt__banner-info">
          <MessageSquare size={20} color="var(--accent-teal)" />
          <div>
            <h4>Reports & Issues Hub</h4>
            <p>Review and resolve inquiries submitted by athletes and coaches.</p>
          </div>
        </div>
        <div className="reports-mgmt__count-badge">
          <span>Unresolved Reports:</span>
          <strong>{unresolvedCount}</strong>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="reports-mgmt__toolbar">
        <div className="reports-mgmt__search">
          <Search size={16} className="reports-mgmt__search-icon" />
          <input
            type="text"
            placeholder="Search reports by subject, reporter, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="reports-mgmt__filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="reports-mgmt__select"
          >
            <option value="all">All Roles</option>
            <option value="athlete">Athletes</option>
            <option value="coach">Coaches</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="reports-mgmt__select"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Content Table / Loading / Empty / Error */}
      {loading && reports.length === 0 ? (
        <div className="reports-mgmt__state">
          <div className="btn-spinner">Loading submitted reports...</div>
        </div>
      ) : error ? (
        <div className="reports-mgmt__state error">
          <AlertCircle size={24} color="var(--signal-red)" />
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchReports}>Retry</Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="reports-mgmt__state empty">
          <CheckCircle2 size={28} color="var(--accent-teal)" />
          <p>No reports found matching criteria.</p>
        </div>
      ) : (
        <div className="reports-mgmt__table-wrapper">
          <table className="reports-mgmt__table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Role</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="reports-mgmt__reporter-cell">
                      <strong className="reports-mgmt__name">{r.userName}</strong>
                      <span className="reports-mgmt__email">{r.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={r.userRole === "coach" ? "coral" : "teal"}>
                      {r.userRole?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="reports-mgmt__category">{r.category}</td>
                  <td>
                    <span className="reports-mgmt__subject" title={r.subject}>
                      {r.subject}
                    </span>
                  </td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td className="reports-mgmt__date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="reports-view-btn"
                      onClick={() => setSelectedReport(r)}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Details & Response Modal */}
      {selectedReport && (
        <ReportDetailsModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
          onUpdateReport={handleUpdateReport}
        />
      )}
    </div>
  );
}
