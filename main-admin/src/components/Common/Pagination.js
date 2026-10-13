import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import './Pagination.css';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  hasMore = false,
  isLoadingMore = false,
  onPageChange
}) {
  if (!totalItems || totalItems <= 0) return null;

  const loadedPages = Math.ceil(totalItems / pageSize) || 1;
  const totalPages = hasMore ? Math.max(loadedPages + 1, currentPage + 1) : loadedPages;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const isNextDisabled = !hasMore && currentPage >= loadedPages;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}{hasMore ? '+' : ''}</strong> entries
        {isLoadingMore && (
          <span style={{ marginLeft: 8, fontSize: '0.78rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Loader2 size={13} className="button-loader" />
            <span>Loading next page...</span>
          </span>
        )}
      </div>

      {(totalPages > 1 || hasMore) && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage <= 1 || isLoadingMore}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>;
            }
            return (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                disabled={isLoadingMore}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-btn"
            disabled={isNextDisabled || isLoadingMore}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
