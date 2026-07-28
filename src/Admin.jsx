import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session exists in sessionStorage
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession === 'active') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('admin_session', 'active');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #0c0c0e)',
        color: 'var(--text-muted, #8a8a93)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        Authenticating Secure Access...
      </div>
    );
  }

  return (
    <div className="admin-root" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #0c0c0e)',
      color: '#ffffff',
      paddingTop: 'var(--header-height, 80px)',
      boxSizing: 'border-box'
    }}>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
}
