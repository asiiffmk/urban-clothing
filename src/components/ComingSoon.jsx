import React from 'react';

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0c',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Helvetica Neue', sans-serif",
      padding: '2rem',
      textAlign: 'center',
    }}>

      {/* Brand Name */}
      <div style={{
        letterSpacing: '0.4em',
        fontSize: '0.85rem',
        color: '#c9a96e',
        marginBottom: '3rem',
        textTransform: 'uppercase',
      }}>
        Urban Clothing
      </div>

      {/* Coming Soon */}
      <div style={{
        letterSpacing: '0.3em',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
      }}>
        Coming Soon
      </div>

      {/* Main Headline */}
      <h1 style={{
        fontSize: 'clamp(2rem, 6vw, 4rem)',
        fontWeight: 200,
        letterSpacing: '0.1em',
        lineHeight: 1.2,
        marginBottom: '1.5rem',
        maxWidth: '700px',
      }}>
        Something New Is Coming
      </h1>

      {/* Subtext */}
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.95rem',
        letterSpacing: '0.05em',
        marginBottom: '4rem',
        maxWidth: '400px',
        lineHeight: 1.8,
      }}>
        We are crafting something special for you. Stay tuned.
      </p>

      {/* Divider */}
      <div style={{
        width: '60px',
        height: '1px',
        background: 'rgba(255,255,255,0.15)',
        marginBottom: '3rem',
      }} />

      {/* Instagram Link */}
      <a
        href="https://www.instagram.com/urbanclothinn"
        target="_blank"
        rel="noreferrer"
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          marginBottom: '4rem',
        }}
        onMouseEnter={e => e.target.style.color = '#c9a96e'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
      >
        Instagram
      </a>

      {/* Footer */}
      <div style={{
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.7rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginTop: '4rem',
      }}>
        © 2026 Urban Clothing Store
      </div>

    </div>
  );
}