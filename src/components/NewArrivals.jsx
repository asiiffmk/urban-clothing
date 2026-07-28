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
            border: '2px solid rgba(212,175,55,0.1)',
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
