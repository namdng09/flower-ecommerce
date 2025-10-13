import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByUser, updateOrder } from '~/store/slices/orderSlice';
import { fetchVariants } from '~/store/slices/variantSlice';
import type { RootState } from '~/store';
import { useNavigate } from 'react-router';
import { AuthContext } from '~/contexts/authContext';
import { BsBoxSeam } from 'react-icons/bs';
import { MdOutlinePending, MdOutlineLocalShipping, MdOutlineCheckCircle, MdOutlineCancel } from 'react-icons/md';
import { toast } from 'react-toastify';

const statusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <MdOutlinePending className="text-yellow-500" title="Chờ xác nhận" />;
    case 'ready_for_pickup':
    case 'out_for_delivery':
      return <MdOutlineLocalShipping className="text-blue-500" title="Đang giao" />;
    case 'delivered':
      return <MdOutlineCheckCircle className="text-green-600" title="Đã giao" />;
    case 'cancelled':
    case 'returned':
      return <MdOutlineCancel className="text-red-500" title="Đã huỷ/Trả hàng" />;
    default:
      return <MdOutlinePending className="text-gray-400" />;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'ready_for_pickup':
      return 'Sẵn sàng lấy hàng';
    case 'out_for_delivery':
      return 'Đang giao';
    case 'delivered':
      return 'Đã giao';
    case 'cancelled':
      return 'Đã huỷ';
    case 'returned':
      return 'Trả hàng';
    default:
      return status;
  }
};

const OrderTrackingDetailPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState(1);

  const { userOrders, loading, error, pagination } = useSelector(
    (state: RootState) => state.orders
  );
  const { items: variants } = useSelector((state: RootState) => state.variants);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrdersByUser(user.id));
      dispatch(fetchVariants());
    }
  }, [dispatch, user, page]);

  const getVariantDetails = (variantId: any) => {
    const id = typeof variantId === 'object' ? variantId._id : variantId;
    return variants.find((v: any) => v._id === id);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await dispatch(updateOrder({
        id: orderId,
        updateData: {
          status: 'cancelled',
          description: 'Khách đã hủy đơn hàng'
        }
      })).unwrap();
      toast.success('Đã hủy đơn hàng thành công');
      dispatch(fetchOrdersByUser(user.id));
    } catch (err: any) {
      toast.error('Hủy đơn thất bại');
    }
  };

  if (!user) {
    return <p className="text-center mt-10 text-red-600">Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>;
  }

  if (loading) {
    return <p className="text-center mt-10">Đang tải lịch sử đơn hàng...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">Lỗi: {error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50 shadow-xl rounded-2xl mt-20 text-black mb-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-[#C4265B] drop-shadow">
        <BsBoxSeam className="text-[#C4265B]" size={32} />
        Lịch sử đơn hàng của bạn
      </h1>
      {userOrders.length === 0 ? (
        <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <thead className="bg-gradient-to-r from-pink-100 via-white to-purple-100 text-gray-700">
              <tr>
                <th className="p-4 text-left">Mã đơn hàng</th>
                <th className="p-4 text-left">Ngày đặt</th>
                <th className="p-4 text-left">Tổng tiền</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Sản phẩm</th>
                <th className="p-4 text-left">Chi tiết</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userOrders.map((order: any) => (
                <tr
                  key={order._id}
                  className="hover:bg-purple-50 transition duration-150"
                >
                  <td className="p-4 font-semibold text-[#C4265B]">{order.orderNumber || order._id}</td>
                  <td className="p-4">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-right text-[#C4265B] font-bold">{order.totalPrice?.toLocaleString()}₫</td>
                  <td className="p-4 flex items-center gap-2">
                    {statusIcon(order.status)}
                    <span className="capitalize">{statusLabel(order.status)}</span>
                  </td>
                  <td className="p-4">
                    {order.items?.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {order.items.map((item: any, idx: number) => {
                          const variant = getVariantDetails(item.variant);
                          const imageUrl = variant?.image || variant?.product?.thumbnailImage;
                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt="Ảnh sản phẩm"
                                  className="w-8 h-8 object-cover border rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center border rounded text-xs text-gray-400 bg-white">
                                  Không ảnh
                                </div>
                              )}
                              <span className="text-xs text-[#C4265B] font-semibold">
                                {variant?.product?.title || ''} {variant?.title ? `(${variant.title})` : ''}
                              </span>
                              <span className="text-xs text-gray-600">x{item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Không có sản phẩm</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      className="text-white bg-[#C4265B] hover:bg-[#a81c48] px-4 py-1 rounded shadow transition font-medium"
                      onClick={() => navigate(`/home/order-tracking/${order._id}`)}
                    >
                      Chi tiết
                    </button>
                  </td>
                  <td className="p-4">
                    {order.status === 'pending' && (
                      <button
                        className="bg-red-100 font-bold text-red-600 px-3 py-1 text-sm rounded hover:bg-red-200 transition"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && (
        <div className='flex justify-center mt-6 gap-3'>
          <button
            disabled={page <= 1}
            onClick={() => setPage(prev => prev - 1)}
            className='px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50'
          >
            Trang trước
          </button>
          <span className='px-3 py-1'>Trang {page}</span>
          <button
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage(prev => prev + 1)}
            className='px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50'
          >
            Trang tiếp
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingDetailPage;