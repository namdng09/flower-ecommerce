import { useContext, useEffect, useState } from 'react';
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
import { AuthContext } from '~/contexts/authContext';

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

const OrderPage = () => {
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

  const { user } = useContext(AuthContext);
  const shopId = user?.role === 'shop' ? user._id || user.id : '';

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        orderNumber: searchParams.get('orderNumber') || '',
        status: searchParams.get('status') || '',
        shop: shopId || '',
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
    setValue('shop', shopId || '');
    setValue('user', searchParams.get('user') || '');
    setValue('sortBy', searchParams.get('sortBy') || 'createdAt');
    setValue(
      'sortOrder',
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );
    setPage(parseInt(searchParams.get('page') || '1', 10));
    setLimit(parseInt(searchParams.get('limit') || '10', 10));
  }, [searchParams, setValue, shopId]);

  useEffect(() => {
    const currentFilters = watch();
    const filters = { ...currentFilters, shop: shopId, page, limit };
    dispatch(setFilters(filters));
    dispatch(fetchOrders(filters));
  }, [searchParams, dispatch, page, limit, watch, shopId]);

  const onSubmit = (data: FilterFormData) => {
    setPage(1);
    updateURLParams(data, 1, limit);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      orderNumber: '',
      status: '',
      shop: shopId,
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

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order'
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
      render: (v: string) => <span className={`badge badge-warning`}>{v}</span>
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      render: (v: any) => `${v.method?.toUpperCase()} - ${v.status}`
    },
    {
      accessorKey: 'shipment',
      header: 'Shipment',
      render: (v: any) =>
        `Status: ${v.status} | Ship: ${v.shippingCost?.toLocaleString()}đ`
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
        <div className='flex gap-2'>
          <Link
            to={`/shop/order/${row._id}`}
            className='btn btn-sm btn-outline btn-info'
          >
            View
          </Link>
          <button
            className='btn btn-sm btn-outline btn-error'
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleExportPaidOrders = () => {
    const paidOrders = orders.filter(order => order.payment?.status === 'paid');
    if (paidOrders.length === 0) {
      alert('Không có hóa đơn đã thanh toán để xuất!');
      return;
    }
    const data = paidOrders.map(order => ({
      'Mã đơn': order.orderNumber,
      'Khách hàng': order.user?.fullName || order.user,
      'Tổng SL': order.totalQuantity,
      'Tổng tiền': order.totalPrice,
      'Trạng thái': order.status,
      'Phương thức thanh toán': order.payment?.method,
      'Trạng thái thanh toán': order.payment?.status,
      'Ngày tạo': new Date(order.createdAt).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Paid Orders');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'shop_paid_orders.xlsx');
  };

  return (
    <div>
      <h2 className='text-2xl font-bold mb-2'>Order Management</h2>
      <div className='mb-2 text-gray-500'>
        Total: {pagination.totalDocs} orders | Page {page} of{' '}
        {pagination.totalPages}
      </div>
      <div className='flex justify-between items-center mb-4'>
        <form className='flex gap-2' onSubmit={handleSubmit(onSubmit)}>
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
            className='btn btn-success ml-2'
            type='button'
            onClick={handleExportPaidOrders}
          >
            Xuất hóa đơn đã thanh toán (Excel)
          </button>
        </form>
      </div>

      {!loading && orders.length > 0 && (
        <>
          <DynamicTable data={sortedOrders} columns={columns} />
          <div className='flex justify-center mt-6'>
            <Pagination
              page={pagination.page}
              setPage={handlePageChange}
              totalPages={pagination.totalPages}
              limit={limit}
              setLimit={handleLimitChange}
              totalItems={pagination.totalDocs}
            />
          </div>
        </>
      )}

      <ConfirmModal
        show={showConfirmModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        message='Are you sure you want to delete this order?'
      />
      {error && (
        <div className='alert alert-error mt-4'>
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className='btn btn-sm ml-2'
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
