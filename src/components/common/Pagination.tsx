import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
}

/**
 * Reusable, dynamic Pagination Component
 * Displays exact item counts (e.g., "Showing 1 to 8 of 8 results"),
 * page navigation buttons, and page size selection.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Compute exact range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array (up to 5 page numbers around current page)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: 'var(--omt-color-surface, #ffffff)',
        borderTop: '1px solid var(--omt-color-border, #ebe8f3)',
        fontSize: 12,
        color: 'var(--omt-color-text-muted, #6b7280)',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
      }}
    >
      {/* Left side: Exact range results text */}
      <div>
        {totalItems === 0 ? (
          <span>Showing 0 results</span>
        ) : (
          <span>
            Showing <strong style={{ color: 'var(--omt-color-text-main)' }}>{startItem}</strong> to{' '}
            <strong style={{ color: 'var(--omt-color-text-main)' }}>{endItem}</strong> of{' '}
            <strong style={{ color: 'var(--omt-color-text-main)' }}>{totalItems}</strong> results
          </span>
        )}
      </div>

      {/* Right side: Page navigation controls & Page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid var(--omt-color-border, #e5e7eb)',
              backgroundColor: 'transparent',
              color: currentPage <= 1 ? '#9ca3af' : 'var(--omt-color-text-main, #374151)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.4 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <RiArrowLeftSLine size={16} />
          </button>

          {/* Page Number Buttons */}
          {pages.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 4,
                  border: isActive ? 'none' : '1px solid var(--omt-color-border, #e5e7eb)',
                  backgroundColor: isActive ? '#8633f3' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--omt-color-text-main, #374151)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid var(--omt-color-border, #e5e7eb)',
              backgroundColor: 'transparent',
              color: currentPage >= totalPages ? '#9ca3af' : 'var(--omt-color-text-main, #374151)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.4 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <RiArrowRightSLine size={16} />
          </button>
        </div>

        {/* Page size dropdown */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid var(--omt-color-border, #e5e7eb)',
              backgroundColor: 'var(--omt-color-surface, #ffffff)',
              color: 'var(--omt-color-text-muted, #6b7280)',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination;
