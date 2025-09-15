# Add Product Modal Components

This folder contains the modular components for the Add Product Modal functionality.

## Structure

```
Add-product/
├── AddProductModal.tsx      # Main modal component that orchestrates the steps
├── ProductInformationStep.tsx # Step 1: Product information form
├── ImageUploadStep.tsx      # Step 2: Image upload functionality
├── types.ts                 # Shared TypeScript types and interfaces
├── index.ts                 # Clean exports for easy importing
└── README.md               # This documentation
```

## Components

### AddProductModal
The main modal component that:
- Manages the two-step flow
- Handles form state and validation
- Orchestrates navigation between steps
- Manages the modal UI (header, footer, step indicator)

### ProductInformationStep
Handles the first step of product creation:
- Product name and manufacturer
- Category, size, and quantity selection
- Product description
- Form validation for required fields

### ImageUploadStep
Handles the second step of image upload:
- Drag and drop functionality
- File type validation
- Image preview with hover overlays
- Upload progress feedback
- Image deletion functionality

## Usage

```tsx
import { AddProductModal } from './Add-product';

// Or import individual components
import { ProductInformationStep, ImageUploadStep } from './Add-product';
```

## Benefits of Modular Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Individual steps can be reused in other contexts
3. **Testability**: Each component can be tested in isolation
4. **Readability**: Smaller, focused components are easier to understand
5. **Scalability**: Easy to add new steps or modify existing ones
