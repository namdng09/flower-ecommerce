import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '~/store';
import { createOrder } from '~/store/slices/orderSlice';
import { fetchAddresses, createAddress } from '~/store/slices/addressSlice';
import { AuthContext } from '~/contexts/authContext';
import { FaShoppingCart, FaUserSecret, FaMoneyBillWave } from 'react-icons/fa';
import {
  FiSend,
  FiGift,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPlus
} from 'react-icons/fi';

const OrderPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const cart = useSelector((state: RootState) => state.carts);
  const { addresses } = useSelector((state: RootState) => state.addresses);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
  const [shippingCost] = useState<number>(30000);
  const [giftMessage, setGiftMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [note, setNote] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    province: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      setSelectedAddressId(defaultAddress?._id || addresses[0]._id);
    }
  }, [addresses]);

  const handleOrder = async () => {
    if (!user) return alert('Vui lòng đăng nhập');
    if (!selectedAddressId) return alert('Vui lòng chọn địa chỉ');
    if (cart.items.length === 0) return alert('Giỏ hàng trống');

    let deliveryTimeRequested;
    if (deliveryDate && deliveryTime) {
      const combined = new Date(`${deliveryDate}T${deliveryTime}`);
      if (!isNaN(combined.getTime())) {
        deliveryTimeRequested = combined.toISOString();
      }
    }

    const orderData = {
      user: user.id,
      address: selectedAddressId,
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
      customization: {
        giftMessage: giftMessage.trim() || undefined,
        isAnonymous,
        deliveryTimeRequested
      },
      description: note
    };

    try {
      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        const order = result.payload;
        navigate(`/home/order-success/${order._id}`);
      } else {
        navigate('/home/order-fail');
      }
    } catch (error) {
      console.error('Order failed:', error);
      navigate('/home/order-fail');
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
    <div className='max-w-6xl mx-auto p-6 mt-50 text-black'>
      <h2 className='text-2xl font-semibold mb-4 flex items-center gap-2'>
        <FaShoppingCart className='text-[#C4265B]' size={22} />
        Xác nhận đơn hàng
      </h2>

      {/* Địa chỉ giao hàng */}
      <div className='bg-white shadow-md rounded p-4 mb-6'>
        <h3 className='font-bold mb-2 text-[#C4265B] flex items-center gap-2'>
          <FiMapPin className='text-blue-500' />
          Địa chỉ giao hàng
        </h3>
        {addresses.length === 0 ? (
          <p>Bạn chưa có địa chỉ nào.</p>
        ) : (
          <div className='space-y-2 mb-3'>
            {addresses.map(address => (
              <label
                key={address._id}
                className='block border p-3 rounded cursor-pointer'
              >
                <input
                  type='radio'
                  name='selectedAddress'
                  className='mr-2'
                  checked={selectedAddressId === address._id}
                  onChange={() => setSelectedAddressId(address._id)}
                />
                <span className='font-semibold'>{address.fullName}</span> -{' '}
                {address.phone}
                <div className='text-sm text-gray-600'>
                  {address.street}, {address.ward}, {address.province}
                </div>
              </label>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className='border px-3 py-1 rounded text-blue-600 border-blue-400 hover:bg-blue-50 flex items-center gap-1'
        >
          <FiPlus className='text-blue-500' /> Thêm địa chỉ mới
        </button>

        {/* Modal thêm địa chỉ */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg w-[95%] max-w-md shadow-lg border'>
              <h3 className='text-lg font-bold mb-4'>Thêm địa chỉ mới</h3>
              {['fullName', 'phone', 'street', 'ward', 'province'].map(
                field => (
                  <input
                    key={field}
                    placeholder={field}
                    className='w-full border p-2 mb-2 rounded text-sm'
                    value={(form as any)[field]}
                    onChange={e =>
                      setForm(prev => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                )
              )}
              <div className='flex justify-end gap-2 mt-4'>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 bg-gray-200 rounded'
                >
                  Huỷ
                </button>
                <button
                  onClick={handleCreateAddress}
                  className='px-4 py-2 bg-[#C4265B] text-white rounded'
                >
                  Lưu địa chỉ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className='bg-white shadow-md rounded p-4 mb-4'>
        <table className='w-full'>
          <thead>
            <tr className='border-b'>
              <th className='text-left py-2'>Sản phẩm</th>
              <th className='text-left py-2'>SL</th>
              <th className='text-left py-2'>Giá</th>
              <th className='text-left py-2'>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item, index) => (
              <tr key={index} className='border-b'>
                <td className='py-2 flex gap-2 items-center'>
                  <img
                    src={item.variantId.image}
                    className='w-16 h-16 object-cover rounded'
                  />
                  <div>
                    <div>{item.variantId.title}</div>
                    <div className='text-sm text-gray-500'>
                      Mã: {item.variantId.variantCode}
                    </div>
                  </div>
                </td>
                <td>{item.quantity}</td>
                <td>{item.price.toLocaleString()}₫</td>
                <td>{(item.price * item.quantity).toLocaleString()}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tuỳ chọn */}
      <div className='bg-white shadow-md rounded p-4 space-y-4 mb-4'>
        <label className='block'>
          <div className='flex items-center gap-2 mb-1'>
            <FiGift className='text-pink-500' /> Lời chúc:
          </div>
          <input
            className='w-full border rounded p-2'
            placeholder='VD: Chúc mừng sinh nhật...'
            value={giftMessage}
            onChange={e => setGiftMessage(e.target.value)}
          />
        </label>

        <label className='flex items-center gap-2'>
          <FaUserSecret className='text-purple-500' />
          <input
            type='checkbox'
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
          />
          Gửi ẩn danh
        </label>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <label>
            <div className='flex items-center gap-2 mb-1'>
              <FiCalendar className='text-green-600' /> Ngày giao mong muốn
            </div>
            <input
              type='date'
              className='w-full border rounded p-2'
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
            />
          </label>

          <label>
            <div className='flex items-center gap-2 mb-1'>
              <FiClock className='text-sky-500' /> Giờ giao mong muốn
            </div>
            <input
              type='time'
              className='w-full border rounded p-2'
              value={deliveryTime}
              onChange={e => setDeliveryTime(e.target.value)}
            />
          </label>
        </div>

        <label>
          <div className='flex items-center gap-2 mb-1'>
            <FaMoneyBillWave className='text-emerald-600' /> Phương thức thanh
            toán
          </div>
          <select
            value={paymentMethod}
            onChange={e =>
              setPaymentMethod(e.target.value as 'cod' | 'banking')
            }
            className='w-full border rounded p-2'
          >
            <option value='cod'>Thanh toán khi nhận hàng (COD)</option>
            <option value='banking'>Chuyển khoản ngân hàng</option>
          </select>
        </label>

        <textarea
          placeholder='Ghi chú đơn hàng...'
          value={note}
          onChange={e => setNote(e.target.value)}
          className='w-full border rounded p-2 mt-8'
          rows={3}
        />
      </div>

      <div className='bg-white shadow-md rounded-xl p-4 mb-6'>
        <div className='flex justify-between items-center text-lg md:text-xl font-semibold'>
          <span className='text-gray-800'>Tổng cộng:</span>
          <span className='text-[#C4265B] text-2xl bold'>
            {(totalPrice + shippingCost).toLocaleString()}₫
          </span>
        </div>
      </div>

      <button
        onClick={handleOrder}
        className='w-full bg-[#C4265B] hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2'
      >
        <FiSend size={18} className='text-white' />
        Đặt hàng ngay
      </button>
    </div>
  );
};

export default OrderPage;
