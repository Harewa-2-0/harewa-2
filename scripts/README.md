# Fabric Bulk Upload Scripts

This directory contains scripts to bulk upload fabrics from the `public/Fabrics/` folder to the database.

## Quick Start (Recommended - Browser Script)

The easiest way to upload all fabrics is using the browser script:

1. **Log in to your admin dashboard**
   - Navigate to `http://localhost:3000/admin/fabrics` (or your admin URL)
   - Make sure you're logged in as an admin

2. **Open browser console**
   - Press `F12` or right-click → Inspect → Console tab

3. **Run the script**
   - Open `scripts/upload-fabrics-browser.js`
   - Copy the entire file content
   - Paste into browser console and press Enter

4. **Wait for completion**
   - The script will upload all 24 fabrics automatically
   - You'll see progress and a summary at the end

## Node.js Script (Alternative)

If you prefer using Node.js:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the script (requires cookies for authentication)
npm run upload-fabrics
```

**Note**: The Node.js script requires authentication cookies. You'll need to extract cookies from your browser session and pass them as environment variables or modify the script.

## What the Script Does

1. **Parses filenames** from `public/Fabrics/` folder
   - Extracts fabric name (preserves "(unique)" and numbers)
   - Extracts price from `$XX` format
   - Example: `"Afrik - $40 (unique).jpg"` → name: `"Afrik (unique)"`, price: `40`

2. **Extracts color** from fabric name
   - Tries to find color words (green, blue, red, etc.)
   - Falls back to "Mixed" if no color found
   - Example: `"Green Perfection"` → color: `"Green"`

3. **Uploads each fabric** with:
   - `name`: Parsed from filename
   - `image`: `/Fabrics/{filename}` (URL path)
   - `type`: `"Mixed"` (hardcoded)
   - `color`: Extracted or "Mixed"
   - `pricePerMeter`: Extracted from filename
   - `inStock`: `true` (default)

4. **Rate limiting**: 500ms delay between requests to avoid overwhelming the server

5. **Error handling**: Continues even if some uploads fail, reports summary at end

## Expected Files

The script expects 24 JPG files in `public/Fabrics/`:
- Afrik - $40 (unique).jpg
- Afrik - $40.jpg
- Bassam - $40.jpg
- Batik - $45.jpg
- Batik - $50.jpg
- Bogolan - $45 (unique) 1.jpg
- Bogolan - $45 (unique) 2.jpg
- Bogolan - $45 (unique) 3.jpg
- Bogolan - $45 (unique) 4.jpg
- Bogolan - $45 (unique).jpg
- Bogolan - $45.jpg
- Cool - $40.jpg
- Emotion - $45.jpg
- Emotion - $50 (unique).jpg
- Emotion - $50.jpg
- Graffiti - $45 (unique) 1.jpg
- Graffiti - $45 (unique).jpg
- Graffiti - $45.jpg
- Green Perfection - $50.jpg
- Jeans - $40.jpg
- Kitor - $45.jpg
- Perles - $40 (unique).jpg
- Perles - $40.jpg
- Perles - $50.jpg

## Troubleshooting

**Authentication errors:**
- Make sure you're logged in as admin before running the browser script
- For Node.js script, you need to provide cookies manually

**File not found errors:**
- Verify images are in `public/Fabrics/` folder
- Check that filenames match expected format: `Name - $Price.jpg`

**Duplicate errors:**
- If a fabric already exists, the upload will fail (this is expected)
- You can edit existing fabrics from the admin dashboard instead

**Network errors:**
- Check that your dev server is running (`npm run dev`)
- Verify the API endpoint is accessible

---

# Product Bulk Upload Scripts

This directory contains scripts to bulk upload products from the `public/Products/` folder to the database. **Images are uploaded to Cloudinary first**, then products are created with Cloudinary URLs.

## Quick Start (Recommended - Node.js Script)

The easiest way to upload all products is using the Node.js script:

1. **Install tsx if not already installed**
   ```bash
   npm install -g tsx
   ```

2. **Install form-data package** (required for file uploads)
   ```bash
   npm install form-data
   # or
   yarn add form-data
   ```

3. **Log in to your admin dashboard** (in browser)
   - Navigate to `http://localhost:3000/admin/products` (or your admin URL)
   - Make sure you're logged in as an admin
   - Extract your authentication cookies (optional, for Node.js script)

4. **Run the script**
   ```bash
   # Option 1: Run directly (will prompt for cookies if needed)
   npx tsx scripts/upload-products.ts
   
   # Option 2: With environment variables
   PRODUCT_UPLOAD_COOKIES="your-cookies-here" PRODUCT_UPLOAD_BASE_URL="http://localhost:3000" npx tsx scripts/upload-products.ts
   ```

4. **Wait for completion**
   - The script will scan all product folders
   - Upload images to Cloudinary
   - Create products with Cloudinary URLs
   - You'll see progress and a summary at the end

**Note**: After successful upload, you can delete the local `public/Products/` folders since images are now in Cloudinary.

## Browser Console Script (Recommended for Image Uploads)

**⚠️ Important**: Due to Node.js `form-data` compatibility issues with Next.js, the **browser console script is recommended** for uploading products with images.

### Quick Start (Browser Console)

1. **Generate product data** (run once):
   ```bash
   npx tsx scripts/generate-product-data.ts
   ```
   This scans your products directory and outputs the product data structure.

2. **Open browser console**:
   - Navigate to `http://localhost:3000/admin/products` (or any admin page)
   - Make sure you're logged in as admin
   - Open DevTools (F12) → Console tab

3. **Copy and paste the ready-to-use script**:
   ```bash
   # Read the script
   cat scripts/upload-products-browser-ready.js
   ```
   - Copy the entire contents
   - Paste into browser console
   - Press Enter

4. **Select images for each product**:
   - The script will prompt you to select 3 images for each product
   - Navigate to: `public/Products/{priceFolder}/{productFolder}/`
   - Select the 3 JPG images
   - Repeat for all products

5. **Wait for completion**:
   - Images upload to Cloudinary automatically
   - Products are created via bulk endpoint
   - You'll see progress in the console

**Why Browser Console?**
- Uses native browser `FormData` which Next.js can parse correctly
- No compatibility issues with `form-data` package
- Works seamlessly with authentication cookies
- Interactive file selection for images

**Note**: The old `upload-products-browser.js` script is a template and requires manual data preparation. Use `upload-products-browser-ready.js` instead.

## Folder Structure

The script expects the following folder structure:

```
public/Products/
├── $20/
│   ├── Product Name 1/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   ├── image3.jpg
│   │   └── Product Description.txt
│   └── Product Name 2/
│       └── ...
├── $25/
│   └── ...
├── $30/
│   └── ...
├── $35/
│   └── ...
└── $40/
    └── ...
```

**Requirements:**
- Each price folder (`$20`, `$25`, etc.) contains product folders
- Each product folder must have:
  - **Exactly 3 JPG images** (any names, e.g., `804A8714.jpg`)
  - **1 description file**: `Product Description.txt` (exact name, case-sensitive)

## What the Script Does

1. **Scans directory structure** from `public/Products/`
   - Reads price folders (`$20`, `$25`, `$30`, `$35`, `$40`)
   - Extracts price from folder name
   - Reads each product folder

2. **Reads product data**
   - Product name from folder name
   - Description from `Product Description.txt`
   - Collects 3 image files

3. **Uploads images to Cloudinary**
   - Reads each image file
   - Uploads via `/api/upload/bulk` endpoint
   - Extracts `secure_url` from Cloudinary response
   - Stores Cloudinary URLs for product creation

4. **Maps category** based on product name:
   - Contains "Senator" → "Senator Wear" category
   - Contains "Kampala" → "Adire & Kampala" category
   - Otherwise → "Ankara Mix and Match" category

5. **Detects gender** from keywords in name/description:
   - Keywords: "men's", "men", "male" → `"male"`
   - Keywords: "women's", "women", "female", "ladies" → `"female"`
   - Default: `"female"`

6. **Sets default values:**
   - `location`: "Kennesaw, GA USA"
   - `quantity`: 1000
   - `remainingInStock`: 1000
   - `sizes`: ["small", "medium", "large", "extra-large"]
   - `fabricType`: First available fabric from database

7. **Creates product** via POST `/api/product` with:
   - All product data
   - Cloudinary image URLs in `images` array

8. **Rate limiting**: 500ms delay between product uploads (images upload in parallel per product)

9. **Error handling**: Continues even if some uploads fail, reports summary at end

## Prerequisites

Before running the script, ensure:
- ✅ Categories exist in database: "Senator Wear", "Ankara Mix and Match", "Adire & Kampala"
- ✅ At least one fabric exists in database (used as default `fabricType`)
- ✅ You're logged in as admin (for authentication)
- ✅ Cloudinary is configured (check environment variables)

## Troubleshooting

**Authentication errors:**
- Make sure you're logged in as admin
- For Node.js script, extract cookies from browser DevTools → Application → Cookies
- Pass cookies as environment variable: `PRODUCT_UPLOAD_COOKIES="your-cookies"`

**Category not found errors:**
- Verify categories exist: "Senator Wear", "Ankara Mix and Match", "Adire & Kampala"
- Category names must match exactly (case-sensitive)

**Fabric not found errors:**
- Ensure at least one fabric exists in the database
- The script uses the first available fabric

**Image upload errors:**
- **"Failed to parse body as FormData" error**: This occurs because Node.js `form-data` package creates a FormData format that Next.js cannot parse. Next.js expects native browser FormData.
  - **Solution**: Use the browser console script (`upload-products-browser-ready.js`) instead, which uses native FormData that Next.js can parse correctly.
  - **Alternative**: If you must use Node.js, you would need to modify the backend to accept a different format, but the browser console approach is recommended.
- Check Cloudinary configuration (environment variables)
- Verify `/api/upload/bulk` endpoint is accessible
- Check that images are valid JPG files

**Missing description file:**
- Each product folder must have `Product Description.txt` (exact name)
- Script will skip products without description files

**Wrong number of images:**
- Each product folder must have exactly 3 JPG images
- Script will warn and skip products with incorrect image count

**Network errors:**
- Check that your dev server is running (`npm run dev`)
- Verify API endpoints are accessible
- Check Cloudinary API credentials

**After successful upload:**
- You can safely delete `public/Products/` folders
- Images are now stored in Cloudinary
- Products reference Cloudinary URLs

