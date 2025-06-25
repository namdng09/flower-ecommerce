import { useOutletContext } from 'react-router';
import type { CartItem } from '../Cart/Cart';

export default function CheckoutPage() {
  const { cartItems } = useOutletContext<{ cartItems: CartItem[] }>();

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 70000;
  const discount = subtotal * 0.12;
  const total = subtotal - discount + shippingFee;

  return (
    <div className='max-w-screen-xl mx-auto pt-32 px-4 pb-12 grid md:grid-cols-3 gap-8 mt-30 text-gray-500'>
      <div className='md:col-span-2 bg-white rounded-xl shadow p-6'>
        <h2 className='text-pink-600 text-xl font-semibold mb-4 border-b pb-2'>
          Thông tin giao hàng
        </h2>
        <form className='space-y-4 text-sm'>
          <div className='grid grid-cols-2 gap-4'>
            <input
              required
              placeholder='Họ và tên*'
              className='border p-2 rounded'
            />
            <input
              required
              placeholder='Số điện thoại*'
              className='border p-2 rounded'
            />
          </div>
          <input
            required
            placeholder='Địa chỉ email'
            className='border p-2 rounded w-full'
          />
          <div className='grid grid-cols-2 gap-4'>
            <input
              placeholder='Tỉnh/Thành phố*'
              className='border p-2 rounded'
            />
            <input placeholder='Quận/Huyện*' className='border p-2 rounded' />
          </div>
          <input
            placeholder='Xã/Phường/Thị trấn'
            className='border p-2 rounded w-full'
          />
          <input
            required
            placeholder='Địa chỉ cụ thể*'
            className='border p-2 rounded w-full'
          />
          <label className='flex items-center gap-2'>
            <input type='checkbox' /> Giấu tên người gửi?
          </label>

          <h3 className='text-pink-600 font-semibold mt-6'>
            Thời gian giao hàng
          </h3>
          <input type='date' className='border p-2 rounded w-full' />

          <h3 className='text-pink-600 font-semibold mt-6'>Thiệp & ghi chú</h3>
          <input
            placeholder='Thiệp gửi tặng cho'
            className='border p-2 rounded w-full'
          />
          <input placeholder='Nhân dịp' className='border p-2 rounded w-full' />
          <textarea
            placeholder='Thông điệp'
            className='border p-2 rounded w-full'
          ></textarea>
          <textarea
            placeholder='Ghi chú đơn hàng (nếu có)'
            className='border p-2 rounded w-full'
          ></textarea>
        </form>
      </div>

      <div className='bg-white rounded-xl shadow p-6'>
        <h2 className='text-pink-600 text-xl font-semibold mb-4 border-b pb-2'>
          Sản phẩm
        </h2>
        <div className='space-y-4'>
          {cartItems.map(item => (
            <div key={item.id} className='flex justify-between items-start'>
              <div className='flex gap-2'>
                <img
                  src={item.image}
                  alt={item.name}
                  className='w-16 h-16 rounded object-cover'
                />
                <div>
                  <p className='text-sm font-medium text-black leading-5'>
                    {item.name}
                  </p>
                  <p className='text-xs text-gray-400'>SKU: HT{item.id}</p>
                </div>
              </div>
              <div className='text-right text-sm'>
                <p className='text-pink-600 font-semibold'>
                  {item.price.toLocaleString()} VNĐ
                </p>
                <p className='text-xs text-gray-400'>x {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className='my-4' />

        <div className='text-sm space-y-2'>
          <div className='flex justify-between'>
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString()} VNĐ</span>
          </div>
          <div className='flex justify-between text-green-600'>
            <span>Giảm giá 12%:</span>
            <span>-{discount.toLocaleString()} VNĐ</span>
          </div>
          <div className='flex justify-between'>
            <span>Phí vận chuyển:</span>
            <span>{shippingFee.toLocaleString()} VNĐ</span>
          </div>
          <div className='flex justify-between font-semibold text-base mt-2'>
            <span>Tổng:</span>
            <span className='text-pink-600'>{total.toLocaleString()} VNĐ</span>
          </div>
        </div>

        <h3 className='text-pink-600 font-semibold mt-6 mb-2'>
          Phương thức thanh toán
        </h3>
        <div className='space-y-2 text-sm'>
          <label className='flex items-center gap-2'>
            <input type='radio' name='payment' defaultChecked />
            Chuyển khoản ngân hàng
          </label>
          <p className='text-xs text-gray-500 ml-5'>
            Thực hiện thanh toán vào tài khoản ngân hàng của chúng tôi. Vui lòng
            sử dụng mã đơn hàng của bạn khi thanh toán. Đơn hàng của bạn sẽ được
            xử lý sau khi chúng tôi nhận được tiền.
          </p>
          <label className='flex items-center gap-2'>
            <input type='radio' name='payment' /> Trả tiền mặt khi nhận hàng
          </label>
          <label className='flex items-center gap-2'>
            <input type='radio' name='payment' /> PayPal Standard
          </label>
        </div>

        <button className='w-full mt-6 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600'>
          Đặt hàng
        </button>
      </div>
    </div>
  );
}
