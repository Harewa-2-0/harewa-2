'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ReactNode } from 'react';
import { PageSpinner } from '../../../components/Spinner';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  expandable?: boolean;
  expandedRows?: Set<string | number>;
  onToggleExpand?: (id: string | number) => void;
  expandableContent?: (item: T) => ReactNode;
  getRowId?: (item: T) => string | number;
  // Pagination props
  pagination?: PaginationProps;
  showPagination?: boolean;
}

export default function DataTable<T = any>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  rowClassName,
  expandable = false,
  expandedRows = new Set(),
  onToggleExpand,
  expandableContent,
  getRowId = (item: T) => (item as any).id || (item as any).key || Math.random(),
  pagination,
  showPagination = true
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <PageSpinner className="h-64" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const CustomSelect = ({ value, onChange, options, className = "" }: {
    value: number;
    onChange: (value: number) => void;
    options: number[];
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`relative ${className}`} ref={selectRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-8 py-1 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm min-w-[80px]"
        >
          <span className="block truncate text-gray-900">{value}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 bottom-full mb-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`${
                  option === value
                    ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'text-gray-900'
                } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 transition-colors w-full text-left`}
              >
                <span className="block truncate font-normal">{option}</span>
                {option === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    //console.log('DataTable renderPagination:', { showPagination, pagination });
    if (!showPagination || !pagination) return null;

    const { currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange, showItemsPerPage = true, itemsPerPageOptions = [10, 25, 50, 100] } = pagination;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
            {showItemsPerPage && onItemsPerPageChange && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">
                  Show:
                </label>
                <CustomSelect
                  value={itemsPerPage}
                  onChange={onItemsPerPageChange}
                  options={itemsPerPageOptions}
                />
              </div>
            )}
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getVisiblePages().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page as number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-[#D4AF37] border-[#D4AF37] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {expandable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  {/* Empty header for expand button */}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.headerClassName || ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const rowId = getRowId(item);
              const isExpanded = expandedRows.has(rowId);
              const customRowClassName = rowClassName ? rowClassName(item, index) : '';
              
              return (
                <React.Fragment key={rowId}>
                  <tr
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${customRowClassName}`}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {expandable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand?.(rowId);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                      >
                        {column.render ? column.render(item, index) : (item as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                  {expandable && isExpanded && expandableContent && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-4 bg-gray-50">
                        {expandableContent(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}
