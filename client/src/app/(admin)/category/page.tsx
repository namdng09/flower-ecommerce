import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiTrash2, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { fetchCategories, resetCategories } from '~/store/slices/categorySlice';
import { ConfirmModal } from '~/components/ConfirmModal';
import Pagination from '~/components/Pagination';
import type { RootState } from '~/store';
import { Link, useNavigate } from 'react-router';
import DynamicTable from '~/components/DynamicTable';

const CategoryPage = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const {
    items: categories,
    loading,
    error
  } = useSelector((state: RootState) => state.categories);

  const [expanded, setExpanded] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalItems = categories.filter(c => !c.parentId).length;
  const totalPages = Math.ceil(totalItems / limit);
  const parentCategories = categories
    .filter(c => !c.parentId)
    .slice((page - 1) * limit, page * limit);

  useEffect(() => {
    dispatch(fetchCategories());
    return () => dispatch(resetCategories());
  }, [dispatch]);

  const handleToggle = (id: string) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const confirmDelete = () => {
    if (selectedId) {
      // dispatch(deleteCategory(selectedId));
      setSelectedId(null);
    }
  };

  const rows = parentCategories.flatMap((cat: any) => {
    const baseRow = {
      ...cat,
      _isParent: true,
      _id: cat._id
    };
    if (!expanded.includes(cat._id)) return [baseRow];

    const children = (cat.subCategory || []).map((sub: any) => ({
      ...sub,
      _parentTitle: cat.title,
      _id: sub._id,
      _isChild: true
    }));

    return [baseRow, ...children];
  });

  const columns = [
    {
      accessorKey: '_id',
      header: '',
      render: (_: any, row: any) => {
        if (row._isParent && row.subCategory?.length > 0) {
          const isExpanded = expanded.includes(row._id);
          return (
            <button
              onClick={() => handleToggle(row._id)}
              className='text-gray-600'
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>
          );
        }
        return null;
      }
    },
    {
      accessorKey: 'image',
      header: 'Image',
      render: (v: string, row: any) =>
        row._isChild ? null : (
          <img
            src={v}
            alt='category'
            className='w-12 h-12 rounded border object-cover'
          />
        )
    },
    {
      accessorKey: 'title',
      header: 'Title & Description',
      render: (_: any, row: any) => (
        <div className='space-y-1'>
          <div className={`font-medium ${row._isChild ? 'pl-4' : ''}`}>
            {row._isChild && '↳ '}
            {row.title}
            {!row.parentId && (
              <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                Root
              </span>
            )}
          </div>
          <div className='text-xs text-gray-500 max-w-[350px]'>
            {row.description}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'parentId',
      header: 'Parent',
      render: (_: any, row: any) => (
        <span className='text-sm italic text-gray-500'>
          {row._isChild ? `Child of ${row._parentTitle}` : '—'}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      render: (v: string) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            v === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {v}
        </span>
      )
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      render: (_: any, row: any) =>
        row._isParent ? (
          <div className='flex gap-2 justify-center text-gray-500'>
            <Link to={`/admin/category/${row._id}`}>
              <FiEye className='hover:text-blue-600' />
            </Link>
            <button
              onClick={() => {
                setSelectedId(row._id);
                setShowConfirm(true);
              }}
            >
              <FiTrash2 className='hover:text-red-600' />
            </button>
          </div>
        ) : (
          <span className='text-xs text-gray-400 text-center block'>–</span>
        )
    }
  ];

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-bold'>Categories</h1>
        <div className='flex gap-2'>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-100'>
            Filter
          </button>
          <button
            onClick={() => navigate('/admin/category/create')}
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
        <DynamicTable data={rows} columns={columns} />
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
