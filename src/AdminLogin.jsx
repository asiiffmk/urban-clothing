import React, { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === adminPassword) {
      onLogin();
    } else {
      setError('Incorrect password credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '24px',
      position: 'relative',
      zIndex: 2
    }}>
      <div className="admin-login-card" style={{
        background: 'rgba(18, 18, 20, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(30px)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-block',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(197, 168, 128, 0.08)',
            border: '1px solid rgba(197, 168, 128, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-gold, #c5a880)',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            UC
          </div>
          <h2 style={{
            color: '#ffffff',
            fontSize: '1.75rem',
            fontWeight: '800',
            marginBottom: '8px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-heading, inherit)'
          }}>ADMIN GATE</h2>
          <p style={{
            color: 'var(--text-muted, #8a8a93)',
            fontSize: '0.85rem',
            letterSpacing: '0.5px'
          }}>Enter password to access operations control</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.8rem',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-muted, #8a8a93)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Security Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold, #c5a880)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            />
          </div>

          <button type="submit" style={{
            background: 'var(--accent-gold, #c5a880)',
            color: '#0e0e10',
            border: 'none',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.1s',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: '8px'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.9'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
