'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataTable, TableColumn } from '../components/shared';
import EditFabricModal from './EditFabricModal';
import DeleteFabricModal from './DeleteFabricModal';

export interface Fabric {
  _id: string;
  name: string;
  type: string;
  color: string; // human-readable (e.g., "Navy Blue")
  pattern?: string;
  weight?: number; // g/m²
  width?: number; // cm or in, UI can show unit
  composition?: string;
  supplier?: string;
  pricePerMeter?: number; // NGN
  inStock?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface FabricsTableProps {
  onFabricCountChange?: (count: number) => void;
}

export interface FabricsTableRef {
  refresh: () => void;
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

  // Placeholder fetch until wired to API
  const fetchFabrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: replace with real API call when backend is ready
      const now = new Date();
      const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
      const demo: Fabric[] = [
        {
          _id: 'fab_1',
          name: 'Cotton Twill',
          type: 'Cotton',
          color: 'Navy Blue',
          pattern: 'Solid',
          weight: 220,
          width: 150,
          composition: '100% Cotton',
          supplier: 'Fabric Depot Ltd.',
          pricePerMeter: 5990, // represent kobo or plain number? kept as number
          inStock: true,
          createdAt: daysAgo(2),
        },
        {
          _id: 'fab_2',
          name: 'Linen Blend',
          type: 'Linen',
          color: 'Beige',
          pattern: 'Solid',
          weight: 180,
          width: 140,
          composition: '70% Linen, 30% Cotton',
          supplier: 'Textile House',
          pricePerMeter: 8500,
          inStock: true,
          createdAt: daysAgo(5),
        },
        {
          _id: 'fab_3',
          name: 'Silk Charmeuse',
          type: 'Silk',
          color: 'Royal Blue',
          pattern: 'Solid',
          weight: 90,
          width: 114,
          composition: '100% Silk',
          supplier: 'Premium Silks Co.',
          pricePerMeter: 35000,
          inStock: false,
          createdAt: daysAgo(12),
        },
        {
          _id: 'fab_4',
          name: 'Polyester Chiffon',
          type: 'Polyester',
          color: 'Sky Blue',
          pattern: 'Floral',
          weight: 70,
          width: 150,
          composition: '100% Polyester',
          supplier: 'Colors & Prints',
          pricePerMeter: 3000,
          inStock: true,
          createdAt: daysAgo(1),
        },
        {
          _id: 'fab_5',
          name: 'Wool Suiting',
          type: 'Wool',
          color: 'Charcoal',
          pattern: 'Checked',
          weight: 260,
          width: 150,
          composition: '100% Wool',
          supplier: 'Heritage Mills',
          pricePerMeter: 28000,
          inStock: true,
          createdAt: daysAgo(20),
        },
        {
          _id: 'fab_6',
          name: 'Denim',
          type: 'Cotton',
          color: 'Indigo',
          pattern: 'Solid',
          weight: 320,
          width: 150,
          composition: '100% Cotton',
          supplier: 'Denim Works',
          pricePerMeter: 7500,
          inStock: true,
          createdAt: daysAgo(8),
        },
      ];
      setFabrics(demo);
    } catch (err) {
      console.error('Error fetching fabrics:', err);
      setError('Failed to fetch fabrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchFabrics
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

  const handleEditSuccess = (updated: Fabric) => {
    setFabrics(prev => prev.map(f => (f._id === updated._id ? updated : f)));
    setShowEditModal(false);
    setSelectedFabric(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns: TableColumn<Fabric>[] = [
    { key: 'name', label: 'Name', render: (fabric) => (
      <div className="text-sm text-gray-900">{fabric.name}</div>
    )},
    { key: 'type', label: 'Type', render: (fabric) => (
      <div className="text-sm text-gray-900">{fabric.type}</div>
    )},
    { key: 'date', label: 'Date', render: (fabric) => (
      <div className="text-sm text-gray-900">{formatDate(fabric.createdAt)}</div>
    )},
    { key: 'actions', label: 'Actions', render: (fabric) => (
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
    )},
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
        getRowId={(item) => item._id}
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
          onSuccess={(deletedId) => {
            setFabrics(prev => prev.filter(f => f._id !== deletedId));
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


