import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { supabase } from '../supabaseClient';
import './Components.css';

// Import all product assets
import catShirts from '../assets/cat_shirts.png';
import catTshirts from '../assets/cat_tshirts.png';
import catPants from '../assets/cat_pants.png';
import catShorts from '../assets/cat_shorts.png';
import catInnerwear from '../assets/cat_innerwear.png';
import overcoatImg from '../assets/overcoat.png';
import blazerImg from '../assets/blazer.png';
import sweaterImg from '../assets/sweater.png';
import cargoImg from '../assets/cargo.png';
import heroImg from '../assets/hero.png';
import newCorduroy from '../assets/new_corduroy.png';
import newStripes from '../assets/new_stripes.png';
import newLinen from '../assets/new_linen.png';
import newDenim from '../assets/new_denim.png';

const productImages = {
  catShirts,
  catTshirts,
  catPants,
  catShorts,
  catInnerwear,
  overcoatImg,
  blazerImg,
  sweaterImg,
  cargoImg,
  heroImg,
  newCorduroy,
  newStripes,
  newLinen,
  newDenim
};

export default function ProductGrid({ activeFilter, onFilterChange, onAddToCart, onQuickView, searchTerm = '', onExploreCategory }) {
  const categories = ['All', 'Shirts', 'Tshirts', 'Pants'];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('category', 'Shorts')
          .neq('category', 'Innerwear')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const mappedData = (data || []).map(p => ({
          ...p,
          image: productImages[p.image] || p.image,
          secondaryImage: productImages[p.secondary_image] || p.secondary_image
        }));
        
        setProducts(mappedData);
      } catch (err) {
        console.error('Error fetching products from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    return activeFilter === 'All' || p.category.toLowerCase() === activeFilter.toLowerCase();
  });

  // Display only 4 cards preview
  const displayedProducts = filteredProducts.slice(0, 4);

  if (loading) {
    return (
      <section id="shop" className="product-section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
    <section id="shop" className="product-section">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="section-title">
          The <span className="highlight">Collection</span>
        </h2>
        <p className="section-subtitle">
          Explore our range of premium gentlemen's essentials, from textured linen shirts to modern relaxed shorts.
        </p>

        {/* Filter Navigation */}
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => onFilterChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid - Always shows up to 2 cards */}
        <motion.div 
          className="products-grid"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          key={activeFilter}
        >
          {displayedProducts.map((product) => (
            <motion.div
              key={product.id}
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
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Explore Button - Navigates to a new page */}
        {filteredProducts.length > 4 && (
          <div className="explore-collection-btn-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
            <div className="explore-arrow-premium">
              <ChevronDown size={16} />
            </div>
            <button 
              className="explore-collection-link"
              onClick={() => onExploreCategory(activeFilter)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-header)',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0.5rem 1rem'
              }}
            >
              Explore Collection
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
