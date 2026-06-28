import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function CheckoutPage({ cartItems, onClearCart, onBack }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

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
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 150; // Rs. 150 shipping or free above Rs. 2000
  const total = subtotal + shipping;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      // 1. Validate Stock for all items first
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
        
        // Fetch current stock to subtract
        const { data: currentProduct } = await supabase
          .from('products')
          .select('sizes_stock')
          .eq('id', item.id)
          .single();
          
        const stockMap = currentProduct.sizes_stock || {};
        const oldStock = stockMap[item.selectedSize] !== undefined ? stockMap[item.selectedSize] : 4;
        
        const updatedStockMap = {
          ...stockMap,
          [item.selectedSize]: Math.max(0, oldStock - item.quantity)
        };
        
        // Update product stock map in DB
        const { error: updateError } = await supabase
          .from('products')
          .update({ sizes_stock: updatedStockMap })
          .eq('id', item.id);
          
        if (updateError) throw updateError;
      }
      
      // Success triggers complete order screen
      setOrderComplete(true);
      onClearCart();
      
    } catch (error) {
      console.error("Checkout transaction error:", error);
      alert(`Checkout failed: ${error.message || error}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout-success-view">
        <div className="success-card">
          <CheckCircle2 size={64} className="success-icon" />
          <h2>Order Confirmed!</h2>
          <p className="order-number-label">Order Reference: <strong>#{confirmedOrderId}</strong></p>
          <p className="success-message">
            Thank you for shopping with Urban Gents Wear. Your order has been registered successfully and is being tailored for shipment. We will contact you at <strong>{phone1}</strong> details shortly.
          </p>
          <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-view">
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div className="details-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="premium-back-btn" onClick={onBack} style={{ marginBottom: 0 }}>
            <ArrowLeft size={16} />
            <span>Back to Bag</span>
          </button>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Secure Checkout</span>
        </div>

        <h1 className="checkout-page-title">Delivery Details</h1>

        {cartItems.length === 0 ? (
          <div className="checkout-empty-state">
            <h3>Your Shopping Bag is empty</h3>
            <p>Explore our premium collections and add tailored garments to your bag to proceed with checkout.</p>
            <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1.5rem' }}>
              Browse Collection
            </button>
          </div>
        ) : (
          <div className="checkout-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'start' }}>
            
            {/* Left Column: Shipping details */}
            <div className="checkout-form-column">
              <h3>Shipping Address</h3>
              <form id="checkout-shipping-form" onSubmit={handleCheckoutSubmit} className="checkout-address-form">
                
                <div className="review-form-group">
                  <label htmlFor="shipName">Full Name</label>
                  <input 
                    type="text" 
                    id="shipName" 
                    className="review-form-input" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="review-form-group" style={{ flex: 1 }}>
                    <label htmlFor="shipPhone1">Primary Phone</label>
                    <input 
                      type="tel" 
                      id="shipPhone1" 
                      className="review-form-input" 
                      value={phone1}
                      onChange={(e) => setPhone1(e.target.value)}
                      placeholder="Primary contact number"
                      required
                    />
                  </div>
                  <div className="review-form-group" style={{ flex: 1 }}>
                    <label htmlFor="shipPhone2">Secondary Phone (Optional)</label>
                    <input 
                      type="tel" 
                      id="shipPhone2" 
                      className="review-form-input" 
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                      placeholder="Alternative contact number"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="review-form-group" style={{ flex: 1 }}>
                    <label htmlFor="shipHouse">House Name/No.</label>
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
                  <div className="review-form-group" style={{ flex: 1 }}>
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
                      placeholder="Post Office name"
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
                      placeholder="6-digit pincode"
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
                    placeholder="Complete postal address details"
                    rows={3}
                    required
                  />
                </div>

              </form>
            </div>

            {/* Right Column: Read-Only items summary & order pricing */}
            <div className="checkout-summary-column">
              <h3>Order Summary</h3>
              <div className="checkout-items-list-read-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <div>
                      <strong>{item.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({item.selectedSize})</span>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Quantity: {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Order total math summary */}
              <div className="checkout-bill-details" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
                <div className="checkout-bill-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="checkout-bill-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : `Rs. ${shipping}`}</span>
                </div>
                <div className="checkout-bill-row total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-medium)', paddingTop: '1.25rem', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  <span>Total Amount</span>
                  <span className="grand-total" style={{ color: '#000000' }}>Rs. {total}</span>
                </div>

                <button 
                  type="submit"
                  form="checkout-shipping-form"
                  className="btn btn-accent checkout-submit-btn"
                  disabled={isCheckingOut}
                  style={{ width: '100%', marginTop: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                >
                  {isCheckingOut ? 'Processing Order...' : 'Confirm Order & Pay'}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
