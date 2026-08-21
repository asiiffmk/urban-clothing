import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './Components.css';

export default function Hero() {
  // Framer Motion Entrance Animation Variants
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 } 
    }
  };

  return (
    <section className="hero-section" style={{ background: 'var(--bg-primary)' }}>
      {/* Subtle ambient lighting/glow effect behind the content */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Main Content Area */}
      <div className="container" style={{ zIndex: 2, display: 'flex', justifyContent: 'center' }}>
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Main Logo Image */}
          <motion.img 
            src={logoImg} 
            alt="Urban Clothing" 
            variants={logoVariants}
            style={{ 
              maxWidth: '300px', 
              width: '75%', 
              height: 'auto', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 0 35px rgba(255, 255, 255, 0.08)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6))',
              objectFit: 'contain'
            }}
          />

          <p className="hero-tagline" style={{ letterSpacing: '0.35em', fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--accent-gold)' }}>
            SINCE 2023
          </p>

          <div className="hero-cta" style={{ marginTop: '2.5rem' }}>
            <motion.a 
              href="#shop" 
              className="btn-glass"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(212, 175, 55, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Explore Collection
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
