import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByShop, deleteProduct } from '~/store/slices/productSlice';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { RootState } from '~/store';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate } from 'react-router';

import React from 'react';

const ProductTableDisplay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items = [],
    loading,
    error
  } = useSelector((state: RootState) => state.products);
  const { user } = useContext(AuthContext);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedItems = items.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (user?.role === 'shop' && user.id) {
      dispatch(fetchProductsByShop(user.id));
    }
  }, [dispatch, user]);

  if (!user || user.role !== 'shop' || !user.id) {
    return (
      <p className='text-red-500'>
        Bạn không có quyền truy cập vào sản phẩm này.
      </p>
    );
  }

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  // SỬA: chỉ cần dispatch deleteProduct, không cần fetch lại danh sách
  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await dispatch(deleteProduct(selectedId)).unwrap();
      } catch (err) {
        // Xử lý lỗi nếu cần
      }
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Product',
      render: (_: any, row: any) => (
        <div className='flex items-center gap-3'>
          <img
            src={row.thumbnailImage || '/placeholder.png'}
            alt={row.title}
            className='w-10 h-10 rounded object-cover border'
          />
          <div>
            <div className='text-green-700 font-semibold'>{row.title}</div>
            <div className='text-gray-400 text-xs'>{row.description}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'skuCode',
      header: 'SKU'
    },
    {
      accessorKey: 'variants',
      header: 'Variants',
      render: (value: any[]) => (
        <span className='text-xs text-gray-600'>
          {Array.isArray(value) ? `${value.length} variants` : '0 variant'}
        </span>
      )
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      render: (value: any[]) => (
        <div className='flex flex-wrap gap-1'>
          {value?.map((cat, idx) => (
            <span
              key={idx}
              className='bg-gray-100 text-xs px-2 py-[2px] rounded-full text-gray-700'
            >
              {cat.title}
            </span>
          ))}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      render: (v: string) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            v === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {v === 'active' ? '✔' : '✖'} {v}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      render: (v: string) => new Date(v).toLocaleString()
    },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (_: any, row: any) => (
        <div className='flex gap-2 justify-center text-gray-500'>
          <button
            title='Edit'
            className='hover:text-blue-600'
            onClick={() => navigate(`/shop/product/update/${row._id}`)}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            title='Delete'
            onClick={() => handleDelete(row._id)}
            className='hover:text-red-600'
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex justify-between items-start mb-6 flex-col sm:flex-row sm:items-center'>
        <div>
          {user && (
            <div className='text-gray-500 text-sm mb-1'>
              👤 Shop:{' '}
              <span className='font-semibold text-green-700'>
                {user.fullName || user.email}
              </span>
            </div>
          )}
          <h1 className='text-xl font-bold'>Sản phẩm của shop</h1>
        </div>
        <div className='flex gap-2 mt-2 sm:mt-0'>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-100'>
            Filter
          </button>
          <button
            className='bg-green-500 text-white px-4 py-2 text-sm rounded hover:bg-green-600'
            onClick={() => navigate('/shop/product/create')}
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        
        <DynamicTable data={paginatedItems} columns={columns} />
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
        title='Xóa Sản Phẩm'
        message='Bạn có chắc chắn muốn xóa sản phẩm này không?'
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProductTableDisplay;