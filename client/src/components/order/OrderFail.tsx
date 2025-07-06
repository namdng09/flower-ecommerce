import React from 'react';
import { useNavigate } from 'react-router';
import { MdErrorOutline } from 'react-icons/md';

const OrderFail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='bg-white shadow-lg rounded-xl p-8 max-w-md text-center'>
        <MdErrorOutline className='text-red-500 mx-auto mb-4' size={64} />
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
          Đặt hàng thất bại!
        </h2>
        <p className='text-gray-600 mb-6'>
          Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý đơn hàng của bạn. Vui
          lòng thử lại hoặc kiểm tra kết nối mạng.
        </p>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <button
            onClick={() => navigate('/home/cart')}
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition'
          >
            Quay lại giỏ hàng
          </button>
          <button
            onClick={() => navigate('/home')}
            className='border border-red-600 text-red-600 hover:bg-red-100 px-6 py-2 rounded font-medium transition'
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFail;
