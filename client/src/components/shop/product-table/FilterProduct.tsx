import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filterProducts } from '~/store/slices/productSlice';
import { fetchCategories } from '~/store/slices/categorySlice';
import { RootState } from '~/store';
import { useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const filterSchema = z.object({
  title: z.string(),
  status: z.string(),
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc']),
  category: z.string().optional()
});
type FilterFormData = z.infer<typeof filterSchema>;

const FilterProduct: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  );

  const [page, setPage] = useState(() =>
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [limit, setLimit] = useState(() =>
    parseInt(searchParams.get('limit') || '10', 10)
  );

  // Danh mục cha và con
  const parentCategories = categories.filter((cat: any) => !cat.parentId);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        title: searchParams.get('title') || '',
        status: searchParams.get('status') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        category: searchParams.get('category') || ''
      }
    });

  // Đồng bộ state với URL params
  useEffect(() => {
    setValue('title', searchParams.get('title') || '');
    setValue('status', searchParams.get('status') || '');
    setValue('sortBy', searchParams.get('sortBy') || 'createdAt');
    setValue(
      'sortOrder',
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );
    setValue('category', searchParams.get('category') || '');
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setLimit(parseInt(searchParams.get('limit') || '10', 10));
    // Đồng bộ selectedSubs với category param
    const catParam = searchParams.get('category');
    setSelectedSubs(catParam ? catParam.split(',') : []);
  }, [searchParams, setValue]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const currentFilters = watch();
    const filters = {
      ...currentFilters,
      page,
      limit,
      category: selectedSubs.length > 0 ? selectedSubs.join(',') : undefined
    };
    dispatch(filterProducts(filters));
  }, [searchParams, dispatch, page, limit, watch, selectedSubs]);

  const updateURLParams = (
    filters: FilterFormData,
    currentPage: number,
    currentLimit: number
  ) => {
    const params = new URLSearchParams();
    if (filters.title) params.set('title', filters.title);
    if (filters.status) params.set('status', filters.status);
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc')
      params.set('sortOrder', filters.sortOrder);
    if (selectedSubs.length > 0) params.set('category', selectedSubs.join(','));
    else params.delete('category');
    if (currentPage !== 1) params.set('page', currentPage.toString());
    params.set('limit', currentLimit.toString());
    setSearchParams(params);
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    if (parentId && !selectedParents.includes(parentId)) {
      setSelectedParents(prev => [...prev, parentId]);
    }
  };

  const handleSubChange = (
    parentId: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const subId = e.target.value;
    if (subId && !selectedSubs.includes(subId)) {
      setSelectedSubs(prev => [...prev, subId]);
    }
  };

  const removeSubCategory = (subId: string) => {
    setSelectedSubs(prev => prev.filter(id => id !== subId));
  };

  const onSubmit = (data: FilterFormData) => {
    setPage(1);
    updateURLParams(data, 1, limit);
  };

  const handleResetFilters = () => {
    reset({
      title: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      category: ''
    });
    setSelectedParents([]);
    setSelectedSubs([]);
    setPage(1);
    updateURLParams(
      {
        title: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        category: ''
      },
      1,
      limit
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white shadow-md rounded-md'
    >
      {/* Tên sản phẩm */}
      <div>
        <label className='block text-sm font-medium mb-1'>Tên sản phẩm</label>
        <input
          type='text'
          {...register('title')}
          placeholder='Nhập tên sản phẩm'
          className='w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Nhóm danh mục */}
      <div>
        <label className='block text-sm font-medium mb-1'>Nhóm danh mục</label>
        <select
          value=''
          onChange={handleParentChange}
          className='w-full border px-3 py-2 rounded'
        >
          <option value=''>-- Chọn nhóm danh mục --</option>
          {parentCategories
            .filter((cat: any) => !selectedParents.includes(cat._id))
            .map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
        </select>
      </div>

      {/* Trạng thái */}
      <div>
        <label className='block text-sm font-medium mb-1'>Trạng thái</label>
        <select
          {...register('status')}
          className='w-full border px-3 py-2 rounded'
        >
          <option value=''>Tất cả</option>
          <option value='active'>Hiện</option>
          <option value='inactive'>Ẩn</option>
        </select>
      </div>

      {/* Danh mục con theo từng nhóm đã chọn */}
      {selectedParents.map(parentId => {
        const parent = parentCategories.find(
          (cat: any) => cat._id === parentId
        );
        const subCategories = parent?.subCategory || [];
        return (
          <div key={parentId}>
            <label className='block text-sm font-medium mb-1'>
              Danh mục con - {parent?.title}
            </label>
            <select
              value=''
              onChange={e => handleSubChange(parentId, e)}
              className='w-full border px-3 py-2 rounded'
            >
              <option value=''>-- Chọn danh mục con --</option>
              {subCategories
                .filter((sub: any) => !selectedSubs.includes(sub._id))
                .map((sub: any) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.title}
                  </option>
                ))}
            </select>
            {/* Danh mục con đã chọn */}
            {subCategories.some((s: any) => selectedSubs.includes(s._id)) && (
              <div className='mt-2 flex flex-wrap gap-2'>
                {subCategories
                  .filter((sub: any) => selectedSubs.includes(sub._id))
                  .map((sub: any) => (
                    <span
                      key={sub._id}
                      className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center'
                    >
                      {sub.title}
                      <button
                        type='button'
                        onClick={() => removeSubCategory(sub._id)}
                        className='ml-2 text-blue-600 hover:text-red-600 font-bold'
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Sắp xếp */}
      <div className='flex gap-2 items-end'>
        <div className='flex-1'>
          <label className='block text-sm font-medium mb-1'>Sắp xếp theo</label>
          <select
            {...register('sortBy')}
            className='w-full border px-3 py-2 rounded'
          >
            <option value='createdAt'>Ngày tạo</option>
            <option value='title'>Tên sản phẩm</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1 invisible'>
            Thứ tự
          </label>
          <select
            {...register('sortOrder')}
            className='border px-3 py-2 rounded'
          >
            <option value='desc'>Giảm dần</option>
            <option value='asc'>Tăng dần</option>
          </select>
        </div>
      </div>

      {/* Nút lọc */}
      <div className='col-span-full text-right'>
        <button
          type='submit'
          className='bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition'
        >
          Lọc
        </button>
        <button
          type='button'
          onClick={handleResetFilters}
          className='ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-md transition'
        >
          Đặt lại
        </button>
      </div>
    </form>
  );
};
export default FilterProduct;
