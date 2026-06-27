const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

const users = [
  { name: 'ShopEZ Admin', email: 'admin@shopez.com', password: 'Admin@123', role: 'ADMIN', phone: '9999999999', isActive: true },
  { name: 'TechZone India', email: 'seller1@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '8888888888', isActive: true, address: { street: '42 Tech Park, Electronic City', city: 'Bangalore', state: 'Karnataka', pincode: '560100', country: 'India' } },
  { name: 'StyleHub', email: 'seller2@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '7777777777', isActive: true, address: { street: '15 Fashion Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' } },
  { name: 'Home Essentials Co.', email: 'seller3@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '6666666666', isActive: true, address: { street: '88 Home Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' } },
  { name: 'BookWorm Publishers', email: 'seller4@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '5555555555', isActive: true, address: { street: '12 Library Road', city: 'Kolkata', state: 'West Bengal', pincode: '700001', country: 'India' } },
  { name: 'SportFit India', email: 'seller5@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '4444444444', isActive: true, address: { street: '7 Sports Complex', city: 'Bangalore', state: 'Karnataka', pincode: '560050', country: 'India' } },
  { name: 'Glamour Beauty', email: 'seller6@shopez.com', password: 'Seller@123', role: 'SELLER', phone: '3333333333', isActive: true, address: { street: '22 Beauty Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India' } },
  { name: 'Ojas Tester', email: 'user@shopez.com', password: 'User@123', role: 'USER', phone: '9123456780', isActive: true, address: { street: '27 Lake View Apartments', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' } },
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'User@123', role: 'USER', phone: '9876543210', isActive: true, address: { street: '8, Green Acres Colony', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' } },
  { name: 'Arun Kumar', email: 'arun@example.com', password: 'User@123', role: 'USER', phone: '8765432109', isActive: true, address: { street: '55, Anna Nagar East', city: 'Chennai', state: 'Tamil Nadu', pincode: '600102', country: 'India' } },
];

const productTemplates = [
  { sellerEmail: 'seller1@shopez.com', name: 'Samsung Galaxy M34 5G', description: 'Experience the power of 5G with the Samsung Galaxy M34, featuring a stunning 6.5-inch Super AMOLED display with 120Hz refresh rate for buttery-smooth scrolling.', category: 'Electronics', brand: 'Samsung', price: 18999, discountPercent: 15, stock: 50, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/samsung-galaxy-m34-5g-0/600/600' },
    { url: 'https://picsum.photos/seed/samsung-galaxy-m34-5g-1/600/600' },
    { url: 'https://picsum.photos/seed/samsung-galaxy-m34-5g-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'boAt Airdopes 141 Earbuds', description: 'boAt Airdopes 141 true wireless earbuds deliver an immersive audio experience with 10mm drivers and boAt Signature Sound.', category: 'Electronics', brand: 'boAt', price: 1499, discountPercent: 20, stock: 200, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/boat-airdopes-141-earbuds-0/600/600' },
    { url: 'https://picsum.photos/seed/boat-airdopes-141-earbuds-1/600/600' },
    { url: 'https://picsum.photos/seed/boat-airdopes-141-earbuds-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Logitech MK235 Keyboard + Mouse Combo', description: 'The Logitech MK235 is a reliable, affordable wireless keyboard and mouse combo designed for everyday productivity.', category: 'Electronics', brand: 'Logitech', price: 1695, discountPercent: 10, stock: 75, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/logitech-mk235-keyboard-mouse-combo-0/600/600' },
    { url: 'https://picsum.photos/seed/logitech-mk235-keyboard-mouse-combo-1/600/600' },
    { url: 'https://picsum.photos/seed/logitech-mk235-keyboard-mouse-combo-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Mi 80cm (32) Smart TV', description: 'The Mi 32-inch Smart TV brings stunning visuals and smart functionality to your living room.', category: 'Electronics', brand: 'Xiaomi', price: 15999, discountPercent: 8, stock: 30, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/mi-80cm-32-smart-tv-0/600/600' },
    { url: 'https://picsum.photos/seed/mi-80cm-32-smart-tv-1/600/600' },
    { url: 'https://picsum.photos/seed/mi-80cm-32-smart-tv-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'HP 15s Laptop', description: 'The HP 15s is a powerful and versatile laptop designed for students and professionals alike.', category: 'Electronics', brand: 'HP', price: 45990, discountPercent: 5, stock: 20, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/hp-15s-laptop-0/600/600' },
    { url: 'https://picsum.photos/seed/hp-15s-laptop-1/600/600' },
    { url: 'https://picsum.photos/seed/hp-15s-laptop-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Realme Narzo 60 5G', description: 'The Realme Narzo 60 5G combines cutting-edge performance with a stunning design.', category: 'Electronics', brand: 'Realme', price: 14999, discountPercent: 12, stock: 80, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/realme-narzo-60-5g-0/600/600' },
    { url: 'https://picsum.photos/seed/realme-narzo-60-5g-1/600/600' },
    { url: 'https://picsum.photos/seed/realme-narzo-60-5g-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Sony WH-1000XM5 Headphones', description: 'Sony WH-1000XM5 industry-leading noise canceling headphones deliver an unparalleled audio experience.', category: 'Electronics', brand: 'Sony', price: 29990, discountPercent: 10, stock: 25, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/sony-wh-1000xm5-headphones-0/600/600' },
    { url: 'https://picsum.photos/seed/sony-wh-1000xm5-headphones-1/600/600' },
    { url: 'https://picsum.photos/seed/sony-wh-1000xm5-headphones-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Apple iPad 10th Gen', description: 'The Apple iPad 10th generation features a stunning 10.9-inch Liquid Retina display.', category: 'Electronics', brand: 'Apple', price: 44900, discountPercent: 3, stock: 35, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/apple-ipad-10th-gen-0/600/600' },
    { url: 'https://picsum.photos/seed/apple-ipad-10th-gen-1/600/600' },
    { url: 'https://picsum.photos/seed/apple-ipad-10th-gen-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Canon EOS R50 Mirrorless Camera', description: 'The Canon EOS R50 is a compact and powerful mirrorless camera perfect for content creators.', category: 'Electronics', brand: 'Canon', price: 69999, discountPercent: 8, stock: 15, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/canon-eos-r50-mirrorless-camera-0/600/600' },
    { url: 'https://picsum.photos/seed/canon-eos-r50-mirrorless-camera-1/600/600' },
    { url: 'https://picsum.photos/seed/canon-eos-r50-mirrorless-camera-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Samsung Galaxy Watch 6', description: 'The Samsung Galaxy Watch 6 combines classic watch design with advanced health and fitness tracking.', category: 'Electronics', brand: 'Samsung', price: 29999, discountPercent: 15, stock: 40, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/samsung-galaxy-watch-6-0/600/600' },
    { url: 'https://picsum.photos/seed/samsung-galaxy-watch-6-1/600/600' },
    { url: 'https://picsum.photos/seed/samsung-galaxy-watch-6-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'JBL PartyBox 310', description: 'The JBL PartyBox 310 is a powerful portable Bluetooth speaker that delivers deep bass.', category: 'Electronics', brand: 'JBL', price: 29999, discountPercent: 12, stock: 18, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/jbl-partybox-310-0/600/600' },
    { url: 'https://picsum.photos/seed/jbl-partybox-310-1/600/600' },
    { url: 'https://picsum.photos/seed/jbl-partybox-310-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'ASUS ROG Strix G16 Gaming Laptop', description: 'The ASUS ROG Strix G16 is a gaming powerhouse designed for competitive gamers.', category: 'Electronics', brand: 'ASUS', price: 129990, discountPercent: 8, stock: 10, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/asus-rog-strix-g16-gaming-laptop-0/600/600' },
    { url: 'https://picsum.photos/seed/asus-rog-strix-g16-gaming-laptop-1/600/600' },
    { url: 'https://picsum.photos/seed/asus-rog-strix-g16-gaming-laptop-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: "Men's Classic Polo T-Shirt", description: 'Elevate your everyday style with this premium classic polo t-shirt.', category: 'Clothing', brand: 'US Polo Assn.', price: 799, discountPercent: 30, stock: 150, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/mens-classic-polo-t-shirt-0/600/600' },
    { url: 'https://picsum.photos/seed/mens-classic-polo-t-shirt-1/600/600' },
    { url: 'https://picsum.photos/seed/mens-classic-polo-t-shirt-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: "Women's Kurti Set", description: 'This elegant kurti set combines traditional craftsmanship with contemporary style.', category: 'Clothing', brand: 'Biba', price: 1299, discountPercent: 25, stock: 100, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/womens-kurti-set-0/600/600' },
    { url: 'https://picsum.photos/seed/womens-kurti-set-1/600/600' },
    { url: 'https://picsum.photos/seed/womens-kurti-set-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: "Levi's 511 Slim Fit Jeans", description: 'The iconic Levi\'s 511 Slim Fit Jeans offer a modern, streamlined silhouette.', category: 'Clothing', brand: "Levi's", price: 2999, discountPercent: 20, stock: 60, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/levis-511-slim-fit-jeans-0/600/600' },
    { url: 'https://picsum.photos/seed/levis-511-slim-fit-jeans-1/600/600' },
    { url: 'https://picsum.photos/seed/levis-511-slim-fit-jeans-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Sports Running Shoes', description: 'Engineered for performance and comfort, these sports running shoes feature a breathable mesh upper.', category: 'Clothing', brand: 'Nike', price: 1899, discountPercent: 15, stock: 90, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/sports-running-shoes-0/600/600' },
    { url: 'https://picsum.photos/seed/sports-running-shoes-1/600/600' },
    { url: 'https://picsum.photos/seed/sports-running-shoes-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Formal Blazer for Men', description: 'Make a powerful impression with this impeccably tailored formal blazer.', category: 'Clothing', brand: 'Arrow', price: 3499, discountPercent: 10, stock: 40, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/formal-blazer-for-men-0/600/600' },
    { url: 'https://picsum.photos/seed/formal-blazer-for-men-1/600/600' },
    { url: 'https://picsum.photos/seed/formal-blazer-for-men-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Floral Maxi Dress', description: 'Turn heads wherever you go with this stunning floral maxi dress.', category: 'Clothing', brand: 'H&M', price: 1599, discountPercent: 35, stock: 70, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/floral-maxi-dress-0/600/600' },
    { url: 'https://picsum.photos/seed/floral-maxi-dress-1/600/600' },
    { url: 'https://picsum.photos/seed/floral-maxi-dress-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: "Men's Leather Wallet", description: 'Handcrafted from full-grain Italian leather, this men\'s wallet exudes sophistication.', category: 'Clothing', brand: 'Hidesign', price: 1999, discountPercent: 5, stock: 120, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/mens-leather-wallet-0/600/600' },
    { url: 'https://picsum.photos/seed/mens-leather-wallet-1/600/600' },
    { url: 'https://picsum.photos/seed/mens-leather-wallet-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Aviator Sunglasses', description: 'Timeless aviator sunglasses that combine iconic style with premium optical performance.', category: 'Clothing', brand: 'Ray-Ban', price: 8499, discountPercent: 20, stock: 35, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/aviator-sunglasses-0/600/600' },
    { url: 'https://picsum.photos/seed/aviator-sunglasses-1/600/600' },
    { url: 'https://picsum.photos/seed/aviator-sunglasses-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Handcrafted Leather Belt', description: 'A premium handcrafted leather belt made from full-grain buffalo leather.', category: 'Clothing', brand: 'TAG Heuer', price: 5999, discountPercent: 25, stock: 25, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/handcrafted-leather-belt-0/600/600' },
    { url: 'https://picsum.photos/seed/handcrafted-leather-belt-1/600/600' },
    { url: 'https://picsum.photos/seed/handcrafted-leather-belt-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Premium Stainless Steel Cookware Set', description: 'Transform your kitchen with this professional-grade 10-piece stainless steel cookware set.', category: 'Home & Kitchen', brand: 'Prestige', price: 8999, discountPercent: 20, stock: 40, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/premium-stainless-steel-cookware-set-0/600/600' },
    { url: 'https://picsum.photos/seed/premium-stainless-steel-cookware-set-1/600/600' },
    { url: 'https://picsum.photos/seed/premium-stainless-steel-cookware-set-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Scented Soy Candle Collection', description: 'Illuminate your space with our hand-poured soy wax candle collection.', category: 'Home & Kitchen', brand: 'Scented Bliss', price: 1299, discountPercent: 10, stock: 200, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/scented-soy-candle-collection-0/600/600' },
    { url: 'https://picsum.photos/seed/scented-soy-candle-collection-1/600/600' },
    { url: 'https://picsum.photos/seed/scented-soy-candle-collection-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Robot Vacuum Cleaner', description: 'Smart robot vacuum cleaner with advanced LiDAR navigation.', category: 'Home & Kitchen', brand: 'Dreame', price: 29999, discountPercent: 15, stock: 22, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/robot-vacuum-cleaner-0/600/600' },
    { url: 'https://picsum.photos/seed/robot-vacuum-cleaner-1/600/600' },
    { url: 'https://picsum.photos/seed/robot-vacuum-cleaner-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Egyptian Cotton Bed Sheet Set', description: 'Experience hotel-quality comfort every night with our 800-thread-count Egyptian cotton bed sheet set.', category: 'Home & Kitchen', brand: 'Bombay Dyeing', price: 4999, discountPercent: 25, stock: 60, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/egyptian-cotton-bed-sheet-set-0/600/600' },
    { url: 'https://picsum.photos/seed/egyptian-cotton-bed-sheet-set-1/600/600' },
    { url: 'https://picsum.photos/seed/egyptian-cotton-bed-sheet-set-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Air Fryer 5.5L', description: 'Revolutionize your cooking with this 5.5L digital air fryer.', category: 'Home & Kitchen', brand: 'Philips', price: 5999, discountPercent: 15, stock: 35, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/air-fryer-55l-0/600/600' },
    { url: 'https://picsum.photos/seed/air-fryer-55l-1/600/600' },
    { url: 'https://picsum.photos/seed/air-fryer-55l-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Smart LED Desk Lamp', description: 'Illuminate your workspace with this smart LED desk lamp.', category: 'Home & Kitchen', brand: 'Philips', price: 3999, discountPercent: 10, stock: 45, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/smart-led-desk-lamp-0/600/600' },
    { url: 'https://picsum.photos/seed/smart-led-desk-lamp-1/600/600' },
    { url: 'https://picsum.photos/seed/smart-led-desk-lamp-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'KitchenAid Stand Mixer', description: 'The iconic KitchenAid Artisan stand mixer is the ultimate kitchen companion.', category: 'Home & Kitchen', brand: 'KitchenAid', price: 34999, discountPercent: 10, stock: 12, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/kitchenaid-stand-mixer-0/600/600' },
    { url: 'https://picsum.photos/seed/kitchenaid-stand-mixer-1/600/600' },
    { url: 'https://picsum.photos/seed/kitchenaid-stand-mixer-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Minimalist Wall Clock', description: 'A stunning minimalist wall clock that serves as both a timepiece and a work of art.', category: 'Home & Kitchen', brand: 'Karlsson', price: 2499, discountPercent: 20, stock: 80, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/minimalist-wall-clock-0/600/600' },
    { url: 'https://picsum.photos/seed/minimalist-wall-clock-1/600/600' },
    { url: 'https://picsum.photos/seed/minimalist-wall-clock-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Bamboo Kitchen Cutting Board Set', description: 'Eco-friendly bamboo cutting board set that combines sustainability with superior functionality.', category: 'Home & Kitchen', brand: 'GreenPan', price: 1999, discountPercent: 30, stock: 100, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/bamboo-kitchen-cutting-board-set-0/600/600' },
    { url: 'https://picsum.photos/seed/bamboo-kitchen-cutting-board-set-1/600/600' },
    { url: 'https://picsum.photos/seed/bamboo-kitchen-cutting-board-set-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Smart Coffee Maker', description: 'Wake up to the perfect cup of coffee with this WiFi-connected smart coffee maker.', category: 'Home & Kitchen', brand: 'Cuisinart', price: 7999, discountPercent: 12, stock: 28, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/smart-coffee-maker-0/600/600' },
    { url: 'https://picsum.photos/seed/smart-coffee-maker-1/600/600' },
    { url: 'https://picsum.photos/seed/smart-coffee-maker-2/600/600' },
  ] },
  { sellerEmail: 'seller4@shopez.com', name: 'Atomic Habits', description: 'Atomic Habits by James Clear is the definitive guide to breaking bad behaviors.', category: 'Books', brand: 'Penguin Random House', price: 499, discountPercent: 20, stock: 500, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/atomic-habits-0/600/600' },
    { url: 'https://picsum.photos/seed/atomic-habits-1/600/600' },
    { url: 'https://picsum.photos/seed/atomic-habits-2/600/600' },
  ] },
  { sellerEmail: 'seller4@shopez.com', name: 'The Alchemist', description: 'Paulo Coelho\'s enchanting novel The Alchemist has inspired millions worldwide.', category: 'Books', brand: 'HarperCollins', price: 299, discountPercent: 15, stock: 400, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/the-alchemist-0/600/600' },
    { url: 'https://picsum.photos/seed/the-alchemist-1/600/600' },
    { url: 'https://picsum.photos/seed/the-alchemist-2/600/600' },
  ] },
  { sellerEmail: 'seller4@shopez.com', name: 'Rich Dad Poor Dad', description: 'Rich Dad Poor Dad by Robert T. Kiyosaki is the #1 personal finance book.', category: 'Books', brand: 'Plata Publishing', price: 399, discountPercent: 15, stock: 350, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/rich-dad-poor-dad-0/600/600' },
    { url: 'https://picsum.photos/seed/rich-dad-poor-dad-1/600/600' },
    { url: 'https://picsum.photos/seed/rich-dad-poor-dad-2/600/600' },
  ] },
  { sellerEmail: 'seller4@shopez.com', name: 'The Psychology of Money', description: 'Morgan Housel\'s The Psychology of Money explores the strange ways people think about money.', category: 'Books', brand: 'Harriman House', price: 399, discountPercent: 10, stock: 280, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/the-psychology-of-money-0/600/600' },
    { url: 'https://picsum.photos/seed/the-psychology-of-money-1/600/600' },
    { url: 'https://picsum.photos/seed/the-psychology-of-money-2/600/600' },
  ] },
  { sellerEmail: 'seller5@shopez.com', name: 'Pro Yoga Mat', description: 'Premium non-slip yoga mat with 6mm thickness for optimal cushioning.', category: 'Sports', brand: 'Puma', price: 1499, discountPercent: 20, stock: 120, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/pro-yoga-mat-0/600/600' },
    { url: 'https://picsum.photos/seed/pro-yoga-mat-1/600/600' },
    { url: 'https://picsum.photos/seed/pro-yoga-mat-2/600/600' },
  ] },
  { sellerEmail: 'seller5@shopez.com', name: 'Adjustable Dumbbell Set', description: 'Space-saving adjustable dumbbell set that replaces 15 sets of traditional dumbbells.', category: 'Sports', brand: 'Decathlon', price: 15999, discountPercent: 10, stock: 30, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/adjustable-dumbbell-set-0/600/600' },
    { url: 'https://picsum.photos/seed/adjustable-dumbbell-set-1/600/600' },
    { url: 'https://picsum.photos/seed/adjustable-dumbbell-set-2/600/600' },
  ] },
  { sellerEmail: 'seller5@shopez.com', name: 'Swimming Goggles Pro', description: 'Professional-grade swimming goggles designed for competitive swimmers.', category: 'Sports', brand: 'Speedo', price: 2499, discountPercent: 15, stock: 80, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/swimming-goggles-pro-0/600/600' },
    { url: 'https://picsum.photos/seed/swimming-goggles-pro-1/600/600' },
    { url: 'https://picsum.photos/seed/swimming-goggles-pro-2/600/600' },
  ] },
  { sellerEmail: 'seller5@shopez.com', name: 'Tennis Racket Pro', description: 'Tour-level tennis racket engineered for advanced players.', category: 'Sports', brand: 'Wilson', price: 15999, discountPercent: 8, stock: 20, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/tennis-racket-pro-0/600/600' },
    { url: 'https://picsum.photos/seed/tennis-racket-pro-1/600/600' },
    { url: 'https://picsum.photos/seed/tennis-racket-pro-2/600/600' },
  ] },
  { sellerEmail: 'seller5@shopez.com', name: 'Fitness Tracker Band', description: 'Advanced fitness tracker that monitors your health and activity 24/7.', category: 'Sports', brand: 'Fitbit', price: 4999, discountPercent: 20, stock: 65, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/fitness-tracker-band-0/600/600' },
    { url: 'https://picsum.photos/seed/fitness-tracker-band-1/600/600' },
    { url: 'https://picsum.photos/seed/fitness-tracker-band-2/600/600' },
  ] },
  { sellerEmail: 'seller6@shopez.com', name: 'Vitamin C Serum 20%', description: 'Advanced Vitamin C serum with 20% L-Ascorbic Acid to brighten your skin.', category: 'Beauty', brand: 'The Ordinary', price: 799, discountPercent: 10, stock: 300, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/vitamin-c-serum-20-0/600/600' },
    { url: 'https://picsum.photos/seed/vitamin-c-serum-20-1/600/600' },
    { url: 'https://picsum.photos/seed/vitamin-c-serum-20-2/600/600' },
  ] },
  { sellerEmail: 'seller6@shopez.com', name: 'Professional Hair Dryer', description: 'Salon-quality hair dryer with a powerful 2200W AC motor.', category: 'Beauty', brand: 'Dyson', price: 29999, discountPercent: 10, stock: 25, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/professional-hair-dryer-0/600/600' },
    { url: 'https://picsum.photos/seed/professional-hair-dryer-1/600/600' },
    { url: 'https://picsum.photos/seed/professional-hair-dryer-2/600/600' },
  ] },
  { sellerEmail: 'seller6@shopez.com', name: 'Hair Growth Oil Treatment', description: 'Clinically proven hair growth oil that reduces hair fall.', category: 'Beauty', brand: 'Minimalist', price: 599, discountPercent: 20, stock: 400, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/hair-growth-oil-treatment-0/600/600' },
    { url: 'https://picsum.photos/seed/hair-growth-oil-treatment-1/600/600' },
    { url: 'https://picsum.photos/seed/hair-growth-oil-treatment-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'LEGO Star Wars Millennium Falcon', description: 'Build the fastest hunk of junk in the galaxy with this incredible LEGO set.', category: 'Toys', brand: 'LEGO', price: 8999, discountPercent: 10, stock: 10, isFeatured: true, images: [
    { url: 'https://picsum.photos/seed/lego-star-wars-millennium-falcon-0/600/600' },
    { url: 'https://picsum.photos/seed/lego-star-wars-millennium-falcon-1/600/600' },
    { url: 'https://picsum.photos/seed/lego-star-wars-millennium-falcon-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Remote Control Racing Car', description: 'High-speed remote control racing car that reaches speeds up to 50 km/h.', category: 'Toys', brand: 'Hot Wheels', price: 4999, discountPercent: 15, stock: 35, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/remote-control-racing-car-0/600/600' },
    { url: 'https://picsum.photos/seed/remote-control-racing-car-1/600/600' },
    { url: 'https://picsum.photos/seed/remote-control-racing-car-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: 'Educational Science Kit', description: 'STEM science kit featuring over 100 exciting experiments.', category: 'Toys', brand: 'National Geographic', price: 2499, discountPercent: 20, stock: 50, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/educational-science-kit-0/600/600' },
    { url: 'https://picsum.photos/seed/educational-science-kit-1/600/600' },
    { url: 'https://picsum.photos/seed/educational-science-kit-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Car Dash Camera 4K', description: 'High-resolution 4K dash camera with advanced night vision.', category: 'Automotive', brand: 'DDPai', price: 5999, discountPercent: 15, stock: 40, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/car-dash-camera-4k-0/600/600' },
    { url: 'https://picsum.photos/seed/car-dash-camera-4k-1/600/600' },
    { url: 'https://picsum.photos/seed/car-dash-camera-4k-2/600/600' },
  ] },
  { sellerEmail: 'seller6@shopez.com', name: 'Smart Blood Pressure Monitor', description: 'Clinically validated smart blood pressure monitor.', category: 'Health', brand: 'Omron', price: 3499, discountPercent: 15, stock: 60, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/smart-blood-pressure-monitor-0/600/600' },
    { url: 'https://picsum.photos/seed/smart-blood-pressure-monitor-1/600/600' },
    { url: 'https://picsum.photos/seed/smart-blood-pressure-monitor-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Organic Green Tea Collection', description: 'Premium organic green tea collection from Darjeeling and Assam.', category: 'Groceries', brand: 'Tata Tea', price: 599, discountPercent: 5, stock: 200, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/organic-green-tea-collection-0/600/600' },
    { url: 'https://picsum.photos/seed/organic-green-tea-collection-1/600/600' },
    { url: 'https://picsum.photos/seed/organic-green-tea-collection-2/600/600' },
  ] },
  { sellerEmail: 'seller3@shopez.com', name: 'Organic Honey - Raw & Unfiltered', description: 'Pure, raw, and unfiltered organic honey from the Western Ghats.', category: 'Groceries', brand: 'Dabur', price: 699, discountPercent: 10, stock: 300, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/organic-honey-raw-unfiltered-0/600/600' },
    { url: 'https://picsum.photos/seed/organic-honey-raw-unfiltered-1/600/600' },
    { url: 'https://picsum.photos/seed/organic-honey-raw-unfiltered-2/600/600' },
  ] },
  { sellerEmail: 'seller2@shopez.com', name: '925 Sterling Silver Necklace', description: 'Exquisite 925 sterling silver necklace with cubic zirconia pendant.', category: 'Jewelry', brand: 'Tanishq', price: 4999, discountPercent: 15, stock: 30, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/925-sterling-silver-necklace-0/600/600' },
    { url: 'https://picsum.photos/seed/925-sterling-silver-necklace-1/600/600' },
    { url: 'https://picsum.photos/seed/925-sterling-silver-necklace-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Acoustic Guitar', description: 'Full-size acoustic guitar with solid spruce top and mahogany back and sides.', category: 'Music', brand: 'Yamaha', price: 14999, discountPercent: 10, stock: 18, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/acoustic-guitar-0/600/600' },
    { url: 'https://picsum.photos/seed/acoustic-guitar-1/600/600' },
    { url: 'https://picsum.photos/seed/acoustic-guitar-2/600/600' },
  ] },
  { sellerEmail: 'seller1@shopez.com', name: 'Bluetooth Turntable Record Player', description: 'Modern Bluetooth turntable combining vintage vinyl warmth with wireless convenience.', category: 'Music', brand: 'Audio-Technica', price: 24999, discountPercent: 12, stock: 12, isFeatured: false, images: [
    { url: 'https://picsum.photos/seed/bluetooth-turntable-record-player-0/600/600' },
    { url: 'https://picsum.photos/seed/bluetooth-turntable-record-player-1/600/600' },
    { url: 'https://picsum.photos/seed/bluetooth-turntable-record-player-2/600/600' },
  ] },
];

const reviewTemplates = [
  { userEmail: 'user@shopez.com', productName: 'Samsung Galaxy M34 5G', rating: 5, title: 'Amazing phone!', comment: 'Great battery life and display.' },
  { userEmail: 'priya@example.com', productName: 'Samsung Galaxy M34 5G', rating: 4, title: 'Great value', comment: 'AMOLED display is fantastic.' },
  { userEmail: 'arun@example.com', productName: 'boAt Airdopes 141 Earbuds', rating: 4, title: 'Good bass', comment: 'Impressive sound for the price.' },
  { userEmail: 'user@shopez.com', productName: 'boAt Airdopes 141 Earbuds', rating: 5, title: 'Best budget TWS', comment: 'Great fit and battery life.' },
  { userEmail: 'priya@example.com', productName: 'Logitech MK235 Keyboard + Mouse Combo', rating: 4, title: 'Reliable workhorse', comment: 'Flawless for home office.' },
  { userEmail: 'arun@example.com', productName: 'Logitech MK235 Keyboard + Mouse Combo', rating: 3, title: 'Good but basic', comment: 'Works well for basic tasks.' },
  { userEmail: 'user@shopez.com', productName: 'Mi 80cm (32) Smart TV', rating: 5, title: 'Perfect for bedroom', comment: 'Great picture quality.' },
  { userEmail: 'arun@example.com', productName: 'Mi 80cm (32) Smart TV', rating: 4, title: 'Good smart TV', comment: 'Smooth streaming.' },
  { userEmail: 'priya@example.com', productName: 'HP 15s Laptop', rating: 5, title: 'Excellent performance', comment: 'Handles multitasking with ease.' },
  { userEmail: 'user@shopez.com', productName: 'HP 15s Laptop', rating: 4, title: 'Great laptop', comment: 'Blazing fast SSD.' },
  { userEmail: 'arun@example.com', productName: 'Realme Narzo 60 5G', rating: 5, title: 'Super smooth', comment: 'Incredible 5G speeds.' },
  { userEmail: 'priya@example.com', productName: 'Realme Narzo 60 5G', rating: 3, title: 'Good but bloatware', comment: 'Too many pre-installed apps.' },
  { userEmail: 'user@shopez.com', productName: 'Sony WH-1000XM5 Headphones', rating: 5, title: 'Best NC ever', comment: 'Phenomenal noise cancellation.' },
  { userEmail: 'arun@example.com', productName: 'Apple iPad 10th Gen', rating: 5, title: 'Perfect tablet', comment: 'Gorgeous display.' },
  { userEmail: 'priya@example.com', productName: 'Canon EOS R50 Mirrorless Camera', rating: 4, title: 'Great for content', comment: 'Incredible autofocus.' },
  { userEmail: 'user@shopez.com', productName: "Men's Classic Polo T-Shirt", rating: 5, title: 'Perfect fit', comment: 'Excellent fabric quality.' },
  { userEmail: 'arun@example.com', productName: "Men's Classic Polo T-Shirt", rating: 4, title: 'Good quality', comment: 'Well-made and neat stitching.' },
  { userEmail: 'priya@example.com', productName: "Women's Kurti Set", rating: 5, title: 'Beautiful set', comment: 'Intricate embroidery.' },
  { userEmail: 'user@shopez.com', productName: "Levi's 511 Slim Fit Jeans", rating: 4, title: 'Classic fit', comment: 'Great stretch denim.' },
  { userEmail: 'arun@example.com', productName: 'Sports Running Shoes', rating: 5, title: 'Very comfortable', comment: 'Great for daily runs.' },
  { userEmail: 'priya@example.com', productName: 'Floral Maxi Dress', rating: 5, title: 'Stunning dress', comment: 'Perfect for summer.' },
  { userEmail: 'user@shopez.com', productName: 'Atomic Habits', rating: 5, title: 'Life-changing book', comment: 'Practical and actionable.' },
  { userEmail: 'priya@example.com', productName: 'The Alchemist', rating: 5, title: 'Inspiring story', comment: 'A book that stays with you.' },
  { userEmail: 'arun@example.com', productName: 'Rich Dad Poor Dad', rating: 4, title: 'Eye-opening', comment: 'Changed my view on money.' },
  { userEmail: 'user@shopez.com', productName: 'Vitamin C Serum 20%', rating: 5, title: 'Works great!', comment: 'Visible results in 2 weeks.' },
  { userEmail: 'priya@example.com', productName: 'Professional Hair Dryer', rating: 4, title: 'Powerful dryer', comment: 'Dries hair very fast.' },
  { userEmail: 'user@shopez.com', productName: 'LEGO Star Wars Millennium Falcon', rating: 5, title: 'Ultimate LEGO set', comment: 'Incredible build experience.' },
  { userEmail: 'arun@example.com', productName: 'Car Dash Camera 4K', rating: 5, title: 'Crystal clear footage', comment: 'Excellent night vision.' },
  { userEmail: 'priya@example.com', productName: 'Smart Blood Pressure Monitor', rating: 4, title: 'Accurate readings', comment: 'Easy to use at home.' },
  { userEmail: 'user@shopez.com', productName: 'Acoustic Guitar', rating: 5, title: 'Beautiful tone', comment: 'Great for beginners.' },
];

const orderTemplate = {
  userEmail: 'user@shopez.com',
  items: [
    { productName: 'Samsung Galaxy M34 5G', quantity: 1 },
    { productName: "Men's Classic Polo T-Shirt", quantity: 2 },
    { productName: 'Pro Yoga Mat', quantity: 1 },
  ],
  shippingAddress: {
    fullName: 'Ojas Tester',
    street: '27 Lake View Apartments',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
  },
  phone: '9123456780',
  paymentMethod: 'COD',
};

module.exports = async function seedData(db) {
  await User.initCollection(db);
  await Product.initCollection(db);
  await Review.initCollection(db);
  await Order.initCollection(db);
  await Cart.initCollection(db);

  const usersCol = db.collection('users');
  const productsCol = db.collection('products');
  const reviewsCol = db.collection('reviews');
  const ordersCol = db.collection('orders');
  const cartsCol = db.collection('carts');

  await Promise.all([
    usersCol.deleteMany({}),
    productsCol.deleteMany({}),
    reviewsCol.deleteMany({}),
    ordersCol.deleteMany({}),
    cartsCol.deleteMany({}),
  ]);

  const createdUsers = [];
  for (const u of users) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const sellerMap = {};
  createdUsers.forEach(u => {
    if (u.role === 'SELLER') sellerMap[u.email] = u._id;
  });

  const productMap = {};
  const createdProducts = [];
  for (const p of productTemplates) {
    const sellerId = sellerMap[p.sellerEmail];
    if (!sellerId) continue;
    const product = await Product.create({ ...p, seller: sellerId.toString() });
    productMap[p.name] = product;
    createdProducts.push(product);
  }

  const userMap = {};
  createdUsers.forEach(u => { userMap[u.email] = u._id; });

  for (const r of reviewTemplates) {
    const userId = userMap[r.userEmail];
    const product = productMap[r.productName];
    if (!userId || !product) continue;
    await Review.create({
      user: userId.toString(),
      product: product._id.toString(),
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: true,
    });
  }

  for (const product of createdProducts) {
    await Review.calcAverageRatings(product._id.toString());
  }

  const orderItems = orderTemplate.items.map(item => {
    const product = productMap[item.productName];
    const seller = product ? product.seller : null;
    return {
      product: product ? product._id.toString() : null,
      name: item.productName,
      image: product && product.images && product.images[0] ? product.images[0].url : '',
      price: product ? Product.calculateFinalPrice(product.price, product.discountPercent) : 0,
      quantity: item.quantity,
      seller: seller ? seller.toString() : null,
    };
  }).filter(item => item.product);

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  await Order.create({
    user: userMap['user@shopez.com'].toString(),
    orderItems: orderItems,
    shippingAddress: orderTemplate.shippingAddress,
    phone: orderTemplate.phone,
    paymentMethod: orderTemplate.paymentMethod,
    itemsPrice,
    taxPrice: Math.round(itemsPrice * 0.18 * 100) / 100,
    shippingPrice: itemsPrice > 5000 ? 0 : 99,
    totalPrice: itemsPrice + Math.round(itemsPrice * 0.18 * 100) / 100 + (itemsPrice > 5000 ? 0 : 99),
    isPaid: false,
  });

  for (const user of createdUsers) {
    await Cart.create({ user: user._id.toString(), items: [] });
  }

  await productsCol.createIndex({ slug: 1 }, { unique: true });
};
