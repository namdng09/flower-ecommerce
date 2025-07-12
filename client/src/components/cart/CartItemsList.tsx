import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '~/contexts/authContext';
import { FaTrashAlt, FaArrowRight } from 'react-icons/fa';
import { HiOutlineReceiptRefund } from 'react-icons/hi';
import type { RootState } from '~/store';
import {
  fetchCartByUserId,
  removeFromCart,
  updateCartItem
} from '~/store/slices/cartSlice';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const CartItemsTable: React.FC = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { items, loading } = useSelector((state: RootState) => state.carts);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCartByUserId(userId));
    }
  }, [userId, dispatch]);

  const handleRemove = async (variantId: string) => {
    if (!userId) return;

    try {
      await dispatch(removeFromCart({ userId, variantId })).unwrap();
      toast.success('Đã xoá sản phẩm khỏi giỏ hàng!');
    } catch (error) {
      console.error(error);
      toast.error('Xoá không thành công!');
    }
  };

  const handleQuantityChange = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ userId, variantId, quantity })).then(() =>
      dispatch(fetchCartByUserId(userId))
    );
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item?.variantId?.salePrice || 0;
    const quantity = item?.quantity || 0;
    return sum + price * quantity;
  }, 0);

  return (
    <div className='pt-10 px-4 max-w-6xl mx-auto bg-white min-h-screen text-black mt-50'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>
        🛒 Giỏ hàng của bạn
      </h2>

      {loading && <p>Đang tải...</p>}

      {!loading && items.length === 0 && (
        <div className='text-gray-700 text-center text-lg'>
          <p className='mb-4'>Giỏ hàng của bạn đang trống.</p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className='border rounded-md overflow-hidden mb-6'>
            <div className='max-h-[600px] overflow-y-auto'>
              <table className='min-w-full border-collapse'>
                <thead className='bg-gray-100 text-left text-sm uppercase text-gray-600 sticky top-0 z-10'>
                  <tr>
                    <th className='p-3'>Sản phẩm</th>
                    <th className='p-3'>Giá</th>
                    <th className='p-3'>Số lượng</th>
                    <th className='p-3'>Tổng</th>
                    <th className='p-3'>Xoá</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const v = item?.variantId;
                    if (!v) return null;

                    const isDiscounted = v.salePrice < v.listPrice;
                    const productTitle = v.product?.[0]?.title || 'Sản phẩm';

                    return (
                      <tr key={v._id} className='border-t'>
                        <td className='p-3 flex items-center gap-3'>
                          <img
                            src={v.image || '/placeholder.jpg'}
                            alt={v.title}
                            className='w-24 h-24 rounded object-cover'
                          />
                          <div>
                            <p className='font-bold text-sm text-[#C4265B] uppercase'>
                              {productTitle}
                            </p>
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
                                {(v.listPrice || 0).toLocaleString()}₫
                              </span>
                              <span className='text-red-600 font-semibold'>
                                {(v.salePrice || 0).toLocaleString()}₫
                              </span>
                            </>
                          ) : (
                            <span className='text-gray-800'>
                              {(v.listPrice || 0).toLocaleString()}₫
                            </span>
                          )}
                        </td>
                        <td className='p-3'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() =>
                                handleQuantityChange(v._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className={`w-8 h-8 border rounded ${item.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                              −
                            </button>
                            <span className='px-3 py-1 border rounded bg-white min-w-[2rem] text-center text-black'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(v._id, item.quantity + 1)
                              }
                              className='w-8 h-8 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700'
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className='p-3 font-semibold text-gray-800'>
                          {(v.salePrice * item.quantity).toLocaleString()}₫
                        </td>
                        <td
                          className='p-3 text-center cursor-pointer'
                          onClick={() => handleRemove(v._id)}
                        >
                          <FaTrashAlt
                            size={20}
                            className='text-red-500 hover:text-red-700 transition'
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className='bg-white shadow-md p-6 rounded-xl mb-6'>
            <h2 className='text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2 text-[#C4265B]'>
              <HiOutlineReceiptRefund className='text-[#C4265B]' size={22} />
              Tóm tắt đơn hàng
            </h2>
            <div className='space-y-3 text-base text-gray-900'>
              <div className='flex justify-between font-bold text-lg text-[#C4265B] pt-2 mt-2'>
                <span>Tổng cộng:</span>
                <span>{subtotal.toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <div className='text-right'>
            <button
              onClick={() => navigate('/home/order')}
              className='bg-[#C4265B] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg inline-flex items-center gap-2 group'
            >
              Tiến hành đặt hàng
              <FaArrowRight className='text-white group-hover:text-yellow-300 transition duration-200' />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItemsTable;
