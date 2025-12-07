// src/components/Public_C/fabrics_gallery/types.ts
import { type Fabric } from '@/services/fabric';

export interface FabricsGalleryProps {
  fabrics?: Fabric[];
  isLoading?: boolean;
  initialFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export type { Fabric };

