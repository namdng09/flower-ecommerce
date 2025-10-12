import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchCategories } from '~/store/slices/categorySlice';

interface ListCategoryProps {
  onFilter?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

const ListCategory = ({ onFilter, selectedCategoryId }: ListCategoryProps) => {
  const dispatch = useDispatch();
  const { items: categories, loading } = useAppSelector(
    state => state.categories
  );

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null
  );
  const previousSelectedCategoryId = useRef<string | null>(undefined);

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, loading]);

  // Auto expand và trigger filter khi selectedCategoryId thay đổi
  useEffect(() => {
    if (
      selectedCategoryId !== previousSelectedCategoryId.current &&
      categories.length > 0
    ) {
      previousSelectedCategoryId.current = selectedCategoryId;

      if (selectedCategoryId) {
        // Tìm parent category của subcategory được selected
        const parentCategory = categories.find(cat =>
          cat.subCategory?.some((sub: any) => sub._id === selectedCategoryId)
        );

        if (parentCategory) {
          setExpandedCategoryId(parentCategory._id);
        }
      }
    }
  }, [selectedCategoryId, categories]);

  const handleToggleExpand = (catId: string) => {
    setExpandedCategoryId(prev => (prev === catId ? null : catId));
  };

  const handleCategoryClick = (categoryId: string | null) => {
    onFilter?.(categoryId);
  };

  const handleParentCategoryClick = (cat: any) => {
    if (cat.subCategory?.length > 0) {
      handleToggleExpand(cat._id);
    } else {
      handleCategoryClick(cat._id);
    }
  };

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div className='flex flex-col gap-2'>
      <button
        className={`px-4 py-2 rounded text-left transition ${
          selectedCategoryId === null
            ? 'bg-rose-500 text-white font-semibold'
            : 'bg-gray-200 hover:bg-rose-400 hover:text-white'
        }`}
        onClick={() => handleCategoryClick(null)}
      >
        Tất cả
      </button>

      {categories.map(cat => (
        <div key={cat._id}>
          {/* cate cha */}
          <div className='flex items-center justify-between'>
            <button
              className={`px-4 py-2 rounded text-left w-full transition ${
                selectedCategoryId === cat._id
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-gray-100 hover:bg-rose-400 hover:text-white'
              }`}
              onClick={() => handleParentCategoryClick(cat)}
            >
              {cat.title}
            </button>

            {cat.subCategory?.length > 0 && (
              <button
                onClick={() => handleToggleExpand(cat._id)}
                className='text-sm text-gray-500 ml-2 p-1 hover:bg-gray-200 rounded'
              >
                {expandedCategoryId === cat._id ? '▲' : '▼'}
              </button>
            )}
          </div>

          {/* cate con */}
          {expandedCategoryId === cat._id && cat.subCategory?.length > 0 && (
            <div className='ml-4 mt-1'>
              {cat.subCategory.map((sub: any) => (
                <button
                  key={sub._id}
                  className={`px-4 py-2 rounded text-left w-full transition mb-1 ${
                    selectedCategoryId === sub._id
                      ? 'bg-rose-400 text-white font-semibold'
                      : 'bg-gray-50 hover:bg-rose-300 hover:text-white'
                  }`}
                  onClick={() => handleCategoryClick(sub._id)}
                >
                  └ {sub.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListCategory;
