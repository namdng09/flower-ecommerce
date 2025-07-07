// import React, { useContext } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router';
// import type { RootState } from '~/store';
// import { createOrder } from '~/store/slices/orderSlice';
// import { AuthContext } from '~/contexts/authContext';
// import { FaShoppingCart } from 'react-icons/fa';
// import { FiSend } from 'react-icons/fi';

// const OrderPage: React.FC = () => {
//   const dispatch = useDispatch<any>();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const cart = useSelector((state: RootState) => state.carts);
//   const { addresses } = useSelector((state: RootState) => state.addresses);

//   console.log(cart);
  
//   const [paymentMethod, setPaymentMethod] = React.useState<'cod' | 'banking'>('cod');
//   const [shippingCost] = React.useState<number>(30000);
//   const [note, setNote] = React.useState('');

//   // Địa chỉ mặc định đã chọn từ trước ở trang giỏ hàng
//   const selectedAddress = addresses.find(addr => addr.isDefault) || addresses[0];

//   const totalPrice = cart.items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const handleOrder = async () => {
//     if (!user) return alert('Vui lòng đăng nhập');
//     if (cart.items.length === 0) return alert('Giỏ hàng trống');
//     if (!selectedAddress?._id) return alert('Không tìm thấy địa chỉ giao hàng');

//     const orderData = {
//       user: user.id,
//       address: selectedAddress._id,
//       items: cart.items.map(item => ({
//         variant: item.variantId._id,
//         quantity: item.quantity,
//         price: item.price
//       })),
//       payment: {
//         amount: totalPrice + shippingCost,
//         method: paymentMethod
//       },
//       shipment: {
//         shippingCost,
//         status: 'pending'
//       },
//       description: note
//     };

//     try {
//       const result = await dispatch(createOrder(orderData));
//       if (createOrder.fulfilled.match(result)) {
//         const order = result.payload;
//         navigate(`/home/order-success/${order._id}`);
//       } else {
//         navigate('/home/order-fail');
//       }
//     } catch (error) {
//       console.error('Order failed:', error);
//       navigate('/home/order-fail');
//     }
//   };

//   return (
//     <div className='max-w-6xl mx-auto p-6 mt-50 text-black'>
//       <h2 className='text-2xl font-semibold mb-4 flex items-center gap-2'>
//         <FaShoppingCart className='text-[#C4265B]' size={22} />
//         Xác nhận đơn hàng
//       </h2>

//       {/* Địa chỉ giao hàng */}
//       <div className='bg-white shadow-md rounded p-4 mb-6'>
//         <h3 className='font-bold mb-2 text-[#C4265B]'>📍 Địa chỉ giao hàng</h3>
//         {selectedAddress ? (
//           <div className='text-sm leading-6'>
//             <p><strong>{selectedAddress.fullName}</strong> - {selectedAddress.phone}</p>
//             <p>{selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.province}</p>
//           </div>
//         ) : (
//           <p className='text-red-600'>Không tìm thấy địa chỉ giao hàng</p>
//         )}
//       </div>

//       {/* Danh sách sản phẩm */}
//       <div className='bg-white shadow-md rounded p-4 mb-4'>
//         <table className='w-full'>
//           <thead>
//             <tr className='border-b'>
//               <th className='text-left py-2'>Sản phẩm</th>
//               <th className='text-left py-2'>SL</th>
//               <th className='text-left py-2'>Giá</th>
//               <th className='text-left py-2'>Tổng</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.items.map((item, index) => (
//               <tr key={index} className='border-b'>
//                 <td className='py-2 flex gap-2 items-center'>
//                   <img src={item.variantId.image} className='w-16 h-16 object-cover' />
//                   <div>
//                     <div>{item.variantId.title}</div>
//                     <div className='text-sm text-gray-500'>Mã: {item.variantId.variantCode}</div>
//                   </div>
//                 </td>
//                 <td>{item.quantity}</td>
//                 <td>{item.price.toLocaleString()}₫</td>
//                 <td>{(item.price * item.quantity).toLocaleString()}₫</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Tổng kết và thanh toán */}
//       <div className='bg-white shadow-md rounded p-4 mb-4 space-y-4'>
//         <div className='flex justify-between'>
//           <span>Tạm tính:</span>
//           <span>{totalPrice.toLocaleString()}₫</span>
//         </div>
//         <div className='flex justify-between'>
//           <span>Phí vận chuyển:</span>
//           <span>{shippingCost.toLocaleString()}₫</span>
//         </div>
//         <div className='flex justify-between font-bold text-lg'>
//           <span>Tổng cộng:</span>
//           <span>{(totalPrice + shippingCost).toLocaleString()}₫</span>
//         </div>

//         <select
//           value={paymentMethod}
//           onChange={e => setPaymentMethod(e.target.value as 'cod' | 'banking')}
//           className='w-full p-2 border rounded'
//         >
//           <option value='cod'>Thanh toán khi nhận hàng (COD)</option>
//           <option value='banking'>Chuyển khoản ngân hàng</option>
//         </select>

//         <textarea
//           placeholder='Ghi chú đơn hàng...'
//           value={note}
//           onChange={e => setNote(e.target.value)}
//           className='w-full border rounded p-2'
//           rows={3}
//         />

//         <button
//           onClick={handleOrder}
//           className='w-full bg-[#C4265B] hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2'
//         >
//           <FiSend size={18} />
//           Đặt hàng ngay
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderPage;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '~/store/slices/orderSlice';
import type { RootState } from '~/store';
import { FaCheckCircle } from 'react-icons/fa';

const OrderPage: React.FC = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { currentOrder: order, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) return <p className="text-center mt-10">Đang tải đơn hàng...</p>;
  if (error || !order)
    return <p className="text-center mt-10 text-red-600">Không tìm thấy đơn hàng.</p>;

  const {
    orderNumber,
    address,
    items,
    totalPrice,
    shipment,
    payment,
    createdAt,
  } = order;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-black mt-45">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-600 mb-6">
          <FaCheckCircle size={26} />
          <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
        </div>

        <p className="mb-4">
          Mã đơn hàng: <span className="font-semibold">{orderNumber}</span>
        </p>
        <p className="mb-4 text-sm text-gray-500">
          Ngày đặt: {new Date(createdAt).toLocaleString()}
        </p>

        <h2 className="text-lg font-semibold mb-2 text-[#C4265B]">📦 Sản phẩm</h2>
        <ul className="mb-6 space-y-2">
          {items.map((item: any, idx: number) => (
            <li key={idx} className="border-b py-2 flex justify-between">
              <span>{item.variant?.title || 'Sản phẩm'} x {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()}₫</span>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-semibold mb-2 text-[#C4265B]">🏠 Địa chỉ giao hàng</h2>
        <p className="mb-4">
          <strong>{address.fullName}</strong> - {address.phone}<br />
          {address.street}, {address.ward}, {address.province}
        </p>

        {order.customization && (
          <div className="mt-6 space-y-2">
            <h2 className="text-lg font-semibold text-[#C4265B]">🎁 Tuỳ chọn đơn hàng</h2>

            {order.customization.giftMessage && (
              <div className="text-gray-800">
                <strong>Lời chúc:</strong> {order.customization.giftMessage}
              </div>
            )}

            {order.customization.isAnonymous && (
              <div className="text-gray-800">
                <strong>Người gửi:</strong> Ẩn danh
              </div>
            )}

            {order.customization.deliveryTimeRequested && (
              <div className="text-gray-800">
                <strong>Thời gian giao hàng mong muốn:</strong>{' '}
                {new Date(order.customization.deliveryTimeRequested).toLocaleString('vi-VN', {
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

        <div className="space-y-2 mt-10">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{(totalPrice - shipment.shippingCost).toLocaleString()}₫</span>
            </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span>{shipment.shippingCost.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-[#C4265B]">
            <span>Tổng cộng:</span>
            <span>{totalPrice.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between pt-2">
            <span>Thanh toán:</span>
            <span className="capitalize">{payment.method} - {payment.status}</span>
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
