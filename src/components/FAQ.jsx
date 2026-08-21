import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import './Components.css';

export default function FAQ({ onBack }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What is the return policy?",
      answer: (
        <div>
          <p style={{ marginBottom: '1rem' }}>
            We don't accept returns or exchanges for size issues, as we provide a detailed size chart before purchase. If the product arrives damaged, incorrect, or in the wrong size, you can return it.
          </p>
          <p style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderLeft: '3px solid var(--accent-gold)',
            fontSize: '0.9rem',
            color: 'var(--text-primary)'
          }}>
            <strong>Important:</strong> Please record a quick 360° video while opening your package. If there's a problem, contact us right away and send the item back within 3 days. Once we receive it, we'll issue a refund or replacement.
          </p>
        </div>
      )
    },
    {
      question: "When will I get my order?",
      answer: (
        <div>
          <div style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
            Once dispatched, delivery times are as follows:
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', listStyleType: 'disc' }}>
              <li><strong>Inside Kerala:</strong> Delivery usually takes <strong>1–3 working days</strong>.</li>
              <li><strong>Outside Kerala:</strong> Delivery usually takes <strong>3–7 working days</strong>.</li>
            </ul>
            We use express courier services for faster shipping. If a PIN code is not serviceable by our courier partner, we dispatch securely through India Post.
          </div>
        </div>
      )
    },
    {
      question: "How much does shipping cost?",
      answer: (
        <div>
          <p style={{ marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
            We offer flat-rate express shipping depending on your location:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Inside Kerala</h4>
              <p style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontWeight: '800' }}>₹50 <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ item</span></p>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Outside Kerala</h4>
              <p style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontWeight: '800' }}>₹100 <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ item</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "What payment methods do you accept?",
      answer: (
        <div>
          <p style={{ marginBottom: '1rem' }}>We accept the following secure payment methods:</p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem' 
          }}>
            {['UPI (GPay, PhonePe, Paytm)', 'Debit & Credit Cards', 'Net Banking'].map((method, idx) => (
              <span key={idx} style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)'
              }}>
                {method}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      question: "Can I change or cancel my order?",
      answer: (
        <div>
          <p style={{ marginBottom: '1rem' }}>
            You can cancel or modify your order only before it has been shipped. Once the order is shipped, cancellations are not possible.
          </p>
          <p>
            To cancel, contact us immediately via WhatsApp or email with your order ID. If the order is already shipped, you will need to wait for delivery and then follow our return process.
          </p>
        </div>
      )
    },
    {
      question: "Is there any shop available?",
      answer: (
        <div>
          <p style={{ marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Yes, we welcome you to visit our physical experience store to browse and try on our tailored garments in person:
          </p>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-header)', fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: '700' }}>
              Urban Clothing Store
            </h4>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '1rem' }}>
              Thangals Road, Kondotty,<br />
              Malappuram District, Kerala<br />
              PIN: 673638
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <strong>Store Hours:</strong> Monday - Sunday (10:00 AM - 9:00 PM)
            </p>
            <a 
              href="https://share.google/Ttm3D0BUxjzWoAQvV" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: 'var(--accent-gold)',
                fontWeight: '600',
                transition: 'var(--transition-fast)'
              }}
              className="hover-gold"
            >
              <span>View on Google Maps</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      )
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section" style={{ minHeight: '100vh', padding: '4rem 1rem 8rem 1rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {onBack && (
          <button 
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '2rem',
              fontFamily: 'var(--font-header)',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }}
            className="hover-gold"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}
        
        {/* Section Header */}
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: '300' }}>
          Frequently Asked <span className="highlight" style={{ fontWeight: '300' }}>Questions</span>
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', fontWeight: '300' }}>
          Got questions? We've got answers. Explore our shipping, returns, and ordering policies.
        </p>

        {/* FAQ Accordion Grid */}
        <div className="faq-accordion-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item glass-panel ${isOpen ? 'active' : ''}`}
                style={{
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isOpen ? 'var(--bg-secondary)' : 'rgba(14, 14, 16, 0.6)',
                  border: isOpen ? '1px solid var(--accent-gold)' : '1px solid var(--border-light)',
                  transition: 'var(--transition-smooth)',
                  overflow: 'hidden'
                }}
              >
                {/* Header/Question Trigger */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontFamily: 'var(--font-header)',
                    fontWeight: '300',
                    fontSize: '1.05rem',
                    color: isOpen ? 'var(--accent-gold)' : 'var(--text-primary)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <span>{item.question}</span>
                  <ChevronDown 
                    size={18} 
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: isOpen ? 'var(--accent-gold)' : 'var(--text-muted)',
                      flexShrink: 0,
                      marginLeft: '1rem'
                    }} 
                  />
                </button>

                {/* Answer Content */}
                <div
                  className="faq-content-wrap"
                  style={{
                    maxHeight: isOpen ? '1000px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontWeight: '300'
                  }}>
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
