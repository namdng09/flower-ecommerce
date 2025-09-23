// bang order
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { fetchOrders, deleteOrder } from '~/store/slices/orderSlice';
import type { RootState } from '~/store';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Link } from 'react-router';

const Page = () => {
  const dispatch = useDispatch();
  const {
    orders = [],
    loading,
    error
  } = useSelector((state: RootState) => state.orders);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      dispatch(deleteOrder(selectedId));
      setSelectedId(null);
    }
  };

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      render: (v: string) => (
        <div className='font-semibold text-blue-700'>{v}</div>
      )
    },
    {
      accessorKey: 'totalQuantity',
      header: 'Qty'
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      render: (v: number) => `${v.toLocaleString()}đ`
    },
    {
      accessorKey: 'status',
      header: 'Status',
      render: (v: string) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            v === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : v === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          {v}
        </span>
      )
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      render: (v: any) => (
        <div className='text-xs text-gray-600'>
          <div>
            <b>{v.method.toUpperCase()}</b>
          </div>
          <div
            className={`${v.status === 'unpaid' ? 'text-red-500' : 'text-green-600'}`}
          >
            {v.status}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'shipment',
      header: 'Shipment',
      render: (v: any) => (
        <div className='text-xs text-gray-600'>
          <div>
            Status: <b>{v.status}</b>
          </div>
          <div>Ship: {v.shippingCost?.toLocaleString()}đ</div>
        </div>
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
          <Link to={`/admin/order/${row._id}`} title='View'>
            <FiEye size={16} className='hover:text-blue-600 cursor-pointer' />
          </Link>
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
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-bold'>Orders</h1>
        <div className='flex gap-2'>
          <button className='px-3 py-2 text-sm border rounded hover:bg-gray-100'>
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <DynamicTable data={paginatedOrders} columns={columns} />
      )}

      {/* Pagin */}
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

      {/* Modal */}
      <ConfirmModal
        show={showConfirm}
        setShow={setShowConfirm}
        title='Delete Order'
        message='Are you sure you want to delete this order?'
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Page;
