import React from 'react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem',
      textAlign: 'center',
      color: '#333',
    }}>

      {/* Error Icon */}
      <div style={{
        fontSize: '5rem',
        marginBottom: '1rem',
      }}>
        🚫
      </div>

      {/* Error Code */}
      <h1 style={{
        fontSize: '6rem',
        fontWeight: 700,
        color: '#e0e0e0',
        margin: '0',
        lineHeight: 1,
      }}>
        404
      </h1>

      {/* Error Title */}
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#333',
        margin: '1rem 0 0.5rem',
      }}>
        This page isn't available
      </h2>

      {/* Error Description */}
      <p style={{
        color: '#666',
        fontSize: '0.95rem',
        maxWidth: '400px',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        The link may be broken, or the page may have been removed. 
        Check to see if the link you're trying to open is correct.
      </p>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <a
          href="/"
          style={{
            background: '#1a73e8',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Go to Homepage
        </a>
        <a
          href="javascript:history.back()"
          style={{
            background: '#f1f3f4',
            color: '#333',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Go Back
        </a>
      </div>

      {/* Error Details */}
      <div style={{
        marginTop: '3rem',
        padding: '1rem 2rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        maxWidth: '400px',
        textAlign: 'left',
      }}>
        <p style={{
          fontSize: '0.8rem',
          color: '#999',
          margin: '0 0 0.5rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Error Details
        </p>
        <p style={{
          fontSize: '0.85rem',
          color: '#555',
          margin: '0',
          fontFamily: 'monospace',
        }}>
          HTTP 404 — Not Found<br />
          urbanclothingstore.in
        </p>
      </div>

    </div>
  );
}