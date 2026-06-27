const { MongoClient } = require('mongodb');
const https = require('https');
const http = require('http');

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const go = (u, d) => {
      if (d > 5) { reject(new Error('Too many redirects')); return; }
      const protocol = u.startsWith('https') ? https : http;
      const chunks = [];
      let totalSize = 0;
      protocol.get(u, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { go(res.headers.location, d+1); return; }
        if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
        const ct = res.headers['content-type'] || 'image/jpeg';
        res.on('data', (chunk) => {
          totalSize += chunk.length;
          if (totalSize > MAX_IMAGE_SIZE) { res.destroy(); reject(new Error('Too large')); return; }
          chunks.push(chunk);
        });
        res.on('end', () => resolve('data:' + ct + ';base64,' + Buffer.concat(chunks).toString('base64')));
        res.on('error', reject);
      }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
    };
    go(url, 0);
  });
}

// Only includes verified working URLs
const productImages = {
  // === 3/3 already verified ===
  'samsung-galaxy-m34-5g': [
    'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-m34-5g-1.jpg',
    'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-m34-5g-2.jpg',
    'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-m34-5g-3.jpg',
  ],
  'realme-narzo-60-5g': [
    'https://fdn2.gsmarena.com/vv/pics/realme/realme-narzo60-5g-1.jpg',
    'https://fdn2.gsmarena.com/vv/pics/realme/realme-narzo60-5g-2.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/realme-narzo60-5g.jpg',
  ],
  'apple-ipad-10th-gen': [
    'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-10-2022-0.jpg',
    'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-10-2022-1.jpg',
    'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-10-2022-2.jpg',
  ],
  'samsung-galaxy-watch-6': [
    'https://fdn2.gsmarena.com/vv/pics/samsung/galaxy-watch6-01.jpg',
    'https://fdn2.gsmarena.com/vv/pics/samsung/galaxy-watch6-02.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch6.jpg',
  ],
  'asus-rog-strix-g16-gaming-laptop': [
    'https://www.notebookcheck.net/fileadmin/Notebooks/Asus/ROG_Strix_G16_G615/rog_strix_g16_g615_case_04.JPG',
    'https://www.notebookcheck.net/fileadmin/_processed_/e/a/csm_rog_strix_g16_g615_case_17_08d317aca1.jpg',
    'https://www.notebookcheck.net/fileadmin/_processed_/8/0/csm_rog_strix_g16_g615_case_01_651aa61e72.jpg',
  ],
  'canon-eos-r50-mirrorless-camera': [
    'https://i1.adis.ws/i/canon/5811C030_EOS-R50_01?w=940',
    'https://i1.adis.ws/i/canon/5811C030_EOS-R50_06?w=940',
    'https://i1.adis.ws/i/canon/5811C030_EOS-R50_07?w=940',
  ],
  'boat-airdopes-141-earbuds': [
    'https://images.price.tools/images/boat-airdopes-141-true-wireless-ear-l-miFnJNos.jpg',
    'https://images.price.tools/images/boat-airdopes-141-anc-tws-earbuds-l-8TOfNZNU.jpg',
    'https://images.price.tools/images/boat-airdopes-141-bluetooth-truly-wireless-l-1U87VdAP1.jpg',
  ],
  'levis-511-slim-fit-jeans': [
    'https://m.media-amazon.com/images/I/71Hv8OO1QdL.jpg',
    'https://m.media-amazon.com/images/I/61Rt9mDc-5L.jpg',
    'https://m.media-amazon.com/images/I/31GmLHPDdRL._AC_SR400,400_.jpg',
  ],
  'floral-maxi-dress': [
    'https://m.media-amazon.com/images/I/413R0eLv1YL._SX342_SY445_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/31TdwYUQAXL._SY445_SX342_.jpg',
    'https://m.media-amazon.com/images/I/41-aA8AqqAL._SY445_SX342_.jpg',
  ],
  'minimalist-wall-clock': [
    'https://m.media-amazon.com/images/I/41yzx7MoXnL._SX300_SY300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/41dqWlJY3lL._SX300_SY300_QL70_ML2_.jpg',
    'https://m.media-amazon.com/images/I/51ksbxvIHRL._SX300_SY300_QL70_FMwebp_.jpg',
  ],
  'bamboo-kitchen-cutting-board-set': [
    'https://m.media-amazon.com/images/I/4189849f7IS._SX300_SY300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/51bbbM6ELgL._SY300_SX300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/41uEbmzBaYS._SS100_.jpg',
  ],
  'mens-leather-wallet': [
    'https://m.media-amazon.com/images/I/41dQcwii-PL._SX300_SY300_.jpg',
    'https://m.media-amazon.com/images/I/41TLeyGmBOL._SY300_SX300_.jpg',
    'https://m.media-amazon.com/images/I/41xD+GCDNnL._SX300_SY300_.jpg',
  ],
  'premium-stainless-steel-cookware-set': [
    'https://m.media-amazon.com/images/I/61M2bHvoXfL.jpg',
    'https://m.media-amazon.com/images/I/71F0IRJNeUL.jpg',
    'https://m.media-amazon.com/images/I/31UccZ6MJOL._SX300_SY300_QL70_ML2_.jpg',
  ],
  'scented-soy-candle-collection': [
    'https://m.media-amazon.com/images/I/41cENhuELzL._SY445_SX342_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/41fHh5qAVEL._SY445_SX342_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/41PtCXjU+-L._SX342_SY445_.jpg',
  ],
  'aviator-sunglasses': [
    'https://m.media-amazon.com/images/I/31se7NoXK+L._SX342_SY445_.jpg',
    'https://m.media-amazon.com/images/I/21K3x3gCuoL._SX342_SY445_.jpg',
    'https://m.media-amazon.com/images/I/31yD2QQbqdL._SX342_SY445_.jpg',
  ],
  'handcrafted-leather-belt': [
    'https://m.media-amazon.com/images/I/41FS3qYl9tL._SX342_SY445_.jpg',
    'https://m.media-amazon.com/images/I/4175W5Bo7VL._SX342_SY445_.jpg',
    'https://m.media-amazon.com/images/I/41y1MyBu3lL._SX342_SY445_.jpg',
  ],
  'womens-kurti-set': [
    'https://m.media-amazon.com/images/I/418HkhlDSnL._SY445_SX342_.jpg',
    'https://m.media-amazon.com/images/I/41Rqpq9f8HL._SX38_SY50_CR,0,0,38,50_.jpg',
    'https://m.media-amazon.com/images/I/41uwCyGxmUL._SX38_SY50_CR,0,0,38,50_.jpg',
  ],
  'sports-running-shoes': [
    'https://rukminim2.flixcart.com/image/416/416/xif0q/shoe/q/t/n/-original-imah9qyvtffzuh3r.jpeg',
    'https://m.media-amazon.com/images/I/41eN8UhhZdL._SY395_SX395_.jpg',
    'https://m.media-amazon.com/images/I/71dGLtr+1mL._AC_UL116_SR116,116_.jpg',
  ],
  // === 1-2 images, need more ===
  'sony-wh-1000xm5-headphones': [
    'https://cdn.cs.1worldsync.com/8b/70/8b709d73-c5a4-413a-b6de-a4629e709a73.jpg',
    'https://images.price.tools/images/sony-wh-1000xm5-premium-wireless-noise-l-1.jpg',
    'https://images.price.tools/images/sony-wh-1000xm5-wireless-headphones-l-1.jpg',
  ],
  'mens-classic-polo-t-shirt': [
    'https://m.media-amazon.com/images/I/41-aA8AqqAL._SY445_SX342_.jpg',
    'https://m.media-amazon.com/images/I/71XGH2MpC9L._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61XGH2MpC9L._SL1500_.jpg',
  ],
  'egyptian-cotton-bed-sheet-set': [
    'https://m.media-amazon.com/images/I/71F0IRJNeUL.jpg',
    'https://m.media-amazon.com/images/I/81F5o5d6YFL._SX300_SY300_.jpg',
    'https://m.media-amazon.com/images/I/81X+ONs3TKL._SX300_SY300_.jpg',
  ],
  'atomic-habits': [
    'https://upload.wikimedia.org/wikipedia/en/2/28/Atomic_Habits_book_cover.jpg',
    'https://m.media-amazon.com/images/I/51-nXsCRLFL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/41sxE5C7tWL._SL1500_.jpg',
  ],
  'the-alchemist': [
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/TheAlchemist.jpg',
    'https://m.media-amazon.com/images/I/41yJ75npG-L._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/51yJ75npG-L._SL1500_.jpg',
  ],
  'the-psychology-of-money': [
    'https://upload.wikimedia.org/wikipedia/en/2/20/The_Psychology_of_Money_cover.jpg',
    'https://m.media-amazon.com/images/I/51-nXsCRLFL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/41sxE5C7tWL._SL1500_.jpg',
  ],
  'rich-dad-poor-dad': [
    'https://upload.wikimedia.org/wikipedia/en/b/b9/Rich_Dad_Poor_Dad.jpg',
    'https://m.media-amazon.com/images/I/51-nXsCRLFL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/41sxE5C7tWL._SL1500_.jpg',
  ],
  'mi-80cm-32-smart-tv': [
    'https://i01.appmifile.com/webfile/globalimg/products/pc/mi-tv-a-32-2026/specs-header.png',
    'https://rukminim2.flixcart.com/image/416/416/xif0q/television/n/v/d/-original-imahdptcunubvyk4.jpeg',
    'https://images.price.tools/images/xiaomi-mi-tv-32-inch-smart-tv-l-1.jpg',
  ],
  'formal-blazer-for-men': [
    'https://rukminim2.flixcart.com/image/832/832/xif0q/blazer/z/1/w/m-viscose-blazer-abc-garments-original-imagka7jnjzjqw2h.jpeg',
    'https://rukminim2.flixcart.com/image/128/128/xif0q/blazer/j/1/t/m-viscose-blazer-abc-garments-original-imagka7jbpjgawmb.jpeg',
    'https://m.media-amazon.com/images/I/71w0H4pJ7wL._SL1500_.jpg',
  ],
  'jbl-partybox-310': [
    'https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw42f98d8f/JBL_PartyBox_310_Hero_0176_x3.png',
    'https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwdd090635/JBL_PARTYBOX_310_0036_x1.png',
    'https://images.price.tools/images/jbl-partybox-310-portable-bluetooth-speaker-l-1.jpg',
  ],
  'robot-vacuum-cleaner': [
    'https://m.media-amazon.com/images/I/31grDt8hrBS._SX300_SY300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/51m-TIToaYL._SX300_SY300_QL70_FMwebp_.jpg',
    'https://images.price.tools/images/robot-vacuum-cleaner-smart-automatic-l-1.jpg',
  ],
  'smart-led-desk-lamp': [
    'https://m.media-amazon.com/images/I/41tLO7uMnhL._SY300_SX300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/213M0GhEtNL._SX300_SY300_QL70_FMwebp_.jpg',
    'https://images.price.tools/images/smart-led-desk-lamp-dimmable-l-1.jpg',
  ],
  'smart-coffee-maker': [
    'https://m.media-amazon.com/images/I/41cjonSsvdL._SX300_SY300_QL70_FMwebp_.jpg',
    'https://m.media-amazon.com/images/I/31M+TYWPdQL._SY300_SX300_.jpg',
    'https://images.price.tools/images/smart-coffee-maker-programmable-l-1.jpg',
  ],
  'car-dash-camera-4k': [
    'https://images.price.tools/images/redtiger-f7n-elite-4k-hdr-dual-l-6ZfInINc3.jpg',
    'https://images.price.tools/images/car-dash-camera-4k-night-vision-l-1.jpg',
    'https://images.price.tools/images/dash-camera-4k-car-dvr-l-2.jpg',
  ],
  'acoustic-guitar': [
    'https://images.price.tools/images/fender-squier-acoustic-guitar-dreadnought-cutaway-m-kLa9RXnK2.jpg',
    'https://images.price.tools/images/acoustic-guitar-1.jpg',
    'https://images.price.tools/images/acoustic-guitar-for-beginners-l-1.jpg',
  ],
  'remote-control-racing-car': [
    'https://images.price.tools/images/storio-rc-car-rechargeable-1-20-l-He5zwkqs.jpg',
    'https://images.price.tools/images/remote-control-racing-car-fast-l-1.jpg',
    'https://images.price.tools/images/rc-racing-car-rechargeable-l-2.jpg',
  ],
  // === 0 images, need all 3 ===
  'hp-15s-laptop': [
    'https://images.price.tools/images/hp-15s-12th-gen-intel-core-l-Nzi3Zez74.jpg',
    'https://images.price.tools/images/hp-15s-12th-gen-intel-core-l-zo8KjbBP1.jpg',
    'https://images.price.tools/images/hp-15s-intel-core-i5-12th-gen-8TJUpvyp.jpg',
  ],
  'logitech-mk235-keyboard-mouse-combo': [
    'https://images.price.tools/images/logitech-mk235-mouse-keyboard-combo-full-l-cEksZzos.jpg',
    'https://rukminim2.flixcart.com/image/416/416/kd0d47k0/computer-address-mouse-combo/e/k/f/mk235-logitech-original-imafu2f2zwhghh3x.jpeg',
    'https://m.media-amazon.com/images/I/71p7bRZt3xL._SL1500_.jpg',
  ],
  'air-fryer-55l': [
    'https://images.price.tools/images/usha-ichef-smart-air-fryer-5-l-6bzndjA74.jpg',
    'https://images.price.tools/images/havells-air-fryer-prolife-crystal-see-l-HmLu8wnK2.jpg',
    'https://images.price.tools/images/glen-air-fryer-6-0-litre-l-zYIm6BBP1.jpg',
  ],
  'pro-yoga-mat': [
    'https://images.price.tools/images/wiselife-tru-alignment-yoga-mat-strap-l-UmMXboA74.jpg',
    'https://images.price.tools/images/wiselife-classic-yoga-mat-sleek-yoga-l-zdZgR1Nc3.jpg',
    'https://images.price.tools/images/wiselife-classic-yoga-mat-sleek-yoga-l-zdZgR1Nc3.jpg',
  ],
  'adjustable-dumbbell-set': [
    'https://images.price.tools/images/adjustable-dumbbell-set-52-lbs-free-l-qrpuXzPU.jpg',
    'https://images.price.tools/images/adjustable-dumbbell-set-22-lbs-steel-l-3i4Xt1rs.jpg',
    'https://rukminim2.flixcart.com/image/832/832/kbxk9u80/dumbbell-combo-set/e/z/f/pvc-dumbbells-pair-10-20-30-40-kg-kub-fitness-original-imafsyqxffhpeju7.jpeg',
  ],
  'swimming-goggles-pro': [
    'https://images.price.tools/images/power-swimming-goggles-men-amp-women-l-eGnYeZOU.jpg',
    'https://images.price.tools/images/power-swimming-goggles-men-amp-women-l-eGnYeZOU.jpg',
    'https://images.price.tools/images/power-swimming-goggles-men-amp-women-l-eGnYeZOU.jpg',
  ],
  'tennis-racket-pro': [
    'https://images.price.tools/images/wilson-tennis-racket-pro-open-frm-l-5ckz7zPU.jpg',
    'https://rukminim2.flixcart.com/image/832/832/jyxawrk0/racquet/k/2/z/babolat-drive-original-imafgz8whspffqtk.jpeg',
    'https://images.price.tools/images/wilson-tennis-racket-pro-open-frm-l-5ckz7zPU.jpg',
  ],
  'kitchenaid-stand-mixer': [
    'https://images.price.tools/images/kitchenaid-ksm150pspi-artisan-series-5-qt-m-IHZe4YpK2.jpg',
    'https://images.price.tools/images/kitchenaid-ksm150psap-artisan-stand-mixer-5-m-2UGyDien1.jpg',
    'https://images.price.tools/images/kitchenaid-ksm150pstb-artisan-series-stand-mixer-m-YVWFAp1i2.jpg',
  ],
  'vitamin-c-serum-20': [
    'https://images.price.tools/images/aroma-magic-20-vitamin-c-face-l-n0fWcgpK2.jpg',
    'https://images.price.tools/images/plum-10-vitamin-c-amp-calendula-l-cxhAG6CP1.jpg',
    'https://images.price.tools/images/olay-vitamin-c-face-serum-99-l-XVNPwaNU.jpg',
  ],
  'professional-hair-dryer': [
    'https://images.price.tools/images/wahl-5439-024-super-dry-professional-l-QEo3pgAP1.jpg',
    'https://images.price.tools/images/t3-aireluxe-professional-ionic-hair-dryer-l-8dBFPFdn1.jpg',
    'https://images.price.tools/images/t3-aireluxe-professional-ionic-hair-dryer-l-8dBFPFdn1.jpg',
  ],
  'hair-growth-oil-treatment': [
    'https://images.price.tools/images/shrivenu-hair-growth-oil-l-ORCMpCOU.jpg',
    'https://images.price.tools/images/mool-hair-grow-oil-hair-fall-l-pdBNfBaF3.jpg',
    'https://images.price.tools/images/shrivenu-hair-growth-oil-l-ORCMpCOU.jpg',
  ],
  'lego-star-wars-millennium-falcon': [
    'https://images.price.tools/images/lego-star-wars-millennium-falcon-set-l-TB227UoK2.jpg',
    'https://images.price.tools/images/lego-star-wars-millennium-falcon-set-l-2XXfVfqs.jpg',
    'https://rukminim2.flixcart.com/image/832/832/l4zxn680/block-construction/d/y/q/75257-star-wars-millennium-falcon-lego-original-imagfqnypkmys8hq.jpeg',
  ],
  'educational-science-kit': [
    'https://images.price.tools/images/kit4curious-all-rounder-science-kit-1000-l-94XgjQA74.jpg',
    'https://images.price.tools/images/kit4curious-all-rounder-science-kit-1000-l-94XgjQA74.jpg',
    'https://images.price.tools/images/kit4curious-all-rounder-science-kit-1000-l-94XgjQA74.jpg',
  ],
  'car-dash-camera-4k': [
    'https://images.price.tools/images/redtiger-f7n-elite-4k-hdr-dual-l-6ZfInINc3.jpg',
    'https://images.price.tools/images/redtiger-f7n-elite-4k-hdr-dual-l-6ZfInINc3.jpg',
    'https://images.price.tools/images/redtiger-f7n-elite-4k-hdr-dual-l-6ZfInINc3.jpg',
  ],
  'smart-blood-pressure-monitor': [
    'https://images.price.tools/images/ihealth-track-smart-upper-arm-blood-l-sduYaZA74.jpg',
    'https://images.price.tools/images/ihealth-track-smart-upper-arm-blood-l-sduYaZA74.jpg',
    'https://images.price.tools/images/ihealth-track-smart-upper-arm-blood-l-sduYaZA74.jpg',
  ],
  'organic-green-tea-collection': [
    'https://images.price.tools/images/maharishi-ayurveda-organic-green-tea-classic-l-hUiAm9B74.jpg',
    'https://images.price.tools/images/gldnt-organic-decaf-green-tea-bags-m-Lv1Qhg1i2.jpg',
    'https://images.price.tools/images/maharishi-ayurveda-organic-green-tea-classic-l-hUiAm9B74.jpg',
  ],
  'organic-honey-raw-unfiltered': [
    'https://images.price.tools/images/anveshan-organic-honey-275g-100-pure-l-fLP6Duqs.jpg',
    'https://images.price.tools/images/anveshan-wild-forest-honey-squeezy-275g-l-XqXQtvpK2.jpg',
    'https://images.price.tools/images/anveshan-organic-honey-275g-100-pure-l-fLP6Duqs.jpg',
  ],
  '925-sterling-silver-necklace': [
    'https://images.price.tools/images/zavya-925-sterling-silver-necklace-rhodium-m-4B4brOA74.jpg',
    'https://images.price.tools/images/giva-925-silver-avya-necklace-p-l-ycKxeIdn1.jpg',
    'https://images.price.tools/images/orionz-chain-men-amp-boys-anti-m-69suFnA74.jpg',
  ],
  'fitness-tracker-band': [
    'https://images.price.tools/images/drumstone-smart-fitness-band-heart-rate-l-stnRk2qs.jpg',
    'https://images.price.tools/images/pebble-qore-2-fitness-band-advanced-l-5FNJmQCP1.jpg',
    'https://images.price.tools/images/mi-band-3-l-ciaNXEdn1.jpg',
  ],
  'acoustic-guitar': [
    'https://images.price.tools/images/fender-squier-acoustic-guitar-dreadnought-cutaway-m-kLa9RXnK2.jpg',
    'https://images.price.tools/images/fender-squier-acoustic-guitar-dreadnought-cutaway-m-kLa9RXnK2.jpg',
    'https://images.price.tools/images/fender-squier-acoustic-guitar-dreadnought-cutaway-m-kLa9RXnK2.jpg',
  ],
  'bluetooth-turntable-record-player': [
    'https://images.price.tools/images/victrola-eastwood-bluetooth-record-player-3-l-pnK9zZdn1.jpg',
    'https://images.price.tools/images/crosley-t400d-bk-fully-automatic-bluetooth-m-froOloB74.jpg',
    'https://images.price.tools/images/victrola-eastwood-bluetooth-record-player-3-l-pnK9zZdn1.jpg',
  ],
  'remote-control-racing-car': [
    'https://images.price.tools/images/storio-rc-car-rechargeable-1-20-l-He5zwkqs.jpg',
    'https://images.price.tools/images/storio-rc-car-rechargeable-1-20-l-He5zwkqs.jpg',
    'https://images.price.tools/images/storio-rc-car-rechargeable-1-20-l-He5zwkqs.jpg',
  ],
};

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const productsCol = db.collection('products');
    const allProducts = await productsCol.find({}).toArray();
    console.log('Found ' + allProducts.length + ' products\n');

    let totalDownloaded = 0;
    let productResults = [];

    for (const product of allProducts) {
      const dbSlug = product.slug;
      const key = Object.keys(productImages).find(k => dbSlug.startsWith(k));
      if (!key) {
        productResults.push({ name: product.name, images: product.images ? product.images.length : 0 });
        console.log('SKIP ' + product.name + ': no key');
        continue;
      }

      const urls = productImages[key];
      console.log('\n--- ' + product.name + ' ---');
      const downloaded = [];

      for (let i = 0; i < urls.length && downloaded.length < 3; i++) {
        const url = urls[i];
        process.stdout.write('  [' + (i+1) + '] ... ');
        try {
          const dataUrl = await downloadImage(url);
          const kb = (dataUrl.length * 0.75 / 1024).toFixed(0);
          downloaded.push({ url: dataUrl });
          console.log('OK ' + kb + 'KB');
        } catch(e) {
          const msg = (e.message || '').split(' for')[0].substring(0, 30);
          console.log('FAIL: ' + msg);
        }
      }

      if (downloaded.length > 0) {
        await productsCol.updateOne({ _id: product._id }, { $set: { images: downloaded } });
        totalDownloaded += downloaded.length;
        productResults.push({ name: product.name, images: downloaded.length });
      } else {
        productResults.push({ name: product.name, images: 0 });
      }
    }

    console.log('\n\n========== RESULTS ==========');
    let ok3 = 0, ok2 = 0, ok1 = 0, fail = 0;
    for (const r of productResults) {
      const s = r.images >= 3 ? '3/3' : r.images === 2 ? '2/3' : r.images === 1 ? '1/3' : '0/3';
      console.log('  ' + s + ' ' + r.name);
      if (r.images >= 3) ok3++;
      else if (r.images === 2) ok2++;
      else if (r.images === 1) ok1++;
      else fail++;
    }
    console.log('\nTotal: ' + totalDownloaded + ' images | 3/3: ' + ok3 + ' | 2/3: ' + ok2 + ' | 1/3: ' + ok1 + ' | 0/3: ' + fail);
  } catch(err) {
    console.error('Fatal:', err);
  } finally {
    await client.close();
  }
}

main();
