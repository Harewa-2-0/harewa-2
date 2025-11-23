/**
 * Migrate Product Images to Cloudinary
 * 
 * This script:
 * 1. Fetches all products from the database
 * 2. Identifies products with local image paths (/Products/...)
 * 3. Reads local image files
 * 4. Uploads them to Cloudinary
 * 5. Updates products with Cloudinary URLs
 * 
 * Usage:
 * npx tsx scripts/migrate-product-images-to-cloudinary.ts
 * 
 * Or with custom cookies:
 * PRODUCT_UPLOAD_COOKIES="your-cookies" npx tsx scripts/migrate-product-images-to-cloudinary.ts
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Load environment variables from .env.local file
 */
async function loadEnvFile() {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    try {
      const envContent = await readFile(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not load .env.local file:', error);
    }
  }
}

// Configure Cloudinary (will be configured after loading env in main function)
let cloudinaryConfigured = false;

function configureCloudinary() {
  if (cloudinaryConfigured) return;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
  });
  
  cloudinaryConfigured = true;
}

const BASE_URL = process.env.PRODUCT_UPLOAD_BASE_URL || 'http://localhost:3000';
const DEFAULT_COOKIES = "_ga=GA1.1.1505490200.1752158888; _ga_SKV1MB80FS=GS2.1.s1752589182$o18$g1$t1752590204$j59$l0$h0; sb-hceglilsbmbzlibrqzsa-auth-token-code-verifier=%22f1529e00d23cfea8b32658e4263b17fd54175980418406c260e1af073822d155bdd140e9108375c6a1d86ebdf1a5ed823b1acb394c45f585%22; sb-hceglilsbmbzlibrqzsa-auth-token=%5B%22eyJhbGciOiJIUzI1NiIsImtpZCI6IklnV01DSnFXdDZzeGpQcDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2hjZWdsaWxzYm1iemxpYnJxenNhLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3N2QxMTJlNy1iNWZkLTQxYzEtODE3Mi1kZmEzZjc0NjRlYTAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3OTc1ODQxLCJpYXQiOjE3NTc5NzIyNDEsImVtYWlsIjoiZW1waXJlNGpvc2hAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJidXNpbmVzc19uYW1lIjoiQXVkdSIsImVtYWlsIjoiZW1waXJlNGpvc2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNzdkMTEyZTctYjVmZC00MWMxLTgxNzItZGZhM2Y3NDY0ZWEwIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTc5NjUyNzV9XSwic2Vzc2lvbl9pZCI6ImJkZTI4YzIxLWM2MGYtNDJmZi1hNGM0LWI0YjQwZWIzNzk3YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.EXotv6y80P7PTZxVzf9DY-m9uM-k7UbKrBGsy7NB8Nc%22%2C%2264fwh7p567df%22%2Cnull%2Cnull%2Cnull%5D; __stripe_mid=f425f34a-108f-4152-9299-eac186dce260646216; __next_hmr_refresh_hash__=24bc8c17706b039db8bb64a328fa137cc3d6e4a6f865a051; access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGVhZDExZDQxZjAyYzViZGE1MDljZTUiLCJlbWFpbCI6ImVtcGlyZTRqb3NoQG91dGxvb2suY29tIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2MzkwNzg3OSwiZXhwIjoxNzYzOTA4Nzc5fQ.rPyf_AOhYeH4epSCr78QOSd80CItfr31LNJCOmbcY3A; refresh-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGVhZDExZDQxZjAyYzViZGE1MDljZTUiLCJqdGkiOiI4MzQzYjk0My04NWYwLTRjYzAtOThlZS1kNTAwNDJhM2Y4ZDQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2MzkwNzg3OSwiZXhwIjoxNzY0NTEyNjc5fQ.mKZmGtwl8Ph0c58VFQh0JAXuXD8B-ffGwQqKaq-3Yyc";
const COOKIES = process.env.PRODUCT_UPLOAD_COOKIES || DEFAULT_COOKIES;

interface Product {
  _id: string;
  id?: string;
  name: string;
  images: string[];
  [key: string]: any;
}

/**
 * Fetch all products from the API
 * Handles pagination and nested response structure: { success, message, data: { data: [...], page, limit, total, ... } }
 */
async function fetchAllProducts(): Promise<Product[]> {
  try {
    let allProducts: Product[] = [];
    let page = 1;
    let hasMore = true;
    const limit = 100;

    while (hasMore) {
      const response = await fetch(`${BASE_URL}/api/product?page=${page}&limit=${limit}`, {
        headers: {
          'Cookie': COOKIES
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle nested response structure: { success, message, data: { data: [...], page, limit, total, ... } }
      const responseData = result.data || result;
      const products = responseData.data || responseData.items || [];
      
      if (Array.isArray(products)) {
        allProducts = allProducts.concat(products);
        console.log(`   📄 Page ${page}: Fetched ${products.length} products (Total: ${allProducts.length})`);
      }

      // Check if there are more pages
      const totalPages = responseData.totalPages || Math.ceil((responseData.total || 0) / limit);
      hasMore = page < totalPages;
      page++;
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Check if an image path is local (starts with /Products/)
 */
function isLocalImage(path: string): boolean {
  if (!path) return false;
  return path.startsWith('/Products/');
}

/**
 * Check if an image URL is already on Cloudinary
 */
function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.startsWith('http');
}

/**
 * Compress/resize image buffer if it's too large
 * Returns compressed buffer or original if already small enough
 */
async function compressImageIfNeeded(buffer: Buffer, maxSizeBytes: number = 9 * 1024 * 1024): Promise<Buffer> {
  // If already under limit, return as-is
  if (buffer.length <= maxSizeBytes) {
    return buffer;
  }

  // For Node.js, we'll use Cloudinary's transformation to resize during upload
  // But we can also try to reduce quality/size by re-encoding
  // Since we don't have sharp/jimp, we'll rely on Cloudinary transformations
  console.log(`   ⚠️  Image is ${(buffer.length / 1024 / 1024).toFixed(2)}MB, will use Cloudinary transformations to compress`);
  return buffer; // Return original, Cloudinary will handle compression via transformations
}

/**
 * Convert local path to file system path
 * /Products/$20/Product Name/image.jpg -> public/Products/$20/Product Name/image.jpg
 */
function getLocalImagePath(imagePath: string): string {
  // Remove leading slash and prepend public/
  const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return join(process.cwd(), 'public', relativePath);
}

/**
 * Upload a single image file to Cloudinary directly (bypassing API)
 * Uses transformations to compress large images
 */
async function uploadImageToCloudinary(imagePath: string): Promise<string> {
  try {
    const localPath = getLocalImagePath(imagePath);
    
    // Check if file exists
    if (!existsSync(localPath)) {
      throw new Error(`Image file not found: ${localPath}`);
    }

    // Read file
    const buffer = await readFile(localPath);
    const fileSizeMB = buffer.length / 1024 / 1024;
    
    // Generate a unique filename based on the product path
    const pathParts = imagePath.split('/').filter(Boolean);
    const filename = pathParts.slice(-1)[0]?.replace(/\.(jpg|jpeg)$/i, '') || 'image';
    const publicId = `products/${filename}_${Date.now()}`;

    // Configure upload options with transformations for large files
    const uploadOptions: any = {
      folder: 'products',
      public_id: publicId,
      resource_type: 'image' as const,
    };

    // If file is large (>8MB), add compression transformations
    if (fileSizeMB > 8) {
      console.log(`   🔧 Compressing large image (${fileSizeMB.toFixed(2)}MB)...`);
      uploadOptions.transformation = [
        { width: 1920, height: 1920, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ];
    } else if (fileSizeMB > 5) {
      // Medium compression for files 5-8MB
      uploadOptions.transformation = [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ];
    }

    // Upload directly to Cloudinary using SDK
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            // If it's a file size error, try with more aggressive compression
            if (error.message.includes('File size too large') || error.message.includes('Maximum is')) {
              console.log(`   🔧 Retrying with aggressive compression...`);
              // Retry with more aggressive compression
              const retryOptions = {
                ...uploadOptions,
                transformation: [
                  { width: 1600, height: 1600, crop: 'limit', quality: 'auto:low' },
                  { fetch_format: 'auto' }
                ]
              };
              
              const retryStream = cloudinary.uploader.upload_stream(
                retryOptions,
                (retryError, retryResult) => {
                  if (retryError) {
                    reject(new Error(`Cloudinary upload failed even with compression: ${retryError.message}`));
                    return;
                  }
                  if (!retryResult || !retryResult.secure_url) {
                    reject(new Error('Cloudinary upload succeeded but no secure_url returned'));
                    return;
                  }
                  resolve(retryResult.secure_url);
                }
              );
              Readable.from(buffer).pipe(retryStream);
              return;
            }
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
            return;
          }
          if (!result || !result.secure_url) {
            reject(new Error('Cloudinary upload succeeded but no secure_url returned'));
            return;
          }
          resolve(result.secure_url);
        }
      );

      Readable.from(buffer).pipe(stream);
    });
  } catch (error: any) {
    console.error(`Failed to upload ${imagePath}:`, error.message || error);
    throw error;
  }
}

/**
 * Update product with new Cloudinary image URLs
 */
async function updateProductImages(productId: string, newImages: string[]): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': COOKIES
      },
      credentials: 'include',
      body: JSON.stringify({ images: newImages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Update failed: ${errorMessage}`);
    }

    console.log(`✅ Updated product ${productId} with Cloudinary URLs`);
  } catch (error: any) {
    console.error(`Failed to update product ${productId}:`, error.message || error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrateProductImages() {
  console.log('🚀 Starting product image migration to Cloudinary...\n');

  // Load environment variables from .env.local
  await loadEnvFile();

  // Configure Cloudinary
  configureCloudinary();

  // Check Cloudinary configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Cloudinary environment variables not set!');
    console.error('   Please set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    console.error('   You can load them from .env.local or set them as environment variables\n');
    process.exit(1);
  }

  console.log('☁️  Cloudinary configured');
  console.log('🔐 Using authentication cookies\n');

  try {
    // Fetch all products
    console.log('📋 Fetching all products...');
    const products = await fetchAllProducts();
    console.log(`✅ Found ${products.length} products\n`);

    // Filter products with local images (skip already migrated products)
    const productsToMigrate = products.filter(product => {
      if (!product.images || !Array.isArray(product.images)) return false;
      // Skip if all images are already Cloudinary URLs
      const allCloudinary = product.images.every(img => isCloudinaryUrl(img));
      if (allCloudinary) {
        return false; // Already migrated
      }
      // Include if at least one image is local
      return product.images.some(isLocalImage);
    });

    console.log(`📸 Found ${productsToMigrate.length} products with local images to migrate\n`);

    if (productsToMigrate.length === 0) {
      console.log('✨ No products need migration. All images are already on Cloudinary!');
      return;
    }

    // Process each product
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < productsToMigrate.length; i++) {
      const product = productsToMigrate[i];
      const productId = product._id || product.id;
      const productName = product.name || 'Unknown';

      if (!productId) {
        console.error(`   ❌ Skipping ${productName}: No product ID found`);
        failCount++;
        continue;
      }

      console.log(`\n[${i + 1}/${productsToMigrate.length}] Processing: ${productName}`);

      try {
        const newImages: string[] = [];

        // Process each image
        for (let j = 0; j < product.images.length; j++) {
          const imagePath = product.images[j];

          if (isLocalImage(imagePath)) {
            console.log(`   📤 Uploading image ${j + 1}/${product.images.length}: ${imagePath}`);
            const cloudinaryUrl = await uploadImageToCloudinary(imagePath);
            newImages.push(cloudinaryUrl);
            console.log(`   ✅ Uploaded: ${cloudinaryUrl}`);
          } else {
            // Already a Cloudinary URL, keep it
            newImages.push(imagePath);
            console.log(`   ℹ️  Already on Cloudinary: ${imagePath}`);
          }

          // Rate limiting: small delay between uploads
          if (j < product.images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Update product with new image URLs
        console.log(`   🔄 Updating product...`);
        await updateProductImages(productId, newImages);

        successCount++;
        console.log(`   ✅ Successfully migrated: ${productName}`);

      } catch (error: any) {
        failCount++;
        console.error(`   ❌ Failed to migrate ${productName}:`, error.message || error);
      }

      // Rate limiting: delay between products
      if (i < productsToMigrate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Summary
    console.log(`\n\n📊 Migration Summary:`);
    console.log(`✅ Successful: ${successCount}/${productsToMigrate.length}`);
    console.log(`❌ Failed: ${failCount}/${productsToMigrate.length}`);
    console.log(`\n✨ Migration complete!`);

  } catch (error: any) {
    console.error('❌ Fatal error during migration:', error.message || error);
    process.exit(1);
  }
}

// Run migration
migrateProductImages().catch(console.error);

