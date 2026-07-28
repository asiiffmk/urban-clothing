import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [showShippingForm, setShowShippingForm] = useState(false);

  // Customer Shipping Details State
  const [customerName, setCustomerName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [houseName, setHouseName] = useState('');
  const [localPlace, setLocalPlace] = useState('');
  const [pincode, setPincode] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      // 1. Validate Stock for all items first in a single check loop
      for (const item of cartItems) {
        const { data: prod, error: fetchError } = await supabase
          .from('products')
          .select('name, sizes_stock')
          .eq('id', item.id)
          .single();
        
        if (fetchError || !prod) {
          throw new Error(`Failed to fetch stock for ${item.name}`);
        }
        
        const stockMap = prod.sizes_stock || {};
        const availableStock = stockMap[item.selectedSize] !== undefined ? stockMap[item.selectedSize] : 4;
        
        if (availableStock < item.quantity) {
          alert(`Insufficient stock for "${prod.name}" (Size: ${item.selectedSize}). Only ${availableStock} items are available. Please adjust your bag.`);
          setIsCheckingOut(false);
          return;
        }
      }
      
      // 2. Insert order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            total_price: total,
            status: 'confirmed',
            customer_name: customerName,
            phone1: phone1,
            phone2: phone2 || null,
            house_name: houseName,
            local_place: localPlace,
            pincode: pincode,
            post_office: postOffice,
            district: district,
            state: state,
            full_address: fullAddress
          }
        ])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      const orderId = orderData.id;
      setConfirmedOrderId(orderId);
      
      // 3. Insert order items & Deduct Stock
      for (const item of cartItems) {
        // Insert item record
        const { error: itemInsertError } = await supabase
          .from('order_items')
          .insert([
            {
              order_id: orderId,
              product_id: item.id,
              product_name: item.name,
              size: item.selectedSize,
              color: item.selectedColor || null,
              quantity: item.quantity,
              price: item.price
            }
          ]);
        
        if (itemInsertError) throw itemInsertError;
        
        // Fetch current stock maps
        const { data: prod } = await supabase
          .from('products')
          .select('sizes_stock')
          .eq('id', item.id)
          .single();
          
        if (prod) {
          const updatedStock = { ...prod.sizes_stock };
          const currentStock = updatedStock[item.selectedSize] !== undefined ? updatedStock[item.selectedSize] : 4;
          updatedStock[item.selectedSize] = Math.max(0, currentStock - item.quantity);
          
          const { error: stockUpdateError } = await supabase
            .from('products')
            .update({ sizes_stock: updatedStock })
            .eq('id', item.id);
            
          if (stockUpdateError) throw stockUpdateError;
        }
      }
      
      // 4. Success state reset
      setOrderComplete(true);
      onClearCart();
      // Clear shipping inputs
      setCustomerName('');
      setPhone1('');
      setPhone2('');
      setHouseName('');
      setLocalPlace('');
      setPostOffice('');
      setPincode('');
      setDistrict('');
      setState('');
      setFullAddress('');
      setShowShippingForm(false);
    } catch (err) {
      console.error('Error during Supabase checkout transaction:', err);
      alert('We were unable to process your checkout. Please check your connection and try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset order completion screen after slide close
    setTimeout(() => {
      setOrderComplete(false);
      setConfirmedOrderId('');
      setShowShippingForm(false);
    }, 400);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`cart-overlay ${isOpen ? 'open' : ''}`} 
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer glass-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="cart-header">
          {showShippingForm && !orderComplete && (
            <button className="action-btn" onClick={() => setShowShippingForm(false)} aria-label="Back to Bag">
              <ArrowLeft size={20} />
            </button>
          )}
          <h3 className="cart-title">
            {orderComplete ? 'Confirmed' : showShippingForm ? 'Shipping details' : `Your Bag (${cartItems.reduce((acc, i) => acc + i.quantity, 0)})`}
          </h3>
          <button className="close-cart-btn action-btn" onClick={handleClose} aria-label="Close Bag">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="cart-items" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {orderComplete ? (
            /* Checkout Success State */
            <div className="cart-empty" style={{ animation: 'fadeIn 0.4s ease' }}>
              <CheckCircle2 size={56} style={{ color: 'var(--accent-gold)' }} />
              <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1rem' }}>Order Confirmed</h4>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                Thank you for shopping at Urban. Your order #{confirmedOrderId ? confirmedOrderId.substring(0, 8).toUpperCase() : 'URB-78249'} has been dispatched.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleClose}>
                Continue Browsing
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="cart-empty">
              <p style={{ fontStyle: 'italic' }}>Your shopping bag is currently empty.</p>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleClose}>
                Return to Shop
              </button>
            </div>
          ) : showShippingForm ? (
            /* Shipping Address Form */
            <form id="shipping-form" onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
              <div className="review-form-group">
                <label htmlFor="shipName">Full Name</label>
                <input 
                  type="text" 
                  id="shipName" 
                  className="review-form-input" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Liam K."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipPhone1">Phone No 1</label>
                  <input 
                    type="tel" 
                    id="shipPhone1" 
                    className="review-form-input" 
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="Primary contact"
                    required
                  />
                </div>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipPhone2">Phone No 2</label>
                  <input 
                    type="tel" 
                    id="shipPhone2" 
                    className="review-form-input" 
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="Alternative contact number"
                    required
                  />
                </div>
              </div>

              <div className="review-form-group">
                <label htmlFor="shipHouse">House Name / No.</label>
                <input 
                  type="text" 
                  id="shipHouse" 
                  className="review-form-input" 
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="House/Apt name or number"
                  required
                />
              </div>

              <div className="review-form-group">
                <label htmlFor="shipLocal">Local Place / Landmark</label>
                <input 
                  type="text" 
                  id="shipLocal" 
                  className="review-form-input" 
                  value={localPlace}
                  onChange={(e) => setLocalPlace(e.target.value)}
                  placeholder="e.g. Near Civic Center"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipPO">Post Office</label>
                  <input 
                    type="text" 
                    id="shipPO" 
                    className="review-form-input" 
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    placeholder="P.O."
                    required
                  />
                </div>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipPin">Pin Code</label>
                  <input 
                    type="text" 
                    id="shipPin" 
                    className="review-form-input" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipDist">District</label>
                  <input 
                    type="text" 
                    id="shipDist" 
                    className="review-form-input" 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                    required
                  />
                </div>
                <div className="review-form-group" style={{ flex: 1 }}>
                  <label htmlFor="shipState">State</label>
                  <input 
                    type="text" 
                    id="shipState" 
                    className="review-form-input" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="review-form-group">
                <label htmlFor="shipAddress">Full Address</label>
                <textarea 
                  id="shipAddress" 
                  className="review-form-input" 
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Complete postal address description"
                  rows={2}
                  required
                />
              </div>
            </form>
          ) : (
            /* Items List */
            cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <div>
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-meta">
                        <span>Size: <strong>{item.selectedSize}</strong></span>
                        {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                      </div>
                    </div>
                    <span className="cart-item-price">${item.price * item.quantity}</span>
                  </div>

                  <div className="cart-item-actions">
                    {/* Quantity controls */}
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Trash Button */}
                    <button 
                      className="remove-item-btn"
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer calculation */}
        {!orderComplete && cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span className="total-price">${total}</span>
            </div>

            {showShippingForm ? (
              <button 
                type="submit"
                form="shipping-form"
                className="btn btn-accent checkout-btn"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <span className="checkout-spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(10,10,12,0.3)',
                      borderTopColor: 'var(--bg-primary)',
                      borderRadius: '50%',
                      animation: 'pulseGlow 1s infinite'
                    }}></span>
                    Processing...
                  </span>
                ) : 'Place Order & Pay'}
              </button>
            ) : (
              <button 
                className="btn btn-accent checkout-btn"
                onClick={() => setShowShippingForm(true)}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        )}

      </div>
    </>
  );
}
