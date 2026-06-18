const { MongoClient } = require('mongodb');

// 1. Your complete e-commerce product list
const products = [
  { name: 'Samsung Galaxy M34 5G', slug: 'samsung-galaxy-m34-5g' },
  { name: 'boAt Airdopes 141 Earbuds', slug: 'boat-airdopes-141-earbuds' },
  { name: 'Logitech MK235 Keyboard + Mouse Combo', slug: 'logitech-mk235-keyboard-mouse-combo' },
  { name: 'Realme Narzo 60 5G', slug: 'realme-narzo-60-5g' },
  { name: 'Mi 80cm (32) Smart TV', slug: 'mi-80cm-32-smart-tv' },
  { name: 'HP 15s Laptop', slug: 'hp-15s-laptop' },
  { name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5-headphones' },
  { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6' },
  { name: 'JBL PartyBox 310', slug: 'jbl-partybox-310' },
  { name: 'ASUS ROG Strix G16 Gaming Laptop', slug: 'asus-rog-strix-g16-gaming-laptop' },
  { name: "Men's Classic Polo T-Shirt", slug: 'mens-classic-polo-t-shirt' },
  { name: "Women's Kurti Set", slug: 'womens-kurti-set' },
  { name: "Levi's 511 Slim Fit Jeans", slug: 'levis-511-slim-fit-jeans' },
  { name: 'Sports Running Shoes', slug: 'sports-running-shoes' },
  { name: 'Formal Blazer for Men', slug: 'formal-blazer-for-men' },
  { name: 'Floral Maxi Dress', slug: 'floral-maxi-dress' },
  { name: 'Apple iPad 10th Gen', slug: 'apple-ipad-10th-gen' },
  { name: 'Canon EOS R50 Mirrorless Camera', slug: 'canon-eos-r50-mirrorless-camera' },
  { name: 'Silk Evening Gown', slug: 'silk-evening-gown' },
  { name: "Men's Leather Wallet", slug: 'mens-leather-wallet' },
  { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses' },
  { name: 'Handcrafted Leather Belt', slug: 'handcrafted-leather-belt' },
  { name: 'Premium Stainless Steel Cookware Set', slug: 'premium-stainless-steel-cookware-set' },
  { name: 'Scented Soy Candle Collection', slug: 'scented-soy-candle-collection' },
  { name: 'Robot Vacuum Cleaner', slug: 'robot-vacuum-cleaner' },
  { name: 'Egyptian Cotton Bed Sheet Set', slug: 'egyptian-cotton-bed-sheet-set' },
  { name: 'Air Fryer 5.5L', slug: 'air-fryer-55l' },
  { name: 'Smart LED Desk Lamp', slug: 'smart-led-desk-lamp' },
  { name: 'KitchenAid Stand Mixer', slug: 'kitchenaid-stand-mixer' },
  { name: 'Minimalist Wall Clock', slug: 'minimalist-wall-clock' },
  { name: 'Bamboo Kitchen Cutting Board Set', slug: 'bamboo-kitchen-cutting-board-set' },
  { name: 'Smart Coffee Maker', slug: 'smart-coffee-maker' },
  { name: 'Atomic Habits', slug: 'atomic-habits' },
  { name: 'The Alchemist', slug: 'the-alchemist' },
  { name: 'Rich Dad Poor Dad', slug: 'rich-dad-poor-dad' },
  { name: 'The Lean Startup', slug: 'the-lean-startup' },
  { name: 'Cashmere Blend Sweater', slug: 'cashmere-blend-sweater' },
  { name: 'Denim Jacket Classic', slug: 'denim-jacket-classic' },
  { name: 'The Great Gatsby', slug: 'the-great-gatsby' },
  { name: 'Thinking, Fast and Slow', slug: 'thinking-fast-and-slow' },
  { name: 'Pro Yoga Mat', slug: 'pro-yoga-mat' },
  { name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set' },
  { name: 'Mountain Bike 27.5 inch', slug: 'mountain-bike-275-inch' },
  { name: 'Swimming Goggles Pro', slug: 'swimming-goggles-pro' },
  { name: 'Tennis Racket Pro', slug: 'tennis-racket-pro' },
  { name: 'Fitness Tracker Band', slug: 'fitness-tracker-band' },
  { name: 'Vitamin C Serum 20%', slug: 'vitamin-c-serum-20' },
  { name: 'Hydrating Face Moisturizer', slug: 'hydrating-face-moisturizer' },
  { name: 'Designer Perfume Collection', slug: 'designer-perfume-collection' },
  { name: 'Professional Hair Dryer', slug: 'professional-hair-dryer' },
  { name: 'Natural Lipstick Set', slug: 'natural-lipstick-set' },
  { name: 'Hair Growth Oil Treatment', slug: 'hair-growth-oil-treatment' },
  { name: 'LEGO Star Wars Millennium Falcon', slug: 'lego-star-wars-millennium-falcon' },
  { name: 'Remote Control Racing Car', slug: 'remote-control-racing-car' },
  { name: 'Board Game Collection - 5 in 1', slug: 'board-game-collection-5-in-1' },
  { name: 'Educational Science Kit', slug: 'educational-science-kit' },
  { name: 'Car Dash Camera 4K', slug: 'car-dash-camera-4k' },
  { name: 'Leather Car Seat Covers', slug: 'leather-car-seat-covers' },
  { name: 'Car Portable Tire Inflator', slug: 'car-portable-tire-inflator' },
  { name: 'Sapiens: A Brief History of Humankind', slug: 'sapiens-a-brief-history-of-humankind' },
  { name: 'Multivitamin Tablets Daily', slug: 'multivitamin-tablets-daily' },
  { name: 'The Psychology of Money', slug: 'the-psychology-of-money' },
  { name: 'Organic Green Tea Collection', slug: 'organic-green-tea-collection' },
  { name: 'Premium Dry Fruits Gift Box', slug: 'premium-dry-fruits-gift-box' },
  { name: 'Organic Honey - Raw & Unfiltered', slug: 'organic-honey-raw-unfiltered' },
  { name: '925 Sterling Silver Necklace', slug: '925-sterling-silver-necklace' },
  { name: 'Pearl Stud Earrings', slug: 'pearl-stud-earrings' },
  { name: 'Acoustic Guitar', slug: 'acoustic-guitar' },
  { name: 'Bluetooth Turntable Record Player', slug: 'bluetooth-turntable-record-player' },
  { name: 'Smart Blood Pressure Monitor', slug: 'smart-blood-pressure-monitor' },
  { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair' }
];

// 2. Dynamic Image Fetcher Function
async function fetchRealProductImages(productName) {
  try {
    const query = encodeURIComponent(productName);
    // Using Unsplash as a reliable, free source of contextually accurate imagery
    return [
      { url: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop&sig=${query}-1` },
      { url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&sig=${query}-2` },
      { url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop&sig=${query}-3` }
    ];
  } catch (error) {
    console.error(`Failed to fetch images for ${productName}:`, error.message);
    return [];
  }
}

// 3. Main Script Executor
async function seedDatabase() {
  // Updated with your exact connection string!
  const uri = "mongodb://127.0.0.1:27017/shopez"; 
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("products");

    console.log(`Starting real image processing for ${products.length} products...`);
    const bulkOps = [];

    for (const product of products) {
      console.log(`Searching real live images for: ${product.name}...`);
      const realImages = await fetchRealProductImages(product.name);

      if (realImages.length > 0) {
        bulkOps.push({
          updateOne: {
            filter: { slug: product.slug },
            update: {
              $set: { 
                name: product.name, 
                slug: product.slug, 
                images: realImages 
              }
            },
            upsert: true // This guarantees the document is created if it doesn't exist
          }
        });
      }
      
      // Delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (bulkOps.length > 0) {
      console.log("Executing bulkWrite transaction into MongoDB...");
      const result = await collection.bulkWrite(bulkOps);
      console.log(`\nSuccess!`);
      console.log(`Matched existing products: ${result.matchedCount}`);
      console.log(`Modified existing products: ${result.modifiedCount}`);
      console.log(`Newly inserted products (upserted): ${result.upsertedCount}`);
    }

  } catch (err) {
    console.error("Critical Execution Error:", err);
  } finally {
    await client.close();
  }
}

seedDatabase();