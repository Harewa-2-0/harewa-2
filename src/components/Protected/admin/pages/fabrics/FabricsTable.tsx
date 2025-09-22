'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataTable, TableColumn } from '../components/shared';
import EditFabricModal from './EditFabricModal';
import DeleteFabricModal from './DeleteFabricModal';
import { getFabrics, type Fabric as ServiceFabric } from '@/services/fabric';

// Use the service type directly
export type Fabric = ServiceFabric;

interface FabricsTableProps {
  onFabricCountChange?: (count: number) => void;
}

export interface FabricsTableRef {
  refresh: () => void;
  addFabric: (newFabric: Fabric) => void;
}

const FabricsTable = forwardRef<FabricsTableRef, FabricsTableProps>(({ onFabricCountChange }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFabrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFabrics();
      setFabrics(data);
    } catch (err) {
      console.error('Error fetching fabrics:', err);
      setError('Failed to fetch fabrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadFabrics = async () => {
      if (isMounted) {
        await fetchFabrics();
      }
    };
    loadFabrics();
    return () => {
      isMounted = false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchFabrics,
    addFabric: (newFabric: Fabric) => {
      setFabrics(prev => [newFabric, ...prev]);
    }
  }));

  useEffect(() => {
    onFabricCountChange?.(fabrics.length);
  }, [fabrics.length, onFabricCountChange]);

  const totalPages = Math.ceil(Math.max(1, fabrics.length) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFabrics = fabrics.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setShowEditModal(true);
  };

  const handleDelete = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = (updatedFabric: Fabric) => {
    setFabrics(prev => 
      prev.map(f => f._id === updatedFabric._id ? updatedFabric : f)
    );
    setShowEditModal(false);
    setSelectedFabric(null);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns: TableColumn<Fabric>[] = [
    { 
      key: 'fabric', 
      label: 'Fabric', 
      render: (fabric) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {fabric.image ? (
              <img
                src={fabric.image}
                alt={fabric.name}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center ${fabric.image ? 'hidden' : ''}`}
            >
              <span className="text-[#D4AF37] text-sm font-semibold">
                {fabric.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fabric.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {fabric.type} • {fabric.color}
            </p>
          </div>
        </div>
      )
    },
    { 
      key: 'specs', 
      label: 'Specifications', 
      render: (fabric) => (
        <div className="text-sm text-gray-900">
          <div className="font-medium">{fabric.pattern || 'Solid'}</div>
          <div className="text-gray-500">
            {fabric.weight ? `${fabric.weight}g/m²` : 'N/A'} • {fabric.width ? `${fabric.width}cm` : 'N/A'}
          </div>
        </div>
      )
    },
    { 
      key: 'pricing', 
      label: 'Pricing & Stock', 
      render: (fabric) => (
        <div className="text-sm text-gray-900">
          <div className="font-medium">
            {fabric.pricePerMeter ? `₦${fabric.pricePerMeter.toLocaleString()}/m` : 'N/A'}
          </div>
          <div className={`text-xs ${fabric.inStock ? 'text-green-600' : 'text-red-600'}`}>
            {fabric.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
      )
    },
    { 
      key: 'date', 
      label: 'Date', 
      render: (fabric) => (
        <div className="text-sm text-gray-900">{formatDate(fabric.createdAt)}</div>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (fabric) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(fabric); }}
            className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
            title="Edit fabric"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(fabric); }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
            title="Delete fabric"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={paginatedFabrics}
        columns={columns}
        loading={isLoading}
        emptyMessage="No fabrics found"
        getRowId={(item) => item._id as string}
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          totalItems: fabrics.length,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setItemsPerPage,
          showItemsPerPage: true,
          itemsPerPageOptions: [10, 25, 50, 100],
        }}
        showPagination={true}
      />

      {showEditModal && selectedFabric && (
        <EditFabricModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedFabric(null); }}
          fabric={selectedFabric}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && selectedFabric && (
        <DeleteFabricModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedFabric(null); }}
          fabric={selectedFabric}
          onSuccess={(fabricId) => {
            setFabrics(prev => prev.filter(f => f._id !== fabricId));
            setShowDeleteModal(false);
            setSelectedFabric(null);
          }}
        />
      )}
    </>
  );
});

FabricsTable.displayName = 'FabricsTable';

export default FabricsTable;


