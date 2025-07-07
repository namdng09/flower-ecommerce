import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { fetchCategories, resetCategories } from '~/store/slices/categorySlice';
import type { RootState } from '~/store';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Link, useNavigate } from 'react-router';

const CategoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const {
    items: categories,
    loading,
    error
  } = useSelector((state: RootState) => state.categories);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / limit);

  const handleToggleExpand = (id: string) => {
    setExpandedRowIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      // dispatch(deleteCategory(selectedId));
      setSelectedId(null);
    }
  };

  const handleCreate = () => {
    navigate('/admin/category/create');
  };

  useEffect(() => {
    dispatch(fetchCategories());
    return () => dispatch(resetCategories());
  }, [dispatch]);

  const renderCategoryRow = (category: any) => {
    const isExpanded = expandedRowIds.includes(category._id);
    const subCategories = category.subCategory || [];

    return (
      <tbody key={category._id} className='border-b'>
        <tr className='hover:bg-gray-50'>
          <td className='py-3 px-4 w-6 text-center'>
            {subCategories.length > 0 && (
              <button onClick={() => handleToggleExpand(category._id)}>
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            )}
          </td>
          <td className='py-3 px-4'>
            <img
              src={category.image}
              alt={category.title}
              className='w-14 h-14 object-cover rounded border'
            />
          </td>
          <td className='py-3 px-4'>
            <div className='font-semibold text-gray-800 flex items-center gap-2'>
              {category.title}
              {!category.parentId && (
                <span className='text-[11px] px-2 py-[2px] rounded-full bg-blue-100 text-blue-700'>
                  Root
                </span>
              )}
            </div>
            <div className='text-sm text-gray-600 max-w-[300px]'>
              {category.description}
            </div>
          </td>
          <td className='py-3 px-4 text-sm italic text-gray-500'>
            {category.parentId
              ? categories.find(c => c._id === category.parentId)?.title || '—'
              : '—'}
          </td>
          <td className='py-3 px-4'>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                category.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category.status}
            </span>
          </td>
          <td className='py-3 px-4 text-center'>
            <div className='flex gap-2 justify-center text-gray-500'>
              <Link to={`/admin/category/${category._id}`} title='View'>
                <FiEye
                  size={16}
                  className='hover:text-blue-600 cursor-pointer'
                />
              </Link>
              <button
                title='Delete'
                onClick={() => handleDelete(category._id)}
                className='hover:text-red-600'
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </td>
        </tr>

        {isExpanded &&
          subCategories.map((sub: any) => (
            <tr key={sub._id} className='bg-gray-50'>
              <td className='py-2 px-4'></td>
              <td className='py-2 px-4'></td>
              <td className='py-2 px-4'>
                <div className='text-sm text-gray-700 font-medium'>
                  ↳ {sub.title}
                </div>
                <div className='text-xs text-gray-500'>{sub.description}</div>
              </td>
              <td className='py-2 px-4 text-xs italic text-gray-500'>
                Child of {category.title}
              </td>
              <td className='py-2 px-4'>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    sub.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {sub.status}
                </span>
              </td>
              <td className='py-2 px-4 text-xs text-gray-400 text-center'>–</td>
            </tr>
          ))}
      </tbody>
    );
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-bold'>Categories</h1>
        <div className='flex gap-2'>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-100'>
            Filter
          </button>
          <button
            onClick={handleCreate}
            className='bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600'
          >
            + Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <div className='overflow-auto'>
          <table className='w-full table-auto text-sm'>
            <thead>
              <tr className='bg-gray-100 text-left'>
                <th className='py-2 px-4 w-6'></th>
                <th className='py-2 px-4'>Image</th>
                <th className='py-2 px-4'>Title & Description</th>
                <th className='py-2 px-4'>Parent</th>
                <th className='py-2 px-4'>Status</th>
                <th className='py-2 px-4 text-center'>Actions</th>
              </tr>
            </thead>
            {categories
              .filter(c => !c.parentId)
              .slice((page - 1) * limit, page * limit)
              .map(renderCategoryRow)}
          </table>
        </div>
      )}

      <div className='mt-6'>
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
        />
      </div>

      <ConfirmModal
        show={showConfirm}
        setShow={setShowConfirm}
        title='Delete Category'
        message='Are you sure you want to delete this category?'
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CategoryPage;
