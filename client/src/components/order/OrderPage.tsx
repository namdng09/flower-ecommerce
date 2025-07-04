import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '~/store';
import { createOrder } from '~/store/slices/orderSlice';
import { AuthContext } from '~/contexts/authContext';

import { FaShoppingCart } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

const OrderPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const cart = useSelector((state: RootState) => state.carts);
  // console.log("Cart state:", cart);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
  const [shippingCost] = useState<number>(20000);
  const [note, setNote] = useState('');

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = async () => {
    if (!user) return alert('Vui lòng đăng nhập trước khi đặt hàng');
    if (!cart || !cart.items || cart.items.length === 0)
      return alert('Giỏ hàng trống');

    const orderData = {
      user: user.id,
      items: cart.items.map(item => ({
        variant: item.variantId._id,
        quantity: item.quantity,
        price: item.price
      })),
      payment: {
        amount: totalPrice + shippingCost,
        method: paymentMethod
      },
      shipment: {
        shippingCost,
        status: 'pending'
      },
      description: note
    };

    try {
      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        navigate('/home/order-success');
      } else {
        navigate('/home/order-fail');
      }
    } catch (error) {
      console.error('Order failed:', error);
      navigate('/home/order-fail');
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 mt-10 text-black mt-50'>
      <h2 className='text-2xl font-semibold mb-4 flex items-center gap-2'>
        <FaShoppingCart className='text-blue-600' size={22} />
        Xác nhận đơn hàng
      </h2>

      {cart.items.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          <div className='bg-white shadow-md rounded p-4 mb-4'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-2'>Sản phẩm</th>
                  <th className='text-left py-2'>Số lượng</th>
                  <th className='text-left py-2'>Giá</th>
                  <th className='text-left py-2'>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item, index) => (
                  <tr key={index} className='border-b'>
                    <td className='py-2 font-bold'>
                      {item.variantId.title}
                      <div className='text-sm text-gray-500'>
                        Mã SP: {item.variantId.variantCode}
                      </div>
                    </td>
                    <td className='text-left py-2'>{item.quantity}</td>
                    <td className='text-left py-2'>
                      {item.price.toLocaleString()}₫
                    </td>
                    <td className='text-left py-2'>
                      {(item.price * item.quantity).toLocaleString()}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='bg-white shadow-md rounded p-4 mb-4 space-y-4'>
            <div className='flex justify-between'>
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}₫</span>
            </div>
            <div className='flex justify-between'>
              <span>Phí vận chuyển:</span>
              <span>{shippingCost.toLocaleString()}₫</span>
            </div>
            <div className='flex justify-between font-bold text-lg'>
              <span>Tổng cộng:</span>
              <span>{(totalPrice + shippingCost).toLocaleString()}₫</span>
            </div>
          </div>

          <div className='bg-white shadow-md rounded p-4 mb-4 space-y-4'>
            <label className='block font-medium mb-1'>
              Phương thức thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={e =>
                setPaymentMethod(e.target.value as 'cod' | 'banking')
              }
              className='border rounded w-full p-2'
            >
              <option value='cod'>Thanh toán khi nhận hàng (COD)</option>
              <option value='banking'>Chuyển khoản ngân hàng</option>
            </select>

            <label className='block font-medium mb-1'>Ghi chú</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className='border rounded w-full p-2'
              rows={3}
              placeholder='Ghi chú cho đơn hàng...'
            />
          </div>

          <button
            onClick={handleOrder}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2'
          >
            <FiSend size={18} />
            Đặt hàng ngay
          </button>
        </>
      )}
    </div>
  );
};

export default OrderPage;
