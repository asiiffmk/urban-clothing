import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Menu, X, ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { supabase } from '../supabaseClient';
import './Components.css';

export default function Header({ 
  products = [], 
  onProductSelect, 
  cartCount, 
  activeView, 
  onViewChange, 
  searchTerm, 
  onSearchChange,
  user,
  onOpenAuth
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = () => {
    if (user) {
      setProfileMenuOpen(!profileMenuOpen);
    } else {
      onOpenAuth();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
  };

  const searchStartScrollY = useRef(0);

  useEffect(() => {
    if (searchActive) {
      searchStartScrollY.current = window.scrollY;
    }
  }, [searchActive]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Auto close search dropdown on page scroll only if they scroll past a threshold (70px)
      if (searchActive) {
        const diff = Math.abs(window.scrollY - searchStartScrollY.current);
        if (diff > 70) {
          setSearchActive(false);
          onSearchChange('');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchActive, onSearchChange]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    onViewChange('home');
  };

  const handleNavClick = (view, anchorId) => {
    onViewChange(view);
    setMobileMenuOpen(false);
    if (anchorId) {
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Scroll again after 400ms to override any layout shifts from newly rendered assets
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
      }, 200);
    }
  };

  // Filter matching search suggestions inside header state
  const searchResults = searchTerm.trim() 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <header className={`site-header glass-panel ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          
          {/* Left Area: Toggle & Search on Mobile, hidden on Desktop */}
          <div className="header-left-group">
            <button 
              className="mobile-nav-toggle action-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <button 
              className="mobile-search-btn action-btn" 
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Navigation Links (Left on desktop, hidden when searching) */}
          {!searchActive && (
            <nav className="nav-links">
              <button onClick={() => handleNavClick('home', 'shop')} className="nav-item">Shop</button>
              <button onClick={() => handleNavClick('home', 'sizing')} className="nav-item">Sizing Guide</button>
              <button onClick={() => handleNavClick('home', 'story')} className="nav-item">Our Story</button>
              <button onClick={() => handleNavClick('home', 'contact')} className="nav-item">Contact</button>
            </nav>
          )}

          {/* Search Input field (takes center/logo space on desktop when active) */}
          {searchActive ? (
            <div className="header-search-container" style={{ display: 'flex', flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
              <input
                type="text"
                className="review-form-input"
                style={{
                  width: '100%',
                  padding: '0.5rem 2.5rem 0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
                placeholder="Search catalog (e.g. linen, denim, pants)..."
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
                autoFocus
              />
              <button 
                className="action-btn" 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                onClick={() => {
                  setSearchActive(false);
                  onSearchChange('');
                }}
              >
                <X size={16} />
              </button>

              {/* Desktop Autocomplete dropdown (Shows Image, Name, Price cleanly aligned) */}
              {searchTerm.trim().length > 0 && (
                <div className="desktop-search-dropdown glass-panel">
                  {searchResults.map((product) => (
                    <div 
                      key={product.id} 
                      className="desktop-search-dropdown-item"
                      onClick={() => {
                        onProductSelect(product); // opens Quick View modal details
                        setSearchActive(false);
                        onSearchChange('');
                      }}
                    >
                      <img src={product.image} alt={product.name} className="desktop-search-dropdown-img" />
                      <div className="desktop-search-dropdown-meta">
                        <span className="desktop-search-dropdown-name">{product.name}</span>
                        <span className="desktop-search-dropdown-price">Rs. {product.price}</span>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="desktop-search-dropdown-empty">
                      No matching garments found
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Logo (Centered, hidden on mobile when searching) */
            <a href="#" className="logo-link" onClick={handleLogoClick}>
              <span className="logo-text">urban clothing</span>
            </a>
          )}

          {/* Action Buttons (Right) */}
          <div className="header-actions">
            <button 
              className={`action-btn desktop-search ${searchActive ? 'active' : ''}`}
              onClick={() => setSearchActive(!searchActive)}
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>
            
            <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button 
                className={`action-btn user-profile-btn ${user ? 'logged-in' : ''}`} 
                onClick={handleUserClick}
                aria-label={user ? "User Profile" : "Sign In / Sign Up"}
                title={user ? `Signed in as ${user.email}` : "Sign In / Sign Up"}
                style={{ color: user ? 'var(--accent-gold)' : 'inherit' }}
              >
                <User size={20} />
              </button>
              
              {user && profileMenuOpen && (
                <div className="profile-dropdown glass-panel" style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  padding: '1rem 1.25rem',
                  minWidth: '220px',
                  boxShadow: 'var(--shadow-premium)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animation: 'authSlideUp 0.2s ease-out'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Signed in as
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: '0.25rem' }}>
                    {user.email}
                  </div>
                  <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '0' }} />
                  <button 
                    onClick={handleSignOut}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C53030',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      textAlign: 'left',
                      padding: '0.25rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#9B2C2C'}
                    onMouseLeave={(e) => e.target.style.color = '#C53030'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            
            <button 
              className="action-btn" 
              onClick={() => onViewChange('cart')}
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Slides from left) */}
      <div 
        className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-menu-drawer glass-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <a href="#" className="logo-link-drawer" onClick={handleLogoClick}>
            <img src={logoImg} alt="Urban Gents Wear" style={{ height: '32px', objectFit: 'contain' }} />
          </a>
          <button 
            className="action-btn close-drawer-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-menu-links">
          <button className="mobile-menu-link" onClick={() => handleNavClick('home')}>Home</button>
          <button className="mobile-menu-link" onClick={() => handleNavClick('home', 'shop')}>Shop</button>
          <button className="mobile-menu-link" onClick={() => handleNavClick('home', 'story')}>Our Story</button>
          <button className="mobile-menu-link" onClick={() => handleNavClick('home', 'contact')}>Contact</button>
          {user ? (
            <>
              <div className="mobile-menu-user-info" style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                SIGNED IN AS: {user.email}
              </div>
              <button className="mobile-menu-link" style={{ color: '#C53030' }} onClick={async () => {
                await supabase.auth.signOut();
                setMobileMenuOpen(false);
              }}>Sign Out</button>
            </>
          ) : (
            <button className="mobile-menu-link" style={{ color: 'var(--accent-gold)' }} onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth();
            }}>Sign In / Sign Up</button>
          )}
        </nav>

        <div className="mobile-menu-footer">
          <a href="https://www.instagram.com/urbanclothinn?igsh=MTg3dmFnbnQ3cTc5aw==" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" className="social-btn" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile Fullscreen Blur Search Modal Overlay */}
      {mobileSearchOpen && (
        <div className="mobile-search-overlay-fullscreen">
          <div className="mobile-search-header-row">
            <input
              type="text"
              className="mobile-search-zoom-input"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search catalog (e.g. shirt, pant)..."
              autoFocus
            />
            <button 
              className="mobile-search-close-btn"
              onClick={() => {
                setMobileSearchOpen(false);
                onSearchChange('');
              }}
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Clean Aligned Search Results */}
          {searchTerm.trim().length > 0 && (
            <div className="mobile-search-results-list">
              {searchResults.map((product) => (
                <div 
                  key={product.id} 
                  className="mobile-search-result-item"
                  onClick={() => {
                    onProductSelect(product); // opens Quick View modal details
                    setMobileSearchOpen(false);
                    onSearchChange('');
                  }}
                >
                  <img src={product.image} alt={product.name} className="mobile-search-result-img" />
                  <div className="mobile-search-result-meta">
                    <span className="mobile-search-result-name">{product.name}</span>
                    <span className="mobile-search-result-price">Rs. {product.price}</span>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="mobile-search-empty">
                  No matching garments found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
