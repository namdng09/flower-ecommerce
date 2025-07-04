import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '~/contexts/authContext';
import type { RootState } from '~/store';
import {
  fetchCartByUserId,
  removeFromCart,
  updateCartItem
} from '~/store/slices/cartSlice';

const CartItemsTable: React.FC = () => {
  const { items, loading, error } = useSelector(
    (state: RootState) => state.carts
  );
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;

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
        <div className='border rounded-md overflow-hidden'>
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
                      {/* <td className="p-3 text-black">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(v._id,Number(e.target.value))}
                                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                                                />
                                            </td> */}
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
      )}
    </div>
  );
};

export default CartItemsTable;
