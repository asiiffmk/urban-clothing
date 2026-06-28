import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import NewArrivals from './components/NewArrivals';
import ProductGrid from './components/ProductGrid';
import WhyUrbanClothing from './components/WhyUrbanClothing';
import ReviewSection from './components/ReviewSection';
import SizeRecommender from './components/SizeRecommender';
import Footer from './components/Footer';
import CheckoutPage from './components/CheckoutPage';
import CartPage from './components/CartPage';
import CategoryExplorePage from './components/CategoryExplorePage';
import ProductDetails from './components/ProductDetails';
import AdminPanel from './components/AdminPanel';
import { Check } from 'lucide-react';
import './index.css';

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Navigation Routing States
  const [activeView, setActiveView] = useState('home'); // 'home' | 'product-details' | 'admin'
  const [previousView, setPreviousView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error loading products in App.jsx:", err);
      }
    }
    fetchAllProducts();
  }, []);

  // Toast Notification handler
  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    
    // Automatically clear toast after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product, size, color) => {
    const chosenColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : 'Obsidian');
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === chosenColor
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            selectedSize: size,
            selectedColor: chosenColor,
            quantity: 1,
          },
        ];
      }
    });
    
    addNotification(`${product.name} (Size ${size}, ${chosenColor}) added to your bag.`);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (id, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size);
      return;
    }
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id && item.selectedSize === size 
          ? { ...item, quantity: newQty } 
          : item
      )
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (id, size) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => !(item.id === id && item.selectedSize === size))
    );
    addNotification("Item removed from your bag.");
  };

  // Clear Cart after checkout success
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle product click to navigate to Product Details View
  const handleProductClick = (product) => {
    setPreviousView(activeView);
    setSelectedProductId(product.id);
    setActiveView('product-details');
    // Scroll to top of details page instantly
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Ambient Background Blur Blobs */}
      <div className="ambient-blob ambient-blob-1"></div>
      <div className="ambient-blob ambient-blob-2"></div>
      
      {/* Toast Notification Container */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className="notification-toast">
            <Check size={16} style={{ color: 'var(--accent-gold)' }} />
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {/* Primary Layout Header */}
      <Header 
        products={products}
        onProductSelect={handleProductClick}
        cartCount={totalCartCount} 
        activeView={activeView}
        onViewChange={handleViewChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {/* View Routing Switcher */}
      {activeView === 'admin' ? (
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <AdminPanel onBack={() => handleViewChange('home')} />
        </main>
      ) : activeView === 'product-details' ? (
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <ProductDetails 
            productId={selectedProductId}
            onBack={() => {
              if (previousView === 'explore') {
                handleViewChange('explore');
              } else {
                setActiveView('home');
                setTimeout(() => {
                  const shopSection = document.getElementById('shop');
                  if (shopSection) {
                    shopSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }
            }}
            onAddToCart={handleAddToCart}
            addNotification={addNotification}
          />
        </main>
      ) : activeView === 'cart' ? (
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <CartPage 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToCheckout={() => handleViewChange('checkout')}
            onBack={() => handleViewChange('home')}
          />
        </main>
      ) : activeView === 'checkout' ? (
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <CheckoutPage 
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onBack={() => handleViewChange('cart')}
          />
        </main>
      ) : activeView === 'explore' ? (
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <CategoryExplorePage 
            activeCategory={activeFilter}
            onAddToCart={handleAddToCart}
            onQuickView={handleProductClick}
            onBack={() => {
              setActiveView('home');
              setTimeout(() => {
                const shopSection = document.getElementById('shop');
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          />
        </main>
      ) : (
        /* Home Landing Page View */
        <main style={{ paddingTop: 'var(--header-height)' }}>
          <Hero />
          
          {/* Category Showcase Section */}
          <Categories 
            onCategorySelect={(category) => {
              setActiveFilter(category);
              setTimeout(() => {
                const shopSection = document.getElementById('shop');
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 50);
            }} 
          />

          {/* New Arrivals Section */}
          <NewArrivals 
            onQuickView={handleProductClick} 
          />

          {/* Collection Shop Grid Section */}
          <ProductGrid 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onAddToCart={handleAddToCart}
            onQuickView={handleProductClick}
            searchTerm={searchTerm}
            onExploreCategory={(category) => {
              setActiveFilter(category);
              setTimeout(() => {
                const shopSection = document.getElementById('shop');
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 50);
            }}
          />
          
          <WhyUrbanClothing />
          
          <SizeRecommender />
          
          <ReviewSection />
        </main>
      )}

      {/* Render Footer everywhere except Admin/Cart/Checkout tabs */}
      {activeView !== 'admin' && activeView !== 'cart' && activeView !== 'checkout' && <Footer />}

    </div>
  );
}
