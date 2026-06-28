import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { supabase } from '../supabaseClient';
import './Components.css';

// Import local image assets for correct bundler mapping
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

export default function CategoryExplorePage({ activeCategory, onAddToCart, onQuickView, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    async function fetchCategoryProducts() {
      try {
        let query = supabase.from('products').select('*');
        
        // Filter by category if not 'All'
        if (activeCategory && activeCategory.toLowerCase() !== 'all') {
          // Categories in DB are plural (e.g. Shirts, Pants), but let's do a case-insensitive check
          query = query.ilike('category', activeCategory);
        }
        
        const { data, error } = await query.order('id', { ascending: true });
        
        if (error) throw error;
        
        const mappedData = (data || []).map(p => ({
          ...p,
          image: productImages[p.image] || p.image,
          secondaryImage: productImages[p.secondary_image] || p.secondary_image
        }));
        
        setProducts(mappedData);
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryProducts();
  }, [activeCategory]);

  return (
    <div className="category-explore-view" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="container">
        
        {/* Premium Back Button */}
        <button className="premium-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </button>

        {/* Section Header */}
        <h1 className="category-explore-title">
          {activeCategory.toLowerCase() === 'all' 
            ? 'All Essentials' 
            : `${activeCategory} Collection`}
        </h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div className="checkout-spinner" style={{
              width: '28px',
              height: '28px',
              border: '2px solid rgba(212,175,55,0.1)',
              borderTopColor: 'var(--accent-gold)',
              borderRadius: '50%',
              animation: 'pulseGlow 1s infinite'
            }}></div>
          </div>
        ) : products.length === 0 ? (
          <div className="explore-empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h3>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              We couldn't find any products in the "{activeCategory}" category at this time.
            </p>
          </div>
        ) : (
          /* Products Grid with Entrance Stagger */
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
            animate="visible"
            key={activeCategory}
          >
            {products.map((product) => (
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
        )}

      </div>
    </div>
  );
}
