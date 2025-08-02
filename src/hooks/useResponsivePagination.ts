import { useEffect, useState } from 'react';

export function useResponsivePagination<T>(items: T[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  useEffect(() => {
    function handleResize() {
      setItemsPerPage(window.innerWidth < 1024 ? 8 : 16);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
  };
} 