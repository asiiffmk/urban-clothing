import React from 'react';
import { Sparkles, Compass, Leaf, ShieldCheck } from 'lucide-react';
import './Components.css';

export default function WhyUrbanClothing() {
  const pillars = [
    {
      icon: <Sparkles size={32} className="pillar-icon" />,
      title: "Sartorial Excellence",
      description: "Meticulously designed silhouettes cut from luxury weight fabrics, ensuring architectural form and a refined drape."
    },
    {
      icon: <Compass size={32} className="pillar-icon" />,
      title: "Minimalist Philosophy",
      description: "We design modern essentials that eliminate clutter. Clean lines, neutral palettes, and timeless, modular styles."
    },
    {
      icon: <Leaf size={32} className="pillar-icon" />,
      title: "Sustainably Sourced",
      description: "Committed to conscious craftsmanship, utilizing organic micro-modal cotton, pure linens, and responsibly sourced textiles."
    },
    {
      icon: <ShieldCheck size={32} className="pillar-icon" />,
      title: "Gentlemen's Guarantee",
      description: "Experience absolute peace of mind with our hassle-free exchanges, premium luxury packaging, and dedicated support."
    }
  ];

  return (
    <section className="why-urban-section">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="section-title">
          Why <span className="highlight">Urban Clothing</span>
        </h2>
        <p className="section-subtitle">
          Crafting modern gentlemen's wear with an uncompromising focus on premium tailoring, refined comfort, and sustainable minimalism.
        </p>

        {/* Pillars Grid */}
        <div className="pillars-grid">
          {pillars.slice(0, 3).map((pillar, idx) => (
            <div key={idx} className="pillar-card glass-panel">
              <div className="pillar-icon-wrap">
                {pillar.icon}
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-desc">{pillar.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
