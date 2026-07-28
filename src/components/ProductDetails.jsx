import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ChevronLeft, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Components.css';
import sizeChartImg from '../assets/size_chart.png';
import ProductCard from './ProductCard';

// Import images for fallbacks if needed (same as ProductGrid)
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

export default function ProductDetails({ productId, onBack, onAddToCart, addNotification, onProductClick }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeScale, setSizeScale] = useState('UK'); // UK or EU converter toggle
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Mobile zoom gallery states
  const [isMobileFullscreenOpen, setIsMobileFullscreenOpen] = useState(false);
  const [mobileFullscreenIndex, setMobileFullscreenIndex] = useState(0);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) throw error;
        
        // Map image keys to imports
        const mappedProduct = {
          ...data,
          image: productImages[data.image] || data.image,
          secondaryImage: productImages[data.secondary_image] || data.secondary_image
        };
        
        setProduct(mappedProduct);
        if (mappedProduct.sizes && mappedProduct.sizes.length > 0) {
          // Select first available size by default
          setSelectedSize(mappedProduct.sizes[0]);
        }
        if (mappedProduct.colors && mappedProduct.colors.length > 0) {
          setSelectedColor(mappedProduct.colors[0].name);
        }

        // Fetch recommended products
        const { data: recommendedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', productId)
          .limit(4);

        let recommendedList = recommendedData || [];
        if (recommendedList.length < 4) {
          const { data: fallbackData } = await supabase
            .from('products')
            .select('*')
            .neq('id', productId)
            .limit(4 - recommendedList.length);
          if (fallbackData) {
            recommendedList = [...recommendedList, ...fallbackData];
          }
        }

        const mappedRecommended = recommendedList.map(p => ({
          ...p,
          image: productImages[p.image] || p.image,
          secondaryImage: productImages[p.secondary_image] || p.secondary_image
        }));
        setRecommendedProducts(mappedRecommended);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [productId]);

  // Lightbox keyboard listeners removed

  if (loading) {
    return (
      <div className="product-details-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="checkout-spinner" style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(212,175,55,0.1)',
          borderTopColor: 'var(--accent-gold)',
          borderRadius: '50%',
          animation: 'pulseGlow 1s infinite'
        }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Product Not Found</h2>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1.5rem' }}>Go Back</button>
      </div>
    );
  }

  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image, product.secondaryImage || product.secondary_image || product.image].filter(Boolean);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Sizing Converter (For numeric sizes like footwear e.g. 7 UK = 40 EU)
  const convertSize = (size) => {
    const numericSize = parseFloat(size);
    if (isNaN(numericSize)) return size; // Return letter size (S, M, L) as is
    
    if (sizeScale === 'EU') {
      // UK to EU converter formula (approximate conversion for standard footwear)
      return `${Math.round(numericSize + 33)} (EU)`;
    }
    return `${numericSize} (UK)`;
  };

  // Stock indicator
  const stockMap = product.sizes_stock || {};
  const currentSizeStock = stockMap[selectedSize] !== undefined ? stockMap[selectedSize] : 4; // Default to 4 if unspecified

  const handleQuantityChange = (newVal) => {
    if (newVal < 1) return;
    if (newVal > currentSizeStock) {
      addNotification(`Only ${currentSizeStock} items left in stock for size ${selectedSize}.`);
      return;
    }
    setQuantity(newVal);
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    // Add to cart with selected configuration
    onAddToCart(product, selectedSize);
    // Notification already fired inside handleAddToCart in App.jsx
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    if (currentSizeStock === 0) {
      alert("This size is out of stock.");
      return;
    }
    onAddToCart(product, selectedSize);
    // Redirect checkout drawer
    setTimeout(() => {
      const cartBtn = document.querySelector('[aria-label="Open Shopping Bag"]');
      if (cartBtn) cartBtn.click();
    }, 150);
  };

  return (
    <div className="product-details-view" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="container">
        
        {/* Navigation Back Button Container */}
        <div className="details-back-container">
          <button className="details-back-btn" onClick={onBack} aria-label="Back to Collection">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="details-grid">
          
          {/* Left Column: Image gallery */}
          <div className="details-gallery-col">
            {/* Desktop Gallery */}
            <div className="desktop-gallery">
              <div className="main-image-wrap">
                <img 
                  src={galleryImages[activeImageIndex]} 
                  alt={product.name} 
                  className="details-main-img" 
                />
              </div>

              {/* Thumbnail Row */}
              {galleryImages.length > 1 && (
                <div className="thumbnails-row">
                  {galleryImages.map((img, idx) => (
                    <button 
                      key={idx}
                      className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="thumb-img" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Scrollable Swipe Gallery */}
            <div className="mobile-scroll-gallery">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="mobile-gallery-img-wrap"
                  onClick={() => {
                    setMobileFullscreenIndex(idx);
                    setIsMobileFullscreenOpen(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="mobile-gallery-img" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Specifications Panel */}
          <div className="details-info-col">
            <div>
              <span className="details-category-tag">{product.category}</span>
              <h1 className="details-product-title">{product.name}</h1>
              
              {/* Stars & Reviews */}
              <div className="details-rating-row">
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={`star-icon ${i < Math.floor(product.rating || 5) ? 'filled' : ''}`} 
                      style={{ color: i < Math.floor(product.rating || 5) ? 'var(--accent-gold)' : 'rgba(255,255,255,0.15)' }}
                    />
                  ))}
                </div>
                <span className="details-reviews-count">
                  {product.rating}
                </span>
              </div>
            </div>

            <div className="details-price-tag">Rs. {product.price}</div>



            <p className="details-description desktop-desc">{product.description}</p>
            <p className="details-description mobile-desc">
              {product.description && product.description.length > 120 
                ? `${product.description.slice(0, 110)}...` 
                : product.description}
            </p>

            {/* Sizes & Converter Section */}
            <div className="details-sizes-section">
              <div className="sizes-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', width: '100%' }}>
                <span className="section-label" style={{ marginBottom: 0 }}>Select Size</span>
                
                {/* Stock indicator badge right next to Select Size text */}
                <div className="details-stock-row" style={{ display: 'inline-flex', alignItems: 'center', margin: 0 }}>
                  {currentSizeStock === 0 ? (
                    <span className="stock-badge out-of-stock" style={{ margin: 0 }}>Out of Stock</span>
                  ) : (
                    <span className="stock-badge in-stock" style={{ margin: 0 }}>✓ In Stock</span>
                  )}
                </div>

                {/* UK / EU Toggle pushed to the far right (Shows only if sizes contain numbers) */}
                {product.sizes.some(s => !isNaN(parseFloat(s))) && (
                  <div className="size-converter-toggle" style={{ margin: '0 0 0 auto' }}>
                    <button 
                      className={`converter-btn ${sizeScale === 'UK' ? 'active' : ''}`}
                      onClick={() => setSizeScale('UK')}
                    >
                      UK
                    </button>
                    <button 
                      className={`converter-btn ${sizeScale === 'EU' ? 'active' : ''}`}
                      onClick={() => setSizeScale('EU')}
                    >
                      EU
                    </button>
                  </div>
                )}
              </div>

              <div className="size-options-grid">
                {product.sizes.map((size) => {
                  const isOutOfStock = stockMap[size] === 0;
                  return (
                    <button
                      key={size}
                      className={`size-select-btn ${selectedSize === size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1); // Reset qty to 1 when changing size
                      }}
                      title={isOutOfStock ? 'Out of Stock' : ''}
                    >
                      {convertSize(size)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection Section */}
            {product.colors && product.colors.length > 0 && (
              <div className="details-colors-section" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                <div className="colors-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="section-label" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 0 }}>COLOR</span>
                </div>
                <div className="colors-buttons-grid">
                  {product.colors.map((colorObj) => {
                    const isSelected = selectedColor === colorObj.name;
                    return (
                      <button
                        key={colorObj.name}
                        onClick={() => setSelectedColor(colorObj.name)}
                        className={`color-select-btn ${isSelected ? 'active' : ''}`}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '30px',
                          border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent',
                          color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                          outline: isSelected ? '2px solid var(--accent-gold)' : 'none',
                          outlineOffset: isSelected ? '2px' : '0',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {colorObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {currentSizeStock > 0 && (
              <div className="details-qty-section">
                <span className="section-label">Quantity</span>
                <div className="details-qty-stepper">
                  <button 
                    className="qty-step-btn" 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-step-value">{quantity}</span>
                  <button 
                    className="qty-step-btn" 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= currentSizeStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Product Specifications list */}
            {product.details && product.details.length > 0 && (
              <div className="details-specs-container">
                <h4 className="specs-title-label">Tailoring & Crafting Specifications</h4>
                <ul className="details-specs-list">
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Call to Actions */}
            <div className="details-actions-row">
              <button 
                className="btn-add-to-bag-bw action-add-to-cart"
                onClick={handleAddToBag}
                style={{ flex: 1, display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}
              >
                <ShoppingBag size={18} />
                <span className="desktop-btn-text">Add to Shopping Bag</span>
                <span className="mobile-btn-text">Add to Bag</span>
              </button>
              
              <button 
                className="btn-buy-now-bw action-buy-now"
                onClick={handleBuyNow}
                disabled={currentSizeStock === 0}
                style={{ flex: 1 }}
              >
                Buy it Now
              </button>
            </div>

            {/* Product Care Note Section (Moved below Buy button) */}
            <div className="details-care-note" style={{ marginTop: '0.45rem', borderTop: 'none', paddingTop: 0, opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.5', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              {product.note || "This garment is crafted with premium fabrics. Dry clean only / non-washable. Handle with care to maintain the texture and structure."}
            </div>

            {/* Size Chart Section */}
            <div className="details-size-chart-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '2rem', marginBottom: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Size Chart</h4>
              <div className="size-chart-img-wrapper" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)', backgroundColor: '#ffffff', padding: '0.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <img 
                  src={sizeChartImg} 
                  alt="Size Chart" 
                  style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
                />
              </div>
            </div>

          </div>

        </div>

        {/* You May Also Like Section */}
        {recommendedProducts.length > 0 && (
          <div className="you-may-like-section" style={{ marginTop: '5rem', borderTop: '1px solid var(--border-light)', paddingTop: '3rem', width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontWeight: 700, fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '2.5rem', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              You May Also Like
            </h3>
            <div className="products-grid">
              {recommendedProducts.map((p) => (
                <ProductCard 
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onQuickView={onProductClick}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Fullscreen Slideshow Gallery Modal */}
      {isMobileFullscreenOpen && (
        <div 
          className="mobile-fullscreen-gallery-overlay"
          onClick={() => setIsMobileFullscreenOpen(false)}
        >
          <button 
            className="fullscreen-close-btn"
            onClick={() => setIsMobileFullscreenOpen(false)}
            aria-label="Close Gallery"
          >
            <X size={24} />
          </button>
          
          <div 
            className="fullscreen-content-container" 
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <button 
                className="fullscreen-nav-btn prev"
                onClick={() => setMobileFullscreenIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                aria-label="Previous Image"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img 
              src={galleryImages[mobileFullscreenIndex]} 
              alt={`${product.name} zoomed view`} 
              className="fullscreen-zoomed-img" 
            />

            {galleryImages.length > 1 && (
              <button 
                className="fullscreen-nav-btn next"
                onClick={() => setMobileFullscreenIndex((prev) => (prev + 1) % galleryImages.length)}
                aria-label="Next Image"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          <div className="fullscreen-index-counter">
            {mobileFullscreenIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

    </div>
  );
}
