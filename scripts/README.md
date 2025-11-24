# Image Upload Scripts Reference

This directory is for scripts that handle image uploads to Cloudinary. All scripts should follow the standard workflow: **compress with Sharp first, then upload to Cloudinary**.

## Standard Upload Workflow

### 1. Image Compression with Sharp
Before uploading any image to Cloudinary, always compress it using Sharp:

```typescript
import sharp from 'sharp';

// Compress image before upload
const compressedBuffer = await sharp(imageBuffer)
  .resize(1920, null, { 
    withoutEnlargement: true,
    fit: 'inside'
  })
  .jpeg({ 
    quality: 85,
    progressive: true,
    mozjpeg: true
  })
  .toBuffer();
```

**Compression Settings:**
- **Max width**: 1920px (maintains aspect ratio)
- **Quality**: 85% (good balance between size and quality)
- **Format**: Progressive JPEG
- **Optimization**: MozJPEG enabled

### 2. Upload to Cloudinary
After compression, upload the compressed buffer to Cloudinary:

```typescript
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload compressed image
const uploadResult = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'products', // or 'fabrics'
      resource_type: 'image',
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );
  
  // Pipe compressed buffer to upload stream
  Readable.from(compressedBuffer).pipe(uploadStream);
});

const cloudinaryUrl = uploadResult.secure_url;
```

## Image Folder Structure

### Products
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
└── ...
```

### Fabrics
```
public/Fabrics/
├── Fabric Name - $40.jpg
├── Fabric Name - $45 (unique).jpg
└── ...
```

## Creating New Upload Scripts

When creating a new upload script, follow this template:

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

// 1. Load environment variables
async function loadEnvFile() {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    // Load .env.local file
    // ... (implementation)
  }
}

// 2. Configure Cloudinary
function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// 3. Compress image with Sharp
async function compressImage(imagePath: string): Promise<Buffer> {
  const imageBuffer = await readFile(imagePath);
  
  return await sharp(imageBuffer)
    .resize(1920, null, { 
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ 
      quality: 85,
      progressive: true,
      mozjpeg: true
    })
    .toBuffer();
}

// 4. Upload compressed image to Cloudinary
async function uploadToCloudinary(
  compressedBuffer: Buffer,
  folder: string = 'products'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    
    Readable.from(compressedBuffer).pipe(uploadStream);
  });
}

// 5. Main upload function
async function uploadImages() {
  await loadEnvFile();
  configureCloudinary();
  
  // Your upload logic here
  // For each image:
  //   1. Compress with Sharp
  //   2. Upload to Cloudinary
  //   3. Update database with Cloudinary URL
}
```

## Required Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Best Practices

1. **Always compress before upload** - Reduces file size and upload time
2. **Use Sharp for compression** - Consistent, high-quality compression
3. **Handle errors gracefully** - Continue processing other images if one fails
4. **Log progress** - Show which images are being processed
5. **Save results** - Keep track of successful and failed uploads
6. **Rate limiting** - Add delays between uploads to avoid overwhelming Cloudinary

## Example: Upload Product Images

```typescript
// For each product image:
const imagePath = join(process.cwd(), 'public', 'Products', productFolder, imageFile);

// 1. Compress
const compressedBuffer = await compressImage(imagePath);

// 2. Upload
const cloudinaryUrl = await uploadToCloudinary(compressedBuffer, 'products');

// 3. Update product
await updateProduct(productId, { images: [...existingImages, cloudinaryUrl] });
```

## Example: Upload Fabric Images

```typescript
// For each fabric image:
const imagePath = join(process.cwd(), 'public', 'Fabrics', fabricFile);

// 1. Compress
const compressedBuffer = await compressImage(imagePath);

// 2. Upload
const cloudinaryUrl = await uploadToCloudinary(compressedBuffer, 'fabrics');

// 3. Update fabric
await updateFabric(fabricId, { image: cloudinaryUrl });
```

## Troubleshooting

**Sharp not found:**
```bash
npm install sharp
```

**Cloudinary configuration errors:**
- Verify environment variables are loaded correctly
- Check that `.env.local` exists and has correct values

**Upload failures:**
- Check Cloudinary API limits
- Verify image files exist and are readable
- Ensure compressed buffer is valid

**Memory issues with large images:**
- Sharp handles large images efficiently
- If issues persist, process images in smaller batches

## Notes

- All local image references should be in `public/Products/` or `public/Fabrics/`
- After successful upload to Cloudinary, local images can be deleted
- Always test scripts on a small subset before running on all images
- Keep backups of original images until upload is confirmed successful

