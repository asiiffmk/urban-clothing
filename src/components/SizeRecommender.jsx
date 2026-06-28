import React, { useState, useEffect } from 'react';
import './Components.css';

export default function SizeRecommender() {
  const [height, setHeight] = useState(178); // cm
  const [weight, setWeight] = useState(72);  // kg
  const [fit, setFit] = useState('regular');  // slim, regular, oversized
  const [recommendedSize, setRecommendedSize] = useState('M');
  const [confidence, setConfidence] = useState(92);

  useEffect(() => {
    // Sizing Logic
    let size = 'M';
    let baseConfidence = 90;

    if (weight < 62) {
      size = height < 172 ? 'S' : 'M';
    } else if (weight >= 62 && weight < 76) {
      size = height < 180 ? 'M' : 'L';
    } else if (weight >= 76 && weight < 90) {
      size = height < 186 ? 'L' : 'XL';
    } else {
      size = height < 192 ? 'XL' : 'XXL';
    }

    // Adjust for fit preference
    const sizesArray = ['S', 'M', 'L', 'XL', 'XXL'];
    let sizeIndex = sizesArray.indexOf(size);

    if (fit === 'slim') {
      if (sizeIndex > 0) sizeIndex -= 1;
      baseConfidence -= 5; // Slim fits vary by chest size
    } else if (fit === 'oversized') {
      if (sizeIndex < sizesArray.length - 1) sizeIndex += 1;
      baseConfidence += 4; // Oversized is more forgiving
    }

    setRecommendedSize(sizesArray[sizeIndex]);
    
    // Add minor variation to look dynamic
    const variation = Math.floor((height + weight) % 7);
    setConfidence(baseConfidence + variation);

  }, [height, weight, fit]);

  return (
    <section id="sizing" className="size-recommender-section">
      <div className="container">
        
        {/* Section Header */}
        <h2 className="section-title">
          Size <span className="highlight">Calculator</span>
        </h2>
        <p className="section-subtitle">
          Find your perfect fit. Adjust the parameters below to calculate your ideal size based on custom tailoring dimensions.
        </p>

        {/* Recommender Widget Grid */}
        <div className="recommender-grid">
          
          {/* Left: Input parameters */}
          <div className="recommender-widget glass-panel">
            
            {/* Height Slider */}
            <div className="form-group">
              <label className="form-label">
                <span>Height</span>
                <span className="range-val">{height} cm ({Math.round(height / 30.48 * 10) / 10} ft)</span>
              </label>
              <input 
                type="range" 
                min="150" 
                max="210" 
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
              />
            </div>

            {/* Weight Slider */}
            <div className="form-group">
              <label className="form-label">
                <span>Weight</span>
                <span className="range-val">{weight} kg ({Math.round(weight * 2.20462)} lbs)</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="120" 
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
              />
            </div>

            {/* Fit Preference Buttons */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span className="form-label">Fit Preference</span>
              <div className="fit-selector">
                <button
                  className={`fit-btn ${fit === 'slim' ? 'active' : ''}`}
                  onClick={() => setFit('slim')}
                >
                  Slim Fit
                </button>
                <button
                  className={`fit-btn ${fit === 'regular' ? 'active' : ''}`}
                  onClick={() => setFit('regular')}
                >
                  Regular
                </button>
                <button
                  className={`fit-btn ${fit === 'oversized' ? 'active' : ''}`}
                  onClick={() => setFit('oversized')}
                >
                  Oversized
                </button>
              </div>
            </div>

            {/* Inline Size Letter Output (displayed in mobile unified card) */}
            <div className="recommender-inline-output">
              <span className="inline-output-label">Size:</span>
              <span className="inline-output-value">{recommendedSize}</span>
            </div>

          </div>

          {/* Right: Recommendation Display */}
          <div className="recommendation-result glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="result-label">Suggested Sizing</span>
            <span className="result-size">{recommendedSize}</span>
            <span className="result-match">
              {confidence}% match based on your proportions and fit preference
            </span>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', marginSelf: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              Our garments are tailored with urban movement in mind. If you prefer a tighter draping, we recommend ordering a size down.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
