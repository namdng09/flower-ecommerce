import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '~/contexts/authContext';
import { FaShoppingCart } from 'react-icons/fa';
import { HiOutlineReceiptRefund } from 'react-icons/hi';
import type { RootState } from '~/store';
import {
  fetchCartByUserId,
  removeFromCart,
  updateCartItem
} from '~/store/slices/cartSlice';
import { createOrder } from '~/store/slices/orderSlice';
import { useNavigate } from 'react-router';

const CartItemsTable: React.FC = () => {
  const { items, loading } = useSelector((state: RootState) => state.carts);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchCartByUserId(userId));
    }
  }, [userId, dispatch]);

  const handleRemove = (variantId: string) => {
    dispatch(removeFromCart({ userId, variantId }));
  };

  const handleQuantityChange = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ userId, variantId, quantity })).then(() =>
      dispatch(fetchCartByUserId(userId))
    );
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.variantId.salePrice,
    0
  );
  const shippingCost = 30000;
  const totalPrice = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) return alert('Bạn cần đăng nhập để đặt hàng');

    const orderData = {
      user: user.id,
      items: items.map(item => ({
        variant: item.variantId._id,
        quantity: item.quantity,
        price: item.variantId.salePrice
      })),
      payment: {
        amount: totalPrice,
        method: 'cod'
      },
      shipment: {
        shippingCost,
        status: 'pending'
      },
      description: 'Đơn hàng từ trang web'
    };

    const result = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(result)) {
      alert('✅ Đặt hàng thành công!');
      navigate('/home/orders');
    } else {
      alert('❌ Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <div className='pt-50 px-4 max-w-7xl mx-auto min-h-screen bg-white'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>
        🛒 Giỏ hàng của bạn
      </h2>

      {loading && <p>Đang tải...</p>}
      {items.length === 0 && !loading && (
        <p className='text-black'>Giỏ hàng của bạn đang trống.</p>
      )}

      {items.length > 0 && (
        <>
          <div className='border rounded-md overflow-hidden mb-6'>
            <div className='max-h-[600px] overflow-y-auto'>
              <table className='min-w-full border-collapse'>
                <thead className='bg-gray-100 text-left text-sm uppercase text-gray-600 sticky top-0 z-10'>
                  <tr>
                    <th className='p-3'>Xoá</th>
                    <th className='p-3'>Sản phẩm</th>
                    <th className='p-3'>Giá</th>
                    <th className='p-3'>Số lượng</th>
                    <th className='p-3'>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const v = item.variantId;
                    const isDiscounted = v.salePrice < v.listPrice;
                    return (
                      <tr key={v._id} className='border-t'>
                        <td
                          className='p-3 text-center text-red-500 cursor-pointer'
                          onClick={() => handleRemove(v._id)}
                        >
                          ✖
                        </td>
                        <td className='p-3 flex items-center gap-3'>
                          <img
                            src={v.image}
                            alt={v.title}
                            className='w-40 h-40 rounded object-cover'
                          />
                          <div>
                            <p className='font-semibold text-gray-800'>
                              {v.title}
                            </p>
                            <p className='text-xs text-gray-500'>
                              Mã: {v.variantCode}
                            </p>
                          </div>
                        </td>
                        <td className='p-3'>
                          {isDiscounted ? (
                            <>
                              <span className='line-through text-sm text-gray-400 mr-1'>
                                {v.listPrice.toLocaleString()}₫
                              </span>
                              <span className='text-red-600 font-semibold'>
                                {v.salePrice.toLocaleString()}₫
                              </span>
                            </>
                          ) : (
                            <span className='text-gray-800'>
                              {v.listPrice.toLocaleString()}₫
                            </span>
                          )}
                        </td>
                        <td className='p-3 text-black'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() =>
                                handleQuantityChange(v._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className={`w-8 h-8 flex items-center justify-center border rounded text-xl font-bold 
          ${item.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                              aria-label='Giảm số lượng'
                            >
                              −
                            </button>

                            <span className='px-3 py-1 border rounded text-gray-800 text-sm bg-white min-w-[2rem] text-center'>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleQuantityChange(v._id, item.quantity + 1)
                              }
                              className='w-8 h-8 flex items-center justify-center border rounded bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-700'
                              aria-label='Tăng số lượng'
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className='p-3 font-semibold text-gray-800'>
                          {(v.salePrice * item.quantity).toLocaleString()}₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className='bg-white shadow-md p-6 rounded-xl mb-6 text-gray-900'>
            <h2 className='text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2'>
              <HiOutlineReceiptRefund className='text-[#C4265B]' size={22} />
              Tóm tắt đơn hàng
            </h2>

            <div className='space-y-3 text-base'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tạm tính:</span>
                <span className='font-medium'>
                  {subtotal.toLocaleString()}₫
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Phí vận chuyển:</span>
                <span className='font-medium'>
                  {shippingCost.toLocaleString()}₫
                </span>
              </div>
              <div className='flex justify-between pt-2 mt-2 border-t font-bold text-lg text-[#C4265B]'>
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className='w-full bg-[#C4265B] text-white py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:bg-blue-700 active:scale-95'
          >
            <FaShoppingCart size={18} />
            Đặt hàng ngay
          </button>
        </>
      )}
    </div>
  );
};

export default CartItemsTable;
