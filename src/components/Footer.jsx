import React, { useState } from 'react';
import { Send } from 'lucide-react';
import './Components.css';

export default function Footer({ activeView, onContactClick, onViewChange }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      
      {/* Premium Contact Section (Shown only on Home view) */}
      {activeView === 'home' && (
        <div id="contact" className="contact-section">
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{
              fontFamily: 'var(--font-header)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '1.35rem',
              marginBottom: '1rem',
              fontWeight: '700'
            }}>
              Get In Touch
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Have questions about sizing, customization, or shipping? Reach out to us directly through WhatsApp or Email. We're here to help you tailor your fit.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {/* Email Button */}
              <a href="mailto:support@urbangents.com" className="btn btn-primary" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.8rem',
                textDecoration: 'none',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}>
                Email Us
              </a>

              {/* WhatsApp Button */}
              <a href="https://wa.me/918137896653" target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.8rem',
                textDecoration: 'none',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.27-5.594l.412.245c1.554.923 3.327 1.41 5.318 1.412 5.56 0 10.086-4.524 10.089-10.09.002-2.697-1.047-5.234-2.956-7.146C17.279 4.908 14.73 3.86 12.015 3.86c-5.568 0-10.1 4.525-10.103 10.093-.001 1.942.506 3.839 1.467 5.518l.262.457-1.0 3.65 3.738-.981zm12.302-5.467c-.29-.145-1.716-.848-1.98-.943-.263-.096-.454-.145-.646.145-.19.29-.738.943-.905 1.136-.168.19-.336.214-.627.069-.29-.145-1.226-.452-2.335-1.442-.863-.77-1.446-1.72-1.615-2.01-.168-.29-.018-.448.127-.592.13-.13.29-.336.436-.506.145-.168.193-.29.29-.482.096-.192.048-.36-.024-.506-.073-.145-.646-1.558-.885-2.136-.233-.56-.47-.482-.646-.492-.167-.008-.36-.01-.55-.01-.19 0-.503.07-.767.36-.263.29-1.004.981-1.004 2.392 0 1.41 1.028 2.77 1.171 2.964.143.193 2.023 3.09 4.898 4.332.684.296 1.218.472 1.636.605.687.218 1.312.187 1.806.114.55-.082 1.716-.7 1.96-1.376.244-.677.244-1.258.172-1.377-.073-.118-.263-.19-.553-.335z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      )}

      <div id="story" className="container" style={{ paddingTop: '4rem' }}>
        
        {/* Footer Main Grid */}
        <div className="footer-grid">
          
          {/* Col 1: About */}
          <div className="footer-col footer-about">
            <h4 style={{ fontFamily: 'var(--font-header)', fontWeight: '800', letterSpacing: '0.15em' }}>Urban</h4>
            <p>
              Architectural gents' wear tailored for modern urban living. We focus on premium sustainable fabrics, minimalist aesthetics, and functional shapes.
            </p>
          </div>

          {/* Col 3: Customer Service */}
          <div className="footer-col footer-support">
            <h4>Support</h4>
            <ul>
              <li><a href="#sizing">Size Guide</a></li>
              <li>
                <a 
                  href="#refund" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewChange) onViewChange('refund');
                  }}
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewChange) onViewChange('faq');
                  }}
                >
                  FAQs
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onContactClick) onContactClick();
                  }}
                >
                  Contact Details
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <span className="copyright">
            © 2023 Urban Gents Wear. All rights reserved.
          </span>
          
          <div className="social-links">
            <a href="https://www.instagram.com/urbanclothinn?igsh=MTg3dmFnbnQ3cTc5aw==" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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
