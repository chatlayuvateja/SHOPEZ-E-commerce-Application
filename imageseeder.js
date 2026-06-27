const { MongoClient } = require('mongodb');
const https = require('https');
const http = require('http');

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Category-based color scheme for SVG placeholders
const categoryColors = {
  'clothing': '#FF6B6B',
  'books': '#4ECDC4',
  'sports': '#45B7D1',
  'beauty': '#DDA0DD',
  'toys': '#FFD93D',
  'automotive': '#6C757D',
  'health': '#51CF66',
  'groceries': '#FF922B',
  'jewelry': '#F06595'
};

function getCategoryColor(slug) {
  const mapping = [
    ['cashmere', 'clothing'], ['denim', 'clothing'], ['silk', 'clothing'],
    ['alchemist', 'books'], ['lean-startup', 'books'], ['sapiens', 'books'],
    ['great-gatsby', 'books'], ['thinking-fast', 'books'],
    ['mountain-bike', 'sports'],
    ['moisturizer', 'beauty'], ['perfume', 'beauty'], ['lipstick', 'beauty'],
    ['board-game', 'toys'],
    ['car-seat', 'automotive'], ['tire-inflator', 'automotive'],
    ['multivitamin', 'health'], ['ergonomic-chair', 'health'],
    ['dry-fruits', 'groceries'],
    ['pearl-stud', 'jewelry']
  ];
  for (const [kw, cat] of mapping) {
    if (slug.includes(kw)) return categoryColors[cat];
  }
  return '#868E96';
}

function generateSvgPlaceholder(slug, width = 600, height = 400) {
  const bgColor = getCategoryColor(slug);
  const text = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" opacity="0.3"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${bgColor}" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="${width/2}" y="${height/2-10}" text-anchor="middle" fill="${bgColor}" font-family="Arial,sans-serif" font-size="24" font-weight="bold">${text}</text>
  <text x="${width/2}" y="${height/2+24}" text-anchor="middle" fill="#868E96" font-family="Arial,sans-serif" font-size="14">ShopEZ - Upload image coming soon</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const imageMap = {
  'cashmere-blend-sweater': ['https://images.price.tools/images/pima-cotton-cashmere-crew-neck-sweater-mw0mw28046-p92.jpg'],
  'denim-jacket-classic': ['https://images.price.tools/images/wrangler-regular-classic-denim-jacket-w448.jpg'],
  'silk-evening-gown': ['https://images.price.tools/images/black-raw-silk-gown-with-gold-hand-embroidery-panache.jpg'],
  'the-alchemist': ['https://upload.wikimedia.org/wikipedia/commons/c/c4/TheAlchemist.jpg'],
  'the-lean-startup': ['https://images.price.tools/images/the-lean-startup-eric-ries-book-cover.jpg'],
  'sapiens-a-brief-history-of-humankind': ['https://upload.wikimedia.org/wikipedia/commons/6/6d/Sapiens-_A_Brief_History_of_Humankind.png'],
  'the-great-gatsby': ['https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg'],
  'thinking-fast-and-slow': ['https://images.price.tools/images/thinking-fast-and-slow-daniel-kahneman-book-cover.jpg'],
  'mountain-bike-275-inch': ['https://images.price.tools/images/mountain-bike-275-inch-hero-cycles.jpg'],
  'hydrating-face-moisturizer': ['https://images.price.tools/images/cetaphil-rich-hydrating-cream-with-hyaluronic-acid.jpg'],
  'designer-perfume-collection': ['https://images.price.tools/images/designer-perfume-collection-nykaa.jpg'],
  'natural-lipstick-set': ['https://images.price.tools/images/natural-lipstick-set-sugar-cosmetics.jpg'],
  'board-game-collection-5-in-1': ['https://images.price.tools/images/board-game-collection-5-in-1-hasbro.jpg'],
  'leather-car-seat-covers': ['https://images.price.tools/images/leather-car-seat-covers-automax-premium.jpg'],
  'car-portable-tire-inflator': ['https://images.price.tools/images/car-portable-tire-inflator-michelin.jpg'],
  'multivitamin-tablets-daily': ['https://images.price.tools/images/multivitamin-tablets-daily-healthkart.jpg'],
  'ergonomic-office-chair': ['https://images.price.tools/images/ergonomic-office-chair-wakefit.jpg'],
  'premium-dry-fruits-gift-box': ['https://images.price.tools/images/premium-dry-fruits-gift-box-happilo.jpg'],
  'pearl-stud-earrings': ['https://images.price.tools/images/pearl-stud-earrings-caratlane.jpg']
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const chunks = [];
    let totalSize = 0;

    const options = {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    protocol.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      const contentType = res.headers['content-type'] || 'image/jpeg';

      res.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_IMAGE_SIZE) {
          res.destroy();
          reject(new Error(`Image too large (>5MB): ${url}`));
          return;
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${contentType};base64,${base64}`;
        resolve(dataUrl);
      });

      res.on('error', reject);
    }).on('error', reject).on('timeout', function() {
      this.destroy();
      reject(new Error(`Timeout for ${url}`));
    });
  });
}

async function seedImages() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopez";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    const products = db.collection("products");
    
    const totalSlugs = Object.keys(imageMap).length;
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    let placeholder = 0;

    for (const [slug, urls] of Object.entries(imageMap)) {
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const product = await products.findOne({ slug: { $regex: '^' + escaped } });
      
      if (!product) {
        console.log(`  ${slug}: product not found in DB`);
        skipped++;
        continue;
      }

      let base64Images = [];

      for (const url of urls) {
        try {
          process.stdout.write(`  ${slug}: downloading... `);
          const dataUrl = await downloadImage(url);
          base64Images.push({ url: dataUrl });
          console.log(`✓ (${(dataUrl.length * 0.75 / 1024).toFixed(0)}KB)`);
        } catch (err) {
          console.log(`✗ ${err.message.split(' for ')[0]}`);
        }
      }

      if (base64Images.length === 0) {
        process.stdout.write(`  ${slug}: generating SVG placeholder... `);
        const dataUrl = generateSvgPlaceholder(slug);
        base64Images.push({ url: dataUrl });
        placeholder++;
        console.log(`✓ (${(dataUrl.length * 0.75 / 1024).toFixed(0)}KB SVG)`);
      }

      await products.updateOne(
        { _id: product._id },
        { $set: { images: base64Images } }
      );
      updated++;
    }

    console.log(`\nDone! Updated ${updated}/${totalSlugs} products.`);
    console.log(`Real images: ${updated - placeholder}, SVG placeholders: ${placeholder}, Not found: ${skipped}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

seedImages();
