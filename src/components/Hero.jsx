import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.png';
import './Components.css';

export default function Hero() {
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
      {/* Editorial Right Background Video */}
      <motion.div 
        className="hero-bg"
        initial="hidden"
        animate="visible"
        variants={bgVariants}
      >
        <video 
          src="/hero-video.mp4" 
          poster={heroImg}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="hero-image"
        />
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
            SINCE 2021
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
