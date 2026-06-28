import React from 'react';
import { lookbooks, products } from '../data/mockData';
import './Components.css';

export default function Lookbook({ onQuickView }) {
  
  const handleHotspotClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      onQuickView(product);
    }
  };

  return (
    <section id="lookbook" className="lookbook-section">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="section-title">
          Shop The <span className="highlight">Look</span>
        </h2>
        <p className="section-subtitle">
          Interactive campaign shoot. Hover over the glowing hotspots on the models to inspect details and purchase.
        </p>

        {/* Lookbooks Masonry Grid */}
        <div className="lookbook-masonry">
          {lookbooks.map((look) => (
            <div key={look.id} className="lookbook-card">
              
              {/* Image with Pins */}
              <div className="lookbook-img-wrap">
                <img 
                  src={look.image} 
                  alt={look.title} 
                  className="lookbook-img"
                  loading="lazy"
                />

                {/* Hotspot Pins */}
                {look.hotspots.map((spot) => (
                  <React.Fragment key={spot.id}>
                    {/* Hotspot Button */}
                    <button
                      className="hotspot-pin"
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onClick={() => handleHotspotClick(spot.productId)}
                      aria-label={`View details for ${spot.productName}`}
                    >
                      <span className="hotspot-inner"></span>
                    </button>

                    {/* Popover Hover Card */}
                    <div 
                      className="hotspot-card glass-panel"
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onClick={() => handleHotspotClick(spot.productId)}
                    >
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {spot.productName}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: '700', margin: 0 }}>
                        Rs. {spot.price}
                      </p>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '0.5rem', display: 'block' }}>
                        Quick View →
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Look Meta Details */}
              <div className="lookbook-meta">
                <span style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600' }}>
                  {look.subtitle}
                </span>
                <h3>{look.title}</h3>
                <p>{look.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
