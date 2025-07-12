import { useEffect, useState } from 'react';
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

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleToggleExpand = (catId: string) => {
    setExpandedCategoryId(prev => (prev === catId ? null : catId));
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
        onClick={() => onFilter?.(null)}
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
              // onClick={() => onFilter?.(cat._id)}
            >
              {cat.title}
            </button>

            {cat.subCategory?.length > 0 && (
              <button
                onClick={() => handleToggleExpand(cat._id)}
                className='text-sm text-gray-500 ml-2'
              >
                {expandedCategoryId === cat._id ? '▲' : '▼'}
              </button>
            )}
          </div>

          {/* cate con */}
          {expandedCategoryId === cat._id && cat.subCategory?.length > 0 && (
            <div className='ml-4'>
              {cat.subCategory.map((sub: any) => (
                <button
                  key={sub._id}
                  className={`px-4 py-2 rounded text-left w-full transition ${
                    selectedCategoryId === sub._id
                      ? 'bg-rose-400 text-white font-semibold'
                      : 'bg-gray-50 hover:bg-rose-300 hover:text-white'
                  }`}
                  onClick={() => onFilter?.(sub._id)}
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
