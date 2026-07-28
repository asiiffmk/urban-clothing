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
          .select('*');
        
        if (error) throw error;

        const orderMap = {
          'shirt': 1,
          't-shirt': 2,
          't shirt': 2,
          'pant': 3,
          'pants': 3,
          'shorts': 4,
          'innerwear': 5
        };

        const getOrder = (name) => {
          const norm = (name || '').toLowerCase().trim();
          if (orderMap[norm] !== undefined) return orderMap[norm];
          
          if (norm.includes('t-shirt') || norm.includes('t shirt')) return 2;
          if (norm.includes('shirt')) return 1;
          if (norm.includes('pant')) return 3;
          if (norm.includes('shorts')) return 4;
          if (norm.includes('innerwear')) return 5;
          return 999;
        };

        const sortedData = (data || [])
          .filter(cat => cat.id !== 'shorts' && cat.id !== 'innerwear')
          .sort((a, b) => getOrder(a.name) - getOrder(b.name));
        setCategories(sortedData);
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
