import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductsByShop,
  deleteProduct
} from '~/store/slices/productSlice';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { RootState } from '~/store';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate } from 'react-router';
import FilterProduct from './FilterProduct';
import ProductDetailModal from './ProductDetailModal';
import { fetchVariants } from '~/store/slices/variantSlice';

import React from 'react';

const ProductTableDisplay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const {
    items = [],
    shopProducts = [],
    loading,
    error
  } = useSelector((state: RootState) => state.products);
  const [detailProduct, setDetailProduct] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (user?.role === 'shop' && user.id) {
      dispatch(fetchProductsByShop(user.id));
    }
    dispatch(fetchVariants()); // <-- Thêm dòng này để lấy biến thể
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === 'shop' && user.id) {
      dispatch(fetchProductsByShop(user.id));
    }
  }, [dispatch, user]);

  const displayedProducts = isFiltering ? items : shopProducts;
  const totalItems = displayedProducts.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedItems = displayedProducts.slice(
    (page - 1) * limit,
    page * limit
  );

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
      header: 'Sản phẩm',
      render: (_: any, row: any) => (
        <div className='flex items-center gap-3'>
          <img
            src={row.thumbnailImage || '/placeholder.png'}
            alt={row.title}
            className='w-12 h-12 rounded-md object-cover border'
          />
          <div>
            <p className='text-gray-800 font-medium line-clamp-1'>
              {row.title}
            </p>
            <p className='text-gray-400 text-xs line-clamp-2'>
              {row.description}
            </p>
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
      header: 'Phân loại',
      render: (value: any[]) => (
        <span className='text-xs text-gray-600'>
          {Array.isArray(value) ? `${value.length} phân loại` : '0'}
        </span>
      )
    },
    {
      accessorKey: 'categories',
      header: 'Danh mục',
      render: (value: any, row: any) => {
        console.log('categories value:', value, row);
        return (
          <div className='flex flex-wrap gap-1'>
            {Array.isArray(value) && value.length > 0 ? (
              value.map((cat: any, idx: number) => (
                <span
                  key={idx}
                  className='bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium'
                >
                  {cat.title || cat._id || '--'}
                </span>
              ))
            ) : (
              <span className='text-gray-400 text-xs italic'>--</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      render: (v: string) => (
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
            v === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {v === 'active' ? 'Đang bán' : 'Tạm ẩn'}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      render: (v: string) => new Date(v).toLocaleString()
    },
    {
      accessorKey: 'action',
      header: 'Thao tác',
      render: (_: any, row: any) => (
        <div className='flex gap-3 justify-center text-gray-500'>
          <button
            title='Chỉnh sửa'
            className='hover:text-blue-600 transition'
            onClick={() => navigate(`/shop/product/update/${row._id}`)}
          >
            <FiEdit2 size={18} />
          </button>
          <button
            title='Xóa'
            className='hover:text-red-600 transition'
            onClick={() => handleDelete(row._id)}
          >
            <FiTrash2 size={18} />
          </button>
          <button
            title='Xem chi tiết'
            className='hover:text-green-600 transition'
            onClick={() => {
              setDetailProduct(row);
              setShowDetail(true);
            }}
          >
            <span className='material-icons' style={{ fontSize: 18 }}>
              info
            </span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className='p-6 bg-white rounded-xl shadow-md border border-gray-100'>
      <FilterProduct
        onFilter={() => setIsFiltering(true)}
        onReset={() => setIsFiltering(false)}
      />

      <div className='flex justify-between items-center flex-col sm:flex-row mb-6 gap-2'>
        <div>
          <p className='text-sm text-gray-500'>
            Quản lý sản phẩm{' '}
            <span className='font-medium text-green-700'>
              {user.fullName || user.email}
            </span>
          </p>
          <h1 className='text-2xl font-bold text-gray-800 mt-1'>
            Danh sách sản phẩm
          </h1>
        </div>
        <button
          className='bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition'
          onClick={() => navigate('/shop/product/create')}
        >
          + Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
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

      <ProductDetailModal
        product={detailProduct}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
};

export default ProductTableDisplay;
