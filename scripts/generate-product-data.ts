/**
 * Generate Product Data for Browser Console
 * 
 * This script scans the products directory and generates a JSON structure
 * that can be used with the browser console upload script.
 * 
 * Run: npx tsx scripts/generate-product-data.ts
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  priceFolder: string;
  imageFilenames: string[];
}

function extractPrice(priceFolder: string): number {
  const match = priceFolder.match(/\$(\d+)/);
  if (!match) {
    throw new Error(`Could not extract price from folder: ${priceFolder}`);
  }
  return parseInt(match[1], 10);
}

function mapProductToCategory(productName: string): string {
  const lowerName = productName.toLowerCase();
  
  if (lowerName.includes('senator')) {
    return 'Senator Wear';
  }
  
  if (lowerName.includes('kampala')) {
    return 'Adire & Kampala';
  }
  
  return 'Ankara Mix and Match';
}

async function generateProductData(): Promise<ProductData[]> {
  const productsDir = join(process.cwd(), 'public', 'Products');
  const products: ProductData[] = [];
  
  try {
    const priceFolders = await readdir(productsDir);
    
    for (const priceFolder of priceFolders) {
      const priceFolderPath = join(productsDir, priceFolder);
      const priceFolderStat = await stat(priceFolderPath);
      
      if (!priceFolderStat.isDirectory()) continue;
      
      const price = extractPrice(priceFolder);
      
      const productFolders = await readdir(priceFolderPath);
      
      for (const productFolder of productFolders) {
        const productFolderPath = join(priceFolderPath, productFolder);
        const productFolderStat = await stat(productFolderPath);
        
        if (!productFolderStat.isDirectory()) continue;
        
        const files = await readdir(productFolderPath);
        
        const descriptionFile = files.find(f => 
          f.toLowerCase() === 'product description.txt'
        );
        
        if (!descriptionFile) {
          console.warn(`⚠️  No description file found in: ${productFolder}`);
          continue;
        }
        
        const descriptionPath = join(productFolderPath, descriptionFile);
        const description = await readFile(descriptionPath, 'utf-8').then(
          content => content.trim(),
          () => ''
        );
        
        // Find image files (JPG files, excluding description file)
        const imageFilenames = files
          .filter(f => {
            const lower = f.toLowerCase();
            return (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) && 
                   f.toLowerCase() !== 'product description.txt';
          })
          .sort(); // Sort for consistent order
        
        if (imageFilenames.length !== 3) {
          console.warn(`⚠️  Expected 3 images in ${productFolder}, found ${imageFilenames.length}`);
        }
        
        const category = mapProductToCategory(productFolder);
        
        products.push({
          name: productFolder,
          description,
          price,
          category,
          priceFolder,
          imageFilenames
        });
      }
    }
    
    return products;
  } catch (error) {
    console.error('Error reading products directory:', error);
    throw error;
  }
}

async function main() {
  console.log('📁 Scanning products directory...\n');
  
  const products = await generateProductData();
  
  console.log(`✅ Found ${products.length} products\n`);
  console.log('📋 Copy this JSON and paste into browser console:\n');
  console.log('const productsData = ' + JSON.stringify(products, null, 2) + ';\n');
  console.log('Then run: scripts/upload-products-browser-ready.js\n');
}

main().catch(console.error);

