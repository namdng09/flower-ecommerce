import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { fetchOrderById } from '~/store/slices/orderSlice';
import { useParams, Link } from 'react-router';

const OrderDetailPage = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { currentOrder, loading, error } = useAppSelector(
    state => state.orders
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
    shop,
    user,
    metadata,
    description,
    expectedDeliveryAt,
    createdAt,
    updatedAt
  } = currentOrder;

  // Status badge color helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      ready_for_pickup: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      returned: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'text-green-600',
      unpaid: 'text-red-500',
      awaiting_payment: 'text-yellow-600',
      expired: 'text-gray-500',
      refunded: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getShipmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-gray-600',
      picking_up: 'text-blue-600',
      out_for_delivery: 'text-purple-600',
      delivered: 'text-green-600',
      failed: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className='p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start border-b pb-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>
            Đơn hàng: <span className='text-blue-600'>{orderNumber}</span>
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Tạo lúc: {new Date(createdAt).toLocaleString('vi-VN')}
          </p>
          <p className='text-sm text-gray-500'>
            Cập nhật: {new Date(updatedAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(status)}`}
        >
          {status.toUpperCase().replace(/_/g, ' ')}
        </span>
      </div>

      {/* Shop & User Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100'>
          <h2 className='text-lg font-semibold mb-3 flex items-center text-blue-800'>
            <svg
              className='w-5 h-5 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
            </svg>
            Thông tin Shop
          </h2>
          <div className='space-y-2 text-sm'>
            <p>
              <b className='text-gray-700'>Tên:</b>{' '}
              <span className='text-gray-900'>{shop.fullName || 'N/A'}</span>
            </p>
            {shop.email && (
              <p>
                <b className='text-gray-700'>Email:</b>{' '}
                <span className='text-gray-900'>{shop.email}</span>
              </p>
            )}
            {shop.phone && (
              <p>
                <b className='text-gray-700'>SĐT:</b>{' '}
                <span className='text-gray-900'>{shop.phone}</span>
              </p>
            )}
            <p className='text-xs text-gray-500 mt-2'>ID: {shop._id}</p>
          </div>
        </div>

        <div className='bg-green-50 p-4 rounded-lg shadow-sm border border-green-100'>
          <h2 className='text-lg font-semibold mb-3 flex items-center text-green-800'>
            <svg
              className='w-5 h-5 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                clipRule='evenodd'
              />
            </svg>
            Thông tin Khách hàng
          </h2>
          <div className='space-y-2 text-sm'>
            <p>
              <b className='text-gray-700'>Tên:</b>{' '}
              <span className='text-gray-900'>{user.fullName}</span>
            </p>
            {user.email && (
              <p>
                <b className='text-gray-700'>Email:</b>{' '}
                <span className='text-gray-900'>{user.email}</span>
              </p>
            )}
            {user.phone && (
              <p>
                <b className='text-gray-700'>SĐT:</b>{' '}
                <span className='text-gray-900'>{user.phone}</span>
              </p>
            )}
            <p className='text-xs text-gray-500 mt-2'>ID: {user._id}</p>
          </div>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm text-center border border-blue-200'>
          <p className='text-sm text-blue-600 font-medium mb-1'>
            Tổng số lượng
          </p>
          <p className='text-3xl font-bold text-blue-700'>{totalQuantity}</p>
        </div>
        <div className='bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg shadow-sm text-center border border-orange-200'>
          <p className='text-sm text-orange-600 font-medium mb-1'>
            Phí vận chuyển
          </p>
          <p className='text-3xl font-bold text-orange-700'>
            {shipment?.shippingCost?.toLocaleString() || 0}đ
          </p>
        </div>
        <div className='bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm text-center border border-green-200'>
          <p className='text-sm text-green-600 font-medium mb-1'>Tổng tiền</p>
          <p className='text-3xl font-bold text-green-700'>
            {totalPrice.toLocaleString()}đ
          </p>
        </div>
      </div>

      {/* Payment & Shipment */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200'>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>
            💳 Thanh toán
          </h2>
          <div className='space-y-2 text-sm'>
            <p>
              <b className='text-gray-700'>Phương thức:</b>{' '}
              <span className='uppercase font-medium text-gray-900'>
                {payment?.method}
              </span>
            </p>
            <p>
              <b className='text-gray-700'>Trạng thái:</b>{' '}
              <span
                className={`font-semibold ${getPaymentStatusColor(payment?.status)}`}
              >
                {payment?.status.toUpperCase().replace(/_/g, ' ')}
              </span>
            </p>
            <p>
              <b className='text-gray-700'>Số tiền:</b>{' '}
              <span className='text-green-600 font-semibold'>
                {payment?.amount?.toLocaleString()}đ
              </span>
            </p>
            {payment?.description && (
              <p>
                <b className='text-gray-700'>Mô tả:</b>{' '}
                <span className='text-gray-900'>{payment.description}</span>
              </p>
            )}
            {payment?.paymentDate && (
              <p>
                <b className='text-gray-700'>Ngày thanh toán:</b>{' '}
                <span className='text-gray-900'>
                  {new Date(payment.paymentDate).toLocaleString('vi-VN')}
                </span>
              </p>
            )}
            {payment?.gatewayRef && (
              <p>
                <b className='text-gray-700'>Mã giao dịch:</b>{' '}
                <span className='font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-800'>
                  {payment.gatewayRef}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200'>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>
            🚚 Vận chuyển
          </h2>
          <div className='space-y-2 text-sm'>
            <p>
              <b className='text-gray-700'>Trạng thái:</b>{' '}
              <span
                className={`font-semibold ${getShipmentStatusColor(shipment?.status)}`}
              >
                {shipment?.status.toUpperCase().replace(/_/g, ' ')}
              </span>
            </p>
            <p>
              <b className='text-gray-700'>Phí ship:</b>{' '}
              <span className='text-orange-600 font-semibold'>
                {shipment?.shippingCost?.toLocaleString()}đ
              </span>
            </p>
            {shipment?.carrier && (
              <p>
                <b className='text-gray-700'>Đơn vị vận chuyển:</b>{' '}
                <span className='text-gray-900'>{shipment.carrier}</span>
              </p>
            )}
            {shipment?.trackingNumber && (
              <p>
                <b className='text-gray-700'>Mã vận đơn:</b>{' '}
                <span className='font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-800'>
                  {shipment.trackingNumber}
                </span>
              </p>
            )}
            {shipment?.deliveredAt && (
              <p>
                <b className='text-gray-700'>Ngày giao:</b>{' '}
                <span className='text-gray-900'>
                  {new Date(shipment.deliveredAt).toLocaleString('vi-VN')}
                </span>
              </p>
            )}
            {shipment?.returnReason && (
              <p className='text-red-600'>
                <b>Lý do trả hàng:</b> {shipment.returnReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Voucher Info */}
      {metadata?.voucherData && (
        <div className='bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200'>
          <h2 className='text-lg font-semibold mb-3 text-purple-800'>
            🎟️ Thông tin Voucher
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            {metadata.voucherData.code && (
              <p>
                <b className='text-gray-700'>Mã:</b>{' '}
                <span className='font-mono bg-purple-200 px-2 py-1 rounded text-purple-800'>
                  {metadata.voucherData.code}
                </span>
              </p>
            )}
            {metadata.voucherData.discountType && (
              <p>
                <b className='text-gray-700'>Loại:</b>{' '}
                <span className='text-gray-900'>
                  {metadata.voucherData.discountType === 'percentage'
                    ? 'Phần trăm'
                    : 'Cố định'}
                </span>
              </p>
            )}
            {metadata.voucherData.discountValue !== undefined && (
              <p>
                <b className='text-gray-700'>Giảm:</b>{' '}
                <span className='text-purple-600 font-semibold'>
                  {metadata.voucherData.discountType === 'percentage'
                    ? `${metadata.voucherData.discountValue}%`
                    : `${metadata.voucherData.discountValue.toLocaleString()}đ`}
                </span>
              </p>
            )}
            {metadata.voucherData.id && (
              <p className='text-xs text-gray-500'>
                <b>Voucher ID:</b> {metadata.voucherData.id}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customization */}
      {customization && (
        <div className='bg-pink-50 p-4 rounded-lg shadow-sm border border-pink-200'>
          <h2 className='text-lg font-semibold mb-3 text-pink-800'>
            💝 Tùy chỉnh đơn hàng
          </h2>
          <div className='space-y-2 text-sm'>
            {customization.giftMessage && (
              <p>
                <b className='text-gray-700'>Lời chúc:</b>{' '}
                <span className='italic text-gray-700'>
                  "{customization.giftMessage}"
                </span>
              </p>
            )}
            <p>
              <b className='text-gray-700'>Ẩn người gửi:</b>{' '}
              {customization.isAnonymous ? (
                <span className='text-green-600 font-medium'>✓ Có</span>
              ) : (
                <span className='text-gray-500'>✗ Không</span>
              )}
            </p>
            {customization.deliveryTimeRequested && (
              <p>
                <b className='text-gray-700'>Thời gian giao yêu cầu:</b>{' '}
                <span className='text-gray-900'>
                  {new Date(
                    customization.deliveryTimeRequested
                  ).toLocaleString('vi-VN')}
                </span>
              </p>
            )}
            {customization.notes && (
              <p>
                <b className='text-gray-700'>Ghi chú:</b>{' '}
                <span className='text-gray-900'>{customization.notes}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expected Delivery & Description */}
      {(expectedDeliveryAt || description) && (
        <div className='bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200'>
          {expectedDeliveryAt && (
            <p className='mb-2 text-sm'>
              <b className='text-gray-700'>📅 Ngày giao dự kiến:</b>{' '}
              <span className='text-blue-600 font-semibold'>
                {new Date(expectedDeliveryAt).toLocaleString('vi-VN')}
              </span>
            </p>
          )}
          {description && (
            <p className='text-sm'>
              <b className='text-gray-700'>📝 Mô tả:</b>{' '}
              <span className='text-gray-900'>{description}</span>
            </p>
          )}
        </div>
      )}

      {/* Address */}
      <div className='bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200'>
        <h2 className='text-lg font-semibold mb-3 text-yellow-800'>
          📍 Địa chỉ nhận hàng
        </h2>
        <div className='space-y-2 text-sm'>
          <p>
            <b className='text-gray-700'>Người nhận:</b>{' '}
            <span className='text-gray-900 font-medium'>
              {address?.fullName}
            </span>
          </p>
          <p>
            <b className='text-gray-700'>Số điện thoại:</b>{' '}
            <span className='text-gray-900 font-medium'>{address?.phone}</span>
          </p>
          <p>
            <b className='text-gray-700'>Địa chỉ:</b>{' '}
            <span className='text-gray-900'>
              {address?.street}, {address?.ward}, {address?.district},{' '}
              {address?.province}
            </span>
          </p>
          <p>
            <b className='text-gray-700'>Loại địa chỉ:</b>{' '}
            <span className='text-gray-900'>
              {address?.addressType === 'home'
                ? '🏠 Nhà riêng'
                : address?.addressType === 'office'
                  ? '🏢 Văn phòng'
                  : '📍 Khác'}
            </span>
          </p>
          {address?.isDefault && (
            <p className='text-green-600 font-medium'>✓ Địa chỉ mặc định</p>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className='bg-white border rounded-lg shadow-sm overflow-hidden'>
        <h2 className='text-lg font-semibold p-4 bg-gray-100 border-b'>
          🛍️ Danh sách sản phẩm ({items.length} sản phẩm)
        </h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  #
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Hình ảnh
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sản phẩm
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Mã biến thể
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Màu / Size
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Số lượng
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Đơn giá
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {items.map((item, idx) => {
                const variant = item.variant;
                const subtotal = item.quantity * item.price;

                return (
                  <tr key={idx} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-medium'>
                      {idx + 1}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      {variant?.images && variant.images.length > 0 ? (
                        <img
                          src={variant.images[0]}
                          alt={variant.product?.title || 'Product'}
                          className='w-16 h-16 object-cover rounded-md border shadow-sm'
                        />
                      ) : variant?.product?.thumbnailImage ? (
                        <img
                          src={variant.product.thumbnailImage}
                          alt={variant.product.title}
                          className='w-16 h-16 object-cover rounded-md border shadow-sm'
                        />
                      ) : (
                        <div className='w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs'>
                          No img
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {variant?.product?.title || 'N/A'}
                      </div>
                      {variant?.product?.skuCode && (
                        <div className='text-xs text-gray-500'>
                          SKU: {variant.product.skuCode}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded border'>
                        {variant?.variantCode || 'N/A'}
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm'>
                      {variant ? (
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                      
                            <span className='text-gray-700 text-lg'>
                              {variant.title}
                            </span>
                          </div>
                   
                        </div>
                      ) : (
                        <span className='text-gray-400'>N/A</span>
                      )}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-center'>
                      <span className='inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold bg-blue-100 text-blue-800'>
                        {item.quantity}
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900'>
                      {item.price.toLocaleString()}đ
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-right text-base font-bold text-green-600'>
                      {subtotal.toLocaleString()}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className='bg-gray-50'>
              <tr>
                <td
                  colSpan={7}
                  className='px-4 py-4 text-right font-semibold text-gray-700'
                >
                  Tổng cộng:
                </td>
                <td className='px-4 py-4 text-right text-xl font-bold text-green-600'>
                  {totalPrice.toLocaleString()}đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className='flex justify-between items-center pt-4 border-t'>
        <Link
          to='/admin/order'
          className='px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium'
        >
          ← Quay lại danh sách
        </Link>
        {/* <div className='flex gap-3'>
          <button className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md'>
            Cập nhật trạng thái
          </button>
          <button
            onClick={() => window.print()}
            className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md'
          >
            🖨️ In đơn hàng
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OrderDetailPage;