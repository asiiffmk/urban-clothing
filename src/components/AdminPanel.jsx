import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, Download, Package, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import JSZip from 'jszip';
import './Components.css';

export default function AdminPanel({ onBack }) {
  // Navigation states
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  // Product Form states
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Shirts');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('catShirts');
  const [productSecondaryImage, setProductSecondaryImage] = useState('overcoatImg');
  const [productDesc, setProductDesc] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [detailList, setDetailList] = useState(['']);
  const [colorList, setColorList] = useState([{ name: 'Obsidian', value: '#0E0E10' }]);

  // Automated premium colors mapping dictionary
  const colorMap = {
    'navy blue': '#1B2A47',
    'navy': '#1B2A47',
    'obsidian': '#0E0E10',
    'black': '#0E0E10',
    'sandstone': '#E6DFD3',
    'sand': '#E6DFD3',
    'burnt orange': '#D98B5F',
    'orange': '#D98B5F',
    'sage': '#8A9A86',
    'sage green': '#8A9A86',
    'crisp white': '#FFFFFF',
    'white': '#FFFFFF',
    'heather grey': '#9B9B9B',
    'grey': '#9B9B9B',
    'gray': '#9B9B9B',
    'red': '#8B0000',
    'crimson': '#8B0000',
    'forest green': '#2D5A27',
    'green': '#2D5A27',
    'blue': '#1E3D59',
    'burgundy': '#800020',
    'charcoal': '#36454F',
    'khaki': '#C3B091',
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'tan': '#D2B48C',
    'brown': '#964B00',
    'teal': '#008080',
    'maroon': '#800000',
    'rust': '#B7410E',
    'mustard': '#FFDB58',
    'olive': '#556B2F',
    'olive green': '#556B2F',
    'indigo': '#4B0082',
    'plum': '#8E4585'
  };

  const handleAddColor = () => {
    setColorList([...colorList, { name: '', value: '#ffffff' }]);
  };

  const handleRemoveColor = (index) => {
    const list = [...colorList];
    list.splice(index, 1);
    setColorList(list);
  };

  const handleColorChange = (index, field, value) => {
    const list = [...colorList];
    if (field === 'name') {
      list[index].name = value;
      // Auto-track the matching HEX code when a name matches the dictionary
      const searchKey = value.toLowerCase().trim();
      if (colorMap[searchKey]) {
        list[index].value = colorMap[searchKey];
      }
    } else {
      list[index].value = value;
    }
    setColorList(list);
  };
  
  // Stock per size inputs
  const availableSizes = ['S', 'M', 'L', 'XL'];
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [sizeStock, setSizeStock] = useState({
    S: 4, M: 4, L: 4, XL: 4
  });

  // Orders lists state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Products CRUD states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'manage') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: itemsData || []
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const startEditProduct = (prod) => {
    setIsEditing(true);
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductCategory(prod.category);
    setProductPrice(prod.price.toString());
    setProductSecondaryImage(prod.secondary_image || 'overcoatImg');
    setProductDesc(prod.description || '');
    setIsNewArrival(prod.is_new_arrival || false);
    setDetailList(prod.details && prod.details.length > 0 ? prod.details : ['']);
    setSelectedSizes(prod.sizes || []);
    
    // Populate size stocks
    const stockValues = { S: 0, M: 0, L: 0, XL: 0 };
    if (prod.sizes_stock) {
      Object.keys(prod.sizes_stock).forEach(s => {
        stockValues[s] = prod.sizes_stock[s] || 0;
      });
    }
    setSizeStock(stockValues);
    
    // Populate colors
    setColorList(prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'Obsidian', value: '#0E0E10' }]);
    
    // Switch tab to form
    setActiveTab('products');
  };

  const handleProductDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        alert(`Product "${name}" deleted successfully.`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setProductName('');
    setProductPrice('');
    setProductDesc('');
    setIsNewArrival(false);
    setDetailList(['']);
    setColorList([{ name: 'Obsidian', value: '#0E0E10' }]);
    setActiveTab('manage');
  };

  const handleAddDetail = () => {
    setDetailList([...detailList, '']);
  };

  const handleRemoveDetail = (index) => {
    const list = [...detailList];
    list.splice(index, 1);
    setDetailList(list);
  };

  const handleDetailChange = (index, value) => {
    const list = [...detailList];
    list[index] = value;
    setDetailList(list);
  };

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleStockChange = (size, qty) => {
    setSizeStock({
      ...sizeStock,
      [size]: Math.max(0, parseInt(qty) || 0)
    });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Upload or Update product handler
  const handleProductUpload = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice) return;

    setSubmittingProduct(true);
    try {
      // Filter the stock to only include selected sizes
      const finalStock = {};
      selectedSizes.forEach(size => {
        finalStock[size] = sizeStock[size] || 0;
      });

      // Filter specifications details
      const finalDetails = detailList.filter(d => d.trim() !== '');

      // Filter colors list details
      const finalColors = colorList.filter(c => c.name.trim() !== '');

      // Map primary image dynamically based on selected category
      const categoryImageMap = {
        'Shirts': 'cat_shirts',
        'Tshirts': 'cat_tshirts',
        'Pants': 'cat_pants',
        'Shorts': 'cat_shorts',
        'Innerwear': 'cat_innerwear'
      };
      const finalPrimaryImage = categoryImageMap[productCategory] || 'cat_shirts';

      const newProduct = {
        name: productName,
        category: productCategory,
        price: parseFloat(productPrice),
        rating: 4.8, // default rating
        reviews: 0, // initial reviews count
        image: finalPrimaryImage,
        secondary_image: 'overcoat', // default secondary
        description: productDesc,
        colors: finalColors.length > 0 ? finalColors : [{ name: "Obsidian", value: "#0E0E10" }],
        sizes: selectedSizes,
        details: finalDetails,
        sizes_stock: finalStock,
        is_new_arrival: isNewArrival
      };

      if (isEditing) {
        // UPDATE existing product
        const { error } = await supabase
          .from('products')
          .update(newProduct)
          .eq('id', editingProductId);

        if (error) throw error;
        alert(`Product "${productName}" updated successfully!`);
        
        // Reset and return to manage tab
        setIsEditing(false);
        setEditingProductId(null);
        setActiveTab('manage');
      } else {
        // INSERT new product
        const timestampId = Date.now();
        const { error } = await supabase
          .from('products')
          .insert([{ id: timestampId, ...newProduct }]);

        if (error) throw error;
        alert(`Product "${productName}" uploaded successfully with dynamic stock configuration!`);
      }
      
      // Reset Form
      setProductName('');
      setProductPrice('');
      setProductDesc('');
      setIsNewArrival(false);
      setDetailList(['']);
      setColorList([{ name: 'Obsidian', value: '#0E0E10' }]);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Check database connection.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Bulk slips exporter as ZIP
  const downloadBulkSlipsZip = () => {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const zip = new JSZip();

    orders.forEach((order, idx) => {
      const fileContent = `==================================================
                 URBAN GENTS WEAR
                 CUSTOMER ORDER SLIP
==================================================
ORDER ID    : ${order.id}
STATUS      : ${order.status.toUpperCase()}
DATE        : ${new Date(order.created_at).toLocaleString()}
TOTAL AMOUNT: Rs. ${order.total_price}

--------------------------------------------------
SHIPPING / CLIENT ADDRESS DETAILS
--------------------------------------------------
CLIENT NAME : ${order.customer_name}
PHONE 1     : ${order.phone1}
PHONE 2     : ${order.phone2 || 'N/A'}
HOUSE NAME  : ${order.house_name}
LOCAL PLACE : ${order.local_place}
POST OFFICE : ${order.post_office}
PIN CODE    : ${order.pincode}
DISTRICT    : ${order.district}
STATE       : ${order.state}
FULL ADDRESS: ${order.full_address}

--------------------------------------------------
ORDERED ESSENTIALS
--------------------------------------------------
${(order.items || []).map((item, index) => `${index + 1}. ${item.product_name}
   Size: ${item.size} | Color: ${item.color || 'Default'}
   Qty : ${item.quantity} | Unit Price: Rs. ${item.price} | Total: Rs. ${item.quantity * item.price}`).join('\n\n')}

==================================================
Thank you for managing checkout deliveries.
==================================================
`;
      const fileName = `Order_${idx + 1}_${order.id.substring(0, 8).toUpperCase()}.txt`;
      zip.file(fileName, fileContent);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = `urban_slips_export_${new Date().toISOString().substring(0, 10)}.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  return (
    <div className="admin-panel-view" style={{ padding: '3rem 0', animation: 'fadeIn 0.3s ease' }}>
      <div className="container">
        
        {/* Header Navigation */}
        <div className="admin-header-row">
          <div>
            <h1 style={{ fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin <span className="highlight">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Upload garments, manage sizes/stock levels, and export bulk checkout slips.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>← Shop Front</button>
        </div>

        {/* Tab Controls */}
        <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', margin: '2rem 0', paddingBottom: '0.75rem' }}>
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'products' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: '0.5rem',
              borderBottom: activeTab === 'products' ? '2px solid var(--accent-gold)' : 'none'
            }}
          >
            <Package size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {isEditing ? 'Edit Product' : 'Upload Products'}
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'manage' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: '0.5rem',
              borderBottom: activeTab === 'manage' ? '2px solid var(--accent-gold)' : 'none'
            }}
          >
            <Package size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Manage Products
          </button>
          
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'orders' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: '0.5rem',
              borderBottom: activeTab === 'orders' ? '2px solid var(--accent-gold)' : 'none'
            }}
          >
            <FileText size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Customer Slips ({orders.length})
          </button>
        </div>

        {/* Tab 1: Upload / Edit Product Form */}
        {activeTab === 'products' && (
          <div className="admin-form-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {isEditing ? `Edit Garment: ${productName}` : 'Add New Garment Model'}
            </h3>

            {isEditing && (
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent-gold)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                  <strong>Edit Mode:</strong> Modifying details of this product model.
                </span>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit} style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cancel Edit
                </button>
              </div>
            )}
            
            <form onSubmit={handleProductUpload}>
              
              <div className="details-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                <div className="review-form-group">
                  <label htmlFor="pName">Product Name</label>
                  <input 
                    type="text" 
                    id="pName" 
                    className="review-form-input" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Linen Shirts MSC1263"
                    required
                  />
                </div>

                <div className="review-form-group">
                  <label htmlFor="pPrice">Price ($)</label>
                  <input 
                    type="number" 
                    id="pPrice" 
                    className="review-form-input" 
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="e.g. 45"
                    required
                  />
                </div>

                <div className="review-form-group">
                  <label htmlFor="pCat">Category</label>
                  <select 
                    id="pCat" 
                    className="review-form-input"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="Tshirts">Tshirts</option>
                    <option value="Pants">Pants</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Innerwear">Innerwear</option>
                  </select>
                </div>

              </div>

              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="pDesc">Product Description</label>
                <textarea 
                  id="pDesc" 
                  className="review-form-input" 
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Enter a brief, premium narrative of the design details..."
                  rows={3}
                  required
                />
              </div>

              {/* Sizes and Stock Levels selection */}
              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Sizes & Stock Levels</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Check sizes to enable them, and set the stock count for each.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                        <input 
                          type="checkbox"
                          id={`chk-${size}`}
                          checked={isSelected}
                          onChange={() => handleSizeToggle(size)}
                          style={{ accentColor: 'var(--accent-gold)' }}
                        />
                        <label htmlFor={`chk-${size}`} style={{ fontSize: '0.85rem', cursor: 'pointer', margin: 0, width: '30px' }}>
                          {size}
                        </label>
                        {isSelected && (
                          <input 
                            type="number"
                            min="0"
                            placeholder="Stock"
                            style={{
                              width: '60px',
                              padding: '0.2rem 0.4rem',
                              border: '1px solid var(--border-light)',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}
                            value={sizeStock[size]}
                            onChange={(e) => handleStockChange(size, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Color Options Section */}
              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Available Color Options</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Define color options for this product. Write a color name and use the square box picker to customize the HEX values.
                </p>
                {colorList.map((color, index) => (
                  <div key={index} className="admin-color-row">
                    <input 
                      type="text" 
                      className="review-form-input" 
                      value={color.name}
                      onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                      placeholder={`Color ${index + 1} Name: e.g. Sandstone`}
                    />
                    <div className="admin-color-picker-wrapper">
                      <input 
                        type="color" 
                        value={color.value}
                        onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                        style={{ width: '28px', height: '24px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{color.value}</span>
                    </div>
                    <button 
                      type="button" 
                      className="action-btn delete-btn"
                      style={{ 
                        border: '1px solid #DC2626', 
                        color: '#DC2626', 
                        backgroundColor: 'rgba(220,38,38,0.05)',
                        borderRadius: '4px',
                        padding: '0.45rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px'
                      }}
                      onClick={() => handleRemoveColor(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddColor}
                  style={{ width: 'fit-content', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                >
                  + Add Color Option
                </button>
              </div>

              {/* Specifications / Details list */}
              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Crafting & Details Bullet Points</label>
                {detailList.map((detail, index) => (
                  <div key={index} className="admin-spec-row">
                    <input 
                      type="text" 
                      className="review-form-input" 
                      value={detail}
                      onChange={(e) => handleDetailChange(index, e.target.value)}
                      placeholder={`Detail ${index + 1}: e.g. 100% Organic Waffle-Textured Cotton`}
                    />
                    <button 
                      type="button" 
                      className="action-btn delete-btn"
                      style={{ 
                        border: '1px solid #DC2626', 
                        color: '#DC2626', 
                        backgroundColor: 'rgba(220,38,38,0.05)',
                        borderRadius: '4px',
                        padding: '0.45rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px'
                      }}
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddDetail}
                  style={{ width: 'fit-content', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                >
                  + Add Specification Line
                </button>
              </div>

              {/* Is New Arrival Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0' }}>
                <input 
                  type="checkbox" 
                  id="newArrival" 
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px' }}
                />
                <label htmlFor="newArrival" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Mark as **New Arrival** (Will show in the main homepage arrivals section)
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-accent" 
                style={{ width: '100%', padding: '1rem' }}
                disabled={submittingProduct}
              >
                {submittingProduct ? 'Uploading...' : 'Upload Garment to Database'}
              </button>

            </form>
          </div>
        )}

        {/* Tab 2: Manage Products Database list */}
        {activeTab === 'manage' && (
          <div>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Manage Garments Database ({products.length})
            </h3>
            
            {loadingProducts ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="checkout-spinner" style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid rgba(212,175,55,0.1)',
                  borderTopColor: 'var(--accent-gold)',
                  borderRadius: '50%',
                  animation: 'pulseGlow 1s infinite'
                }}></div>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No garments loaded in database.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map((prod) => (
                  <div key={prod.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: '48px', height: '64px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{prod.category}</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{prod.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Category: {prod.category} | Price: ${prod.price} | Stock: {prod.sizes_stock ? Object.values(prod.sizes_stock).reduce((a, b) => a + b, 0) : 0} items
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => startEditProduct(prod)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-accent" 
                        onClick={() => handleProductDelete(prod.id, prod.name)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#8B0000', borderColor: '#8B0000', color: '#fff' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Orders List */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Deliveries Slips ({orders.length})
              </h3>
              
              <button 
                className="btn btn-accent" 
                onClick={downloadBulkSlipsZip}
                disabled={orders.length === 0}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Download size={16} />
                Download Slips ZIP
              </button>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="checkout-spinner" style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid rgba(212,175,55,0.1)',
                  borderTopColor: 'var(--accent-gold)',
                  borderRadius: '50%',
                  animation: 'pulseGlow 1s infinite'
                }}></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No client checkouts recorded yet.</p>
              </div>
            ) : (
              <div className="orders-list-slips" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => {
                  const isExpanded = !!expandedOrders[order.id];
                  return (
                    <div key={order.id} className="order-slip-card glass-panel" style={{ overflow: 'hidden' }}>
                      
                      {/* Summary Row */}
                      <div 
                        className="order-summary-row" 
                        onClick={() => toggleOrderExpand(order.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                      >
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Order ID</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--accent-gold)' }}>#{order.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Client Name</span>
                            <strong>{order.customer_name}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Contact Phone</span>
                            <span>{order.phone1}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Paid</span>
                            <strong style={{ color: 'var(--accent-gold)' }}>Rs. {order.total_price}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Date</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className="order-status-tag confirmed" style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            background: 'rgba(0,255,136,0.1)',
                            border: '1px solid rgba(0,255,136,0.3)',
                            color: '#00ff88',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {order.status}
                          </span>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {/* Expanded Details: printable slip */}
                      {isExpanded && (
                        <div className="order-slip-details" style={{ padding: '2rem', borderTop: '1px solid var(--border-light)', animation: 'slideDown 0.3s ease' }}>
                          
                          <div className="slip-printable-area" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '2rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>
                            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                              <h2 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontSize: '1.4rem' }}>Urban Gents Wear</h2>
                              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Fulfillment Slip / Invoice Details</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
                              
                              {/* Left: General Order details */}
                              <div>
                                <h4 style={{ textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Delivery Information</h4>
                                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem', width: '110px' }}>Order ID:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.id}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Timestamp:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{new Date(order.created_at).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Payment Status:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>Paid (Stripe Mock)</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Fulfillment:</td>
                                      <td style={{ paddingBottom: '0.4rem', color: '#00ff88' }}>{order.status.toUpperCase()}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Right: Shipping Address Grid */}
                              <div>
                                <h4 style={{ textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Customer Slip</h4>
                                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem', width: '110px' }}>Client Name:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}><strong>{order.customer_name}</strong></td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Phone 1:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.phone1}</td>
                                    </tr>
                                    {order.phone2 && (
                                      <tr>
                                        <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Phone 2:</td>
                                        <td style={{ paddingBottom: '0.4rem' }}>{order.phone2}</td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>House/Apt:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.house_name}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Local Place:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.local_place}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Post Office:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.post_office}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Pin Code:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.pincode}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>District/State:</td>
                                      <td style={{ paddingBottom: '0.4rem' }}>{order.district}, {order.state}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-muted)', paddingBottom: '0.4rem' }}>Full Address:</td>
                                      <td style={{ paddingBottom: '0.4rem', whiteSpace: 'pre-line' }}>{order.full_address}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                            </div>

                            {/* Ordered Items details */}
                            <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '1.5rem' }}>
                              <h4 style={{ textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Purchased Items</h4>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(order.items || []).map((item, idx) => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.5rem' }}>
                                    <div>
                                      <strong>{idx + 1}. {item.product_name}</strong>
                                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                        Selected Config: Size {item.size} {item.color && `| Color ${item.color}`}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <span>{item.quantity} x Rs. {item.price}</span>
                                      <strong style={{ display: 'block', color: 'var(--accent-gold)', marginTop: '0.2rem' }}>
                                        Rs. {item.quantity * item.price}
                                      </strong>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--text-primary)', marginTop: '1.5rem', paddingTop: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                                <span>TOTAL CHARGED:</span>
                                <span style={{ color: 'var(--accent-gold)' }}>Rs. {order.total_price}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
