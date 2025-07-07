interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
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
    <div className='join text-black'>
      <button
        className={`join-item btn btn-outline ${
          page === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
        onClick={() => page !== 1 && setPage(1)}
        title='Go to first page'
      >
        First
      </button>

      <button
        className={`join-item btn btn-outline ${
          page === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
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
          } ${pageNum === '...' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
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
  );
};

export default Pagination;
