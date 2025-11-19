/**
 * Bulk Upload Fabrics Script
 * 
 * This script uploads all fabric images from public/Fabrics folder to the database.
 * 
 * Usage:
 * 1. Log in to the admin dashboard
 * 2. Open browser console (F12)
 * 3. Paste and run this script (it will be compiled and available as a browser script)
 * 
 * OR run as Node.js script:
 * npx tsx scripts/upload-fabrics.ts
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

// Note: This script uses fetch directly since it needs to run in Node.js environment
// For browser usage, use scripts/upload-fabrics-browser.js instead

// Color extraction - basic color words
const COLOR_WORDS = [
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
  'black', 'white', 'gray', 'grey', 'navy', 'gold', 'silver', 'beige',
  'tan', 'cream', 'ivory', 'maroon', 'burgundy', 'teal', 'turquoise',
  'coral', 'salmon', 'lime', 'olive', 'khaki'
];

interface FabricFile {
  filename: string;
  name: string;
  price: number;
  imageUrl: string;
  color: string;
}

/**
 * Parse filename to extract fabric name and price
 * Examples:
 * - "Afrik - $40 (unique).jpg" → { name: "Afrik (unique)", price: 40 }
 * - "Bogolan - $45 (unique) 1.jpg" → { name: "Bogolan (unique) 1", price: 45 }
 * - "Bassam - $40.jpg" → { name: "Bassam", price: 40 }
 */
function parseFilename(filename: string): { name: string; price: number } | null {
  // Remove .jpg extension
  const withoutExt = filename.replace(/\.jpg$/i, '');
  
  // Match pattern: "Name - $Price (optional suffix)"
  const match = withoutExt.match(/^(.+?)\s*-\s*\$\s*(\d+)\s*(.*)$/);
  
  if (!match) {
    console.warn(`Could not parse filename: ${filename}`);
    return null;
  }
  
  const [, namePart, priceStr, suffix] = match;
  const price = parseInt(priceStr, 10);
  
  // Clean up name - preserve (unique) and any numbers
  let name = namePart.trim();
  
  // Add suffix if present (like "(unique)" or "(unique) 1")
  if (suffix.trim()) {
    name = `${name} ${suffix.trim()}`;
  }
  
  return { name, price };
}

/**
 * Extract color from fabric name if possible
 */
function extractColor(name: string): string {
  const lowerName = name.toLowerCase();
  
  for (const color of COLOR_WORDS) {
    if (lowerName.includes(color)) {
      // Capitalize first letter
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  
  // Check for "Green Perfection" -> "Green"
  if (lowerName.includes('green')) return 'Green';
  
  // Default fallback
  return 'Mixed';
}

/**
 * Process all fabric files and prepare upload data
 */
async function prepareFabrics(): Promise<FabricFile[]> {
  const fabricsDir = join(process.cwd(), 'public', 'Fabrics');
  
  try {
    const files = await readdir(fabricsDir);
    const jpgFiles = files.filter(f => f.toLowerCase().endsWith('.jpg'));
    
    console.log(`Found ${jpgFiles.length} fabric images`);
    
    const fabrics: FabricFile[] = [];
    
    for (const filename of jpgFiles) {
      const parsed = parseFilename(filename);
      
      if (!parsed) {
        console.warn(`Skipping ${filename} - could not parse`);
        continue;
      }
      
      const { name, price } = parsed;
      const color = extractColor(name);
      const imageUrl = `/Fabrics/${filename}`;
      
      fabrics.push({
        filename,
        name,
        price,
        imageUrl,
        color
      });
    }
    
    return fabrics;
  } catch (error) {
    console.error('Error reading fabrics directory:', error);
    throw error;
  }
}

/**
 * Upload a single fabric with error handling
 * Note: This requires authentication cookies to be passed manually in Node.js environment
 * For easier usage, use the browser script instead (scripts/upload-fabrics-browser.js)
 */
async function uploadFabric(
  fabric: FabricFile, 
  index: number, 
  total: number,
  cookies?: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<boolean> {
  try {
    const payload = {
      name: fabric.name,
      image: fabric.imageUrl,
      type: 'Mixed',
      color: fabric.color,
      pricePerMeter: fabric.price,
      inStock: true
    };
    
    console.log(`[${index + 1}/${total}] Uploading: ${fabric.name} - $${fabric.price} (${fabric.color})`);
    
    const response = await fetch(`${baseUrl}/api/fabric`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { 'Cookie': cookies } : {})
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
    
    console.log(`✅ Success: ${fabric.name} (ID: ${fabricData._id || 'unknown'})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed: ${fabric.name}`, error.message || error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main(cookies?: string, baseUrl?: string) {
  console.log('🚀 Starting bulk fabric upload...\n');
  
  if (!cookies) {
    console.warn('⚠️  Warning: No cookies provided. This script may fail without authentication.');
    console.log('💡 Tip: For easier usage, use the browser script instead:');
    console.log('   Open browser console at http://localhost:3000/admin/fabrics');
    console.log('   Copy and run: scripts/upload-fabrics-browser.js\n');
  }
  
  try {
    // Prepare fabrics from files
    const fabrics = await prepareFabrics();
    
    if (fabrics.length === 0) {
      console.error('No fabrics found to upload');
      return;
    }
    
    console.log(`\n📋 Prepared ${fabrics.length} fabrics for upload:\n`);
    fabrics.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} - $${f.price} (${f.color})`);
    });
    
    console.log(`\n⏳ Starting uploads...\n`);
    
    // Upload each fabric with delay between requests
    const results: { success: boolean; name: string }[] = [];
    
    for (let i = 0; i < fabrics.length; i++) {
      const fabric = fabrics[i];
      const success = await uploadFabric(fabric, i, fabrics.length, cookies, baseUrl);
      
      results.push({ success, name: fabric.name });
      
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
      failed.forEach(f => console.log(`  - ${f.name}`));
    }
    
    console.log(`\n✨ Bulk upload complete!`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly (Node.js)
if (typeof require !== 'undefined' && require.main === module) {
  // Get cookies and base URL from environment variables if provided
  const cookies = process.env.FABRIC_UPLOAD_COOKIES;
  const baseUrl = process.env.FABRIC_UPLOAD_BASE_URL || 'http://localhost:3000';
  
  main(cookies, baseUrl).catch(console.error);
}

export { main, prepareFabrics, parseFilename, extractColor };

