import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { AiOutlineCheckCircle } from 'react-icons/ai';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='bg-white shadow-lg rounded-xl p-8 max-w-md text-center'>
        <AiOutlineCheckCircle
          className='text-green-500 mx-auto mb-4'
          size={64}
        />
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
          Đặt hàng thành công!
        </h2>
        <p className='text-gray-600 mb-6'>
          Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là:
          <span className='font-semibold text-black'> {orderId}</span>
        </p>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <button
            onClick={() => navigate('/home')}
            className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition'
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(`/home/order-tracking/${orderId}`)}
            className='border border-green-600 text-green-600 hover:bg-blue-100 px-6 py-2 rounded font-medium transition'
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
