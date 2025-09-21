import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface ProductFilterProps {
  onFilter: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

const ProductFilter = ({
  onFilter,
  placeholder = 'Tìm kiếm sản phẩm...',
  className = ''
}: ProductFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term để tránh gọi API quá nhiều lần
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gọi onFilter khi debouncedTerm thay đổi
  useEffect(() => {
    onFilter(debouncedTerm);
  }, [debouncedTerm, onFilter]);

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedTerm(searchTerm);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className='relative'>
        <div className='relative flex items-center'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors'
          />
          {searchTerm && (
            <button
              type='button'
              onClick={handleClear}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          )}
        </div>
      </form>

      {/* Hiển thị trạng thái tìm kiếm */}
      {debouncedTerm && (
        <div className='mt-2 text-sm text-gray-600'>
          Đang tìm kiếm:{' '}
          <span className='font-medium text-pink-600'>"{debouncedTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
