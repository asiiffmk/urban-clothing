import React from 'react';
import './Components.css';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const handleProductAction = (e) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div 
      className="new-arrival-card"
      onClick={() => onQuickView(product)}
      style={{ cursor: 'pointer' }}
    >
      {/* Product Image */}
      <div className="new-arrival-image-wrap" style={{ position: 'relative' }}>
        {product.offer_price && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'var(--accent-gold)',
            color: '#0e0e10',
            padding: '0.3rem 0.7rem',
            fontSize: '0.72rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            borderRadius: '2px',
            zIndex: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-header)'
          }}>
            Sale
          </span>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="new-arrival-img"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="new-arrival-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', marginBottom: '1rem', width: '100%' }}>
        <h3 className="new-arrival-name" style={{ maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '300' }}>{product.name}</h3>
        <span className="new-arrival-price" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '300' }}>
          {product.offer_price ? (
            <>
              <span style={{ color: 'var(--accent-gold)', fontWeight: '300' }}>Rs. {product.offer_price}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85em', fontWeight: '300' }}>Rs. {product.price}</span>
            </>
          ) : (
            `Rs. ${product.price}`
          )}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="new-arrival-actions">
        <button 
          className="new-arrival-btn btn-add-cart"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          Add to cart
        </button>
        <button 
          className="new-arrival-btn btn-buy-now"
          onClick={handleProductAction}
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}
