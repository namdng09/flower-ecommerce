// table cua product
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '~/store/slices/productSlice';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { RootState } from '~/store';

const Page = () => {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((state: RootState) => state.products);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // pagination
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedItems = items.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      console.log('Delete product:', selectedId);
      setSelectedId(null);
    }
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Product',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <img
            src={row.thumbnailImage || '/placeholder.png'}
            alt={row.title}
            className="w-10 h-10 rounded object-cover border"
          />
          <div>
            <div className="text-green-700 font-semibold">{row.title}</div>
            <div className="text-gray-400 text-xs">{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'skuCode',
      header: 'SKU',
    },
    {
      accessorKey: 'variants',
      header: 'Variants',
      render: (value: any[]) => (
        <div className="space-y-1">
          {value?.slice(0, 2).map((variant, i) => (
            <div key={i} className="text-xs text-gray-600">
              {variant.title} - <b>{variant.salePrice.toLocaleString()}đ</b> ({variant.inventory} in stock)
            </div>
          ))}
          {value?.length > 2 && <span className="text-gray-400 text-xs italic">+{value.length - 2} more</span>}
        </div>
      ),
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.map((cat, idx) => (
            <span key={idx} className="bg-gray-100 text-xs px-2 py-[2px] rounded-full text-gray-700">
              {cat.title}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      render: (v: string) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${v === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
            }`}
        >
          {v === 'active' ? '✔' : '✖'} {v}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      render: (_: any, row: any) => (
        <div className="flex gap-2 justify-center text-gray-500">
          <button title="Edit" className="hover:text-blue-600">
            <FiEdit2 size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(row._id)}
            className="hover:text-red-600"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm border rounded hover:bg-gray-100">Filter</button>
          <button className="bg-green-500 text-white px-4 py-2 text-sm rounded hover:bg-green-600">
            + Add Product
          </button>
        </div>
      </div>

      {/* bảng */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DynamicTable data={paginatedItems} columns={columns} />
      )}

      {/* Pagin */}
      <div className="mt-6">
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
        />
      </div>

      {/* modal */}
      <ConfirmModal
        show={showConfirm}
        setShow={setShowConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Page;
