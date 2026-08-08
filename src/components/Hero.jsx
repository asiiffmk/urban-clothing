import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function Hero() {
  const [mediaType, setMediaType] = useState('video');
  const [mediaUrl, setMediaUrl] = useState('/hero-video.mp4');

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const typeRow = data.find(r => r.key === 'hero_media_type');
          const urlRow = data.find(r => r.key === 'hero_media_url');
          if (typeRow) setMediaType(typeRow.value);
          if (urlRow) setMediaUrl(urlRow.value);
        }
      } catch (err) {
        console.warn("Failed to fetch hero settings from site_settings (using default video):", err);
      }
    }
    loadSettings();
  }, []);

  // Framer Motion Entrance Animation Variants
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const bgVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.0, ease: 'easeOut' } 
    }
  };

  return (
    <section className="hero-section">
      {/* Editorial Background Video or Image */}
      <motion.div 
        className="hero-bg"
        initial="hidden"
        animate="visible"
        variants={bgVariants}
        key={mediaUrl + mediaType} // Reset container element when configuration switches
      >
        {mediaType === 'image' ? (
          <img 
            src={mediaUrl} 
            alt="Hero Background" 
            className="hero-image" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <video 
            src={mediaUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hero-image"
          />
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="container">
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h1 className="hero-title">
            URBAN CLOTHING
          </h1>
          <p className="hero-tagline">
            SINCE 2023
          </p>
          <div className="hero-cta">
            <motion.a 
              href="#shop" 
              className="btn-glass"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Shop Now
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
