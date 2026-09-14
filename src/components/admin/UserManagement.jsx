import React, { useState, useEffect, useCallback } from "react";
import { Search, ShieldAlert, ShieldCheck, UserX, Trash2, RefreshCw, UserCheck } from "lucide-react";
import { getUsersApi, banUserApi, unbanUserApi, deleteUserApi } from "../../api/adminApi.js";
import BanUserModal from "./BanUserModal.jsx";
import DeleteUserModal from "./DeleteUserModal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import "./UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Selected user for Ban or Delete modal
  const [selectedUserForBan, setSelectedUserForBan] = useState(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersApi({ search, role: roleFilter });
      setUsers(data || []);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError(err.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleBanConfirm = async (userId, banData) => {
    const res = await banUserApi(userId, banData);
    setActionMessage(res.message || "User status updated.");
    setTimeout(() => setActionMessage(null), 4000);
    fetchUsers();
  };

  const handleUnban = async (user) => {
    if (!window.confirm(`Unban ${user.name} and restore account access?`)) return;
    try {
      const res = await unbanUserApi(user._id);
      setActionMessage(res.message || "User unbanned successfully.");
      setTimeout(() => setActionMessage(null), 4000);
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to unban user.");
    }
  };

  const handleDeleteConfirm = async (userId) => {
    const res = await deleteUserApi(userId);
    setActionMessage(res.message || "User account deleted.");
    setTimeout(() => setActionMessage(null), 4000);
    fetchUsers();
  };

  return (
    <div className="user-mgmt">
      {actionMessage && (
        <div className="user-mgmt__toast">
          <UserCheck size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Toolbar: Search + Filter + Refresh */}
      <div className="user-mgmt__toolbar">
        <div className="user-mgmt__search">
          <Search size={16} className="user-mgmt__search-icon" />
          <input
            type="text"
            placeholder="Search athletes or coaches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-mgmt__filter-group">
          <label htmlFor="role-select" className="eyebrow">Role:</label>
          <select
            id="role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="user-mgmt__role-select"
          >
            <option value="all">All (Athletes & Coaches)</option>
            <option value="athlete">Athletes Only</option>
            <option value="coach">Coaches Only</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchUsers} disabled={loading} title="Refresh User List">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Content Table / Loading / Empty / Error States */}
      {loading && users.length === 0 ? (
        <div className="user-mgmt__state">
          <div className="btn-spinner">Loading registered users...</div>
        </div>
      ) : error ? (
        <div className="user-mgmt__state error">
          <ShieldAlert size={24} color="var(--signal-red)" />
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchUsers}>Retry</Button>
        </div>
      ) : users.length === 0 ? (
        <div className="user-mgmt__state empty">
          <UserX size={28} color="var(--text-tertiary)" />
          <p>No athletes or coaches found matching query.</p>
        </div>
      ) : (
        <div className="user-mgmt__table-wrapper">
          <table className="user-mgmt__table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isTempBanned = u.isBanned && u.banType === "temporary";
                const isPermBanned = u.isBanned && u.banType === "permanent";
                const untilDate = u.banUntil ? new Date(u.banUntil).toLocaleDateString() : "";

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="user-mgmt__name-cell">
                        <span className="user-mgmt__avatar">
                          {u.name?.slice(0, 2).toUpperCase() || "US"}
                        </span>
                        <span className="user-mgmt__name">{u.name}</span>
                      </div>
                    </td>
                    <td className="user-mgmt__email">{u.email}</td>
                    <td>
                      <Badge variant={u.role === "coach" ? "coral" : "teal"}>
                        {u.role?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {isPermBanned ? (
                        <div className="user-mgmt__status-badge banned-perm">
                          <ShieldAlert size={12} />
                          <span>Permanently Banned</span>
                        </div>
                      ) : isTempBanned ? (
                        <div className="user-mgmt__status-badge banned-temp">
                          <ShieldAlert size={12} />
                          <span>Banned until {untilDate}</span>
                        </div>
                      ) : (
                        <div className="user-mgmt__status-badge active">
                          <ShieldCheck size={12} />
                          <span>Active</span>
                        </div>
                      )}
                    </td>
                    <td className="user-mgmt__date">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="user-mgmt__action-btns">
                        {u.isBanned ? (
                          <button
                            type="button"
                            className="mgmt-btn unban"
                            onClick={() => handleUnban(u)}
                            title="Unban user and restore account access"
                          >
                            <ShieldCheck size={14} />
                            <span>Unban</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mgmt-btn ban"
                            onClick={() => setSelectedUserForBan(u)}
                            title="Temporarily or Permanently Ban User"
                          >
                            <ShieldAlert size={14} />
                            <span>Ban</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="mgmt-btn delete"
                          onClick={() => setSelectedUserForDelete(u)}
                          title="Delete User Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ban Modal */}
      {selectedUserForBan && (
        <BanUserModal
          isOpen={!!selectedUserForBan}
          onClose={() => setSelectedUserForBan(null)}
          user={selectedUserForBan}
          onConfirmBan={handleBanConfirm}
        />
      )}

      {/* Delete Modal */}
      {selectedUserForDelete && (
        <DeleteUserModal
          isOpen={!!selectedUserForDelete}
          onClose={() => setSelectedUserForDelete(null)}
          user={selectedUserForDelete}
          onConfirmDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
