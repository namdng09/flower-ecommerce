import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '~/contexts/authContext';
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa';
import { HiOutlineReceiptRefund } from 'react-icons/hi';
import { FiMapPin, FiPlus } from 'react-icons/fi';
import type { RootState } from '~/store';
import {
  fetchCartByUserId,
  removeFromCart,
  updateCartItem
} from '~/store/slices/cartSlice';
import { fetchAddresses, createAddress } from '~/store/slices/addressSlice';
import { createOrder } from '~/store/slices/orderSlice';
import { useNavigate } from 'react-router';

const CartItemsTable: React.FC = () => {
  const { items, loading } = useSelector((state: RootState) => state.carts);
  const {addresses} = useSelector((state: RootState) => state.addresses);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userId = user?.id;  

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    province: ''
  });

  // Fetch cart + address khi user đã đăng nhập
  useEffect(() => {
    if (userId) {
      dispatch(fetchCartByUserId(userId));
      dispatch(fetchAddresses(userId));
    }
  }, [userId, dispatch]);

  console.log(addresses);
  
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      setSelectedAddressId(defaultAddress?._id || addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);
  
  const handleRemove = (variantId: string) => {
    dispatch(removeFromCart({ userId, variantId }));
  };

  const handleQuantityChange = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ userId, variantId, quantity })).then(() =>
      dispatch(fetchCartByUserId(userId))
    );
  };

  const subtotal = items.reduce((sum, item) => {
    const v = item?.variantId;
    const price = v?.salePrice || 0;
    const quantity = item?.quantity || 0;
    return sum + price * quantity;
  }, 0);

  const shippingCost = 30000;
  const totalPrice = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) return alert('Bạn cần đăng nhập để đặt hàng');
    if (!selectedAddressId) return alert('Vui lòng chọn địa chỉ giao hàng');

    const orderData = {
      user: user.id,
      address: selectedAddressId,
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
      description: 'Đơn hàng từ giỏ hàng'
    };

    const result = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(result)) {
      alert('✅ Đặt hàng thành công!');
      navigate('/home/orders');
    } else {
      alert('❌ Có lỗi xảy ra khi đặt hàng');
    }
  };

  const handleCreateAddress = async () => {
    if (!user) return alert('Cần đăng nhập');
    const newAddress = { ...form, user: user.id };
    await dispatch(createAddress(newAddress));
    setForm({ fullName: '', phone: '', street: '', ward: '', province: '' });
    setIsModalOpen(false);
  };

  return (
    <div className='pt-50 px-4 max-w-7xl mx-auto min-h-screen bg-white'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>🛒 Giỏ hàng của bạn</h2>

      {loading && <p>Đang tải...</p>}
      {items.length === 0 && !loading && (
        <p className='text-black'>Giỏ hàng của bạn đang trống.</p>
      )}

      {items.length > 0 && (
        <>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2 text-[#C4265B] flex items-center gap-2'>
              <FiMapPin className='text-[#C4265B]' />
              Địa chỉ giao hàng
            </h3>            
            {addresses.length === 0 ? (
              <p>Bạn chưa có địa chỉ nào.</p>
            ) : (
              <div className='space-y-2 mb-3'>
                {addresses.map(address => (
                  <label
                    key={address._id}
                    className='block border p-3 rounded cursor-pointer hover:bg-gray-50'
                  >
                    <input
                      type='radio'
                      name='selectedAddress'
                      className='mr-2'
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                    />
                    <span className='font-semibold'>{address.fullName}</span> - {address.phone}
                    <div className='text-sm text-gray-600'>
                      {address.street}, {address.ward}, {address.province}
                    </div>
                  </label>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className='bg-white text-blue-600 border border-blue-400 hover:bg-blue-50 font-medium mt-2 px-3 py-1 rounded flex items-center gap-1 transition'
            >
              <FiPlus />
              Thêm địa chỉ mới
            </button>

            {/* Modal thêm địa chỉ */}
            {isModalOpen && (
              <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 text-black'>
                <div className='bg-white/80 backdrop-blur-md p-6 rounded-lg w-[95%] max-w-md shadow-lg relative border border-gray-200'>
                  <h3 className='text-lg font-bold mb-4'>Thêm địa chỉ mới</h3>
                  {['fullName', 'phone', 'street', 'ward', 'province'].map(field => (
                    <input
                      key={field}
                      placeholder={field}
                      className='w-full border p-2 mb-2 rounded text-sm bg-white/70 backdrop-blur placeholder-black text-black'
                      value={(form as any)[field]}
                      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    />
                  ))}
                  <div className='flex justify-end gap-2 mt-4'>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={handleCreateAddress}
                      className='px-4 py-2 bg-[#C4265B] text-white rounded hover:bg-[#a61e48]'
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bảng sản phẩm */}
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
                    const isDiscounted = v?.salePrice < v?.listPrice;
                    return (
                      <tr key={v._id} className='border-t'>
                        <td className='p-3 flex items-center gap-3'>
                          <img src={v.image || '/placeholder.jpg'} alt={v.title} className='w-40 h-40 rounded object-cover' />
                          <div>
                            <p className='font-semibold text-gray-800'>{v.title}</p>
                            <p className='text-xs text-gray-500'>Mã: {v.variantCode}</p>
                          </div>
                        </td>
                        <td className='p-3'>
                          {isDiscounted ? (
                            <>
                              <span className='line-through text-sm text-gray-400 mr-1'>{(v.listPrice || 0).toLocaleString()}₫</span>
                              <span className='text-red-600 font-semibold'>{(v.salePrice || 0).toLocaleString()}₫</span>
                            </>
                          ) : (
                            <span className='text-gray-800'>{(v.listPrice || 0).toLocaleString()}₫</span>
                          )}
                        </td>
                        <td className='p-3'>
                          <div className='flex items-center gap-2'>
                            <button onClick={() => handleQuantityChange(v._id, item.quantity - 1)} disabled={item.quantity <= 1} className={`w-8 h-8 border rounded ${item.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>−</button>
                            <span className='px-3 py-1 border rounded bg-white min-w-[2rem] text-center'>{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(v._id, item.quantity + 1)} className='w-8 h-8 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700'>+</button>
                          </div>
                        </td>
                        <td className='p-3 font-semibold text-gray-800'>{(v.salePrice * item.quantity).toLocaleString()}₫</td>
                        <td className='p-3 text-center text-red-500 cursor-pointer hover:text-red-700' onClick={() => handleRemove(v._id)}>
                          <FaTrashAlt size={20} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng cộng và đặt hàng */}
          <div className='bg-white shadow-md p-6 rounded-xl mb-6'>
            <h2 className='text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2'>
              <HiOutlineReceiptRefund className='text-[#C4265B]' size={22} />
              Tóm tắt đơn hàng
            </h2>
            <div className='space-y-3 text-base text-gray-900'>
              <div className='flex justify-between'>
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString()}₫</span>
              </div>
              <div className='flex justify-between'>
                <span>Phí vận chuyển:</span>
                <span>{shippingCost.toLocaleString()}₫</span>
              </div>
              <div className='flex justify-between font-bold text-lg text-[#C4265B] pt-2 mt-2'>
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString()}₫</span>
              </div>
            </div>
          </div>

          <button onClick={handlePlaceOrder} className='w-full bg-[#C4265B] text-white py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 hover:bg-blue-700'>
            <FaShoppingCart size={18} />
            Đặt hàng ngay
          </button>
        </>
      )}
    </div>
  );
};

export default CartItemsTable;
