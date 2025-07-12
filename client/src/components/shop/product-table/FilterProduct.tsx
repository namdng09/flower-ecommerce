import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  filterProducts,
  fetchProductsByShop
} from '~/store/slices/productSlice';
import { AuthContext } from '~/contexts/authContext';

interface FilterProductProps {
  onFilter?: () => void;
  onReset?: () => void;
}

const FilterProduct: React.FC<FilterProductProps> = ({ onFilter, onReset }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');

  // Nếu có filter category/subCategory thì thêm state ở đây

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      filterProducts({
        title: title.trim(),
        shop: user?.id // Đổi thành shop để BE nhận đúng
        // category: selectedCategoryId,
        // subCategory: selectedSubCategoryIds,
      })
    );
    onFilter?.();
  };

  const handleResetFilters = () => {
    setTitle('');
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
