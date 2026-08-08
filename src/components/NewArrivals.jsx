import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import './Components.css';

// Import local images for high-quality visuals
import newCorduroy from '../assets/new_corduroy.png';
import newStripes from '../assets/new_stripes.png';
import newLinen from '../assets/new_linen.png';
import newDenim from '../assets/new_denim.png';
import catShirts from '../assets/cat_shirts.png';

const productImages = {
  newCorduroy,
  newStripes,
  newLinen,
  newDenim,
  catShirts
};

export default function NewArrivals({ onQuickView, onAddToCart }) {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_new_arrival', true)
          .neq('category', 'Shorts')
          .neq('category', 'Innerwear')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (error) throw error;
        
        // Map database image keys to bundled assets
        const mappedData = (data || []).map(p => ({
          ...p,
          image: productImages[p.image] || p.image,
          secondaryImage: productImages[p.secondary_image] || p.secondary_image
        }));
        
        setNewArrivals(mappedData);
      } catch (err) {
        console.error('Error fetching new arrivals from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewArrivals();
  }, []);
  
  const handleProductAction = (e, product) => {
    e.stopPropagation(); // Avoid duplicate triggers
    onQuickView(product);
  };

  if (loading) {
    return (
      <section className="new-arrivals-section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="checkout-spinner" style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--accent-gold)',
            borderRadius: '50%',
            animation: 'pulseGlow 1s infinite'
          }}></div>
        </div>
      </section>
    );
  }

  return (
    <section className="new-arrivals-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">New Arrivals</h2>
          <a href="#shop" className="view-all-link">View all</a>
        </div>

        {/* 4-Column Product Grid */}
        <motion.div 
          className="new-arrivals-grid"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {newArrivals.map((product) => (
            <motion.div 
              key={product.id} 
              className="new-arrival-card"
              onClick={() => onQuickView(product)}
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1]
                  }
                }
              }}
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
                  onClick={(e) => handleProductAction(e, product)}
                >
                  Buy it now
                </button>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
