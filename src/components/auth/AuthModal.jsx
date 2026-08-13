import React, { useState } from 'react';
import { useAuth, getDashboardRoute } from '../../context/AuthContext.jsx';
import { X, LogIn, UserPlus, Shield, UserCheck, AlertCircle } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onNavigate }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('athlete');
  
  // UI status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting...`);
        setTimeout(() => {
          setLoading(false);
          onClose();
          const route = res.redirectUrl || getDashboardRoute(res.user.role);
          if (onNavigate) {
            onNavigate(route, res.user.role);
          }
        }, 800);
      } else {
        const res = await register(name, email, password, role);
        setSuccessMsg(`Account created for ${res.user.name} (${res.user.role})! Redirecting...`);
        setTimeout(() => {
          setLoading(false);
          onClose();
          const route = res.redirectUrl || getDashboardRoute(res.user.role);
          if (onNavigate) {
            onNavigate(route, res.user.role);
          }
        }, 800);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="auth-modal__overlay">
      <div className="auth-modal__content">
        <button className="auth-modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="auth-modal__header">
          <div className="auth-modal__logo">
            <Shield className="auth-modal__logo-icon" />
            <span>SportsRBAC</span>
          </div>
          <h2>{mode === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Access your role-restricted sports dashboard'
              : 'Choose your role and join the athletic management platform'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-modal__tabs">
          <button
            className={`auth-modal__tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('login')}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            className={`auth-modal__tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('register')}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {error && (
          <div className="auth-modal__alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-modal__alert success">
            <UserCheck size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal__form">
          {mode === 'register' && (
            <div className="auth-modal__field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="auth-modal__field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="user@sportsplatform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-modal__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-modal__field">
              <label>Select User Role (RBAC)</label>
              <div className="auth-modal__roles">
                <label className={`role-option ${role === 'athlete' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="athlete"
                    checked={role === 'athlete'}
                    onChange={() => setRole('athlete')}
                  />
                  <div className="role-option__content">
                    <span className="role-title">🏃 Athlete</span>
                    <span className="role-desc">Performance stats & drills</span>
                  </div>
                </label>

                <label className={`role-option ${role === 'coach' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="coach"
                    checked={role === 'coach'}
                    onChange={() => setRole('coach')}
                  />
                  <div className="role-option__content">
                    <span className="role-title">📋 Coach</span>
                    <span className="role-desc">Roster & team management</span>
                  </div>
                </label>

                {/* Admin role selection removed — admin accounts are seeded by server only */}
              </div>
            </div>
          )}

          <button type="submit" className="auth-modal__submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner">Processing...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create {role.toUpperCase()} Account
              </>
            )}
          </button>
        </form>

        <div className="auth-modal__footer">
          <small>
            Role-Based Authentication powered by Node.js/Express JWT & Mongoose User Model.
          </small>
        </div>
      </div>
    </div>
  );
}
