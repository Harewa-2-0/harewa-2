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

