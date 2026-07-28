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
      <div className="new-arrival-image-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          className="new-arrival-img"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="new-arrival-info">
        <h3 className="new-arrival-name">{product.name}</h3>
        <span className="new-arrival-price">Rs. {product.price}</span>
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
