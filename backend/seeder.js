const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const connectDB = require('./config/db');

const users = [
  {
    name: 'ShopEZ Admin',
    email: 'admin@shopez.com',
    password: 'Admin@123',
    role: 'ADMIN',
    phone: '9999999999',
    isActive: true,
  },
  {
    name: 'TechZone India',
    email: 'seller1@shopez.com',
    password: 'Seller@123',
    role: 'SELLER',
    phone: '8888888888',
    isActive: true,
    address: { street: '42 Tech Park, Electronic City', city: 'Bangalore', state: 'Karnataka', pincode: '560100', country: 'India' },
  },
  {
    name: 'StyleHub',
    email: 'seller2@shopez.com',
    password: 'Seller@123',
    role: 'SELLER',
    phone: '7777777777',
    isActive: true,
    address: { street: '15 Fashion Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
  },
  {
    name: 'Ojas Tester',
    email: 'user@shopez.com',
    password: 'User@123',
    role: 'USER',
    phone: '9123456780',
    isActive: true,
    address: { street: '27 Lake View Apartments', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'User@123',
    role: 'USER',
    phone: '9876543210',
    isActive: true,
    address: { street: '8, Green Acres Colony', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
  },
  {
    name: 'Arun Kumar',
    email: 'arun@example.com',
    password: 'User@123',
    role: 'USER',
    phone: '8765432109',
    isActive: true,
    address: { street: '55, Anna Nagar East', city: 'Chennai', state: 'Tamil Nadu', pincode: '600102', country: 'India' },
  },
];

const productTemplates = [
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'Samsung Galaxy M34 5G',
    description: 'Experience the power of 5G with the Samsung Galaxy M34, featuring a stunning 6.5-inch Super AMOLED display with 120Hz refresh rate for buttery-smooth scrolling. Powered by the Exynos 1280 octa-core processor, this smartphone handles multitasking and gaming with ease. The 50MP triple camera system with OIS captures sharp, detailed photos in any lighting condition. With a massive 6000mAh battery, you can go up to two days on a single charge. Running on One UI 5.1 based on Android 13, it offers a clean and feature-rich software experience. The 128GB internal storage is expandable up to 1TB via microSD. Available in Midnight Blue, Prism Silver, and Waterfall Green.',
    category: 'Electronics',
    brand: 'Samsung',
    price: 18999,
    discountPercent: 15,
    stock: 50,
    isFeatured: true,
    images: [
      { url: 'https://picsum.photos/seed/samsung-m34-1/640/480' },
      { url: 'https://picsum.photos/seed/samsung-m34-2/640/480' },
      { url: 'https://picsum.photos/seed/samsung-m34-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'boAt Airdopes 141 Earbuds',
    description: 'boAt Airdopes 141 true wireless earbuds deliver an immersive audio experience with 10mm drivers and boAt Signature Sound. Equipped with IWP (Insta Wake N Pair) technology, they connect automatically as soon as you open the case. The earbuds offer up to 40 hours of total playback with the charging case, and ASAP Flash Charge technology provides 10 minutes of playtime with just 5 minutes of charging. IPX4 splash resistance makes them perfect for workouts and commutes. The sleek, ergonomic design ensures a comfortable fit for extended use. Dual microphones with ENx (Environmental Noise Cancellation) technology ensure crystal-clear call quality.',
    category: 'Electronics',
    brand: 'boAt',
    price: 1499,
    discountPercent: 20,
    stock: 200,
    isFeatured: true,
    images: [
      { url: 'https://picsum.photos/seed/boat-earbuds-1/640/480' },
      { url: 'https://picsum.photos/seed/boat-earbuds-2/640/480' },
      { url: 'https://picsum.photos/seed/boat-earbuds-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'Logitech MK235 Keyboard + Mouse Combo',
    description: 'The Logitech MK235 is a reliable, affordable wireless keyboard and mouse combo designed for everyday productivity. The full-sized keyboard features a familiar layout with a comfortable typing experience thanks to its whisper-quiet keys. The included optical mouse offers smooth, precise tracking on most surfaces. Both devices connect via a single nano USB receiver that stays inside the mouse for easy storage and portability. With up to 36 months of battery life for the keyboard and 12 months for the mouse, this combo delivers exceptional longevity. The spill-resistant keyboard and durable construction make it ideal for home and office use.',
    category: 'Electronics',
    brand: 'Logitech',
    price: 1695,
    discountPercent: 10,
    stock: 75,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/logitech-combo-1/640/480' },
      { url: 'https://picsum.photos/seed/logitech-combo-2/640/480' },
      { url: 'https://picsum.photos/seed/logitech-combo-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'Mi 80cm (32) Smart TV',
    description: 'The Mi 32-inch Smart TV brings stunning visuals and smart functionality to your living room. The HD-ready display with 1366x768 resolution delivers crisp, vibrant colours powered by the Vivid Picture Engine. Running on Android TV 11 with PatchWall, it offers access to thousands of apps and content from Netflix, Prime Video, Disney+ Hotstar, YouTube, and more via the Google Play Store. The 1.3GHz quad-core processor ensures smooth navigation and app loading. Dual-band Wi-Fi, Bluetooth 5.0, and multiple connectivity options including 2 HDMI ports and 2 USB ports make it a versatile entertainment hub. The 20W stereo speakers deliver immersive Dolby Audio.',
    category: 'Electronics',
    brand: 'Xiaomi',
    price: 15999,
    discountPercent: 8,
    stock: 30,
    isFeatured: true,
    images: [
      { url: 'https://picsum.photos/seed/mi-tv-1/640/480' },
      { url: 'https://picsum.photos/seed/mi-tv-2/640/480' },
      { url: 'https://picsum.photos/seed/mi-tv-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'HP 15s Laptop',
    description: 'The HP 15s is a powerful and versatile laptop designed for students and professionals alike. Powered by the 12th Gen Intel Core i5 processor and 16GB DDR4 RAM, it handles demanding applications, multitasking, and entertainment with ease. The 15.6-inch Full HD IPS display with micro-edge bezels offers an immersive viewing experience with vibrant colours and wide viewing angles. The 512GB PCIe NVMe SSD ensures lightning-fast boot times and ample storage for files, photos, and videos. With a full-size keyboard, numeric keypad, and a wide touchpad, productivity is effortless. Battery life of up to 8 hours keeps you going through the workday.',
    category: 'Electronics',
    brand: 'HP',
    price: 45990,
    discountPercent: 5,
    stock: 20,
    isFeatured: true,
    images: [
      { url: 'https://picsum.photos/seed/hp-laptop-1/640/480' },
      { url: 'https://picsum.photos/seed/hp-laptop-2/640/480' },
      { url: 'https://picsum.photos/seed/hp-laptop-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller1@shopez.com',
    name: 'Realme Narzo 60 5G',
    description: 'The Realme Narzo 60 5G combines cutting-edge performance with a stunning design. The MediaTek Dimensity 6020 5G chipset delivers exceptional speed and efficiency for gaming, streaming, and multitasking. The 6.43-inch Super AMOLED display with 90Hz refresh rate and 1000 nits peak brightness offers an incredible viewing experience even under direct sunlight. The 50MP AI camera with夜景 mode captures stunning photos day and night. The 5000mAh battery with 33W Dart Charge provides a full day of power in just 30 minutes of charging. Running Realme UI 4.0 based on Android 13, it offers a smooth, customizable user experience with 8GB of RAM and 128GB of storage.',
    category: 'Electronics',
    brand: 'Realme',
    price: 14999,
    discountPercent: 12,
    stock: 80,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/realme-narzo-1/640/480' },
      { url: 'https://picsum.photos/seed/realme-narzo-2/640/480' },
      { url: 'https://picsum.photos/seed/realme-narzo-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: "Men's Classic Polo T-Shirt",
    description: 'Elevate your everyday style with this premium classic polo t-shirt, crafted from 100% combed cotton pique fabric that offers exceptional breathability and comfort. The two-button placket with contrast taping adds a touch of sophistication, while the ribbed cuffs and hem ensure a perfect fit that holds its shape wash after wash. The regular fit design flatters all body types without being too tight or too loose. Available in a versatile colour palette, this polo transitions seamlessly from casual Friday at the office to weekend brunch. The fabric is pre-shrunk and treated for colour retention, so your polo looks new even after repeated washes.',
    category: 'Clothing',
    brand: 'US Polo Assn.',
    price: 799,
    discountPercent: 30,
    stock: 150,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/polo-tshirt-1/640/480' },
      { url: 'https://picsum.photos/seed/polo-tshirt-2/640/480' },
      { url: 'https://picsum.photos/seed/polo-tshirt-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: "Women's Kurti Set",
    description: 'This elegant women\'s kurti set combines traditional craftsmanship with contemporary style. The set includes a beautifully embroidered straight-cut kurti made from premium rayon fabric that drapes gracefully, paired with flowing palazzo pants for a complete, ready-to-wear ensemble. Intricate thread work and delicate mirror detailing along the neckline and sleeves add a touch of ethnic charm. The breathable, lightweight fabric makes it perfect for all-day wear during any season. Available in a range of vibrant colours and prints, this kurti set is ideal for festive occasions, family gatherings, or casual office wear. The easy-care fabric requires minimal ironing and maintains its colour and shape over time.',
    category: 'Clothing',
    brand: 'Biba',
    price: 1299,
    discountPercent: 25,
    stock: 100,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/kurti-set-1/640/480' },
      { url: 'https://picsum.photos/seed/kurti-set-2/640/480' },
      { url: 'https://picsum.photos/seed/kurti-set-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: "Levi's 511 Slim Fit Jeans",
    description: 'The iconic Levi\'s 511 Slim Fit Jeans offer a modern, streamlined silhouette that sits at the waist and is slim through the hip and thigh with a narrow leg opening. Crafted from premium stretch denim with just the right amount of give, these jeans move with you without losing their shape. The classic five-pocket design, signature Levi\'s branding, and zip fly construction deliver timeless style that never goes out of fashion. Whether you pair them with a casual t-shirt or a crisp button-down shirt, these jeans elevate any outfit. Available in multiple washes from dark indigo to light stonewash, the 511 is a wardrobe essential for every modern man. Machine washable for easy care.',
    category: 'Clothing',
    brand: "Levi's",
    price: 2999,
    discountPercent: 20,
    stock: 60,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/levis-jeans-1/640/480' },
      { url: 'https://picsum.photos/seed/levis-jeans-2/640/480' },
      { url: 'https://picsum.photos/seed/levis-jeans-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: 'Sports Running Shoes',
    description: 'Engineered for performance and comfort, these sports running shoes feature a breathable mesh upper that keeps your feet cool and dry during intense workouts. The lightweight EVA midsole provides exceptional cushioning and shock absorption, reducing impact on your joints with every stride. The rubber outsole with multidirectional traction pattern delivers superior grip on both road and trail surfaces. A padded collar and tongue, along with a cushioned insole, ensure a snug, comfortable fit that prevents blisters and hot spots. Reflective elements enhance visibility during early morning or evening runs. Whether you are training for a marathon or hitting the gym, these shoes provide the support and durability you need.',
    category: 'Clothing',
    brand: 'Nike',
    price: 1899,
    discountPercent: 15,
    stock: 90,
    isFeatured: true,
    images: [
      { url: 'https://picsum.photos/seed/running-shoes-1/640/480' },
      { url: 'https://picsum.photos/seed/running-shoes-2/640/480' },
      { url: 'https://picsum.photos/seed/running-shoes-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: 'Formal Blazer for Men',
    description: 'Make a powerful impression with this impeccably tailored formal blazer, designed for the modern professional. Constructed from a premium poly-viscose blend fabric that resists wrinkles and maintains its crisp shape throughout the day, this blazer features a two-button closure, notched lapels, and flap pockets for a classic, timeless look. The interior is fully lined with a smooth satin finish and includes an inner breast pocket for storing essentials. The blazer is available in charcoal, navy, and black — versatile colours that pair perfectly with formal trousers or chinos. Whether for boardroom meetings, interviews, or formal events, this blazer offers the perfect balance of style, comfort, and durability.',
    category: 'Clothing',
    brand: 'Arrow',
    price: 3499,
    discountPercent: 10,
    stock: 40,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/formal-blazer-1/640/480' },
      { url: 'https://picsum.photos/seed/formal-blazer-2/640/480' },
      { url: 'https://picsum.photos/seed/formal-blazer-3/640/480' },
    ],
  },
  {
    sellerEmail: 'seller2@shopez.com',
    name: 'Floral Maxi Dress',
    description: 'Turn heads wherever you go with this stunning floral maxi dress, featuring an all-over botanical print on soft, flowy georgette fabric. The dress features a flattering V-neckline, adjustable spaghetti straps, and a smocked elastic back for a comfortable, customized fit. The A-line silhouette with a tiered skirt creates a graceful, feminine look that flatters all body types. Side pockets add practicality, while the ankle-length cut makes it suitable for both casual and semi-formal occasions. Perfect for summer weddings, garden parties, beach vacations, or date nights, this dress pairs beautifully with strappy sandals and statement jewellery. The lightweight fabric packs easily without wrinkling, making it an ideal travel companion.',
    category: 'Clothing',
    brand: 'H&M',
    price: 1599,
    discountPercent: 35,
    stock: 70,
    isFeatured: false,
    images: [
      { url: 'https://picsum.photos/seed/maxi-dress-1/640/480' },
      { url: 'https://picsum.photos/seed/maxi-dress-2/640/480' },
      { url: 'https://picsum.photos/seed/maxi-dress-3/640/480' },
    ],
  },
];

const reviewTemplates = [
  // Samsung Galaxy M34 5G reviews
  { userEmail: 'user@shopez.com', productName: 'Samsung Galaxy M34 5G', rating: 5, title: 'Amazing phone for the price!', comment: 'I have been using this phone for two weeks and I am thoroughly impressed. The battery life is exceptional — it easily lasts two days with moderate use. The display is vibrant and the 120Hz refresh rate makes everything feel smooth. Camera quality is great for this price range, especially in daylight. Highly recommended for anyone looking for a budget 5G phone.' },
  { userEmail: 'priya@example.com', productName: 'Samsung Galaxy M34 5G', rating: 4, title: 'Great value but heavy', comment: 'The phone offers fantastic value for money with its AMOLED display and huge battery. The only downside is that it is quite heavy and bulky compared to other phones in this segment. One UI is clean and bloatware-free. Performance is snappy for everyday tasks.' },
  // boAt Airdopes reviews
  { userEmail: 'arun@example.com', productName: 'boAt Airdopes 141 Earbuds', rating: 4, title: 'Good bass, decent build', comment: 'The sound quality is impressive for the price, with punchy bass that boAt is known for. Battery life is excellent — I charge the case once a week. Connectivity is stable and the IWP feature works well. The only minor issue is that the touch controls can be a bit too sensitive at times.' },
  { userEmail: 'user@shopez.com', productName: 'boAt Airdopes 141 Earbuds', rating: 5, title: 'Best budget TWS earbuds', comment: 'These are my third pair of boAt earbuds and they just keep getting better. The fit is comfortable, the sound signature is lively, and the battery life is outstanding. Call quality has improved significantly with the ENx technology. Absolutely worth every rupee.' },
  // Logitech MK235 reviews
  { userEmail: 'priya@example.com', productName: 'Logitech MK235 Keyboard + Mouse Combo', rating: 4, title: 'Reliable workhorse', comment: 'I bought this combo for my home office setup and it has been flawless. The keyboard has a satisfying typing feel and the mouse tracks accurately on all surfaces. Setup was truly plug-and-play with the unified receiver. Battery life is incredible — it has been 6 months and no sign of dying.' },
  { userEmail: 'arun@example.com', productName: 'Logitech MK235 Keyboard + Mouse Combo', rating: 3, title: 'Good but basic', comment: 'It works well for basic office tasks. The keyboard is comfortable for typing long documents. However, the mouse lacks side buttons and the scroll wheel feels a bit loose. For the price, it is decent but there are better options if you need extra functionality.' },
  // Mi Smart TV reviews
  { userEmail: 'user@shopez.com', productName: 'Mi 80cm (32) Smart TV', rating: 5, title: 'Perfect for the bedroom', comment: 'Bought this for my bedroom and it is perfect. The picture quality is surprisingly good for an HD-ready panel. PatchWall interface is intuitive and the built-in Chromecast works seamlessly. Sound quality from the 20W speakers is adequate for a small room. Setting up was a breeze.' },
  { userEmail: 'arun@example.com', productName: 'Mi 80cm (32) Smart TV', rating: 4, title: 'Good smart TV, bulky stand', comment: 'The smart TV features are excellent with smooth streaming and quick app loading. The remote is well-designed with direct buttons for Netflix and Prime Video. Only complaint is that the included stand is quite wide and requires a large table. Picture quality is good for HD content.' },
  // HP 15s Laptop reviews
  { userEmail: 'priya@example.com', productName: 'HP 15s Laptop', rating: 5, title: 'Excellent performance laptop', comment: 'This laptop handles everything I throw at it — from coding with multiple IDEs open to video editing in Premiere Pro. The 16GB RAM makes a huge difference in multitasking. The display is bright and colours are accurate. Battery life is around 7 hours which is decent. Highly recommended for professionals and students.' },
  { userEmail: 'user@shopez.com', productName: 'HP 15s Laptop', rating: 4, title: 'Great laptop, heavy charger', comment: 'The performance is top-notch for the price. The SSD is blazing fast and boot times are under 10 seconds. Build quality feels premium with a clean, professional design. The only drawback is that the charger is quite bulky, making it less portable. Would have appreciated a USB-C charging option.' },
  // Realme Narzo 60 reviews
  { userEmail: 'arun@example.com', productName: 'Realme Narzo 60 5G', rating: 5, title: 'Super smooth 5G experience', comment: 'Upgraded from a 4G phone and the difference is night and day. 5G speeds are incredible on Jio. The AMOLED display is gorgeous and the 90Hz makes scrolling so smooth. Camera takes great pictures with good dynamic range. The design is sleek and the phone feels premium in hand. Charging speed is phenomenal.' },
  { userEmail: 'priya@example.com', productName: 'Realme Narzo 60 5G', rating: 3, title: 'Good phone but bloatware', comment: 'Hardware-wise, this is a solid phone. The display, battery, and performance are all good. However, the amount of pre-installed bloatware is frustrating. It took me 30 minutes to uninstall or disable all the unwanted apps. Otherwise, for the price, it is a capable 5G device.' },
  // Men's Classic Polo T-Shirt reviews
  { userEmail: 'user@shopez.com', productName: "Men's Classic Polo T-Shirt", rating: 5, title: 'Perfect fit and great quality', comment: 'Ordered this polo for casual office wear and it exceeded my expectations. The fabric quality is excellent — soft, breathable, and the colour has not faded after multiple washes. The fit is true to size and very flattering. Definitely ordering more colours.' },
  { userEmail: 'arun@example.com', productName: "Men's Classic Polo T-Shirt", rating: 4, title: 'Good quality, slightly expensive', comment: 'The polo shirt is well-made with neat stitching and good fabric. The collar holds its shape well. It is on the pricier side for a basic polo but the quality justifies the cost. Would recommend for anyone looking for a smart casual option.' },
  // Women's Kurti Set reviews
  { userEmail: 'priya@example.com', productName: "Women's Kurti Set", rating: 5, title: 'Beautiful set, perfect fit!', comment: 'I wore this for a family function and received so many compliments. The embroidery is intricate and the fabric drapes beautifully. The palazzo pants are comfortable and the matching dupatta completes the look. The colour was exactly as shown in the pictures. Highly recommend!' },
  { userEmail: 'user@shopez.com', productName: "Women's Kurti Set", rating: 4, title: 'Lovely design, slight colour variation', comment: 'The design and craftsmanship are beautiful. The fabric is soft and comfortable for all-day wear. The only reason I am not giving 5 stars is that the colour was slightly darker than what was shown online. Still a great purchase overall and good value for money.' },
  // Levi's 511 Slim Fit Jeans reviews
  { userEmail: 'arun@example.com', productName: "Levi's 511 Slim Fit Jeans", rating: 5, title: 'Classic Levi\'s quality', comment: 'These are my go-to jeans for every occasion. The stretch denim is incredibly comfortable while maintaining a sharp, slim look. The fit is perfect — not too tight, not too loose. After several washes, the colour and shape remain excellent. Worth every penny for the quality and durability.' },
  { userEmail: 'priya@example.com', productName: "Levi's 511 Slim Fit Jeans", rating: 4, title: 'Great jeans for smart casual', comment: 'Bought these for my husband and he loves them. The fabric quality is typical Levi\'s — durable and comfortable. The slim fit looks modern and clean. Sizing runs slightly small so I recommend ordering one size up. Overall, a solid addition to any wardrobe.' },
  // Sports Running Shoes reviews
  { userEmail: 'user@shopez.com', productName: 'Sports Running Shoes', rating: 5, title: 'Excellent running shoes', comment: 'I have been running for 6 months and these shoes have been fantastic. The cushioning absorbs impact well and my knees feel less strained after long runs. The grip is excellent on both road and track. They are lightweight and breathable. Great value at this price point.' },
  { userEmail: 'arun@example.com', productName: 'Sports Running Shoes', rating: 5, title: 'Comfortable out of the box', comment: 'No break-in period needed — these were comfortable from the first wear. Used them for a 10K run and my feet felt great throughout. The arch support is adequate and the toe box has enough room. The reflective strips are a nice safety touch for evening runs.' },
  // Formal Blazer reviews
  { userEmail: 'priya@example.com', productName: 'Formal Blazer for Men', rating: 4, title: 'Sharp look for interviews', comment: 'Bought this for my brother\'s job interviews and it made a great impression. The fit is tailored and professional. The fabric resists wrinkles well, which is important for long days. The internal pockets are well-designed. Only wish it came with a second set of buttons.' },
  { userEmail: 'arun@example.com', productName: 'Formal Blazer for Men', rating: 3, title: 'Decent blazer for the price', comment: 'It looks good and fits reasonably well off the rack. The material feels a bit synthetic but it does not look cheap. The lining is nice and smooth. For the discounted price it is good value, but I would not pay full price. Fine for occasional formal wear.' },
  // Floral Maxi Dress reviews
  { userEmail: 'priya@example.com', productName: 'Floral Maxi Dress', rating: 5, title: 'Gorgeous dress!', comment: 'I absolutely love this dress! The floral print is beautiful and vibrant, and the fabric feels luxurious yet lightweight. The fit is incredibly flattering and the smocked back makes it easy to put on and take off. I wore it to a beach wedding and got so many compliments. The pockets are a wonderful bonus!' },
  { userEmail: 'user@shopez.com', productName: 'Floral Maxi Dress', rating: 4, title: 'Beautiful print, runs large', comment: 'The dress is stunning — the print, the cut, everything about it is gorgeous. However, it runs one size large so I had to exchange it. Once I got the right size, it fit perfectly. The material is soft and flowy. Perfect for summer occasions and vacations.' },
];

const orderSeeds = [
  {
    userEmail: 'user@shopez.com',
    items: [
      { productName: 'Samsung Galaxy M34 5G', quantity: 1, price: 16149.15 },
      { productName: 'boAt Airdopes 141 Earbuds', quantity: 2, price: 1199.20 },
    ],
    address: {
      fullName: 'Ojas Tester',
      street: '27 Lake View Apartments',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    phone: '9123456780',
    paymentMethod: 'COD',
    orderStatus: 'DELIVERED',
    isPaid: false,
    deliveredAt: new Date('2026-05-28'),
    createdAt: new Date('2026-05-20'),
  },
  {
    userEmail: 'user@shopez.com',
    items: [
      { productName: "Men's Classic Polo T-Shirt", quantity: 3, price: 559.30 },
      { productName: "Levi's 511 Slim Fit Jeans", quantity: 1, price: 2399.20 },
    ],
    address: {
      fullName: 'Ojas Tester',
      street: '27 Lake View Apartments',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    phone: '9123456780',
    paymentMethod: 'UPI',
    orderStatus: 'DELIVERED',
    isPaid: true,
    paidAt: new Date('2026-06-01'),
    deliveredAt: new Date('2026-06-05'),
    createdAt: new Date('2026-05-29'),
  },
  {
    userEmail: 'user@shopez.com',
    items: [
      { productName: 'HP 15s Laptop', quantity: 1, price: 43690.50 },
      { productName: 'Logitech MK235 Keyboard + Mouse Combo', quantity: 1, price: 1525.50 },
    ],
    address: {
      fullName: 'Ojas Tester',
      street: '27 Lake View Apartments',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    phone: '9123456780',
    paymentMethod: 'CARD',
    orderStatus: 'DELIVERED',
    isPaid: true,
    paidAt: new Date('2026-06-08'),
    deliveredAt: new Date('2026-06-10'),
    createdAt: new Date('2026-06-06'),
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('MongoDB Connected:', mongoose.connection.host);

    const arg = process.argv[2];
    if (arg === '--destroy') {
      console.log('WARNING: This will permanently delete all data in the database.');
      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise((resolve) => { rl.question("Are you sure? Type 'yes' to confirm: ", resolve); });
      rl.close();
      if (answer.toLowerCase() !== 'yes') {
        console.log('Destroy cancelled.');
        process.exit(0);
      }
      await destroyData();
      console.log('Data destroyed successfully.');
      process.exit(0);
    }

    if (arg === '--import') {
      await destroyData();
      console.log('Data destroyed.');

      console.log('Creating users...');
      const createdUsers = await User.create(users);
      console.log(`  ${createdUsers.length} users created`);

      const userMap = {};
      createdUsers.forEach((u) => { userMap[u.email] = u._id; });

      console.log('Creating products...');
      const productDocs = productTemplates.map((t) => ({
        seller: userMap[t.sellerEmail],
        name: t.name,
        description: t.description,
        category: t.category,
        brand: t.brand,
        price: t.price,
        discountPercent: t.discountPercent,
        stock: t.stock,
        isFeatured: t.isFeatured,
        images: t.images,
      }));
      const createdProducts = await Product.create(productDocs);
      console.log(`  ${createdProducts.length} products created`);

      const productMap = {};
      createdProducts.forEach((p) => { productMap[p.name] = p._id; });

      console.log('Creating reviews...');
      const reviewDocs = reviewTemplates.map((r) => ({
        user: userMap[r.userEmail],
        product: productMap[r.productName],
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: true,
      }));
      const createdReviews = await Review.create(reviewDocs);
      console.log(`  ${createdReviews.length} reviews created`);

      console.log('Creating orders...');
      const orderDocs = orderSeeds.map((o) => {
        const items = o.items.map((item) => {
          const productId = productMap[item.productName];
          const template = productTemplates.find((t) => t.name === item.productName);
          const imgUrl = template ? template.images[0].url : '';
          return {
            product: productId,
            name: item.productName,
            image: imgUrl,
            price: item.price,
            quantity: item.quantity,
            seller: userMap[template ? template.sellerEmail : 'seller1@shopez.com'],
          };
        });
        const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingPrice = itemsPrice >= 999 ? 0 : 99;
        const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
        const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;
        return {
          user: userMap[o.userEmail],
          orderItems: items,
          shippingAddress: o.address,
          phone: o.phone,
          paymentMethod: o.paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          orderStatus: o.orderStatus,
          isPaid: o.isPaid,
          paidAt: o.paidAt || null,
          deliveredAt: o.deliveredAt || null,
          createdAt: o.createdAt,
        };
      });
      const createdOrders = await Order.create(orderDocs);
      console.log(`  ${createdOrders.length} orders created`);

      console.log('Creating carts...');
      const cartDocs = createdUsers.map((u) => ({ user: u._id, items: [] }));
      await Cart.create(cartDocs);
      console.log(`  ${cartDocs.length} carts created`);

      console.log('\nSeeding complete!');
      process.exit(0);
    }

    console.log('Usage: node seeder.js --import | --destroy');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

async function destroyData() {
  await Order.deleteMany({});
  await Review.deleteMany({});
  await Cart.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});
}

seed();
