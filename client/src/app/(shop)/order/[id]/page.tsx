import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '~/store/slices/orderSlice';
import { useParams } from 'react-router';
import type { RootState } from '~/store';

const OrderDetailPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id as string));
    }
  }, [dispatch, id]);

  if (loading || !currentOrder) return <p className='p-6'>Loading...</p>;
  if (error) return <p className='p-6 text-red-500'>{error}</p>;

  const {
    orderNumber,
    status,
    totalPrice,
    totalQuantity,
    payment,
    shipment,
    customization,
    address,
    items,
    createdAt
  } = currentOrder;

  return (
    <div className='p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-6'>
      <h1 className='text-3xl font-bold text-gray-800 border-b pb-2'>
        Chi tiết đơn hàng: <span className='text-blue-600'>{orderNumber}</span>
      </h1>

      {/* Thông tin chung */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-gray-50 p-4 rounded-lg shadow-sm'>
          <h2 className='text-lg font-semibold mb-2'>Thông tin đơn hàng</h2>
          <p>
            <b>Trạng thái:</b>{' '}
            <span className='capitalize text-yellow-600'>{status}</span>
          </p>
          <p>
            <b>Ngày tạo:</b> {new Date(createdAt).toLocaleString()}
          </p>
          <p>
            <b>Tổng SL:</b> {totalQuantity}
          </p>
          <p>
            <b>Tổng tiền:</b>{' '}
            <span className='text-green-600 font-semibold'>
              {totalPrice.toLocaleString()}đ
            </span>
          </p>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg shadow-sm'>
          <h2 className='text-lg font-semibold mb-2'>
            Thanh toán & Vận chuyển
          </h2>
          <p>
            <b>Thanh toán:</b> {payment?.method?.toUpperCase()} -{' '}
            <span
              className={
                payment?.status === 'unpaid' ? 'text-red-500' : 'text-green-600'
              }
            >
              {payment?.status}
            </span>
          </p>
          <p>
            <b>Phí ship:</b> {shipment?.shippingCost?.toLocaleString()}đ
          </p>
          <p>
            <b>Trạng thái giao:</b> {shipment?.status}
          </p>
        </div>
      </div>

      {/* Tùy chỉnh */}
      <div className='bg-gray-50 p-4 rounded-lg shadow-sm'>
        <h2 className='text-lg font-semibold mb-2'>Lời nhắn & Giao hàng</h2>
        <p>
          <b>Lời chúc:</b> {customization?.giftMessage || 'Không có'}
        </p>
        <p>
          <b>Ẩn người gửi:</b> {customization?.isAnonymous ? 'Có' : 'Không'}
        </p>
        <p>
          <b>Thời gian giao yêu cầu:</b>{' '}
          {customization?.deliveryTimeRequested
            ? new Date(customization.deliveryTimeRequested).toLocaleString()
            : 'Không'}
        </p>
      </div>

      {/* Địa chỉ */}
      <div className='bg-gray-50 p-4 rounded-lg shadow-sm'>
        <h2 className='text-lg font-semibold mb-2'>Địa chỉ nhận hàng</h2>
        <div className='text-sm text-gray-700 space-y-1'>
          <p>
            <b>Người nhận:</b> {address?.fullName}
          </p>
          <p>
            <b>Số điện thoại:</b> {address?.phone}
          </p>
          <p>
            <b>Địa chỉ:</b> {address?.street}, {address?.ward},{' '}
            {address?.province}
          </p>
          <p>
            <b>Loại địa chỉ:</b>{' '}
            {address?.addressType === 'home'
              ? 'Nhà riêng'
              : address?.addressType}
          </p>
          {address?.isDefault && (
            <p className='text-green-600 font-medium'>Địa chỉ mặc định</p>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className='bg-gray-50 p-4 rounded-lg shadow-sm'>
        <h2 className='text-lg font-semibold mb-3'>Danh sách sản phẩm</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm border border-gray-200'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='text-left px-4 py-2 border-b'>#</th>
                <th className='text-left px-4 py-2 border-b'>Mã Biến thể</th>
                <th className='text-left px-4 py-2 border-b'>Số lượng</th>
                <th className='text-left px-4 py-2 border-b'>Giá</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr key={idx} className='border-b hover:bg-gray-50'>
                  <td className='px-4 py-2'>{idx + 1}</td>
                  <td className='px-4 py-2'>
                    {item.variant?.variantCode || 'N/A'}
                  </td>
                  <td className='px-4 py-2'>{item.quantity}</td>
                  <td className='px-4 py-2'>{item.price.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
