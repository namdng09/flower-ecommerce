// import React from 'react';
// import { useNavigate, useParams } from 'react-router';
// import { AiOutlineCheckCircle } from 'react-icons/ai';

// const OrderSuccess: React.FC = () => {
//   const navigate = useNavigate();
//   const { orderId } = useParams();

//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4 mt-10'>
//       <div className='bg-white shadow-lg rounded-xl p-8 max-w-md text-center'>
//         <AiOutlineCheckCircle
//           className='text-green-500 mx-auto mb-4'
//           size={64}
//         />
//         <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
//           Đặt hàng thành công!
//         </h2>
//         <p className='text-gray-600 mb-6'>
//           Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là:
//           <span className='font-semibold text-black'> {orderId}</span>
//         </p>

//         <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
//           <button
//             onClick={() => navigate('/home')}
//             className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition'
//           >
//             Về trang chủ
//           </button>
//           <button
//             onClick={() => navigate(`/home/order-tracking/${orderId}`)}
//             className='border border-green-600 text-green-600 hover:bg-blue-100 px-6 py-2 rounded font-medium transition'
//           >
//             Xem đơn hàng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSuccess;


import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '~/store/slices/orderSlice';
import type { RootState } from '~/store';
import { FaCheckCircle, FaGift } from 'react-icons/fa';
import { FiBox, FiMapPin } from 'react-icons/fi';

const OrderPage: React.FC = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const {
    currentOrder: order,
    loading,
    error
  } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) return <p className='text-center mt-10'>Đang tải đơn hàng...</p>;
  if (error || !order)
    return (
      <p className='text-center mt-10 text-red-600'>Không tìm thấy đơn hàng.</p>
    );

  const {
    orderNumber,
    address,
    items,
    totalPrice,
    shipment,
    payment,
    createdAt
  } = order;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8 text-black mt-45'>
      <div className='bg-white shadow-md rounded-lg p-6'>
        <div className='flex items-center gap-3 text-green-600 mb-6'>
          <FaCheckCircle size={26} />
          <h1 className='text-2xl font-bold'>Đặt hàng thành công!</h1>
        </div>

        <p className='mb-4'>
          Mã đơn hàng: <span className='font-semibold'>{orderNumber}</span>
        </p>
        <p className='mb-4 text-sm text-gray-500'>
          Ngày đặt: {new Date(createdAt).toLocaleString()}
        </p>

        <h2 className='text-lg font-semibold mb-2 text-[#C4265B] flex items-center gap-2'>
          <FiBox className='text-[#C4265B]' />
          Sản phẩm
        </h2>
        <ul className='mb-6 space-y-2'>
          {items.map((item: any, idx: number) => (
            <li key={idx} className='border-b py-2 flex justify-between'>
              <span>
                {item.variant?.title || 'Sản phẩm'} x {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toLocaleString()}₫</span>
            </li>
          ))}
        </ul>

        <h2 className='text-lg font-semibold mb-2 text-[#C4265B] flex items-center gap-2'>
          <FiMapPin className='text-[#C4265B]' />
          Địa chỉ giao hàng
        </h2>
        <p className='mb-4'>
          <strong>{address.fullName}</strong> - {address.phone}
          <br />
          {address.street}, {address.ward}, {address.province}
        </p>

        {order.customization && (
          <div className='mt-6 space-y-2'>
            <h2 className='text-lg font-semibold text-[#C4265B] flex items-center gap-2'>
              <FaGift className='text-[#C4265B] size-5' />
              Tuỳ chọn đơn hàng
            </h2>

            {order.customization.giftMessage && (
              <div className='text-gray-800'>
                <strong>Lời chúc:</strong> {order.customization.giftMessage}
              </div>
            )}

            {order.customization.isAnonymous && (
              <div className='text-gray-800'>
                <strong>Người gửi:</strong> Ẩn danh
              </div>
            )}

            {order.customization.deliveryTimeRequested && (
              <div className='text-gray-800'>
                <strong>Thời gian giao hàng mong muốn:</strong>{' '}
                {new Date(
                  order.customization.deliveryTimeRequested
                ).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            )}
          </div>
        )}

        <div className='space-y-2 mt-10'>
          <div className='flex justify-between'>
            <span>Tạm tính:</span>
            <span>
              {(totalPrice - shipment.shippingCost).toLocaleString()}₫
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Phí vận chuyển:</span>
            <span>{shipment.shippingCost.toLocaleString()}₫</span>
          </div>
          <div className='flex justify-between font-bold text-lg text-[#C4265B]'>
            <span>Tổng cộng:</span>
            <span>{totalPrice.toLocaleString()}₫</span>
          </div>
          <div className='flex justify-between pt-2'>
            <span>Thanh toán:</span>
            <span className='capitalize'>
              {payment.method} - {payment.status}
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center mt-10'>
          <button
            onClick={() => navigate('/home')}
            className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition'
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(`/home/order-tracking/${orderId}`)}
            className='border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded font-medium transition'
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
