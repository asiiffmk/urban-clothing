import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

// Import local category images for high-quality aesthetics
import catShirts from '../assets/cat_shirts.png';
import catTshirts from '../assets/cat_tshirts.png';
import catPants from '../assets/cat_pants.png';
import catShorts from '../assets/cat_shorts.png';
import catInnerwear from '../assets/cat_innerwear.png';

const categoryImages = {
  catShirts,
  catTshirts,
  catPants,
  catShorts,
  catInnerwear
};

export default function Categories({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    onCategorySelect(categoryName);
    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="categories-section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
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
    <section className="categories-section">
      <div className="container">
        {/* Section Title */}
        <div style={{ position: 'relative' }}>
          <h2 className="section-title">Shop by <span className="highlight">Category</span></h2>
          
          {/* Scroll Indicator Prompt (Visible top-left above cards on mobile) */}
          <div className="category-mobile-scroll-indicator">
            <ArrowLeft size={13} />
            <span>Scroll</span>
          </div>
        </div>
        <p className="section-subtitle">
          Modern essentials designed for comfort, utility, and refined aesthetics.
        </p>

        {/* Categories Row */}
        <div className="categories-list">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="category-image-wrap">
                <img 
                  src={categoryImages[cat.image] || cat.image} 
                  alt={`${cat.name} Category`} 
                  className="category-img"
                  loading="lazy"
                />
              </div>
              <h3 className="category-label">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
