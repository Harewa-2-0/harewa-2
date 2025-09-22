export type FormDataPayload = {
  name: string;
  description: string;
  price: string;
  quantity: string;
  remainingInStock: string;
  location: string;
  category: string;
  fabricType: string;
  sizes: string[];
  gender: 'male' | 'female' | 'unisex';
  images: File[];
};

export type BackendProductPayload = {
  name: string;
  description: string;
  price: string;
  quantity: string;
  remainingInStock: string;
  location: string;
  images: string[];
  sizes: string[];
  gender: 'male' | 'female' | 'unisex';
  category: string;
  fabricType: string;
  seller?: string;
  shop?: string;
};

export interface StepProps {
  formData: FormDataPayload;
  onFormDataChange: (data: Partial<FormDataPayload>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: (data: FormDataPayload) => void;
}

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FormDataPayload) => void;
  onSuccess?: (product?: any) => void; // Accept the created product
}
