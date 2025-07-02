import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchCategories } from '~/store/slices/categorySlice'; // Đảm bảo bạn đã tạo slice này

interface ListCategoryProps {
  onFilter?: (categoryId: string | null) => void;
}

const ListCategory = ({ onFilter }: ListCategoryProps) => {
  const dispatch = useDispatch();
  const { items: categories, loading } = useAppSelector(
    state => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div className='flex flex-col gap-2'>
      <button
        className='px-4 py-2 bg-gray-200 rounded hover:bg-rose-400 hover:text-white transition'
        onClick={() => onFilter && onFilter(null)}
      >
        Tất cả
      </button>
      {categories.map(cat => (
        <button
          key={cat._id}
          className='px-4 py-2 bg-gray-100 hover:bg-rose-400 hover:text-white rounded text-left transition'
          onClick={() => onFilter && onFilter(cat._id)}
        >
          {cat.title}
        </button>
      ))}
    </div>
  );
};

export default ListCategory;
