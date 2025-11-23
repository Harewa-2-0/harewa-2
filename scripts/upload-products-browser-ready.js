/**
 * Browser Console Product Upload Script - Using Local Paths (Like Fabrics)
 * 
 * INSTRUCTIONS:
 * 1. Run: npx tsx scripts/generate-product-data.ts
 * 2. Copy the productsData array from the output
 * 3. Open browser console at http://localhost:3000/admin/products (while logged in)
 * 4. Paste the productsData array, then paste this script
 * 5. Press Enter
 * 
 * This script uses local file paths (like the fabrics script) - no file selection needed!
 */

(async function bulkUploadProductsBrowser() {
  console.log('🚀 Browser Product Upload Script (Local Paths)\n');

  // Product data - REPLACE THIS with output from: npx tsx scripts/generate-product-data.ts
  const productsData = [
    {
      "name": "Adire Panel T-Shirt & Ankara Cargo Trousers Set",
      "description": "A modern, crisp white t-shirt featuring subtle Adire/Ankara trim detailing along the side seam, paired with boldly patterned, earthy-toned cargo trousers. This set combines contemporary sportswear with vibrant West African textile heritage for a distinctive, smart-casual look.",
      "price": 20,
      "category": "Ankara Mix and Match",
      "priceFolder": "$20",
      "imageFilenames": ["804A8894.jpg", "804A8895.jpg", "804A8904.jpg"]
    },
    {
      "name": "Burgundy Short-Sleeve Senator Kaftan",
      "description": "A refined burgundy senator kaftan crafted from smooth, breathable fabric with a clean placket and subtle contrast detailing. Its modern short-sleeve design and tailored fit make it perfect for events, work, and stylish everyday wear.",
      "price": 20,
      "category": "Senator Wear",
      "priceFolder": "$20",
      "imageFilenames": ["804A8714.jpg", "804A8725.jpg", "804A8732.jpg"]
    },
    {
      "name": "Zebra-Print Peplum Top & Mini Skirt Set",
      "description": "A stylish two-piece set featuring a vibrant zebra-print pattern with pink and brown accents. The peplum top offers a flattering silhouette, paired with a matching mini skirt for a bold, feminine, and fashion-forward look—perfect for chic outings, events, and standout moments.",
      "price": 20,
      "category": "Ankara Mix and Match",
      "priceFolder": "$20",
      "imageFilenames": ["804A8838.jpg", "804A8840.jpg", "804A8845.jpg"]
    },
    {
      "name": "Modern Short-Sleeve Tunic with Abstract Accent",
      "description": "A contemporary, short-sleeved tunic (or long shirt) in a textured light grey fabric. It features a band/Mandarin collar trimmed in black and is styled with a prominent abstract, multicolored print on the sleeves and the slanted chest pocket. The black trim on the collar and pocket adds a sharp, modern contrast to this distinctive, fusion design.",
      "price": 25,
      "category": "Ankara Mix and Match",
      "priceFolder": "$25",
      "imageFilenames": ["804A8790.jpg", "804A8798.jpg", "804A8799.jpg"]
    },
    {
      "name": "Navy Tunic with Blue Abstract Yoke",
      "description": "A sharp, short-sleeved tunic (or long shirt) in a deep navy blue fabric. The design features a prominent white-piped band collar and a curved, geometric yoke across the chest that integrates a vibrant abstract print in shades of blue, turquoise, and purple. The same abstract print is also used on the sleeves, creating a modern, high-contrast, and dynamic look.",
      "price": 25,
      "category": "Ankara Mix and Match",
      "priceFolder": "$25",
      "imageFilenames": ["804A8807.jpg", "804A8814.jpg", "804A8817.jpg"]
    },
    {
      "name": "White Band-Collar Tunic with Sunrise Ankara Panel",
      "description": "A crisp, white long-sleeved tunic (or shirt) featuring a sophisticated band/Mandarin collar. It is elegantly detailed with a vibrant orange and earth-toned Ankara/Adire print panel that runs vertically down the front placket, extending onto the cuffs, and across the shoulders. The look is finished with matching orange buttons for a cohesive and striking formal-casual design.",
      "price": 25,
      "category": "Ankara Mix and Match",
      "priceFolder": "$25",
      "imageFilenames": ["804A8629.jpg", "804A8631.jpg", "804A8633.jpg"]
    },
    {
      "name": "Afro-Print Suspender Jumpsuit",
      "description": "A stylish women's outfit featuring a pair of wide-leg, high-waisted overalls/jumpsuit crafted from a rich, brown and white patterned African print fabric (likely Ankara or Adire), accented with vertical mustard yellow and red stripes. The piece is layered over a simple white crew-neck t-shirt and paired with black high-heeled sandals, creating a fashionable and comfortable ensemble.",
      "price": 30,
      "category": "Ankara Mix and Match",
      "priceFolder": "$30",
      "imageFilenames": ["804A8924.jpg", "804A8929.jpg", "804A8930.jpg"]
    },
    {
      "name": "African Print Power Blazer",
      "description": "A structured, tailored blazer featuring a striking, vibrant African wax print (likely Ankara) fabric. The fabric showcases a complex, repeating geometric or Aztec-inspired pattern in shades of teal, turquoise, red, and gold/white. The blazer has a single-button closure and a sharp collar, offering a bold and professional statement piece that combines classic tailoring with traditional textiles.",
      "price": 35,
      "category": "Ankara Mix and Match",
      "priceFolder": "$35",
      "imageFilenames": ["804A8663.jpg", "804A8664.jpg", "804A8672.jpg"]
    },
    {
      "name": "Abstract Swirl Print Peplum Top and Shorts Set",
      "description": "A fashionable two-piece shorts set made from a soft-toned African print fabric (likely Ankara) featuring a repeating abstract swirl or wave pattern in shades of teal, mint green, and light blue. The set includes a button-front top with a slight peplum flare and dramatic, voluminous puff sleeves, paired with matching tailored shorts. This outfit offers a stylish, contemporary, and cohesive summer look.",
      "price": 40,
      "category": "Ankara Mix and Match",
      "priceFolder": "$40",
      "imageFilenames": ["804A8856.jpg", "804A8860.jpg", "804A8864.jpg"]
    },
    {
      "name": "African Print Mini Tuxedo Dress",
      "description": "A stylish mini-dress tailored in the style of a blazer, featuring a deep V-neckline, lapels, and a single-button closure. The dress is made from an eye-catching African print fabric (likely Ankara) with an abstract botanical or leaf pattern in muted tones of dark green, mustard yellow, and pale blue. The look is finished with patterned sheer black tights, giving it a chic, edgy, and contemporary appeal.",
      "price": 40,
      "category": "Ankara Mix and Match",
      "priceFolder": "$40",
      "imageFilenames": ["804A8642.jpg", "804A8648.jpg", "804A8651.jpg"]
    },
    {
      "name": "Ankara Peplum Top and Trousers Co-ord Set",
      "description": "A vibrant two-piece matching set crafted from a striking geometric African print fabric (likely Ankara) featuring a repeating checkered pattern in red, yellow, blue, and white. The set includes a long-sleeved top with a fitted bodice and a tiered, ruffled peplum hem, paired with matching straight-leg trousers. This ensemble offers a bold, contemporary, and formal look.",
      "price": 40,
      "category": "Ankara Mix and Match",
      "priceFolder": "$40",
      "imageFilenames": ["804A8734.jpg", "804A8741.jpg", "804A8750.jpg"]
    },
    {
      "name": "Micro-Geometric Print Peplum Top and Trousers Set",
      "description": "A sophisticated, two-piece matching set made from a deep purple and blue African print fabric featuring a fine, repeating micro-geometric or dotted pattern in multiple colors. The set includes a long-sleeved top with a flattering, multi-layered ruffled peplum hem (with a subtle pink lining visible) and tailored wide-leg trousers. This ensemble offers a refined and dramatic silhouette.",
      "price": 40,
      "category": "Ankara Mix and Match",
      "priceFolder": "$40",
      "imageFilenames": ["804A8758.jpg", "804A8764.jpg", "804A8768.jpg"]
    }
  ];

  // Helper functions
  function mapProductToCategory(productName) {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('senator')) return 'Senator Wear';
    if (lowerName.includes('kampala')) return 'Adire & Kampala';
    return 'Ankara Mix and Match';
  }

  function detectGender(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    if (text.includes("men's") || text.includes("men ") || text.includes("male")) return 'male';
    if (text.includes("women's") || text.includes("women ") || text.includes("female") || text.includes("ladies")) return 'female';
    return 'female';
  }

  /**
   * Build local image paths from product data (like fabrics script)
   */
  function buildImagePaths(product) {
    return product.imageFilenames.map(filename => 
      `/Products/${product.priceFolder}/${product.name}/${filename}`
    );
  }

  async function fetchCategories() {
    const res = await fetch('/api/product-category', { credentials: 'include' });
    const data = await res.json();
    return data.data || data;
  }

  async function fetchFabrics() {
    const res = await fetch('/api/fabric', { credentials: 'include' });
    const data = await res.json();
    return data.data || data;
  }

  /**
   * Upload a single product (like fabrics script)
   */
  async function uploadProduct(product, index, total, categoryId, fabricId) {
    try {
      const imagePaths = buildImagePaths(product);
      const categoryName = product.category || mapProductToCategory(product.name);
      const gender = detectGender(product.name, product.description || '');

      const payload = {
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        quantity: '1000',
        remainingInStock: '1000',
        location: 'Kennesaw, GA USA',
        images: imagePaths,
        sizes: ['small', 'medium', 'large', 'extra-large'],
        gender: gender,
        category: categoryId,
        fabricType: fabricId
      };

      console.log(`[${index + 1}/${total}] Uploading: ${product.name} - $${product.price} (${categoryName})`);

      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const productData = result.data || result;

      console.log(`✅ Success: ${product.name} (ID: ${productData._id})`);
      return { success: true, name: product.name };
    } catch (error) {
      console.error(`❌ Failed: ${product.name}`, error.message || error);
      return { success: false, name: product.name, error: error.message };
    }
  }

  // Main execution
  try {
    console.log('📋 Fetching categories and fabrics...\n');
    const [categories, fabrics] = await Promise.all([
      fetchCategories(),
      fetchFabrics()
    ]);

    if (categories.length === 0) {
      throw new Error('No categories found');
    }
    if (fabrics.length === 0) {
      throw new Error('No fabrics found');
    }

    console.log(`✅ Found ${categories.length} categories and ${fabrics.length} fabrics\n`);
    console.log(`📋 Prepared ${productsData.length} products for upload:\n`);
    productsData.forEach((p, i) => {
      const categoryName = p.category || mapProductToCategory(p.name);
      console.log(`${i + 1}. ${p.name} - $${p.price} (${categoryName})`);
    });

    console.log(`\n⏳ Starting uploads...\n`);

    // Upload each product with delay (like fabrics script)
    const results = [];
    
    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      
      // Find category
      const categoryName = product.category || mapProductToCategory(product.name);
      const category = categories.find(c => c.name === categoryName);
      if (!category) {
        console.error(`❌ Category not found: ${categoryName} - Skipping ${product.name}`);
        results.push({ success: false, name: product.name, error: `Category not found: ${categoryName}` });
        continue;
      }

      const result = await uploadProduct(product, i, productsData.length, category._id, fabrics[0]._id);
      results.push(result);
      
      // Rate limiting: 500ms delay between requests
      if (i < productsData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Summary report
    console.log(`\n📊 Upload Summary:\n`);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${productsData.length}`);
    console.log(`❌ Failed: ${failed.length}/${productsData.length}`);
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed products:`);
      failed.forEach(f => console.log(`  - ${f.name}: ${f.error || 'Unknown error'}`));
    }
    
    console.log(`\n✨ Bulk upload complete!`);
    console.log(`\n💡 You can now delete the local public/Products/ folders if desired.`);

    return { successful, failed, total: productsData.length };

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return { error: error.message };
  }
})();
