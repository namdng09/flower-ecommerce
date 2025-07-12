'use client';

import React from 'react';

const TermsPage = () => {
  return (
    <div className='max-w-4xl mx-auto px-6 py-12 text-black leading-relaxed space-y-6 mt-40'>
      <h1 className='text-2xl font-bold text-pink-600 mb-4'>
        CHÍNH SÁCH VÀ ĐIỀU KHOẢN
      </h1>

      <p>
        Các điều khoản hợp đồng sau đây là thỏa thuận giữa các bên, bao gồm:
        Công Ty Cổ Phần COLOR LIFE – chủ sở hữu website{' '}
        <a
          href='http://Flaura'
          className='text-blue-600 hover:underline'
          target='_blank'
        >
          http://Flaura
        </a>{' '}
        – sau đây gọi là <strong>Flaura</strong> và khách hàng.
      </p>

      <p>
        Khách hàng khi đặt mua hàng đồng nghĩa với việc chấp nhận mọi điều khoản
        trong văn bản này mà không cần ký xác nhận.
      </p>

      <p>
        Mọi bài viết, hình ảnh, thiết kế trên trang đều thuộc bản quyền của công
        ty. Nghiêm cấm sao chép, chia sẻ cho mục đích thương mại.
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 1 – MỤC ĐÍCH ÁP DỤNG
      </h2>
      <ul className='list-disc pl-6 space-y-2'>
        <li>
          Áp dụng cho mọi hoạt động bán hàng tại <strong>Flaura</strong> hoặc
          qua điện thoại.
        </li>
        <li>
          Công ty có quyền thay đổi nội dung điều khoản bất kỳ lúc nào. Khuyến
          khích khách hàng thường xuyên theo dõi.
        </li>
      </ul>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 2 – TRUY CẬP TRANG WEB
      </h2>
      <ul className='list-disc pl-6 space-y-2'>
        <li>Chỉ các mặt hàng có giá khác 0đ mới được phép đặt mua.</li>
        <li>
          Khách hàng cần cung cấp thông tin chính xác. Nếu sai thông tin, công
          ty có quyền hủy đơn.
        </li>
        <li>
          Nghiêm cấm mọi hành vi sao chép, sử dụng lại nội dung, hình ảnh, biểu
          trưng của website cho mục đích thương mại.
        </li>
      </ul>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 3 – ĐẶT MUA HÀNG
      </h2>
      <p>
        Đơn hàng chỉ áp dụng cho các khu vực giao hàng tại Việt Nam và một số
        quốc gia nhất định.
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 4 – TÌNH TRẠNG HÀNG HÓA
      </h2>
      <p>
        Các mẫu hiển thị sẵn có. Nếu hết nguyên liệu sẽ trao đổi phương án thay
        thế với khách.
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 5 – GIÁ
      </h2>
      <p>
        Giá hiển thị đã bao gồm VAT và phí giao hàng nội địa. Có thể thanh toán
        bằng VNĐ hoặc USD theo tỷ giá Vietcombank.
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 6 – GIAO HÀNG
      </h2>
      <ul className='list-disc pl-6 space-y-2'>
        <li>
          Giao hàng đúng địa chỉ cung cấp. Không chịu trách nhiệm nếu sai địa
          chỉ do lỗi khách hàng.
        </li>
        <li>
          Nếu người nhận không có mặt, tùy loại sản phẩm sẽ có chính sách tính
          phí hoặc miễn phí.
        </li>
      </ul>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 7 – THANH TOÁN
      </h2>
      <p>Có thể thanh toán qua thẻ quốc tế, PayPal hoặc chuyển khoản.</p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 8 – TRẢ HÀNG
      </h2>
      <p>
        Chỉ chấp nhận trả hàng nếu sản phẩm không đúng mô tả. Không nhận hàng
        hỏng do lỗi khách.
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 9 – HỖ TRỢ
      </h2>
      <p>
        Hotline hỗ trợ 24/24: <strong>1800 6131</strong>
      </p>

      <h2 className='text-lg font-semibold text-pink-600 mt-6'>
        ĐIỀU KHOẢN 10 – HỦY/THAY ĐỔI ĐƠN HÀNG
      </h2>
      <ul className='list-disc pl-6 space-y-2'>
        <li>
          Hủy đơn trước 8h hành chính. Sau thời điểm này vẫn phải thanh toán
          100%.
        </li>
        <li>
          Thay đổi sản phẩm trước 4h so với giờ giao dự kiến thì không tính phí.
          Nếu sản phẩm đã được chuẩn bị, không thay đổi được.
        </li>
      </ul>

      <p className='mt-8 text-sm text-gray-600'>
        Mọi thắc mắc vui lòng liên hệ: <strong>love@Flaura</strong>
      </p>
    </div>
  );
};

export default TermsPage;
