import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Runtime Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-0)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          padding: '2rem'
        }}>
          <div style={{
            maxHeight: '90vh',
            maxWidth: '540px',
            backgroundColor: 'var(--bg-1)',
            border: '1px solid var(--border-strong)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--signal-red-wash)',
              color: 'var(--signal-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.75rem'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Interface Recovered
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              An unexpected display issue occurred in this section. The application recovered safely without shutting down.
            </p>
            {this.state.error?.message && (
              <p style={{
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                backgroundColor: 'var(--bg-3)',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                color: 'var(--signal-red)',
                marginBottom: '1.5rem',
                wordBreak: 'break-word'
              }}>
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                backgroundColor: 'var(--accent-teal)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Reload Application View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
