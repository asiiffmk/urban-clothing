import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Search, ExternalLink, Package, Calendar, DollarSign, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import './Components.css';

const courierLinks = {
  'Delhivery': 'https://www.delhivery.com/track/package?trackingId=',
  'BlueDart': 'https://www.bluedart.com/tracking/',
  'DTDC': 'https://www.dtdc.in/tracking.asp?',
  'India Post': 'https://www.indiapost.gov.in/vas/pages/trackconsignment.aspx',
  'Ekart': 'https://ekartlogistics.com/shipmenttrack/',
  'XpressBees': 'https://www.xpressbees.com/shipment/tracking/',
  'Other': ''
};

const statusStyles = {
  'pending': { color: '#FFA500', bg: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.3)' },
  'confirmed': { color: '#0066CC', bg: 'rgba(0, 102, 204, 0.1)', border: '1px solid rgba(0, 102, 204, 0.3)' },
  'shipped': { color: '#FF6600', bg: 'rgba(255, 102, 0, 0.1)', border: '1px solid rgba(255, 102, 0, 0.3)' },
  'delivered': { color: '#00AA00', bg: 'rgba(0, 170, 0, 0.1)', border: '1px solid rgba(0, 170, 0, 0.3)' },
  'cancelled': { color: '#CC0000', bg: 'rgba(204, 0, 0, 0.1)', border: '1px solid rgba(204, 0, 0, 0.3)' }
};

export default function MyOrders({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Load orders stored in localStorage on mount
  useEffect(() => {
    loadLocalOrders();
  }, []);

  const loadLocalOrders = async () => {
    try {
      const placed = JSON.parse(localStorage.getItem('uc_placed_orders') || '[]');
      if (placed.length > 0) {
        setLoading(true);
        setError(null);
        
        // Fetch order details
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .in('id', placed)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          (ordersData || []).map(async (order) => {
            const { data: itemsData } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            return { ...order, items: itemsData || [] };
          })
        );

        setOrders(ordersWithItems);
      }
    } catch (err) {
      console.error('Error fetching local orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const query = searchQuery.trim();
      let ordersData = [];
      let ordersError = null;

      // Check if query is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);

      if (isUUID) {
        // Search by Order ID
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('id', query);
        ordersData = result.data || [];
        ordersError = result.error;
      } else {
        // Search by Phone (phone1)
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('phone1', query)
          .order('created_at', { ascending: false });
        ordersData = result.data || [];
        ordersError = result.error;
      }

      if (ordersError) throw ordersError;

      if (ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch items for matched orders
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          return { ...order, items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
      
      // Save searched order IDs to local storage for quick access next time
      try {
        const placed = JSON.parse(localStorage.getItem('uc_placed_orders') || '[]');
        ordersWithItems.forEach(o => {
          if (!placed.includes(o.id)) placed.push(o.id);
        });
        localStorage.setItem('uc_placed_orders', JSON.stringify(placed));
      } catch (e) {
        console.warn('Failed to cache order IDs:', e);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while retrieving order information. Please double check the ID or phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = (courier, trackingId) => {
    if (!trackingId) return;
    const baseLink = courierLinks[courier] || '';
    const link = baseLink.endsWith('=') || baseLink.endsWith('/') || baseLink.endsWith('?') 
      ? baseLink + trackingId 
      : baseLink;
    window.open(link, '_blank');
  };

  return (
    <div className="category-explore-view" style={{ minHeight: '90vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', paddingTop: '2rem' }}>
        
        {/* Header Back Button */}
        <button 
          onClick={onBack} 
          className="action-btn"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </button>

        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-header)', 
            fontSize: '2rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            marginBottom: '0.75rem',
            fontWeight: '700'
          }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            Check status, view dispatch timelines, and track delivery packages in real-time.
          </p>
        </div>

        {/* Search Bar lookup Form */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: '12px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Enter 10-digit Phone Number or Order Reference ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="review-form-input"
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 1rem 0.65rem 2.5rem', 
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.8rem', fontSize: '0.85rem', textTransform: 'uppercase', height: 'auto' }}
            >
              Look Up Order
            </button>
          </form>
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tip: Search using the exact phone number entered during checkout.
          </span>
        </div>

        {/* Loader */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="checkout-spinner" style={{
              width: '40px',
              height: '40px',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--accent-gold)',
              borderRadius: '50%',
              animation: 'pulseGlow 1s infinite'
            }}></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.5rem 2rem', borderLeft: '3px solid var(--accent-red)', marginBottom: '2rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--accent-red)' }} />
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Orders Result List */}
        {!loading && !error && (
          <div>
            {orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {orders.map((order) => {
                  const statusVal = (order.status || 'pending').toLowerCase();
                  const style = statusStyles[statusVal] || statusStyles.pending;
                  
                  return (
                    <div key={order.id} className="order-slip-card glass-panel" style={{ overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                      
                      {/* Top Header Row */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        flexWrap: 'wrap', 
                        gap: '1rem', 
                        padding: '1.5rem 2rem', 
                        borderBottom: '1px solid var(--border-light)',
                        background: 'rgba(255,255,255,0.01)'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Order Reference</span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--accent-gold)' }}>#{order.id}</strong>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={13} />
                              {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <DollarSign size={13} />
                              {order.payment_method || 'Razorpay'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          background: style.bg,
                          border: style.border,
                          color: style.color,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {order.status}
                        </span>
                      </div>

                      {/* Order Items Details */}
                      <div style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                          {(order.items || []).map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Package size={18} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                  <strong style={{ color: 'var(--text-primary)' }}>{item.product_name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                    Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: 'var(--text-muted)', marginRight: '1.5rem' }}>Qty: {item.quantity}</span>
                                <strong>Rs. {item.price}</strong>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Paid Amount:</span>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>Rs. {order.total_price}</strong>
                        </div>
                      </div>

                      {/* Shipping / Tracking Details Banner */}
                      <div style={{ 
                        padding: '1.5rem 2rem', 
                        background: 'rgba(255,255,255,0.01)', 
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {/* Shipped tracking info */}
                        {statusVal === 'shipped' && order.tracking_id && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <Truck size={20} style={{ color: 'var(--accent-gold)' }} />
                              <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Courier Partner & AWB</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                  <strong>{order.courier_name || 'Delhivery'}</strong> — AWB: <span style={{ fontFamily: 'monospace' }}>{order.tracking_id}</span>
                                </span>
                                {order.shipped_at && (
                                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    Dispatched: {new Date(order.shipped_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleTrackOrder(order.courier_name || 'Delhivery', order.tracking_id)}
                              style={{ 
                                display: 'flex', 
                                gap: '0.4rem', 
                                alignItems: 'center', 
                                padding: '0.5rem 1.2rem', 
                                fontSize: '0.8rem', 
                                textTransform: 'uppercase',
                                height: 'auto'
                              }}
                            >
                              Track Order
                              <ExternalLink size={12} />
                            </button>
                          </div>
                        )}

                        {/* Delivered Date Info */}
                        {statusVal === 'delivered' && (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <CheckCircle2 size={20} style={{ color: '#00AA00' }} />
                            <span>
                              Order delivered successfully. {order.delivered_at && `Delivered on: ${new Date(order.delivered_at).toLocaleString()}`}
                            </span>
                          </div>
                        )}

                        {/* Pending Info */}
                        {statusVal === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Clock size={18} />
                            <span>Tailoring & processing order. We will ship and update tracking details shortly.</span>
                          </div>
                        )}

                        {/* Confirmed Info */}
                        {statusVal === 'confirmed' && (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Clock size={18} />
                            <span>Tailoring complete. Order confirmed, awaiting dispatch.</span>
                          </div>
                        )}

                        {/* Cancelled Info */}
                        {statusVal === 'cancelled' && (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <AlertCircle size={20} style={{ color: 'var(--accent-red)' }} />
                            <span>This order has been cancelled. Contact support for inquiries.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              searched && (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No matching orders found.</p>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
