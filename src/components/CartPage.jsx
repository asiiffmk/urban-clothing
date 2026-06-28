import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import './Components.css';

export default function CartPage({ cartItems, onUpdateQuantity, onRemoveItem, onProceedToCheckout, onBack }) {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 150; // Rs. 150 shipping or free above Rs. 2000
  const total = subtotal + shipping;

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
          <div className="cart-page-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'start' }}>
            
            {/* Left Column: Items List */}
            <div className="cart-items-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-header)', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Garments ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
              
              <div className="checkout-items-list" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="checkout-cart-item" style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <img src={item.image} alt={item.name} className="checkout-item-img" style={{ width: '90px', height: '120px' }} />
                    
                    <div className="checkout-item-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div className="checkout-item-title-row">
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '500' }}>{item.name}</h4>
                        <span className="checkout-item-price" style={{ color: '#000000', fontSize: '1.05rem' }}>Rs. {item.price * item.quantity}</span>
                      </div>
                      
                      <div className="checkout-item-meta-row" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Size: <strong>{item.selectedSize}</strong></span>
                        {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
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
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Trigger */}
            <div className="cart-summary-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-header)', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Summary
              </h3>
              
              <div className="checkout-bill-details" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
                <div className="checkout-bill-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="checkout-bill-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : `Rs. ${shipping}`}</span>
                </div>
                <div className="checkout-bill-row total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-medium)', paddingTop: '1.5rem', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                  <span>Total Amount</span>
                  <span className="grand-total" style={{ color: '#000000' }}>Rs. {total}</span>
                </div>

                <button 
                  onClick={onProceedToCheckout}
                  className="btn btn-accent checkout-submit-btn"
                  style={{ width: '100%', marginTop: '2rem', display: 'block', textAlign: 'center' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
