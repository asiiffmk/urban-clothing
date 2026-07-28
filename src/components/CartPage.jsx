import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import './Components.css';

export default function CartPage({ cartItems, products = [], onUpdateQuantity, onRemoveItem, onProceedToCheckout, onProductClick, onBack }) {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="checkout-page-view">
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div className="details-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="premium-back-btn" onClick={onBack} style={{ marginBottom: 0 }}>
            <span>← Back to Shop</span>
          </button>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Shopping Bag</span>
        </div>

        <h1 className="checkout-page-title">Your Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <div className="checkout-empty-state">
            <h3>Your Shopping Bag is empty</h3>
            <p>Explore our premium collections and add tailored garments to your bag to proceed with checkout.</p>
            <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1.5rem' }}>
              Browse Collection
            </button>
          </div>
        ) : (
          <div className="cart-page-layout">
            
            {/* Left Column: Items List */}
            <div className="cart-items-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-header)', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Garments ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
              
              <div className="checkout-items-list" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                {cartItems.map((item) => {
                  const dbProduct = products.find(p => p.id === item.id);
                  const sizeStockMap = dbProduct ? (dbProduct.sizes_stock || {}) : {};
                  const availableStock = sizeStockMap[item.selectedSize] !== undefined ? sizeStockMap[item.selectedSize] : 4;
                  const isOutOfStock = availableStock <= 0;

                  return (
                    <div key={`${item.id}-${item.selectedSize}`} className="checkout-cart-item" style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="checkout-item-img" 
                        style={{ width: '90px', height: '120px', cursor: 'pointer' }} 
                        onClick={() => onProductClick(item)}
                      />
                      
                      <div className="checkout-item-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                        <div className="checkout-item-title-row">
                          <h4 
                            style={{ fontSize: '1.05rem', fontWeight: '500', cursor: 'pointer' }}
                            onClick={() => onProductClick(item)}
                          >
                            {item.name}
                          </h4>
                          <span className="checkout-item-price" style={{ color: 'var(--accent-gold)', fontSize: '1.05rem' }}>Rs. {item.price * item.quantity}</span>
                        </div>
                        
                        <div className="checkout-item-meta-row" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                          <span>Size: <strong>{item.selectedSize}</strong></span>
                          {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                          {isOutOfStock && (
                            <span style={{ color: 'var(--accent-red, #DC2626)', fontWeight: 'bold', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <div className="checkout-item-quantity-actions" style={{ marginTop: '0.75rem' }}>
                          <div className="quantity-controls" style={{ display: 'inline-flex', gap: '1rem', border: '1px solid var(--border-light)', borderRadius: '30px', padding: '0.25rem 0.6rem', alignItems: 'center' }}>
                            <button 
                              className="qty-btn" 
                              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-val" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                            <button 
                              className="qty-btn" 
                              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                              disabled={availableStock <= item.quantity}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: availableStock <= item.quantity ? 0.3 : 1 }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button 
                            className="remove-item-btn"
                            onClick={() => onRemoveItem(item.id, item.selectedSize)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', gap: '0.4rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '2rem' }}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Trigger */}
            <div className="cart-summary-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-header)', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Summary
              </h3>
              
              <div className="checkout-bill-details" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
                <div className="checkout-bill-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                  * Shipping calculated at checkout.
                </div>
                <div className="checkout-bill-row total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-medium)', paddingTop: '1.5rem', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                  <span>Total Amount</span>
                  <span className="grand-total" style={{ color: 'var(--accent-gold)' }}>Rs. {total}</span>
                </div>

                {(() => {
                  const hasOutOfStockItems = cartItems.some(item => {
                    const dbProduct = products.find(p => p.id === item.id);
                    const sizeStockMap = dbProduct ? (dbProduct.sizes_stock || {}) : {};
                    const availableStock = sizeStockMap[item.selectedSize] !== undefined ? sizeStockMap[item.selectedSize] : 4;
                    return availableStock <= 0;
                  });

                  return (
                    <button 
                      onClick={onProceedToCheckout}
                      className="btn btn-accent checkout-submit-btn"
                      style={{ width: '100%', marginTop: '2rem', display: 'block', textAlign: 'center', opacity: hasOutOfStockItems ? 0.5 : 1, cursor: hasOutOfStockItems ? 'not-allowed' : 'pointer' }}
                      disabled={hasOutOfStockItems}
                      title={hasOutOfStockItems ? "Please remove out of stock garments to proceed." : ""}
                    >
                      {hasOutOfStockItems ? "Out of Stock Items in Bag" : "Proceed to Checkout"}
                    </button>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
