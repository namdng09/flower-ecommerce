import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  filterProducts,
  fetchProductsByShop
} from '~/store/slices/productSlice';
import { fetchCategories } from '~/store/slices/categorySlice';
import { AuthContext } from '~/contexts/authContext';
import { RootState } from '~/store';

interface FilterProductProps {
  onFilter?: () => void;
  onReset?: () => void;
}

const FilterProduct: React.FC<FilterProductProps> = ({ onFilter, onReset }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>('');

  // Lấy categories từ store
  const { items: categories = [] } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // Lấy danh mục con của danh mục cha đã chọn
  const subCategories =
    categories.find((cat: any) => cat._id === selectedCategoryId)
      ?.subCategory || [];

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      filterProducts({
        title: title.trim(),
        shop: user?.id,
        category: selectedSubCategoryId || selectedCategoryId || undefined
      })
    );
    onFilter?.();
  };

  const handleResetFilters = () => {
    setTitle('');
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    if (user?.id) {
      dispatch(fetchProductsByShop(user.id));
    }
    onReset?.();
  };

  return (
    <form
      onSubmit={handleFilter}
      className='flex gap-4 items-end p-4 bg-white shadow-md rounded-md'
    >
      <div className='flex-1'>
        <label className='block text-sm font-medium mb-1'>Tên sản phẩm</label>
        <input
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Nhập tên sản phẩm'
          className='w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>
      <div>
        <label className='block text-sm font-medium mb-1'>Danh mục</label>
        <select
          value={selectedCategoryId}
          onChange={e => {
            setSelectedCategoryId(e.target.value);
            setSelectedSubCategoryId('');
          }}
          className='border px-3 py-2 rounded min-w-[160px]'
        >
          <option value=''>-- Tất cả danh mục --</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>
      {selectedCategoryId && subCategories.length > 0 && (
        <div>
          <label className='block text-sm font-medium mb-1'>Danh mục con</label>
          <select
            value={selectedSubCategoryId}
            onChange={e => setSelectedSubCategoryId(e.target.value)}
            className='border px-3 py-2 rounded min-w-[160px]'
          >
            <option value=''>-- Tất cả danh mục con --</option>
            {subCategories.map((sub: any) => (
              <option key={sub._id} value={sub._id}>
                {sub.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type='submit'
        className='bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition'
      >
        Lọc
      </button>
      <button
        type='button'
        onClick={handleResetFilters}
        className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-md transition'
      >
        Đặt lại
      </button>
    </form>
  );
};

export default FilterProduct;
