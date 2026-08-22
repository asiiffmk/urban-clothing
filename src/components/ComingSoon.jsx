import React, { useState, useEffect } from 'react';

const LAUNCH_DATE = new Date();
LAUNCH_DATE.setDate(LAUNCH_DATE.getDate() + 14);

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = LAUNCH_DATE - now;
      if (diff <= 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you! We will notify you at ${email} when we launch.`);
      setEmail('');
    }
  };

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

      {/* Logo */}
      <div style={{
        letterSpacing: '0.4em',
        fontSize: '0.85rem',
        color: '#c9a96e',
        marginBottom: '3rem',
        textTransform: 'uppercase',
      }}>
        Urban Clothing
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

      {/* Countdown Timer */}
      <div style={{
        display: 'flex',
        gap: 'clamp(1rem, 4vw, 3rem)',
        marginBottom: '4rem',
      }}>
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 200,
              color: '#c9a96e',
              minWidth: '60px',
              transition: 'all 0.3s',
            }}>
              {String(value).padStart(2, '0')}
            </div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '0.5rem',
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        width: '60px',
        height: '1px',
        background: 'rgba(255,255,255,0.15)',
        marginBottom: '3rem',
      }} />

      {/* Email Signup */}
      <form onSubmit={handleNotify} style={{
        display: 'flex',
        gap: '0',
        marginBottom: '3rem',
        width: '100%',
        maxWidth: '420px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem',
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.85rem 1.2rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.85rem 1.5rem',
            background: '#c9a96e',
            color: '#0a0a0c',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Notify Me
        </button>
      </form>

      {/* Social Links */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '4rem',
      }}>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => e.target.style.color = '#c9a96e'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          Instagram
        </a>
        <a
          href="https://wa.me/919747416502"
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => e.target.style.color = '#c9a96e'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          WhatsApp
        </a>
      </div>

      {/* Footer */}
      <div style={{
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.7rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        © 2026 Urban Clothing Store
      </div>

    </div>
  );
}