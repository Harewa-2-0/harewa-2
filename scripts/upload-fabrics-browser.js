(async function bulkUploadFabrics() {
  console.log('🚀 Starting bulk fabric upload...\n');

  // Fabric filenames from public/Fabrics folder
  const fabricFiles = [
    'Afrik - $40 (unique).jpg',
    'Afrik - $40.jpg',
    'Bassam - $40.jpg',
    'Batik - $45.jpg',
    'Batik - $50.jpg',
    'Bogolan - $45 (unique) 1.jpg',
    'Bogolan - $45 (unique) 2.jpg',
    'Bogolan - $45 (unique) 3.jpg',
    'Bogolan - $45 (unique) 4.jpg',
    'Bogolan - $45 (unique).jpg',
    'Bogolan - $45.jpg',
    'Cool - $40.jpg',
    'Emotion - $45.jpg',
    'Emotion - $50 (unique).jpg',
    'Emotion - $50.jpg',
    'Graffiti - $45 (unique) 1.jpg',
    'Graffiti - $45 (unique).jpg',
    'Graffiti - $45.jpg',
    'Green Perfection - $50.jpg',
    'Jeans - $40.jpg',
    'Kitor - $45.jpg',
    'Perles - $40 (unique).jpg',
    'Perles - $40.jpg',
    'Perles - $50.jpg'
  ];

  // Color extraction - basic color words
  const COLOR_WORDS = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'navy', 'gold', 'silver', 'beige',
    'tan', 'cream', 'ivory', 'maroon', 'burgundy', 'teal', 'turquoise',
    'coral', 'salmon', 'lime', 'olive', 'khaki'
  ];

  /**
   * Parse filename to extract fabric name and price
   */
  function parseFilename(filename) {
    const withoutExt = filename.replace(/\.jpg$/i, '');
    const match = withoutExt.match(/^(.+?)\s*-\s*\$\s*(\d+)\s*(.*)$/);
    
    if (!match) {
      console.warn(`Could not parse filename: ${filename}`);
      return null;
    }
    
    const [, namePart, priceStr, suffix] = match;
    const price = parseInt(priceStr, 10);
    let name = namePart.trim();
    
    if (suffix.trim()) {
      name = `${name} ${suffix.trim()}`;
    }
    
    return { name, price };
  }

  /**
   * Extract color from fabric name if possible
   */
  function extractColor(name) {
    const lowerName = name.toLowerCase();
    
    for (const color of COLOR_WORDS) {
      if (lowerName.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    
    return 'Mixed';
  }

  /**
   * Upload a single fabric
   */
  async function uploadFabric(fabric, index, total) {
    try {
      const payload = {
        name: fabric.name,
        image: `/Fabrics/${fabric.filename}`,
        type: 'Mixed',
        color: fabric.color,
        pricePerMeter: fabric.price,
        inStock: true
      };
      
      console.log(`[${index + 1}/${total}] Uploading: ${fabric.name} - $${fabric.price} (${fabric.color})`);
      
      const response = await fetch('/api/fabric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      const fabricData = result.data || result;
      
      console.log(`✅ Success: ${fabric.name} (ID: ${fabricData._id})`);
      return { success: true, name: fabric.name };
    } catch (error) {
      console.error(`❌ Failed: ${fabric.name}`, error.message || error);
      return { success: false, name: fabric.name, error: error.message };
    }
  }

  // Parse all filenames
  console.log('📋 Parsing fabric files...\n');
  const fabrics = [];
  
  for (const filename of fabricFiles) {
    const parsed = parseFilename(filename);
    if (parsed) {
      fabrics.push({
        filename,
        name: parsed.name,
        price: parsed.price,
        color: extractColor(parsed.name)
      });
    }
  }

  console.log(`📋 Prepared ${fabrics.length} fabrics for upload:\n`);
  fabrics.forEach((f, i) => {
    console.log(`${i + 1}. ${f.name} - $${f.price} (${f.color})`);
  });

  console.log(`\n⏳ Starting uploads...\n`);

  // Upload each fabric with delay
  const results = [];
  
  for (let i = 0; i < fabrics.length; i++) {
    const fabric = fabrics[i];
    const result = await uploadFabric(fabric, i, fabrics.length);
    results.push(result);
    
    // Rate limiting: 500ms delay between requests
    if (i < fabrics.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary report
  console.log(`\n📊 Upload Summary:\n`);
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${fabrics.length}`);
  console.log(`❌ Failed: ${failed.length}/${fabrics.length}`);
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed fabrics:`);
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error || 'Unknown error'}`));
  }
  
  console.log(`\n✨ Bulk upload complete!`);
  
  // Return results for inspection
  return { successful, failed, total: fabrics.length };
})();

