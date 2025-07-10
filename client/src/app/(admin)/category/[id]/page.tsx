import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '~/store';
import { fetchCategories } from '~/store/slices/categorySlice';
import { FiArrowLeft } from 'react-icons/fi';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<any>();
  const { items: categories, loading } = useSelector(
    (state: RootState) => state.categories
  );
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0) {
      const found = categories.find(c => c._id === id);
      if (found) {
        setCategory(found);
      }
    }
  }, [categories, id]);

  if (loading || !category) {
    return <div className='p-6'>Loading category details...</div>;
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2 text-blue-600 hover:underline'>
          <Link
            to='/admin/category'
            className='inline-flex items-center gap-2 px-4 py-2 rounded-md border border-green-600 bg-white text-gray-700 text-sm hover:bg-gray-100 transition duration-200 shadow-sm'
          >
            <FiArrowLeft className='text-lg' />
            Back
          </Link>
        </div>
      </div>

      <h1 className='text-2xl font-bold mb-4'>{category.title}</h1>

      <div className='flex gap-6 mb-6'>
        {category.image && (
          <img
            src={category.image}
            alt={category.title}
            className='w-52 h-52 object-cover rounded-lg border'
          />
        )}
        <div className='flex-1 space-y-3'>
          <div>
            <span className='font-semibold text-gray-700'>Description: </span>
            <p className='text-sm text-gray-600'>
              {category.description || '—'}
            </p>
          </div>
          <div>
            <span className='font-semibold text-gray-700'>Status: </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                category.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category.status}
            </span>
          </div>
        </div>
      </div>

      {category.subCategory?.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold mb-2'>Subcategories:</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {category.subCategory.map((sub: any) => (
              <div
                key={sub._id}
                className='p-4 border rounded shadow-sm bg-gray-50 hover:shadow transition'
              >
                <div className='font-medium text-gray-800'>{sub.title}</div>
                <div className='text-sm text-gray-500'>{sub.description}</div>
                <div className='mt-2 text-xs text-gray-500 italic'>
                  Status:{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
