import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function RefundReturnPage({ products = [], onBack }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [complaint, setComplaint] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch products if not passed as props
  const [dbProducts, setDbProducts] = useState([]);
  useEffect(() => {
    if (products.length === 0) {
      async function fetchProducts() {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .order('name');
          if (!error && data) {
            setDbProducts(data);
          }
        } catch (err) {
          console.error("Error loading products for dropdown:", err);
        }
      }
      fetchProducts();
    }
  }, [products]);

  const activeProductsList = products.length > 0 ? products : dbProducts;

  const handleSendToWhatsApp = (e) => {
    e.preventDefault();

    if (!selectedProductId && !customProduct.trim()) {
      setErrorMsg('Please specify the product you bought.');
      return;
    }
    if (!complaint.trim()) {
      setErrorMsg('Please describe your complaint.');
      return;
    }
    if (!hasVideo) {
      setErrorMsg('You must confirm that you have a 360° unboxing video.');
      return;
    }

    setErrorMsg('');

    // Determine product name
    let productName = '';
    if (selectedProductId) {
      const prod = activeProductsList.find(p => p.id.toString() === selectedProductId.toString());
      productName = prod ? prod.name : '';
    } else {
      productName = customProduct;
    }

    // Format WhatsApp message
    const waNumber = '918137896653';
    const message = `Hi Urban Gents,

I would like to request a Refund / Return.

*Product Details:*
- Product: ${productName}
- Size/Color/Other Details: ${otherDetails.trim() || 'N/A'}

*Complaint Description:*
${complaint.trim()}

*Unboxing Video Status:*
- 360° package opening video is recorded and ready to send.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="refund-return-container" style={{ padding: '4rem 0', minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ maxWidth: '650px' }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
            transition: 'var(--transition-fast)'
          }}
          className="hover-gold"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          Refund & <span className="highlight">Return</span>
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
          Please fill in the complaint details below. Submitting this form will automatically format and send your request via WhatsApp.
        </p>

        {/* Unboxing Video Warning Callout */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <Video size={24} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-header)', fontWeight: '700', marginBottom: '0.25rem' }}>
              360° Package Opening Video Required
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              To qualify for a refund or replacement due to damage or incorrect items, you must provide a 360° unboxing video recorded while opening the package.
            </p>
          </div>
        </div>

        {/* Refund Form */}
        <form onSubmit={handleSendToWhatsApp} className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          {errorMsg && (
            <div style={{ color: '#E53E3E', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
              * {errorMsg}
            </div>
          )}



          {/* Product Bought Selection */}
          <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="productSelect" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Garment / Product Bought <span style={{ color: 'var(--accent-gold)' }}>*</span>
            </label>
            <select
              id="productSelect"
              className="review-form-input"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                if (e.target.value) setCustomProduct('');
              }}
              style={{ width: '100%', cursor: 'pointer', background: 'var(--bg-tertiary)' }}
            >
              <option value="">-- Select Product --</option>
              {activeProductsList.map((prod) => (
                <option key={prod.id} value={prod.id}>{prod.name}</option>
              ))}
              <option value="custom">Other (Type manually...)</option>
            </select>
          </div>

          {/* Custom Product Input if select "custom" */}
          {(selectedProductId === 'custom' || !selectedProductId) && (
            <div className="review-form-group" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.2s ease' }}>
              <label htmlFor="customProduct" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Specify Product Name <span style={{ color: 'var(--accent-gold)' }}>*</span>
              </label>
              <input 
                type="text" 
                id="customProduct" 
                className="review-form-input" 
                value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                placeholder="e.g. Black Linen Shirt"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Other Details (Size/Color) */}
          <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="otherDetails" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Size / Color / Custom Fit Details
            </label>
            <input 
              type="text" 
              id="otherDetails" 
              className="review-form-input" 
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="e.g. Size M, Obsidian Black"
              style={{ width: '100%' }}
            />
          </div>

          {/* Complaint Description */}
          <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="complaint" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Describe the issue / Complaint <span style={{ color: 'var(--accent-gold)' }}>*</span>
            </label>
            <textarea 
              id="complaint" 
              className="review-form-input" 
              rows={4}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Please explain the issue (e.g. arrived damaged, wrong sizing, incorrect style)..."
              required
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Video Confirmation Checkbox */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => setHasVideo(!hasVideo)}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '4px', 
              border: hasVideo ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)', 
              background: hasVideo ? 'var(--accent-gold)' : 'transparent',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'var(--transition-fast)'
            }}>
              {hasVideo && <CheckCircle2 size={14} style={{ color: 'var(--bg-primary)' }} />}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', userSelect: 'none', lineHeight: '1.4' }}>
              I confirm that I have recorded a <strong>360° unboxing video</strong> while opening the package and am ready to send it via WhatsApp. <span style={{ color: 'var(--accent-gold)' }}>*</span>
            </span>
          </div>

          {/* Submit/WhatsApp Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.1em'
            }}
          >
            {/* Inline WhatsApp SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.27-5.594l.412.245c1.554.923 3.327 1.41 5.318 1.412 5.56 0 10.086-4.524 10.089-10.09.002-2.697-1.047-5.234-2.956-7.146C17.279 4.908 14.73 3.86 12.015 3.86c-5.568 0-10.1 4.525-10.103 10.093-.001 1.942.506 3.839 1.467 5.518l.262.457-1.0 3.65 3.738-.981zm12.302-5.467c-.29-.145-1.716-.848-1.98-.943-.263-.096-.454-.145-.646.145-.19.29-.738.943-.905 1.136-.168.19-.336.214-.627.069-.29-.145-1.226-.452-2.335-1.442-.863-.77-1.446-1.72-1.615-2.01-.168-.29-.018-.448.127-.592.13-.13.29-.336.436-.506.145-.168.193-.29.29-.482.096-.192.048-.36-.024-.506-.073-.145-.646-1.558-.885-2.136-.233-.56-.47-.482-.646-.492-.167-.008-.36-.01-.55-.01-.19 0-.503.07-.767.36-.263.29-1.004.981-1.004 2.392 0 1.41 1.028 2.77 1.171 2.964.143.193 2.023 3.09 4.898 4.332.684.296 1.218.472 1.636.605.687.218 1.312.187 1.806.114.55-.082 1.716-.7 1.96-1.376.244-.677.244-1.258.172-1.377-.073-.118-.263-.19-.553-.335z" />
            </svg>
            Send Complaint via WhatsApp
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hint: Clicking send will redirect you to WhatsApp with your complaint prefilled.
          </div>
        </form>

      </div>
    </div>
  );
}
