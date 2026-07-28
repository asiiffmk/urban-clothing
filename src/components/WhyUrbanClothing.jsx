import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Leaf, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function WhyUrbanClothing() {
  const [cards, setCards] = useState([
    {
      icon: "Sparkles",
      title: "Sartorial Excellence",
      description: "Meticulously designed silhouettes cut from luxury weight fabrics, ensuring architectural form and a refined drape."
    },
    {
      icon: "Compass",
      title: "Minimalist Philosophy",
      description: "We design modern essentials that eliminate clutter. Clean lines, neutral palettes, and timeless, modular styles."
    },
    {
      icon: "Leaf",
      title: "Sustainably Sourced",
      description: "Committed to conscious craftsmanship, utilizing organic micro-modal cotton, pure linens, and responsibly sourced textiles."
    }
  ]);

  useEffect(() => {
    async function loadWhyCards() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'why_cards_config')
          .single();
        if (error) throw error;
        if (data && data.value) {
          setCards(JSON.parse(data.value));
        }
      } catch (err) {
        console.warn("Failed to fetch why cards config, using default static values:", err);
      }
    }
    loadWhyCards();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Compass": return <Compass size={32} className="pillar-icon" />;
      case "Leaf": return <Leaf size={32} className="pillar-icon" />;
      case "ShieldCheck": return <ShieldCheck size={32} className="pillar-icon" />;
      default: return <Sparkles size={32} className="pillar-icon" />;
    }
  };

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
          {cards.map((pillar, idx) => (
            <div key={idx} className="pillar-card glass-panel">
              <div className="pillar-icon-wrap">
                {getIcon(pillar.icon)}
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
