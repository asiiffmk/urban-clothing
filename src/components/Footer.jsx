import React, { useState } from 'react';
import { Send } from 'lucide-react';
import './Components.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer id="story" className="site-footer">
      <div className="container">
        
        {/* Footer Main Grid */}
        <div className="footer-grid">
          
          {/* Col 1: About */}
          <div className="footer-col footer-about">
            <h4 style={{ fontFamily: 'var(--font-header)', fontWeight: '800', letterSpacing: '0.15em' }}>Urban</h4>
            <p>
              Architectural gents' wear tailored for modern urban living. We focus on premium sustainable fabrics, minimalist aesthetics, and functional shapes.
            </p>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col">
            <h4>Stay Updated</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              Subscribe to unlock early lookbook access and 10% off your initial purchase.
            </p>
            
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
                aria-label="Email Address for newsletter"
              />
              <button type="submit" className="newsletter-submit" aria-label="Subscribe">
                <Send size={14} />
              </button>
            </form>

            {subscribed && (
              <p className="newsletter-success">
                Welcome to the vanguard. Code: URBAN10
              </p>
            )}
          </div>

          {/* Col 3: Customer Service */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#sizing">Size Guide</a></li>
              <li><a href="#shop">Shipping & Returns</a></li>
              <li><a href="#story">Our Workshop</a></li>
              <li><a href="#story">Contact Details</a></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span className="copyright">
            © {new Date().getFullYear()} Urban Gents Wear. All rights reserved. Created in partnership with Gapsy.
          </span>
          
          <div className="social-links">
            <a href="#" className="social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="social-btn" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="social-btn" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
