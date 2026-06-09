import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { type Fabric } from '@/services/fabric';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import {
  formatFabricBundlePrice,
  isFabricOutOfStock,
  isFabricPurchasable,
  isFabricSellable,
} from '@/utils/fabricDisplay';

interface FabricShopCardProps {
  fabric: Fabric;
}

const FabricShopCard: React.FC<FabricShopCardProps> = ({ fabric }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const { addFabricToCart } = useAuthAwareCartActions();
  const { addToast } = useToast();
  const sellable = isFabricSellable(fabric);
  const outOfStock = isFabricOutOfStock(fabric);
  const purchasable = isFabricPurchasable(fabric);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!purchasable || isAdding) return;

    setIsAdding(true);
    try {
      await addFabricToCart({
        id: fabric._id,
        quantity: 1,
        price: fabric.bundlePrice,
        name: fabric.name,
        image: fabric.image,
        yardBundle: fabric.yardBundle,
      });
      addToast(`Added ${fabric.name} bundle to cart`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add fabric to cart';
      addToast(message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/fabrics/${fabric._id}`} className="block w-full cursor-pointer">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={fabric.image || '/placeholder-fabric.jpg'}
            alt={fabric.name}
            className="w-full h-36 sm:h-40 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder-fabric.jpg')) {
                target.src = '/placeholder-fabric.jpg';
              }
            }}
          />
          {purchasable ? (
            <span className="absolute top-3 right-3 rounded-full bg-[#D4AF37] text-white text-xs font-semibold px-2.5 py-1 shadow-md">
              {fabric.yardBundle} yd
            </span>
          ) : outOfStock ? (
            <span className="absolute top-3 right-3 rounded-full bg-gray-900/85 text-white text-xs font-semibold px-2.5 py-1 shadow-md">
              Out of stock
            </span>
          ) : null}
        </div>

        <div className="p-2.5">
          <h4 className="text-sm text-gray-800 mb-1 line-clamp-2">{fabric.name}</h4>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${outOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
              {sellable ? formatFabricBundlePrice(fabric) : 'Gallery item'}
            </span>
            {sellable && (
              <button
                onClick={handleAdd}
                disabled={isAdding || outOfStock}
                type="button"
                className={`p-2 transition-all duration-200 rounded-full ${
                  isAdding || outOfStock
                    ? 'bg-gray-100 cursor-not-allowed opacity-60 text-gray-400'
                    : 'text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer'
                }`}
                aria-label={
                  outOfStock
                    ? 'Out of stock'
                    : isAdding
                      ? 'Adding to cart...'
                      : 'Add fabric bundle to cart'
                }
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {outOfStock
              ? 'Out of stock'
              : purchasable
                ? 'Material only, not customization'
                : 'Not currently sellable'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default FabricShopCard;
