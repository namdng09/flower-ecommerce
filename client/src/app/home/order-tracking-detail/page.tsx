import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrder } from '~/store/slices/orderSlice';
import type { RootState } from '~/store';
import {
  FaStore,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShippingFast,
  FaClipboardCheck,
  FaExclamationCircle
} from 'react-icons/fa';
import { fetchVariants } from '~/store/slices/variantSlice';
import { AuthContext } from '~/contexts/authContext';
import { Link } from 'react-router';
import { toast } from 'react-toastify';

const OrderListByUserPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const [page, setPage] = useState(1);

  const { orders, loading, error, pagination } = useSelector(
    (state: RootState) => state.orders
  );
  const { items: variants } = useSelector((state: RootState) => state.variants);

  useEffect(() => {
    if (userId) {
      dispatch(fetchVariants());
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (userId) {
      dispatch(
        fetchOrders({
          page,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'asc',
          user: userId
        })
      );
    }
  }, [dispatch, userId, page]);

  const handleCancelOrder = async (orderId: string) => {
    const now = new Date().toISOString();
    const cancelData = {
      status: 'cancelled',
      expectedDeliveryAt: now,
      description: 'Khách đã hủy đơn hàng'
    };

    try {
      await dispatch(
        updateOrder({ id: orderId, updateData: cancelData })
      ).unwrap();
      await dispatch(
        fetchOrders({
          page,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          user: userId
        })
      );
      toast.success('Đã hủy đơn hàng thành công');
    } catch (err: any) {
      toast.error('Hủy đơn thất bại: ' + (err?.message || 'Có lỗi xảy ra'));
    }
  };

  const getVariantDetails = (variantId: any) => {
    const id = typeof variantId === 'object' ? variantId._id : variantId;
    return variants.find((v: any) => v._id === id);
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'ready_for_pickup':
        return 'Sẵn sàng lấy hàng';
      case 'out_for_delivery':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao';
      case 'returned':
        return 'Đã trả hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-700';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'returned':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading)
    return <p className='text-center mt-10'>Đang tải danh sách đơn hàng...</p>;

  if (error || !orders?.length || !userId) {
    return (
      <div className='flex flex-col items-center justify-center mt-50 text-red-600'>
        <FaExclamationCircle className='text-4xl mb-3 text-red-500' />
        <p className='text-lg font-semibold'>Không tìm thấy đơn hàng.</p>
        <p className='text-gray-500 mt-2'>
          Vui lòng đăng nhập hoặc kiểm tra lại thông tin.
        </p>
      </div>
    );
  }
  console.log('Variants list:', variants);

  return (
    <div className='max-w-7xl mx-auto p-4 text-black mt-45'>
      <h2 className='text-2xl font-bold mb-6'>Lịch sử đơn hàng của bạn</h2>

      <div className='space-y-6'>
        {orders.map((order: any) => (
          <div
            key={order._id}
            className='border-black-100 rounded-lg shadow-sm p-4 bg-white'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold text-lg'>
                  {order.shop?.fullName?.charAt(0)?.toUpperCase() || (
                    <FaStore />
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Người bán:</p>
                  <p className='text-[#C4265B] font-semibold'>
                    {order.shop?.fullName || 'Cửa hàng'} (
                    {order.shop?.username || 'username'})
                  </p>
                </div>
              </div>
              <button className='bg-pink-100 text-[#C4265B] px-3 py-1 rounded text-sm font-medium hover:bg-pink-200'>
                <Link to={`/home/shop-profile/${order.shop?._id}`}>
                  Xem shop
                </Link>
              </button>
            </div>

            <div className='space-y-4'>
              {order.items?.length > 0 ? (
                order.items.map((item: any, index: number) => {
                  const variant = getVariantDetails(item.variant);
                  const imageUrl =
                    variant?.image || variant?.product?.thumbnailImage;
                  return (
                    <div
                      key={index}
                      className='flex gap-3 border rounded p-3 bg-gray-50'
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt='Ảnh sản phẩm'
                          className='w-16 h-16 object-cover border rounded'
                        />
                      ) : (
                        <div className='w-16 h-16 flex items-center justify-center border rounded text-xs text-gray-400 bg-white'>
                          Không ảnh
                        </div>
                      )}
                      <div className='flex-1'>
                        <p className='text-base font-bold text-[#C4265B]'>
                          {variant?.product?.title || ''}
                        </p>
                        <p className='text-base font-bold text-[#C4265B]'>
                          {variant?.title ? `Phân Loại: ${variant.title}` : ''}{' '}
                          {variant?.variantCode
                            ? `| Mã: ${variant.variantCode}`
                            : ''}
                        </p>
                        <p className='text-sm mt-1'>
                          SL: {item.quantity} | Giá:{' '}
                          {item.price.toLocaleString()}₫
                        </p>
                        <p className='text-sm font-medium text-[#C4265B]'>
                          Tổng: {(item.price * item.quantity).toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className='text-sm text-gray-500'>
                  Không có sản phẩm trong đơn hàng.
                </p>
              )}
            </div>

            <div className='mt-4 text-sm text-gray-600 space-y-1'>
              <p className='flex items-center gap-2'>
                <FaCalendarAlt className='text-pink-400' />
                <strong>Ngày đặt:</strong>{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className='flex items-center gap-2'>
                <FaClipboardCheck className='text-yellow-500' />
                <strong>Trạng thái:</strong>
                <span
                  className={`ml-2 px-2 py-0.5 text-sm font-semibold rounded-full ${statusStyle(order.status)}`}
                >
                  {translateStatus(order.status)}
                </span>
              </p>
              <p className='flex items-center gap-2'>
                <FaMoneyBillWave className='text-green-500' />
                <strong>Phương thức thanh toán:</strong>{' '}
                {order.payment?.method?.toUpperCase() || '---'} -{' '}
                {order.payment?.status || '---'}
              </p>
              <p className='flex items-center gap-2'>
                <FaShippingFast className='text-blue-500' />
                <strong>Phí vận chuyển:</strong>{' '}
                {order.shipment?.shippingCost?.toLocaleString() || '0'}₫
              </p>
              <p className='text-base font-bold text-[#C4265B]'>
                Tổng thanh toán: {order?.totalPrice?.toLocaleString()}₫
              </p>
              {order.status === 'pending' && (
                <div className='flex justify-end mt-3'>
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className='bg-red-100 font-bold text-red-600 px-3 py-1 text-sm rounded hover:bg-red-200 transition'
                  >
                    Hủy đơn
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-center mt-6 gap-3'>
        <button
          disabled={page <= 1}
          onClick={() => setPage(prev => prev - 1)}
          className='px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50'
        >
          Trang trước
        </button>
        <span className='px-3 py-1'>Trang {page}</span>
        <button
          disabled={page >= (pagination?.totalPages || 1)}
          onClick={() => setPage(prev => prev + 1)}
          className='px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50'
        >
          Trang tiếp
        </button>
      </div>
    </div>
  );
};

export default OrderListByUserPage;
