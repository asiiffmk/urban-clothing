import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read .env file manually from the current working directory
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at: ' + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file!');
  process.exit(1);
}

// Create Supabase client with the service role key to bypass RLS policies during seeding
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categoriesData = [
  { id: 'shirts', name: 'Shirts', image: 'catShirts' },
  { id: 'tshirts', name: 'Tshirts', image: 'catTshirts' },
  { id: 'pants', name: 'Pants', image: 'catPants' },
  { id: 'shorts', name: 'Shorts', image: 'catShorts' },
  { id: 'innerwear', name: 'Innerwear', image: 'catInnerwear' }
];

const productsData = [
  // New Arrivals
  {
    id: 101,
    name: "Corduroy Shirts MSC1262",
    category: "Shirts",
    price: 45,
    rating: 4.8,
    reviews: 42,
    image: "newCorduroy",
    secondary_image: "catShirts",
    description: "A premium black corduroy shirt designed for daily comfort and structural elegance. Engineered with fine-wale cotton corduroy for soft drape and a modern silhouette.",
    colors: [{ name: "Obsidian", value: "#0E0E10" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% fine-wale corduroy cotton",
      "Classic structured collar",
      "Signature chest pocket detail",
      "Slightly curved hem",
      "Machine wash cold"
    ],
    sizes_stock: { S: 4, M: 4, L: 2, XL: 2 },
    is_new_arrival: true
  },
  {
    id: 102,
    name: "Stripes Shirts MSC1265",
    category: "Shirts",
    price: 45,
    rating: 4.7,
    reviews: 31,
    image: "newStripes",
    secondary_image: "catShirts",
    description: "A light-blue and white vertical striped oxford shirt. Crisp, clean cotton weave with a structured button-down collar and adjustable double-button cuffs.",
    colors: [{ name: "Blue Stripe", value: "#A3C1AD" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% long-staple oxford cotton",
      "Button-down collar",
      "Vertical clean stripes",
      "Adjustable cuffs",
      "Machine wash warm"
    ],
    sizes_stock: { S: 3, M: 5, L: 2, XL: 1 },
    is_new_arrival: true
  },
  {
    id: 103,
    name: "Linen Shirts MSC1263",
    category: "Shirts",
    price: 45,
    rating: 4.8,
    reviews: 55,
    image: "newLinen",
    secondary_image: "catShirts",
    description: "A breathable, long-sleeve linen shirt in a sophisticated burnt orange/peach hue. Pre-washed for a soft linen texture and a relaxed, easy-to-style fit.",
    colors: [{ name: "Burnt Orange", value: "#D45B34" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% pure organic linen",
      "Relaxed resort-style fit",
      "Breathable open weave pattern",
      "Pre-shrunk, soft finish",
      "Hand wash cold, dry flat"
    ],
    sizes_stock: { S: 4, M: 4, L: 3, XL: 2 },
    is_new_arrival: true
  },
  {
    id: 104,
    name: "Semi Baggy Denim Pants MDP0176",
    category: "Pants",
    price: 55,
    rating: 4.9,
    reviews: 82,
    image: "newDenim",
    secondary_image: "catPants",
    description: "Light wash denim jeans in a contemporary semi-baggy cut. Built with heavy-duty denim for durability and a comfortable, relaxed drape through the leg.",
    colors: [{ name: "Light Wash Blue", value: "#A9C2D8" }],
    sizes: ["30", "32", "34", "36"],
    details: [
      "100% heavy cotton denim (13.5 oz)",
      "Classic 5-pocket denim design",
      "Semi-baggy tapered straight cut",
      "Custom branded leather patch",
      "Machine wash inside out cold"
    ],
    sizes_stock: { "30": 4, "32": 4, "34": 2, "36": 2 },
    is_new_arrival: true
  },
  // Main Products
  {
    id: 1,
    name: "The Oxford Textured Shirt",
    category: "Shirts",
    price: 85,
    rating: 4.8,
    reviews: 94,
    image: "catShirts",
    secondary_image: "overcoatImg",
    description: "Tailored from premium waffle-textured cotton, this long-sleeve white button-up features a soft relaxed collar and custom mother-of-pearl buttons. Crafted for seamless transition between smart and casual.",
    colors: [
      { name: "Cream White", value: "#F5F5F3" },
      { name: "Slate", value: "#4A4D50" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% Organic Waffle-Textured Cotton",
      "Mother-of-pearl button closure",
      "Breathable, lightweight weave",
      "Tailored curved hem",
      "Machine wash warm"
    ],
    sizes_stock: { S: 6, M: 8, L: 4, XL: 2 },
    is_new_arrival: false
  },
  {
    id: 2,
    name: "The Vanguard Graphic Tee",
    category: "Tshirts",
    price: 55,
    rating: 4.7,
    reviews: 142,
    image: "catTshirts",
    secondary_image: "blazerImg",
    description: "An oversized streetwear essential crafted from heavy cotton jersey. Featuring custom pink graffiti puff print on the chest, dropped shoulders, and a thick ribbed mock-neck collar.",
    colors: [
      { name: "Obsidian Black", value: "#0E0E10" },
      { name: "Sand", value: "#E5DFD3" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "260GSM Heavyweight 100% Cotton",
      "Premium puff-print detail",
      "Pre-shrunk graphic jersey",
      "Oversized boxy streetwear drape",
      "Wash inside out cold"
    ],
    sizes_stock: { S: 10, M: 12, L: 8, XL: 4 },
    is_new_arrival: false
  },
  {
    id: 3,
    name: "The Corduroy Utility Pants",
    category: "Pants",
    price: 115,
    rating: 4.9,
    reviews: 78,
    image: "catPants",
    secondary_image: "sweaterImg",
    description: "Sartorial trousers crafted from premium 8-wale brown corduroy. Featuring a relaxed straight-leg profile, functional utility pockets, and reinforced seam work for durability.",
    colors: [
      { name: "Earth Brown", value: "#7B5E43" },
      { name: "Charcoal", value: "#2C302B" }
    ],
    sizes: ["30", "32", "34", "36"],
    details: [
      "100% Heavy Corduroy Cotton",
      "Minimalist straight-leg silhouette",
      "Reinforced utility pockets",
      "Premium YKK brass zipper",
      "Dry clean recommended"
    ],
    sizes_stock: { "30": 5, "32": 6, "34": 4, "36": 2 },
    is_new_arrival: false
  },
  {
    id: 4,
    name: "The Relaxed Summer Shorts",
    category: "Shorts",
    price: 65,
    rating: 4.6,
    reviews: 53,
    image: "catShorts",
    secondary_image: "cargoImg",
    description: "Relaxed-fit shorts crafted from washed cotton corduroy. Featuring a comfortable elasticized waistband with custom woven drawstring, side-seam pockets, and signature brand patch.",
    colors: [
      { name: "Sage Green", value: "#4D5845" },
      { name: "Washed Blue", value: "#6F8294" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% Soft Washed Corduroy",
      "Elastic waistband with drawstring",
      "Signature embroidered logo patch",
      "Standard 6-inch insetam",
      "Machine wash cold"
    ],
    sizes_stock: { S: 8, M: 10, L: 6, XL: 4 },
    is_new_arrival: false
  },
  {
    id: 5,
    name: "The Premium Boxer Briefs",
    category: "Innerwear",
    price: 35,
    rating: 4.9,
    reviews: 210,
    image: "catInnerwear",
    secondary_image: "heroImg",
    description: "The ultimate base layer. Crafted from organic micro-modal cotton that feels like a second skin, with a tagless design, ultra-soft elastic band, and anatomical supportive pouch.",
    colors: [
      { name: "Slate Blue", value: "#5B758E" },
      { name: "Obsidian", value: "#1A1D20" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "95% Organic Micro-Modal, 5% Elastane",
      "Tagless anti-chafing construction",
      "Supportive contoured pouch",
      "Stay-put elastic waistband",
      "Machine wash tumble dry low"
    ],
    sizes_stock: { S: 15, M: 15, L: 10, XL: 5 },
    is_new_arrival: false
  }
];

const reviewsData = [
  {
    author: "Alexander M.",
    rating: 5,
    product: "The Oxford Textured Shirt",
    comment: "The fabric texture is outstanding. It feels extremely premium and holds its shape perfectly throughout the day. A true minimalist masterpiece."
  },
  {
    author: "Liam K.",
    rating: 5,
    product: "The Corduroy Utility Pants",
    comment: "Exceptional tailoring. Finding pants that drape this nicely is rare. The corduroy material has a rich weight to it, perfect for smart casual styling."
  },
  {
    author: "Julian R.",
    rating: 5,
    product: "The Vanguard Graphic Tee",
    comment: "Heavyweight cotton done right. The mock collar stays tight, and the puff print detail is immaculate. Definitely ordering more colors."
  }
];

async function seed() {
  console.log('Starting seed process...');

  // 1. Seed Categories
  console.log('Seeding categories...');
  const { error: catError } = await supabase.from('categories').upsert(categoriesData);
  if (catError) {
    console.error('Error seeding categories:', catError);
  } else {
    console.log('Categories seeded successfully!');
  }

  // 2. Seed Products
  console.log('Seeding products...');
  const { error: prodError } = await supabase.from('products').upsert(productsData);
  if (prodError) {
    console.error('Error seeding products:', prodError);
  } else {
    console.log('Products seeded successfully!');
  }

  // 3. Seed Reviews
  console.log('Seeding reviews...');
  const { error: revError } = await supabase.from('reviews').insert(reviewsData);
  if (revError) {
    console.error('Error seeding reviews:', revError);
  } else {
    console.log('Reviews seeded successfully!');
  }

  console.log('Seeding complete.');
}

seed();
