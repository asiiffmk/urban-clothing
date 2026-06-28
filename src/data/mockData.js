import heroImg from '../assets/hero.png';
import blazerImg from '../assets/blazer.png';
import overcoatImg from '../assets/overcoat.png';
import sweaterImg from '../assets/sweater.png';
import cargoImg from '../assets/cargo.png';
import look1Img from '../assets/look1.png';
import look2Img from '../assets/look2.png';

// Category Images
import catShirts from '../assets/cat_shirts.png';
import catTshirts from '../assets/cat_tshirts.png';
import catPants from '../assets/cat_pants.png';
import catShorts from '../assets/cat_shorts.png';
import catInnerwear from '../assets/cat_innerwear.png';

// New Arrivals Images
import newCorduroy from '../assets/new_corduroy.png';
import newStripes from '../assets/new_stripes.png';
import newLinen from '../assets/new_linen.png';
import newDenim from '../assets/new_denim.png';

export const categories = [
  { id: 'shirts', name: 'Shirts', image: catShirts },
  { id: 'tshirts', name: 'Tshirts', image: catTshirts },
  { id: 'pants', name: 'Pants', image: catPants },
  { id: 'shorts', name: 'Shorts', image: catShorts },
  { id: 'innerwear', name: 'Innerwear', image: catInnerwear }
];

export const newArrivals = [
  {
    id: 101,
    name: "Corduroy Shirts MSC1262",
    category: "Shirts",
    price: 45,
    rating: 4.8,
    reviews: 42,
    image: newCorduroy,
    secondaryImage: catShirts,
    description: "A premium black corduroy shirt designed for daily comfort and structural elegance. Engineered with fine-wale cotton corduroy for soft drape and a modern silhouette.",
    colors: [{ name: "Obsidian", value: "#0E0E10" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% fine-wale corduroy cotton",
      "Classic structured collar",
      "Signature chest pocket detail",
      "Slightly curved hem",
      "Machine wash cold"
    ]
  },
  {
    id: 102,
    name: "Stripes Shirts MSC1265",
    category: "Shirts",
    price: 45,
    rating: 4.7,
    reviews: 31,
    image: newStripes,
    secondaryImage: catShirts,
    description: "A light-blue and white vertical striped oxford shirt. Crisp, clean cotton weave with a structured button-down collar and adjustable double-button cuffs.",
    colors: [{ name: "Blue Stripe", value: "#A3C1AD" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% long-staple oxford cotton",
      "Button-down collar",
      "Vertical clean stripes",
      "Adjustable cuffs",
      "Machine wash warm"
    ]
  },
  {
    id: 103,
    name: "Linen Shirts MSC1263",
    category: "Shirts",
    price: 45,
    rating: 4.8,
    reviews: 55,
    image: newLinen,
    secondaryImage: catShirts,
    description: "A breathable, long-sleeve linen shirt in a sophisticated burnt orange/peach hue. Pre-washed for a soft linen texture and a relaxed, easy-to-style fit.",
    colors: [{ name: "Burnt Orange", value: "#D45B34" }],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% pure organic linen",
      "Relaxed resort-style fit",
      "Breathable open weave pattern",
      "Pre-shrunk, soft finish",
      "Hand wash cold, dry flat"
    ]
  },
  {
    id: 104,
    name: "Semi Baggy Denim Pants MDP0176",
    category: "Pants",
    price: 55,
    rating: 4.9,
    reviews: 82,
    image: newDenim,
    secondaryImage: catPants,
    description: "Light wash denim jeans in a contemporary semi-baggy cut. Built with heavy-duty denim for durability and a comfortable, relaxed drape through the leg.",
    colors: [{ name: "Light Wash Blue", value: "#A9C2D8" }],
    sizes: ["30", "32", "34", "36"],
    details: [
      "100% heavy cotton denim (13.5 oz)",
      "Classic 5-pocket denim design",
      "Semi-baggy tapered straight cut",
      "Custom branded leather patch",
      "Machine wash inside out cold"
    ]
  }
];

export const products = [
  {
    id: 1,
    name: "The Oxford Textured Shirt",
    category: "Shirts",
    price: 85,
    rating: 4.8,
    reviews: 94,
    image: catShirts,
    secondaryImage: overcoatImg,
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
    ]
  },
  {
    id: 2,
    name: "The Vanguard Graphic Tee",
    category: "Tshirts",
    price: 55,
    rating: 4.7,
    reviews: 142,
    image: catTshirts,
    secondaryImage: blazerImg,
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
    ]
  },
  {
    id: 3,
    name: "The Corduroy Utility Pants",
    category: "Pants",
    price: 115,
    rating: 4.9,
    reviews: 78,
    image: catPants,
    secondaryImage: sweaterImg,
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
    ]
  },
  {
    id: 4,
    name: "The Relaxed Summer Shorts",
    category: "Shorts",
    price: 65,
    rating: 4.6,
    reviews: 53,
    image: catShorts,
    secondaryImage: cargoImg,
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
      "Standard 6-inch inseam",
      "Machine wash cold"
    ]
  },
  {
    id: 5,
    name: "The Premium Boxer Briefs",
    category: "Innerwear",
    price: 35,
    rating: 4.9,
    reviews: 210,
    image: catInnerwear,
    secondaryImage: heroImg,
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
    ]
  }
];

export const lookbooks = [
  {
    id: 1,
    title: "Urban Vanguard Lookbook",
    subtitle: "Autumn / Winter Edition",
    image: look1Img,
    description: "A stark study of structure and functionality, featuring premium layered utility silhouettes in concrete-heavy cityscapes.",
    hotspots: [
      {
        id: "hs-1",
        x: 45,
        y: 35,
        productId: 1, // Links to Oxford Textured Shirt
        productName: "The Oxford Textured Shirt",
        price: 85
      },
      {
        id: "hs-2",
        x: 52,
        y: 75,
        productId: 3, // Links to Corduroy Utility Pants
        productName: "The Corduroy Utility Pants",
        price: 115
      }
    ]
  },
  {
    id: 2,
    title: "Minimalist Lounge Lookbook",
    subtitle: "Contemporary Tailoring",
    image: look2Img,
    description: "Effortless sartorial expression designed for indoor settings, blending comfort and razor-sharp modern lines.",
    hotspots: [
      {
        id: "hs-3",
        x: 50,
        y: 40,
        productId: 2, // Links to Graphic Tee
        productName: "The Vanguard Graphic Tee",
        price: 55
      }
    ]
  }
];
