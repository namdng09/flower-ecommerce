import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchOrderById } from '~/store/slices/orderSlice';
import type { RootState } from '~/store';

import { BsBoxSeam } from 'react-icons/bs';
import { AiOutlineCalendar, AiOutlineBarcode } from 'react-icons/ai';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';
import { MdOutlinePayments, MdOutlineStickyNote2 } from 'react-icons/md';

const OrderTrackingPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { orderId } = useParams();

  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (loading)
    return (
      <p className='text-center mt-10 text-gray-600'>
        Đang tải dữ liệu đơn hàng...
      </p>
    );
  if (error)
    return <p className='text-center text-red-600 mt-10'>Lỗi: {error}</p>;
  if (!currentOrder)
    return <p className='text-center mt-10'>Không tìm thấy đơn hàng</p>;

  const {
    orderNumber,
    items,
    totalPrice,
    totalQuantity,
    payment,
    shipment,
    description,
    createdAt,
    status
  } = currentOrder;

  return (
    <div className='max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-50 text-black mb-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-2 text-[#C4265B]'>
        <BsBoxSeam className='text-[#C4265B]' size={26} />
        Theo dõi đơn hàng
      </h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-800 text-sm'>
        <div className='flex items-center gap-2'>
          <AiOutlineBarcode className='text-blue-600' />
          <span>
            <strong>Mã đơn hàng:</strong> {orderNumber}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <AiOutlineCalendar className='text-green-600' />
          <span>
            <strong>Ngày đặt:</strong> {new Date(createdAt).toLocaleString()}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <TbTruckDelivery className='text-orange-500' />
          <span>
            <strong>Trạng thái đơn:</strong> {status}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <MdOutlinePayments className='text-purple-600' />
          <span>
            <strong>Phương thức thanh toán:</strong>{' '}
            {payment.method.toUpperCase()}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <RiMoneyDollarCircleLine className='text-yellow-600' />
          <span>
            <strong>Trạng thái thanh toán:</strong> {payment.status}
          </span>
        </div>
        <div className='flex items-center gap-2 col-span-1 sm:col-span-2'>
          <MdOutlineStickyNote2 className='text-gray-500' />
          <span>
            <strong>Ghi chú:</strong> {description || 'Không có'}
          </span>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm bg-white shadow rounded-xl overflow-hidden'>
          <thead className='bg-gray-100 text-gray-700'>
            <tr>
              <th className='p-3 text-left'>STT</th>
              <th className='p-3 text-left'>Mã biến thể</th>
              <th className='p-3 text-left'>Số lượng</th>
              <th className='p-3 text-left'>Đơn giá</th>
              <th className='p-3 text-left'>Tổng</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {Array.isArray(items) && items.map((item: any, index: number) => (
              <tr key={item.variant?._id || index} className='text-left'>
                <td className='p-3'>{index + 1}</td>

                <td className='p-3'>
                  {item.variant?.variantCode || 'Không rõ'}
                </td>

                <td className='p-3'>{item.quantity}</td>
                <td className='p-3'>{item.price?.toLocaleString()}₫</td>
                <td className='p-3'>
                  {(item.price * item.quantity).toLocaleString()}₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='mt-6 text-right text-gray-800 space-y-2'>
        <p>
          <strong>Tổng số lượng:</strong> {totalQuantity}
        </p>
        <p>
          <strong>Phí vận chuyển:</strong>{' '}
          {shipment.shippingCost.toLocaleString()}₫
        </p>
        <p className='text-xl font-bold text-[#C4265B]'>
          Tổng thanh toán:{' '}
          {(totalPrice + shipment.shippingCost).toLocaleString()}₫
        </p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
