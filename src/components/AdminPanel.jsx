import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, Download, Package, FileText, CheckCircle2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import JSZip from 'jszip';
import './Components.css';

// Import all product assets for preview
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

// Standalone helpers for slip generation
function convertNumberToWords(amount) {
  const words = {
    0: '', 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN',
    11: 'ELEVEN', 12: 'TWELVE', 13: 'THIRTEEN', 14: 'FOURTEEN', 15: 'FIFTEEN', 16: 'SIXTEEN', 17: 'SEVENTEEN', 18: 'EIGHTEEN', 19: 'NINETEEN',
    20: 'TWENTY', 30: 'THIRTY', 40: 'FORTY', 50: 'FIFTY', 60: 'SIXTY', 70: 'SEVENTY', 80: 'EIGHTY', 90: 'NINETY'
  };

  if (amount === 0) return 'ZERO';

  function convertLessThanThousand(num) {
    let str = '';
    if (num >= 100) {
      str += words[Math.floor(num / 100)] + ' HUNDRED ';
      num %= 100;
    }
    if (num > 0) {
      if (num < 20) {
        str += words[num];
      } else {
        str += words[Math.floor(num / 10) * 10];
        if (num % 10 > 0) {
          str += ' ' + words[num % 10];
        }
      }
    }
    return str.trim();
  }

  let num = Math.floor(amount);
  let result = '';

  if (num >= 100000) {
    result += convertLessThanThousand(Math.floor(num / 100000)) + ' LAKH ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertLessThanThousand(Math.floor(num / 1000)) + ' THOUSAND ';
    num %= 1000;
  }
  if (num > 0) {
    result += convertLessThanThousand(num);
  }

  return result.trim() + ' ONLY';
}

function formatSlipDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function AdminPanel({ onBack, onLogout }) {
  // Navigation states
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'manage' | 'settings'
  const [customerIds, setCustomerIds] = useState({});

  // Settings & Reviews management states
  const [heroMediaType, setHeroMediaType] = useState('video'); // 'video' | 'image'
  const [heroMediaUrl, setHeroMediaUrl] = useState('/hero-video.mp4');
  const [heroUploadStatus, setHeroUploadStatus] = useState('No file chosen');
  const [allReviews, setAllReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [whyCards, setWhyCards] = useState([
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

  // Product Form states
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Shirts');
  const [productPrice, setProductPrice] = useState('');
  const [imageList, setImageList] = useState(['catShirts']);
  const [imageUploadStates, setImageUploadStates] = useState(['No file chosen']);
  const [productDesc, setProductDesc] = useState('');
  const [productNote, setProductNote] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [detailList, setDetailList] = useState(['']);
  const [colorList, setColorList] = useState([{ name: 'Obsidian', value: '#0E0E10' }]);

  const handleAddImage = () => {
    setImageList([...imageList, '']);
    setImageUploadStates([...imageUploadStates, 'No file chosen']);
  };

  const handleRemoveImage = (index) => {
    const newList = [...imageList];
    newList.splice(index, 1);
    setImageList(newList);

    const newStates = [...imageUploadStates];
    newStates.splice(index, 1);
    setImageUploadStates(newStates);
  };

  const handleImageChange = (index, value) => {
    const newList = [...imageList];
    newList[index] = value;
    setImageList(newList);
  };

  const handleDynamicImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newStates = [...imageUploadStates];
    newStates[index] = 'Uploading...';
    setImageUploadStates(newStates);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage bucket 'product-images'
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newList = [...imageList];
      newList[index] = publicUrl;
      setImageList(newList);

      const successStates = [...imageUploadStates];
      successStates[index] = 'Uploaded successfully!';
      setImageUploadStates(successStates);
    } catch (err) {
      console.error('Error uploading image:', err);
      const failStates = [...imageUploadStates];
      failStates[index] = 'Upload failed.';
      setImageUploadStates(failStates);
      alert(`Failed to upload image: ${err.message || err.error_description || err}\n\nPlease ensure the "product-images" bucket exists in your Supabase storage and has public policies applied.`);
    }
  };

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
  const [selectedOrderIds, setSelectedOrderIds] = useState({});
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const handleSelectAllOrders = (checked) => {
    const nextSelected = {};
    if (checked) {
      orders.forEach(o => {
        nextSelected[o.id] = true;
      });
    }
    setSelectedOrderIds(nextSelected);
  };

  // Products CRUD states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        // Hero Background Settings
        const typeRow = data.find(r => r.key === 'hero_media_type');
        const urlRow = data.find(r => r.key === 'hero_media_url');
        if (typeRow) setHeroMediaType(typeRow.value);
        if (urlRow) setHeroMediaUrl(urlRow.value);

        // Why Us Cards Settings
        const whyRow = data.find(r => r.key === 'why_cards_config');
        if (whyRow) {
          try {
            setWhyCards(JSON.parse(whyRow.value));
          } catch (e) {
            console.error('Failed to parse why cards config:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch site settings from site_settings (might need table creation):', err);
    }
  };

  const handleSaveHeroSettings = async () => {
    try {
      const { error: typeErr } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_media_type', value: heroMediaType });
      if (typeErr) throw typeErr;

      const { error: urlErr } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_media_url', value: heroMediaUrl });
      if (urlErr) throw urlErr;

      alert('Hero Background settings saved successfully!');
    } catch (err) {
      console.error('Error saving hero settings:', err);
      alert(`Failed to save settings: ${err.message || err}\n\nPlease ensure the "site_settings" table exists in your Supabase database and has appropriate policies.`);
    }
  };

  const handleSaveWhyCards = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'why_cards_config', value: JSON.stringify(whyCards) });
      if (error) throw error;
      alert('Why Us cards settings saved successfully!');
    } catch (err) {
      console.error('Error saving why cards config:', err);
      alert(`Failed to save settings: ${err.message || err}\n\nPlease ensure the "site_settings" table exists in your Supabase database and has appropriate policies.`);
    }
  };

  const fetchAllReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewDelete = async (id, author) => {
    if (window.confirm(`Are you sure you want to delete review by "${author}"?`)) {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);
        if (error) throw error;
        alert('Review deleted successfully.');
        fetchAllReviews();
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review.');
      }
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'manage') {
      fetchProducts();
    } else if (activeTab === 'settings') {
      fetchAllReviews();
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
    
    // Map dynamic images array
    const imgs = prod.images && prod.images.length > 0
      ? prod.images
      : [prod.image, prod.secondary_image].filter(Boolean);
    setImageList(imgs.length > 0 ? imgs : ['']);
    setImageUploadStates(Array(imgs.length > 0 ? imgs.length : 1).fill('No file chosen'));

    setProductDesc(prod.description || '');
    setProductNote(prod.note || '');
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

  const handleOrderDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete order #${id.substring(0, 8).toUpperCase()}?`)) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', id);
        if (error) throw error;
        alert("Order deleted successfully.");
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order.');
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

      // Filter images list details
      const finalImages = imageList.filter(img => img.trim() !== '');

      // Map primary image dynamically based on selected category using camelCase matching assets
      const categoryImageMap = {
        'Shirts': 'catShirts',
        'Tshirts': 'catTshirts',
        'Pants': 'catPants',
        'Shorts': 'catShorts',
        'Innerwear': 'catInnerwear'
      };
      const finalPrimaryImage = finalImages[0] && finalImages[0].trim() !== '' ? finalImages[0] : (categoryImageMap[productCategory] || 'catShirts');
      const finalSecondaryImage = finalImages[1] && finalImages[1].trim() !== '' ? finalImages[1] : 'overcoatImg';

      const newProduct = {
        name: productName,
        category: productCategory,
        price: parseFloat(productPrice),
        rating: 4.8, // default rating
        reviews: 0, // initial reviews count
        image: finalPrimaryImage,
        secondary_image: finalSecondaryImage,
        images: finalImages.length > 0 ? finalImages : [finalPrimaryImage],
        note: productNote,
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
      setProductNote('');
      setImageList(['']);
      setImageUploadStates(['No file chosen']);
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

  // Bulk slips exporter as ZIP (Respects checkboxes selection)
  const downloadBulkSlipsZip = () => {
    const selectedList = orders.filter(order => selectedOrderIds[order.id]);
    const listToExport = selectedList.length > 0 ? selectedList : orders;

    if (listToExport.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const zip = new JSZip();

    listToExport.forEach((order, idx) => {
      const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const shippingFee = Math.max(0, order.total_price - subtotal);
      
      const itemsHtml = (order.items || []).map((item, idx) => `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
          <span>${idx + 1}. ${item.product_name || item.name || item.product_title || 'Garment Model'} (SIZE: ${item.size || 'N/A'}${item.color ? `, COLOR: ${item.color}` : ''})</span>
          <span>QTY: ${item.quantity} - RS. ${item.price * item.quantity}</span>
        </div>
      `).join('');

      const shippingHtml = shippingFee > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
          <span>SHIPPING FEE</span>
          <span>RS. ${shippingFee}</span>
        </div>
      ` : '';

      const htmlContent = `
        <html>
          <head>
            <title>Order Slip - ${order.id.substring(0, 8).toUpperCase()}</title>
            <style>
              body {
                font-family: monospace;
                color: #000000;
                background: #ffffff;
                padding: 40px;
                max-width: 650px;
                margin: 0 auto;
              }
              @media print {
                body { padding: 10px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print();" style="padding: 10px 20px; font-weight: bold; background: #000000; color: #ffffff; border: none; cursor: pointer; border-radius: 4px;">Print This Slip</button>
            </div>
            
            <div style="border: 2px solid #000000; padding: 20px; font-family: monospace; color: #000000; max-width: 650px; margin: 0 auto; background: #ffffff; box-sizing: border-box;">
              <div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 0.3px; font-weight: bold; text-transform: uppercase; line-height: 1.4; white-space: nowrap;">
                  CASH ON DELIVERY FOR RS. ${order.total_price} (${convertNumberToWords(order.total_price)})
                </h3>
                <h1 style="margin: 8px 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                  URBAN CLOTHING
                </h1>
                <div style="font-size: 13px; font-weight: bold; margin: 10px 0; text-transform: uppercase; line-height: 1.5;">
                  DATE : ${formatSlipDate(order.created_at)}<br/>
                  CUSTOMER ID : ${customerIds[order.id] || 'N/A'}
                </div>
                <h3 style="margin: 12px 0 0 0; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #000000; padding-top: 10px;">
                  CASH ON DELIVERY
                </h3>
              </div>

              <div style="display: flex; border-bottom: 2px solid #000000; padding-bottom: 15px; margin-bottom: 15px; gap: 20px;">
                <div style="flex: 1; padding-right: 10px; border-right: 2px solid #000000; min-height: 150px;">
                  <strong style="font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 8px;">FROM,</strong>
                  <div style="font-size: 12px; line-height: 1.6; font-weight: bold; text-transform: uppercase;">
                    URBAN CLOTHING<br/>KONDOTTY<br/>PIN: 675643<br/>MALAPPURAM DT<br/>PH: 9747200000
                  </div>
                </div>
                <div style="flex: 1; padding-left: 10px; min-height: 150px;">
                  <strong style="font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 8px;">TO,</strong>
                  <div style="font-size: 12px; line-height: 1.6; font-weight: bold; text-transform: uppercase;">
                    ${order.customer_name}<br/>${order.house_name ? `${order.house_name}, ` : ''}${order.local_place || ''}<br/>${order.post_office ? `${order.post_office} (POST)` : ''}<br/>${order.district || ''}<br/>PIN : ${order.pincode || ''}<br/>${order.state || ''}<br/>PH: ${order.phone1} ${order.phone2 ? `/ ${order.phone2}` : ''}
                  </div>
                </div>
              </div>

              <div>
                <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #000000; padding-bottom: 5px; font-weight: bold;">
                  PRODUCT DETAILS
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${itemsHtml}
                  ${shippingHtml}
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; border-top: 1px solid #000000; margin-top: 4px;">
                    <span>SUBTOTAL</span>
                    <span>RS. ${subtotal}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; font-weight: 900; text-transform: uppercase;">
                    <span>TOTAL AMOUNT</span>
                    <span>RS. ${order.total_price}</span>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const fileName = `Slip_${order.customer_name.replace(/\s+/g, '_')}_${order.id.substring(0, 8).toUpperCase()}.html`;
      zip.file(fileName, htmlContent);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      const downloadName = selectedList.length > 0 ? `slips_selection_${new Date().toISOString().substring(0, 10)}.zip` : `all_slips_${new Date().toISOString().substring(0, 10)}.zip`;
      element.download = downloadName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };



  const handlePrintSlip = (order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      alert("Failed to open print window. Please allow popups for this site.");
      return;
    }

    const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = Math.max(0, order.total_price - subtotal);

    const itemsHtml = (order.items || []).map((item, idx) => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        <span>${idx + 1}. ${item.product_name || item.name || item.product_title || 'Garment Model'} (SIZE: ${item.size || 'N/A'}${item.color ? `, COLOR: ${item.color}` : ''})</span>
        <span>QTY: ${item.quantity} - RS. ${item.price * item.quantity}</span>
      </div>
    `).join('');

    const shippingHtml = shippingFee > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        <span>SHIPPING FEE</span>
        <span>RS. ${shippingFee}</span>
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Slip - ${order.customer_name}</title>
          <style>
            body { font-family: monospace; color: #000000; background: #ffffff; padding: 20px; max-width: 650px; margin: 0 auto; }
            @media print { body { padding: 10px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print();" style="padding: 8px 16px; font-weight: bold; background: #000000; color: #ffffff; border: none; cursor: pointer; border-radius: 4px;">Print</button>
            <button onclick="window.close();" style="padding: 8px 16px; font-weight: bold; background: #cccccc; color: #000000; border: none; cursor: pointer; border-radius: 4px; margin-left: 10px;">Close</button>
          </div>
          <div style="border: 2px solid #000000; padding: 20px; font-family: monospace; color: #000000; max-width: 650px; margin: 0 auto; background: #ffffff; box-sizing: border-box;">
            <div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 11px; letter-spacing: 0.3px; font-weight: bold; text-transform: uppercase; line-height: 1.4; white-space: nowrap;">
                CASH ON DELIVERY FOR RS. ${order.total_price} (${convertNumberToWords(order.total_price)})
              </h3>
              <h1 style="margin: 8px 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                URBAN CLOTHING
              </h1>
              <div style="font-size: 13px; font-weight: bold; margin: 10px 0; text-transform: uppercase; line-height: 1.5;">
                DATE : ${formatSlipDate(order.created_at)}<br/>
                CUSTOMER ID : ${customerIds[order.id] || 'N/A'}
              </div>
              <h3 style="margin: 12px 0 0 0; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #000000; padding-top: 10px;">
                CASH ON DELIVERY
              </h3>
            </div>
            <div style="display: flex; border-bottom: 2px solid #000000; padding-bottom: 15px; margin-bottom: 15px; gap: 20px;">
              <div style="flex: 1; padding-right: 10px; border-right: 2px solid #000000; min-height: 150px;">
                <strong style="font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 8px;">FROM,</strong>
                <div style="font-size: 12px; line-height: 1.6; font-weight: bold; text-transform: uppercase;">
                  URBAN CLOTHING<br/>KONDOTTY<br/>PIN: 675643<br/>MALAPPURAM DT<br/>PH: 9747200000
                </div>
              </div>
              <div style="flex: 1; padding-left: 10px; min-height: 150px;">
                <strong style="font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 8px;">TO,</strong>
                <div style="font-size: 12px; line-height: 1.6; font-weight: bold; text-transform: uppercase;">
                  ${order.customer_name}<br/>${order.house_name ? `${order.house_name}, ` : ''}${order.local_place || ''}<br/>${order.post_office ? `${order.post_office} (POST)` : ''}<br/>${order.district || ''}<br/>PIN : ${order.pincode || ''}<br/>${order.state || ''}<br/>PH: ${order.phone1} ${order.phone2 ? `/ ${order.phone2}` : ''}
                </div>
              </div>
            </div>
            <div>
              <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #000000; padding-bottom: 5px; font-weight: bold;">
                PRODUCT DETAILS
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${itemsHtml}
                ${shippingHtml}
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; border-top: 1px solid #000000; margin-top: 4px;">
                  <span>SUBTOTAL</span>
                  <span>RS. ${subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; font-weight: 900; text-transform: uppercase;">
                  <span>TOTAL AMOUNT</span>
                  <span>RS. ${order.total_price}</span>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintMinimalSlip = (order) => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'monospace';
    element.style.color = '#000000';
    element.style.backgroundColor = '#ffffff';
    element.style.width = '600px';

    const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = Math.max(0, order.total_price - subtotal);

    const itemsHtml = (order.items || []).map((item, idx) => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        <span>${idx + 1}. ${item.product_name || item.name || item.product_title || 'Garment Model'} (SIZE: ${item.size || 'N/A'}${item.color ? `, COLOR: ${item.color}` : ''})</span>
        <span>QTY: ${item.quantity} - RS. ${item.price * item.quantity}</span>
      </div>
    `).join('');

    const shippingHtml = shippingFee > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cccccc; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        <span>SHIPPING FEE</span>
        <span>RS. ${shippingFee}</span>
      </div>
    ` : '';

    element.innerHTML = `
      <div style="border: 2px solid #000000; padding: 20px; font-family: monospace; color: #000000; background: #ffffff; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 10.5px; letter-spacing: 0.3px; font-weight: bold; text-transform: uppercase; line-height: 1.4; white-space: nowrap;">
            CASH ON DELIVERY FOR RS. ${order.total_price} (${convertNumberToWords(order.total_price)})
          </h3>
          <h1 style="margin: 8px 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
            URBAN CLOTHING
          </h1>
          <div style="font-size: 12px; font-weight: bold; margin: 10px 0; text-transform: uppercase; line-height: 1.5;">
            DATE : ${formatSlipDate(order.created_at)}<br/>
            CUSTOMER ID : ${customerIds[order.id] || 'N/A'}
          </div>
          <h3 style="margin: 12px 0 0 0; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #000000; padding-top: 10px;">
            CASH ON DELIVERY
          </h3>
        </div>

        <div style="display: flex; border-bottom: 2px solid #000000; padding-bottom: 15px; margin-bottom: 15px; gap: 20px;">
          <div style="flex: 1; padding-right: 10px; border-right: 2px solid #000000; min-height: 140px;">
            <strong style="font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 6px;">FROM,</strong>
            <div style="font-size: 11px; line-height: 1.5; font-weight: bold; text-transform: uppercase;">
              URBAN CLOTHING<br/>KONDOTTY<br/>PIN: 675643<br/>MALAPPURAM DT<br/>PH: 9747200000
            </div>
          </div>
          <div style="flex: 1; padding-left: 10px; min-height: 140px;">
            <strong style="font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 6px;">TO,</strong>
            <div style="font-size: 11px; line-height: 1.5; font-weight: bold; text-transform: uppercase;">
              ${order.customer_name}<br/>${order.house_name ? `${order.house_name}, ` : ''}${order.local_place || ''}<br/>${order.post_office ? `${order.post_office} (POST)` : ''}<br/>${order.district || ''}<br/>PIN : ${order.pincode || ''}<br/>${order.state || ''}<br/>PH: ${order.phone1} ${order.phone2 ? `/ ${order.phone2}` : ''}
            </div>
          </div>
        </div>
        <div>
          <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #000000; padding-bottom: 5px; font-weight: bold;">
            PRODUCT DETAILS
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${itemsHtml}
            ${shippingHtml}
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; border-top: 1px solid #000000; margin-top: 4px;">
              <span>SUBTOTAL</span>
              <span>RS. ${subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; font-weight: 900; text-transform: uppercase;">
              <span>TOTAL AMOUNT</span>
              <span>RS. ${order.total_price}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const options = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `Slip_${order.customer_name.replace(/\s+/g, '_')}_${order.id.substring(0, 8).toUpperCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;
      html2pdf().set(options).from(element).save();
    }).catch(err => {
      console.error('Failed to load html2pdf:', err);
      alert('Failed to generate PDF. Please try again.');
    });
  };

  const handleDownloadFullSlipPDF = (order) => {
    handlePrintMinimalSlip(order);
  };

  return (
    <div className="admin-panel-view" style={{ padding: '3rem 0', animation: 'fadeIn 0.3s ease' }}>
      <div className="container">
        
        {/* Top Logout / Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#00ff88', background: 'rgba(0,255,136,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.15)' }}>
            ● System Active
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.35rem 0.95rem', fontSize: '0.75rem' }}>
              ← Shop Front
            </button>
            {onLogout && (
              <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '0.35rem 0.95rem', fontSize: '0.75rem', border: '1px solid #DC2626', color: '#DC2626' }}>
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Centered Dashboard Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-header)', fontWeight: '700', fontSize: '2.2rem', textTransform: 'uppercase', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>
            Urban Gents Admin
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage your premium product catalogue & order slips
          </p>
        </div>

        {/* Tab Controls - Centered Short Pills Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setIsEditing(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              background: activeTab === 'products' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'products' ? '#000000' : 'var(--text-primary)'
            }}
          >
            {isEditing ? '✏️ Edit' : '➕ Add'}
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              background: activeTab === 'manage' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'manage' ? '#000000' : 'var(--text-primary)'
            }}
          >
            📦 Manage
          </button>
          
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              background: activeTab === 'orders' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'orders' ? '#000000' : 'var(--text-primary)'
            }}
          >
            📋 Orders
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              background: activeTab === 'settings' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'settings' ? '#000000' : 'var(--text-primary)'
            }}
          >
            ⚙️ Site Settings
          </button>
        </div>

        {/* Tab 1: Upload / Edit Product Form */}
        {activeTab === 'products' && (
          <div className="admin-form-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {isEditing ? `Edit Garment: ${productName}` : 'Add New Garment Model'}
            </h3>

            {isEditing && (
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-gold)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

              {/* Dynamic Garment Images Group */}
              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Garment Images (First image will be Primary/Thumbnail)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {imageList.map((img, index) => (
                    <div key={index} className="admin-color-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '24px' }}>#{index + 1}</span>
                      
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          className="review-form-input" 
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={`Image URL / Asset Key ${index + 1} (e.g. catShirts or http://...)`}
                          style={{ margin: 0 }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', cursor: 'pointer', margin: 0, whiteSpace: 'nowrap' }}>
                          Choose File
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleDynamicImageUpload(e, index)} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {imageUploadStates[index] || 'No file chosen'}
                        </span>
                      </div>

                      {img.trim() !== '' && (
                        <div style={{ width: '34px', height: '34px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={img.startsWith('http') ? img : (productImages[img] || img)} 
                            alt={`Preview ${index + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}

                      {imageList.length > 1 && (
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
                            height: '34px'
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddImage}
                  style={{ width: 'fit-content', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.75rem' }}
                >
                  + Add Image
                </button>
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
                  Define color options for this product. Write a color name (HEX color value can be chosen as fallback/reference).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {colorList.map((color, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div className="admin-color-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%', marginBottom: 0 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '24px' }}>#{index + 1}</span>
                        
                        <div style={{ flex: 1 }}>
                          <input 
                            type="text" 
                            className="review-form-input" 
                            value={color.name}
                            onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                            placeholder={`Color Name (e.g. SKYBLUE WHITE)`}
                            style={{ margin: 0 }}
                          />
                        </div>
                        
                        <div className="admin-color-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                          <input 
                            type="color" 
                            value={color.value}
                            onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                            style={{ width: '28px', height: '24px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                          />
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

                      {/* Live Preview of Pill Badges */}
                      {color.name && color.name.trim() !== '' && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem', paddingLeft: '2rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Live Preview:</span>
                          
                          {/* Unselected Badge */}
                          <div style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '30px',
                            border: '1px solid var(--border-medium)',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            fontWeight: '600',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
                          }}>
                            {color.name}
                          </div>
                          
                          {/* Selected Badge */}
                          <div style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '30px',
                            border: '1px solid #000000',
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
                          }}>
                            {color.name}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddColor}
                  style={{ width: 'fit-content', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.75rem' }}
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

              {/* Care Note Input Field */}
              <div className="review-form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="prodNote">Additional Care Note / Instructions</label>
                <input 
                  type="text" 
                  id="prodNote" 
                  className="review-form-input" 
                  value={productNote}
                  onChange={(e) => setProductNote(e.target.value)}
                  placeholder="e.g. Dry Clean only. Fits true to size."
                />
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
                  border: '2px solid rgba(255,255,255,0.1)',
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
                {products.map((prod) => {
                  const firstImage = prod.images && prod.images[0] ? prod.images[0] : prod.image;
                  const displayImage = firstImage && firstImage.startsWith('http') ? firstImage : (productImages[firstImage] || firstImage);
                  
                  return (
                    <div 
                      key={prod.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        gap: '1rem' 
                      }}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          width: '70px', 
                          height: '70px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-light)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: 'rgba(255,255,255,0.01)',
                          flexShrink: 0
                        }}>
                          <img 
                            src={displayImage} 
                            alt={prod.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong style={{ 
                            display: 'block', 
                            fontSize: '0.95rem', 
                            color: 'var(--text-primary)', 
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {prod.name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {prod.category}
                          </span>
                          <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
                            Rs. {prod.price}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                            ID: {prod.id}
                          </span>
                        </div>
                      </div>
                      
                       {/* Right: Vertical Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '90px', flexShrink: 0 }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => startEditProduct(prod)}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', width: '100%', display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✏️ Edit
                        </button>
                        
                        <button 
                          className="btn btn-accent" 
                          onClick={() => handleProductDelete(prod.id, prod.name)}
                          style={{ 
                            padding: '0.35rem 0.5rem', 
                            fontSize: '0.75rem', 
                            width: '100%', 
                            background: '#8B0000', 
                            borderColor: '#8B0000', 
                            color: '#fff', 
                            display: 'flex', 
                            gap: '0.25rem', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Orders List */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Recent Deliveries Slips ({orders.length})
                </h3>
                
                {orders.length > 0 && (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={orders.length > 0 && Object.keys(selectedOrderIds).length === orders.length}
                      onChange={(e) => handleSelectAllOrders(e.target.checked)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                    />
                    Select All
                  </label>
                )}
              </div>
              
              <button 
                className="btn btn-accent" 
                onClick={downloadBulkSlipsZip}
                disabled={orders.length === 0}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Download size={16} />
                Download {orders.filter(o => selectedOrderIds[o.id]).length > 0 ? `Selected Slips (${orders.filter(o => selectedOrderIds[o.id]).length})` : 'All Slips'} ZIP
              </button>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="checkout-spinner" style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid rgba(255,255,255,0.1)',
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
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginRight: '0.5rem' }}>
                            <input 
                              type="checkbox" 
                              checked={!!selectedOrderIds[order.id]} 
                              onChange={(e) => {
                                setSelectedOrderIds({
                                  ...selectedOrderIds,
                                  [order.id]: e.target.checked
                                });
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent accordion triggers
                              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', cursor: 'pointer', margin: 0 }}
                            />
                          </div>
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
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Customer ID:
                              </label>
                              <input 
                                type="text" 
                                className="review-form-input" 
                                placeholder="Enter ID to print" 
                                value={customerIds[order.id] || ''} 
                                onChange={(e) => setCustomerIds({ ...customerIds, [order.id]: e.target.value })}
                                style={{ width: '180px', margin: 0, padding: '0.4rem 0.8rem', color: '#ffffff', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                              <button 
                                className="btn btn-accent"
                                onClick={() => handlePrintMinimalSlip(order)}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1.2rem' }}
                              >
                                <Download size={14} />
                                Download Slip
                              </button>
                              <button 
                                className="btn btn-primary"
                                onClick={() => handlePrintSlip(order)}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1.2rem' }}
                              >
                                <FileText size={14} />
                                Print Customer Slip
                              </button>
                              <button 
                                className="btn btn-secondary"
                                onClick={() => handleOrderDelete(order.id)}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1.2rem', backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#ffffff' }}
                              >
                                <Trash2 size={14} />
                                Delete Order
                              </button>
                            </div>
                          </div>
                          
                          <div className="slip-printable-area" style={{ background: '#ffffff', border: '2px solid #000000', padding: '2rem', borderRadius: '4px', fontFamily: 'monospace', color: '#000000', maxWidth: '650px', margin: '0 auto', boxSizing: 'border-box' }}>
                            
                            {/* Top Section */}
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '15px' }}>
                              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.72rem', letterSpacing: '0.3px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                                CASH ON DELIVERY FOR RS. {order.total_price} ({convertNumberToWords(order.total_price)})
                              </h3>
                              <h1 style={{ margin: '8px 0', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#000000' }}>
                                URBAN CLOTHING
                              </h1>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '10px 0', textTransform: 'uppercase', color: '#000000', lineHeight: '1.5' }}>
                                DATE : {formatSlipDate(order.created_at)}<br/>
                                CUSTOMER ID : {customerIds[order.id] || 'N/A'}
                              </div>
                              <h3 style={{ margin: '12px 0 0 0', fontSize: '0.9rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', borderTop: '1px solid #000000', paddingTop: '10px', color: '#000000' }}>
                                CASH ON DELIVERY
                              </h3>
                            </div>

                            {/* Address Grid Section */}
                            <div style={{ display: 'flex', borderBottom: '2px solid #000000', paddingBottom: '15px', marginBottom: '15px', gap: '20px' }}>
                              {/* Left Column: FROM */}
                              <div style={{ flex: 1, paddingRight: '10px', borderRight: '2px solid #000000', minHeight: '140px', textAlign: 'left' }}>
                                <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', color: '#000000' }}>FROM,</strong>
                                <div style={{ fontSize: '0.8rem', lineHeight: '1.5', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
                                  URBAN CLOTHING<br/>
                                  KONDOTTY<br/>
                                  PIN: 675643<br/>
                                  MALAPPURAM DT<br/>
                                  PH: 9747200000
                                </div>
                              </div>

                              {/* Right Column: TO */}
                              <div style={{ flex: 1, paddingLeft: '10px', minHeight: '140px', textAlign: 'left' }}>
                                <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', color: '#000000' }}>TO,</strong>
                                <div style={{ fontSize: '0.8rem', lineHeight: '1.5', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
                                  {order.customer_name}<br/>
                                  {order.house_name ? `${order.house_name}, ` : ''}{order.local_place || ''}<br/>
                                  {order.post_office ? `${order.post_office} (POST)` : ''}<br/>
                                  {order.district || ''}<br/>
                                  PIN : {order.pincode || ''}<br/>
                                  {order.state || ''}<br/>
                                  PH: {order.phone1} {order.phone2 ? `/ ${order.phone2}` : ''}
                                </div>
                              </div>
                            </div>

                            {/* Product Details Section */}
                            <div style={{ textAlign: 'left' }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #000000', paddingBottom: '5px', fontWeight: 'bold', color: '#000000' }}>
                                PRODUCT DETAILS
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(order.items || []).map((item, idx) => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cccccc', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
                                    <span>{idx + 1}. {item.product_name || item.name || item.product_title || 'Garment Model'} (SIZE: {item.size || 'N/A'}{item.color ? `, COLOR: ${item.color}` : ''})</span>
                                    <span>QTY: {item.quantity} - RS. {item.price * item.quantity}</span>
                                  </div>
                                ))}
                                {(() => {
                                  const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                  const shippingFee = Math.max(0, order.total_price - subtotal);
                                  return (
                                    <>
                                      {shippingFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #cccccc', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
                                          <span>SHIPPING FEE</span>
                                          <span>RS. {shippingFee}</span>
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', borderTop: '1px solid #000000', marginTop: '4px', color: '#000000' }}>
                                        <span>SUBTOTAL</span>
                                        <span>RS. {subtotal}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', color: '#000000' }}>
                                        <span>TOTAL AMOUNT</span>
                                        <span>RS. {order.total_price}</span>
                                      </div>
                                    </>
                                  );
                                })()}
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

        {/* Tab 4: Hero Settings */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Hero Section Media Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  BACKGROUND MEDIA TYPE
                </label>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="heroType" 
                      value="video" 
                      checked={heroMediaType === 'video'}
                      onChange={() => setHeroMediaType('video')}
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    Video Background
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="heroType" 
                      value="image" 
                      checked={heroMediaType === 'image'}
                      onChange={() => setHeroMediaType('image')}
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    Image Background
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  MEDIA SOURCE URL
                </label>
                <input 
                  type="text" 
                  className="review-form-input" 
                  value={heroMediaUrl} 
                  onChange={(e) => setHeroMediaUrl(e.target.value)}
                  placeholder="e.g. /hero-video.mp4 or public URL"
                  style={{ width: '100%', margin: 0, padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#ffffff' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Enter a relative local path or an absolute HTTP URL.
                </span>
              </div>

              <div style={{ border: '1px dashed var(--border-light)', padding: '1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  UPLOAD NEW BACKGROUND FILE
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setHeroUploadStatus('Uploading...');
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `hero-${Date.now()}.${fileExt}`;
                        const filePath = `${fileName}`;

                        const { data, error } = await supabase.storage
                          .from('product-images')
                          .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                          });

                        if (error) throw error;

                        const { data: { publicUrl } } = supabase.storage
                          .from('product-images')
                          .getPublicUrl(filePath);

                        setHeroMediaUrl(publicUrl);
                        setHeroUploadStatus('Uploaded successfully!');
                      } catch (err) {
                        console.error('Error uploading hero file:', err);
                        setHeroUploadStatus('Upload failed.');
                        alert(`Upload failed: ${err.message || err}`);
                      }
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: heroUploadStatus.includes('success') ? '#00ff88' : 'var(--text-muted)' }}>
                    {heroUploadStatus}
                  </span>
                </div>
              </div>

              <button 
                className="btn btn-accent" 
                onClick={handleSaveHeroSettings}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', marginTop: '1rem' }}
              >
                Save Background Settings
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '3rem 0' }} />

            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
              "Why Us" Columns Settings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {whyCards.map((card, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-gold)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                    Column {idx + 1}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                        ICON STYLE
                      </label>
                      <select 
                        value={card.icon}
                        onChange={(e) => {
                          const newCards = [...whyCards];
                          newCards[idx].icon = e.target.value;
                          setWhyCards(newCards);
                        }}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: '#0e0e10', border: '1px solid var(--border-light)', color: '#ffffff' }}
                      >
                        <option value="Sparkles">Sparkles (Quality/Excellence)</option>
                        <option value="Compass">Compass (Philosophy/Direction)</option>
                        <option value="Leaf">Leaf (Sustainability/Cotton)</option>
                        <option value="ShieldCheck">Shield Check (Guarantee/Trust)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                        TITLE
                      </label>
                      <input 
                        type="text" 
                        className="review-form-input" 
                        value={card.title}
                        onChange={(e) => {
                          const newCards = [...whyCards];
                          newCards[idx].title = e.target.value;
                          setWhyCards(newCards);
                        }}
                        style={{ width: '100%', margin: 0, padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                        DESCRIPTION TEXT
                      </label>
                      <textarea 
                        className="review-form-input" 
                        value={card.description}
                        onChange={(e) => {
                          const newCards = [...whyCards];
                          newCards[idx].description = e.target.value;
                          setWhyCards(newCards);
                        }}
                        rows={3}
                        style={{ width: '100%', margin: 0, padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#ffffff', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-accent" 
                onClick={handleSaveWhyCards}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}
              >
                Save "Why Us" Columns Settings
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '3rem 0' }} />

            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Manage Client Reviews ({allReviews.length})
            </h3>

            {loadingReviews ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                <div className="checkout-spinner" style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: 'var(--accent-gold)',
                  borderRadius: '50%',
                  animation: 'pulseGlow 1s infinite'
                }}></div>
              </div>
            ) : allReviews.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No reviews in database.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1rem 1.5rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      gap: '1rem',
                      background: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.author}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({new Date(rev.created_at).toLocaleDateString()})</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < rev.rating ? 'var(--accent-gold)' : 'none'} 
                            color={i < rev.rating ? 'var(--accent-gold)' : 'var(--text-muted)'} 
                          />
                        ))}
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginLeft: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Product: {rev.product}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <button 
                      className="btn btn-accent" 
                      onClick={() => handleReviewDelete(rev.id, rev.author)}
                      style={{ 
                        padding: '0.35rem 0.6rem', 
                        fontSize: '0.75rem', 
                        background: '#8B0000', 
                        borderColor: '#8B0000', 
                        color: '#fff', 
                        display: 'flex', 
                        gap: '0.25rem', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
