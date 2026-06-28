import React, { useState } from 'react';
import { X, Star, ShoppingBag } from 'lucide-react';
import './Components.css';

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');

  if (!isOpen || !product) return null;

  const handleAddToBag = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    onAddToCart(product, selectedSize);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Grid Container */}
        <div className="modal-grid">
          
          {/* Left Column: Image */}
          <div className="modal-image-col">
            <img src={product.image} alt={product.name} className="modal-img" />
          </div>

          {/* Right Column: Information */}
          <div className="modal-details-col">
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {product.category}
              </span>
              <h3 style={{ fontSize: '2.2rem', textTransform: 'uppercase', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                {product.name}
              </h3>
              
              <div className="rating-stars" style={{ fontSize: '0.9rem', gap: '0.4rem' }}>
                <Star size={14} className="star-icon" />
                <span>{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="modal-price">Rs. {product.price}</div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {product.description}
            </p>

            {/* Sizing Selector */}
            <div>
              <span className="modal-sizes-title">Select Sizing</span>
              <div className="modal-sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Specifications list */}
            <div className="modal-specs">
              <h4 className="specs-title">Crafting & Details</h4>
              <ul className="specs-list">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            {/* Add to Bag CTA */}
            <button 
              className="btn btn-accent" 
              onClick={handleAddToBag}
              style={{ width: '100%', display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}
            >
              <ShoppingBag size={18} />
              Add to Shopping Bag
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
