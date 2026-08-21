import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import './ProtectedRoute.css';

/**
 * ProtectedRoute Guard Component
 * 
 * Enforces strict access rules:
 * 1. Unauthenticated users -> 401 Authentication Required
 * 2. Authenticated non-athletes trying to access athlete features (or non-admins trying admin) -> 403 Forbidden
 */
export default function ProtectedRoute({ allowedRoles = [], children, onOpenLogin }) {
  const { user, isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="protected-route__loading">
        <div className="protected-route__spinner"></div>
        <p>Verifying authentication & role permissions...</p>
      </div>
    );
  }

  // 1. Unauthenticated -> 401 "Authentication required."
  if (!isAuthenticated) {
    return (
      <div className="protected-route__container protected-route__unauthorized">
        <div className="protected-route__card">
          <div className="protected-route__icon-wrapper icon-lock">
            <Lock className="protected-route__icon" />
          </div>
          <span className="protected-route__badge">401 Unauthorized</span>
          <h2>Authentication Required</h2>
          <p>Authentication required. Please sign in with your athlete credentials to access video analysis.</p>
          {onOpenLogin && (
            <button className="protected-route__btn primary" onClick={onOpenLogin}>
              <LogIn size={18} />
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Role Restriction -> 403 "Video analysis is available only to athletes." for video analysis, or "Admin access required."
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const isAthleteRoute = allowedRoles.includes('athlete');
    const forbiddenMessage = isAthleteRoute
      ? "Video analysis is available only to athletes."
      : "Admin dashboard is available only to administrators.";

    return (
      <div className="protected-route__container protected-route__forbidden">
        <div className="protected-route__card">
          <div className="protected-route__icon-wrapper icon-shield">
            <ShieldAlert className="protected-route__icon" />
          </div>
          <span className="protected-route__badge" style={{ backgroundColor: "rgba(230, 57, 70, 0.2)", color: "#e63946" }}>
            403 Forbidden
          </span>
          <h2>Access Denied</h2>
          <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#e63946", margin: "0.5rem 0" }}>
            {forbiddenMessage}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Your account role is <strong>{role.toUpperCase()}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Authorized!
  return children;
}
