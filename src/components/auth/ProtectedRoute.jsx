import React from 'react';
import { useAuth, getDashboardRoute } from '../../context/AuthContext.jsx';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import './ProtectedRoute.css';

/**
 * ProtectedRoute Component / Higher-Order Guard
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - List of allowed roles e.g. ['athlete', 'coach']
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {Function} props.onOpenLogin - Optional callback to trigger login modal
 */
export default function ProtectedRoute({ allowedRoles = [], children, onOpenLogin }) {
  const { user, isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="protected-route__loading">
        <div className="protected-route__spinner"></div>
        <p>Verifying role-based permissions...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="protected-route__container protected-route__unauthorized">
        <div className="protected-route__card">
          <div className="protected-route__icon-wrapper icon-lock">
            <Lock className="protected-route__icon" />
          </div>
          <h2>Authentication Required</h2>
          <p>
            You must be logged in to access this page. Please sign in with your account credentials.
          </p>
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

  // Case 2: Role Authorization Check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const targetRoute = getDashboardRoute(role);

    return (
      <div className="protected-route__container protected-route__forbidden">
        <div className="protected-route__card">
          <div className="protected-route__icon-wrapper icon-shield">
            <ShieldAlert className="protected-route__icon" />
          </div>
          <span className="protected-route__badge">403 Forbidden</span>
          <h2>Unauthorized Role Access</h2>
          <p>
            Your current role (<strong>{role.toUpperCase()}</strong>) does not have authorization to view this area.
          </p>
          <div className="protected-route__info">
            <p>Required Roles: <span>{allowedRoles.join(', ')}</span></p>
            <p>Your Role: <span className="role-tag">{role}</span></p>
          </div>
          <a href={targetRoute} className="protected-route__btn secondary">
            Go to My Dashboard ({targetRoute})
          </a>
        </div>
      </div>
    );
  }

  // Authorized!
  return children;
}
