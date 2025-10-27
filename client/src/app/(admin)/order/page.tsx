import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import {
  fetchOrders,
  deleteOrder,
  setFilters,
  clearError
} from '~/store/slices/orderSlice';
import { useSearchParams } from 'react-router';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Link } from 'react-router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const filterSchema = z.object({
  orderNumber: z.string(),
  status: z.string(),
  shop: z.string(),
  user: z.string(),
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc'])
});

type FilterFormData = z.infer<typeof filterSchema>;

const Page = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, loading, error, pagination } = useAppSelector(
    state => state.orders
  );

  const [page, setPage] = useState(() =>
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [limit, setLimit] = useState(() =>
    parseInt(searchParams.get('limit') || '10', 10)
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        orderNumber: searchParams.get('orderNumber') || '',
        status: searchParams.get('status') || '',
        shop: searchParams.get('shop') || '',
        user: searchParams.get('user') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
      }
    });

  // Đồng bộ filter với URL params
  const updateURLParams = (
    filters: FilterFormData,
    currentPage: number,
    currentLimit: number
  ) => {
    const params = new URLSearchParams();
    if (filters.orderNumber) params.set('orderNumber', filters.orderNumber);
    if (filters.status) params.set('status', filters.status);
    if (filters.shop) params.set('shop', filters.shop);
    if (filters.user) params.set('user', filters.user);
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc')
      params.set('sortOrder', filters.sortOrder);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    params.set('limit', currentLimit.toString());
    setSearchParams(params);
  };

  useEffect(() => {
    setValue('orderNumber', searchParams.get('orderNumber') || '');
    setValue('status', searchParams.get('status') || '');
    setValue('shop', searchParams.get('shop') || '');
    setValue('user', searchParams.get('user') || '');
    setValue('sortBy', searchParams.get('sortBy') || 'createdAt');
    setValue(
      'sortOrder',
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setLimit(parseInt(searchParams.get('limit') || '10', 10));
  }, [searchParams, setValue]);

  useEffect(() => {
    const currentFilters = watch();
    const filters = { ...currentFilters, page, limit };
    dispatch(setFilters(filters));
    dispatch(fetchOrders(filters));
  }, [searchParams, dispatch, page, limit, watch]);

  const onSubmit = (data: FilterFormData) => {
    setPage(1);
    updateURLParams(data, 1, limit);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      orderNumber: '',
      status: '',
      shop: '',
      user: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    reset(resetFilters);
    setPage(1);
    updateURLParams(resetFilters, 1, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const currentFilters = watch();
    updateURLParams(currentFilters, newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    const currentFilters = watch();
    updateURLParams(currentFilters, 1, newLimit);
  };

  const handleDelete = (id: string) => {
    setOrderToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    await dispatch(deleteOrder(orderToDelete));
    setShowConfirmModal(false);
    setOrderToDelete(null);
    const currentFilters = watch();
    const filters = { ...currentFilters, page, limit };
    dispatch(fetchOrders(filters));
  };

  // FE sort nếu backend chưa sort
  const sortBy = watch('sortBy');
  const sortOrder = watch('sortOrder');
  const sortedOrders = [...orders].sort((a, b) => {
    let result = 0;
    if (sortBy === 'totalPrice') {
      result = a.totalPrice - b.totalPrice;
    } else if (sortBy === 'createdAt') {
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? result : -result;
  });

  const handleExportPaidOrders = () => {
    const paidOrders = orders.filter(order => order.payment?.status === 'paid');
    if (paidOrders.length === 0) {
      alert('Không có hóa đơn đã thanh toán để xuất!');
      return;
    }
    const data = paidOrders.map(order => ({
      'Mã đơn': order.orderNumber,
      'Khách hàng': order.user?.fullName || order.user,
      'Shop': order.shop?.name || order.shop,
      'Tổng SL': order.totalQuantity,
      'Tổng tiền': order.totalPrice,
      'Trạng thái': order.status,
      'Phương thức thanh toán': order.payment?.method,
      'Trạng thái thanh toán': order.payment?.status,
      'Trạng thái vận chuyển': order.shipment?.status,
      'Phí vận chuyển': order.shipment?.shippingCost,
      'Ngày tạo': new Date(order.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Paid Orders');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'admin_paid_orders.xlsx');
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
            <b>{v.method?.toUpperCase()}</b>
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
      header: 'Created',
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      render: (_: any, row: any) => (
        <div className='flex gap-2 justify-center text-gray-500'>
          <Link
            to={`/admin/order/${row._id}`}
            className='hover:text-blue-600 cursor-pointer'
            title='View'
          >
            View
          </Link>
          <button
            title='Delete'
            onClick={() => handleDelete(row._id)}
            className='hover:text-red-600 cursor-pointer'
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      {/* Header */}
      <h1 className='text-2xl font-bold mb-2'>Order Management</h1>
      <div className='mb-4 text-gray-500'>
        Total: {pagination.totalDocs || orders.length} orders | Page {page} of{' '}
        {pagination.totalPages || Math.ceil(orders.length / limit)}
      </div>

      {/* Filters */}
      <div className='mb-6'>
        <form className='flex flex-wrap gap-2' onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('orderNumber')}
            className='input input-bordered'
            placeholder='Order Number'
          />
          <select {...register('status')} className='select select-bordered'>
            <option value=''>All Status</option>
            <option value='pending'>Pending</option>
            <option value='ready_for_pickup'>Ready for Pickup</option>
            <option value='out_for_delivery'>Out for Delivery</option>
            <option value='delivered'>Delivered</option>
            <option value='returned'>Returned</option>
            <option value='cancelled'>Cancelled</option>
          </select>
          <input
            {...register('shop')}
            className='input input-bordered'
            placeholder='Shop ID'
          />
          <input
            {...register('user')}
            className='input input-bordered'
            placeholder='User ID'
          />
          <select {...register('sortBy')} className='select select-bordered'>
            <option value='createdAt'>Created Date</option>
            <option value='totalPrice'>Total Price</option>
          </select>
          <select {...register('sortOrder')} className='select select-bordered'>
            <option value='desc'>Descending</option>
            <option value='asc'>Ascending</option>
          </select>
          <button className='btn btn-primary' type='submit'>
            Apply Filters
          </button>
          <button className='btn' type='button' onClick={handleResetFilters}>
            Reset Filters
          </button>
          <button
            className='btn btn-success'
            type='button'
            onClick={handleExportPaidOrders}
          >
            Xuất hóa đơn đã thanh toán (Excel)
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className='alert alert-error'>
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className='btn btn-sm ml-2'
          >
            Dismiss
          </button>
        </div>
      ) : orders.length > 0 ? (
        <>
          <DynamicTable data={sortedOrders} columns={columns} />
          <div className='flex justify-center mt-6'>
            <Pagination
              page={pagination.page || page}
              setPage={handlePageChange}
              totalPages={pagination.totalPages || Math.ceil(orders.length / limit)}
              limit={limit}
              setLimit={handleLimitChange}
              totalItems={pagination.totalDocs || orders.length}
            />
          </div>
        </>
      ) : (
        <p className='text-center text-gray-500'>No orders found</p>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        title='Delete Order'
        message='Are you sure you want to delete this order?'
      />
    </div>
  );
};

export default Page;