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
import FAQ from './components/FAQ';
import RefundReturnPage from './components/RefundReturnPage';
import MyOrders from './components/MyOrders';
import NotFound from './components/NotFound';

import { Check } from 'lucide-react';
import './index.css';
import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Admin from './Admin';
import { productImages } from './utils/productImages';

export default function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const navigate = useNavigate();
const SITE_ACTIVE = false;
if (!SITE_ACTIVE) return <NotFound />;
  const [cartItems, setCartItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('category', 'Shorts')
          .neq('category', 'Innerwear')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mappedData = (data || []).map(p => ({
          ...p,
          image: productImages[p.image] || p.image,
          secondary_image: productImages[p.secondary_image] || p.secondary_image
        }));
        setProducts(mappedData);
      } catch (err) {
        console.error("Error loading products in App.jsx:", err);
      }
    }
    fetchAllProducts();
  }, []);

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleAddToCart = (product, size, color) => {
    const chosenSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'S');
    const chosenColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : 'Obsidian');
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedSize === chosenSize && item.selectedColor === chosenColor
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
            price: product.offer_price !== undefined && product.offer_price !== null ? product.offer_price : product.price,
            image: product.image,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
            quantity: 1,
          },
        ];
      }
    });
    addNotification(`${product.name} (Size ${chosenSize}, ${chosenColor}) added to your bag.`);
  };

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

  const handleRemoveItem = (id, size) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.selectedSize === size))
    );
    addNotification("Item removed from your bag.");
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleExploreCategory = (category) => {
    navigate(`/explore?category=${category}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleViewChange = (view) => {
    if (view === 'home') navigate('/');
    else if (view === 'cart') navigate('/cart');
    else if (view === 'checkout') navigate('/checkout');
    else if (view === 'explore') navigate('/explore');
    else if (view === 'faq') navigate('/faq');
    else if (view === 'refund') navigate('/refund');
    else if (view === 'admin') navigate('/admin');
    else if (view === 'orders') navigate('/orders');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateToContact = () => {
    navigate('/');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const ProductDetailsWrapper = () => {
    const { id } = useParams();
    return (
      <ProductDetails
        productId={id}
        onBack={() => navigate(-1)}
        onAddToCart={handleAddToCart}
        addNotification={addNotification}
        onProductClick={handleProductClick}
      />
    );
  };

  const CategoryExploreWrapper = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || 'All';
    return (
      <CategoryExplorePage
        activeCategory={category}
        onAddToCart={handleAddToCart}
        onQuickView={handleProductClick}
        onBack={() => navigate('/')}
      />
    );
  };

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/*" element={
        <div className="app-container">
          <div className="ambient-blob ambient-blob-1"></div>
          <div className="ambient-blob ambient-blob-2"></div>

          <div className="notification-container">
            {notifications.map((n) => (
              <div key={n.id} className="notification-toast">
                <Check size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>{n.message}</span>
              </div>
            ))}
          </div>

          <Header
            products={products}
            onProductSelect={handleProductClick}
            cartCount={totalCartCount}
            activeView="home"
            onViewChange={handleViewChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <Routes>
            <Route path="/" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <Hero />
                <Categories
                  onCategorySelect={(category) => {
                    handleExploreCategory(category);
                  }}
                />
                <NewArrivals
                  onQuickView={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
                <ProductGrid
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleProductClick}
                  searchTerm={searchTerm}
                  onExploreCategory={(category) => {
                    handleExploreCategory(category);
                  }}
                />
                <WhyUrbanClothing />
                <SizeRecommender />
                <ReviewSection />
              </main>
            } />

            <Route path="/product/:id" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <ProductDetailsWrapper />
              </main>
            } />

            <Route path="/cart" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <CartPage
                  cartItems={cartItems}
                  products={products}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onProceedToCheckout={() => navigate('/checkout')}
                  onProductClick={handleProductClick}
                  onBack={() => navigate('/')}
                />
              </main>
            } />

            <Route path="/checkout" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <CheckoutPage
                  cartItems={cartItems}
                  onClearCart={handleClearCart}
                  onBack={() => navigate('/cart')}
                />
              </main>
            } />

            <Route path="/explore" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <CategoryExploreWrapper />
              </main>
            } />

            <Route path="/faq" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <FAQ onBack={() => navigate('/')} />
              </main>
            } />

            <Route path="/refund" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <RefundReturnPage products={products} onBack={() => navigate('/')} />
              </main>
            } />

            <Route path="/orders" element={
              <main style={{ paddingTop: 'var(--header-height)' }}>
                <MyOrders onBack={() => navigate('/')} />
              </main>
            } />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />

          </Routes>

          <Footer
            activeView="home"
            onContactClick={handleNavigateToContact}
            onViewChange={handleViewChange}
          />
        </div>
      } />
    </Routes>
  );
}