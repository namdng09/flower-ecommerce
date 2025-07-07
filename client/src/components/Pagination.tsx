interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  limit?: number;
  setLimit?: (limit: number) => void;
  totalItems?: number;
}

const Pagination = ({
  page,
  setPage,
  totalPages,
  limit = 2,
  setLimit,
  totalItems
}: PaginationProps) => {
  const getVisiblePages = () => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (page > 3) {
      pages.push('...');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    if (page < totalPages - 2) {
      pages.push('...');
    }
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className='flex flex-col lg:flex-row items-center gap-4'>
      {/* Items per page selector */}
      {setLimit && (
        <div className='flex items-center gap-2 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>Items per page:</span>
          <select
            className='select select-bordered select-sm min-w-16'
            value={limit}
            onChange={e => {
              const newLimit = parseInt(e.target.value);
              if (setLimit) {
                setLimit(newLimit);
              }
            }}
          >
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}

      {totalItems && (
        <div className='text-sm text-gray-600'>
          Showing {Math.min((page - 1) * limit + 1, totalItems)} to{' '}
          {Math.min(page * limit, totalItems)} of {totalItems} items
        </div>
      )}

      {/* Pagination buttons */}
      <div className='join text-black'>
        <button
          className={`join-item btn btn-outline ${
            page === 1
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : ''
          }`}
          onClick={() => page !== 1 && setPage(1)}
          title='Go to first page'
        >
          First
        </button>

        <button
          className={`join-item btn btn-outline ${
            page === 1
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : ''
          }`}
          onClick={() => page !== 1 && setPage(page - 1)}
          title='Go to previous page'
        >
          Prev
        </button>

        {getVisiblePages().map((pageNum, index) => (
          <button
            key={`${pageNum}-${index}`}
            className={`join-item btn btn-outline ${
              pageNum === page ? 'btn-active' : ''
            } ${
              pageNum === '...'
                ? 'opacity-50 cursor-not-allowed pointer-events-none'
                : ''
            }`}
            onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
            title={pageNum === '...' ? 'More pages' : `Go to page ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}

        <button
          className={`join-item btn btn-outline ${
            page === totalPages
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : ''
          }`}
          onClick={() => page !== totalPages && setPage(page + 1)}
          title='Go to next page'
        >
          Next
        </button>

        <button
          className={`join-item btn btn-outline ${
            page === totalPages
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : ''
          }`}
          title='Go to last page'
          onClick={() => page !== totalPages && setPage(totalPages)}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;
