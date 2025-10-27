import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '~/store';
import { createOrder } from '~/store/slices/orderSlice';
import { fetchAddresses, createAddress } from '~/store/slices/addressSlice';
import {
  fetchVouchers,
  validateVoucher,
  calculateDiscount,
  clearError,
  clearCurrentVoucher
} from '~/store/slices/voucherSlice';
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
import { toast } from 'react-toastify';

const OrderPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const cart = useSelector((state: RootState) => state.carts);
  const { addresses } = useSelector((state: RootState) => state.addresses);
  const voucherState = useSelector((state: RootState) => state.voucher);

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

  // Voucher form
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses(user.id));
    }
    dispatch(fetchVouchers());
  }, [user, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      setSelectedAddressId(defaultAddress?._id || addresses[0]._id);
    }
  }, [addresses]);

  // Tổng tiền trước giảm giá
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính giảm giá từ voucher
  const discountValue = voucherState.currentVoucher
    ? Math.floor(calculateDiscount(voucherState.currentVoucher, totalPrice))
    : 0;

  // Tổng tiền sau giảm giá
  const totalPriceAfterDiscount = Math.max(totalPrice - discountValue, 0);

  // Xử lý nhập voucher
  const handleApplyVoucher = async () => {
    setVoucherError(null);
    dispatch(clearError());
    if (!voucherInput.trim()) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }
    try {
      await dispatch(
        validateVoucher({ code: voucherInput, orderValue: totalPrice })
      ).unwrap();
    } catch (err: any) {
      setVoucherError(
        typeof err === 'string' ? err : 'Mã voucher không hợp lệ'
      );
    }
  };

  // Xoá voucher
  const handleRemoveVoucher = () => {
    setVoucherInput('');
    dispatch(clearCurrentVoucher());
    setVoucherError(null);
  };

  const redirectToPayOS = (paymentData: any) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${import.meta.env.VITE_API_URL}/api/payments/create-payment-link`;
    form.style.display = 'none';

    for (const key in paymentData) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const handleOrder = async () => {
    if (!user) {
      toast.warn('⚠️ Vui lòng đăng nhập để tiếp tục!');
      return;
    }

    if (!selectedAddressId) {
      toast.warn('📍 Vui lòng chọn địa chỉ giao hàng!');
      return;
    }

    if (cart.items.length === 0) {
      toast.warn('🛒 Giỏ hàng của bạn đang trống!');
      return;
    }

    let deliveryTimeRequested;
    if (deliveryDate && deliveryTime) {
      const combined = new Date(`${deliveryDate}T${deliveryTime}`);
      if (!isNaN(combined.getTime())) {
        deliveryTimeRequested = combined.toISOString();
      }
    }

    // Thêm voucher vào metadata nếu có
    const metadata: any = {};
    if (voucherState.currentVoucher) {
      metadata.voucherData = {
        code: voucherState.currentVoucher.code,
        discountType: voucherState.currentVoucher.discountType,
        discountValue: voucherState.currentVoucher.discountValue,
        id: voucherState.currentVoucher._id
      };
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
        amount: totalPriceAfterDiscount + shippingCost,
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
      description: note.trim() || 'Gửi đơn hàng',
      metadata: Object.keys(metadata).length ? metadata : undefined
    };

    try {
      const result = await dispatch(createOrder(orderData));

      if (createOrder.fulfilled.match(result)) {
        const orders = result.payload;

        // Nếu trả về mảng
        if (Array.isArray(orders) && orders.length > 0) {
          // Đơn hàng mới nhất là cuối mảng (thường backend push theo thứ tự tạo)
          const latestOrder = orders[orders.length - 1];
          const orderId = latestOrder._id;
          const orderNumber = latestOrder.orderNumber;

          if (paymentMethod === 'banking') {
            const amountInt = Math.max(
              Math.floor(totalPriceAfterDiscount + shippingCost),
              1
            );
            redirectToPayOS({
              amount: amountInt,
              description: orderNumber,
              returnUrl: `${window.location.origin}/home/order-success/${orderId}`,
              cancelUrl: `${window.location.origin}/home/order-fail`
            });
            return;
          }

          // Nếu COD
          navigate(`/home/order-success/${orderId}`);
        } else if (orders && orders._id) {
          // Nếu trả về 1 object
          const orderId = orders._id;
          if (paymentMethod === 'banking') {
            const amountInt = Math.max(
              Math.floor(totalPriceAfterDiscount + shippingCost),
              1
            );
            redirectToPayOS({
              amount: amountInt,
              description: orders.orderNumber,
              returnUrl: `${window.location.origin}/home/order-success/${orderId}`,
              cancelUrl: `${window.location.origin}/home/order-fail`
            });
            return;
          }
          navigate(`/home/order-success/${orderId}`);
        } else {
          toast.error('Không có đơn hàng nào được tạo.');
          navigate('/home/order-fail');
        }
      } else {
        console.error('❌ createOrder bị reject:', result);
        toast.error(result.payload || 'Đặt hàng thất bại. Vui lòng thử lại.');
        navigate('/home/order-fail');
      }
    } catch (error) {
      console.error('❌ Exception khi gọi createOrder:', error);
      toast.error('Đã xảy ra lỗi khi đặt hàng!');
      navigate('/home/order-fail');
    }
  };

  const handleCreateAddress = async () => {
    if (!user) {
      toast.warn('⚠️ Vui lòng đăng nhập để tiếp tục!');
      return;
    }

    const newAddress = { ...form, user: user.id };

    try {
      await dispatch(createAddress(newAddress)).unwrap();
      toast.success('🎉 Đã thêm địa chỉ mới thành công!');
      setForm({ fullName: '', phone: '', street: '', ward: '', province: '' });
      setIsModalOpen(false);

      dispatch(fetchAddresses(user.id));
    } catch (error) {
      console.error(error);
      toast.error('❌ Thêm địa chỉ thất bại!');
    }
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
                {address.addressType && (
                  <div className='text-xs text-gray-700 italic mt-1'>
                    📍 Loại địa chỉ:{' '}
                    <span className='capitalize'>{address.addressType}</span>
                  </div>
                )}
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
              {[
                { key: 'fullName', placeholder: 'Họ và tên người nhận' },
                { key: 'phone', placeholder: 'Số điện thoại' },
                {
                  key: 'street',
                  placeholder: 'Địa chỉ cụ thể (số nhà, đường)'
                },
                { key: 'ward', placeholder: 'Phường / Xã' },
                { key: 'province', placeholder: 'Tỉnh / Thành phố' }
              ].map(field => (
                <input
                  key={field.key}
                  placeholder={field.placeholder}
                  className='w-full border p-2 mb-2 rounded text-sm'
                  value={(form as any)[field.key]}
                  onChange={e =>
                    setForm(prev => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              ))}
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
            {cart.items.map((item, index) => {
              const variant = item.variantId;
              const productTitle = variant.product?.[0]?.title || 'Sản phẩm';

              return (
                <tr key={index} className='border-b'>
                  <td className='py-2 flex gap-2 items-center'>
                    <img
                      src={variant.image}
                      className='w-16 h-16 object-cover rounded'
                    />
                    <div>
                      <div className='text-sm font-bold uppercase text-[#C4265B]'>
                        {productTitle}
                      </div>
                      <div>{variant.title}</div>
                      <div className='text-sm text-gray-500'>
                        Mã: {variant.variantCode}
                      </div>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toLocaleString()}₫</td>
                  <td>{(item.price * item.quantity).toLocaleString()}₫</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Voucher form */}
      <div className='bg-white shadow-md rounded p-4 mb-4'>
        <h3 className='font-bold mb-2 text-[#C4265B]'>Mã giảm giá (Voucher)</h3>
        {voucherState.currentVoucher ? (
          <div className='flex items-center justify-between bg-green-50 border border-green-400 rounded p-2 mb-2'>
            <div>
              <span className='font-semibold text-green-700'>
                {voucherState.currentVoucher.code}
              </span>
              <span className='ml-2 text-sm text-gray-700'>
                {voucherState.currentVoucher.description}
              </span>
              <div className='text-sm text-green-600'>
                Giảm: {discountValue.toLocaleString()}₫
              </div>
            </div>
            <button
              onClick={handleRemoveVoucher}
              className='text-red-500 px-2 py-1 rounded hover:bg-red-100'
            >
              Xoá
            </button>
          </div>
        ) : (
          <div className='flex gap-2 items-center'>
            <input
              type='text'
              placeholder='Nhập mã voucher...'
              className='border rounded p-2 flex-1'
              value={voucherInput}
              onChange={e => setVoucherInput(e.target.value)}
            />
            <button
              onClick={handleApplyVoucher}
              className='bg-[#C4265B] text-white px-4 py-2 rounded'
              disabled={voucherState.loading}
            >
              Áp dụng
            </button>
          </div>
        )}
        {(voucherError || voucherState.error) && (
          <div className='text-red-500 mt-2 text-sm'>
            {voucherError || voucherState.error}
          </div>
        )}
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
        {discountValue > 0 && (
          <div className='flex justify-between items-center text-sm text-green-700 mt-2'>
            <span>Đã giảm giá:</span>
            <span>-{discountValue.toLocaleString()}₫</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span>Phí vận chuyển:</span>
          <span>{shippingCost.toLocaleString()}₫</span>
        </div>
        <div className='flex justify-between items-center text-lg md:text-xl font-semibold'>
          <span className='text-gray-800'>Tổng cộng:</span>
          <span className='text-[#C4265B] text-2xl bold'>
            {(totalPriceAfterDiscount + shippingCost).toLocaleString()}₫
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
