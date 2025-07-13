import { Link, useNavigate } from 'react-router';
import logo1 from '../../../src/assets/logo1.svg';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import type { RootState } from '~/store';
import { FiShoppingCart } from 'react-icons/fi';

function HeaderC() {
  const navigate = useNavigate();

  const accessToken = sessionStorage.getItem('accessToken');
  let userId = '';
  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      userId = decoded.id;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const totalQuantity = useSelector((state: RootState) =>
    state.carts.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <div>
      <nav className='bg-[#FFFDFA] fixed w-full z-20 top-0 start-0 border-b border-[#F8F5F2]'>
        <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
          <Link to='/home' className='flex items-center space-x-3'>
            <img src={logo1} alt='Ribbon Box Logo' className='h-35' />
          </Link>

          <ul className='hidden md:flex space-x-10 text-black font-medium'>
            <li>
              <Link to='/home'>Trang Chủ</Link>
            </li>
            <li>
              <Link to='/home/shop'>Cửa Hàng</Link>
            </li>
            <li>
              <Link to='/home/about'>Về Chúng Tôi</Link>
            </li>
            <li>
              <Link to='/home/privacy'>Điều Khoản Và Chính Sách</Link>
            </li>
            <li>
              {accessToken && jwtDecode(accessToken)?.role !== 'shop' && (
                <Link to='/home/order-tracking-detail'>Đơn Hàng Đã Đặt</Link>
              )}
            </li>
          </ul>

          <div className='flex items-center space-x-6 md:order-2 relative'>
            {accessToken && jwtDecode(accessToken)?.role === 'shop' ? (
              <Link
                to='/shop/login'
                className='text-white bg-[#B9205A] hover:bg-[#F8C8D2] text-lg px-4 py-2 rounded-lg'
              >
                Quản lý cửa hàng
              </Link>
            ) : (
              <Link
                to='/home/cart'
                className='relative text-gray-700 hover:text-pink-600'
              >
                <FiShoppingCart size={26} />
                {totalQuantity > 0 && (
                  <span className='absolute -top-2 -right-3 bg-pink-600 text-white text-xs rounded-full px-1.5 py-0.5'>
                    {totalQuantity}
                  </span>
                )}
              </Link>
            )}

            {userId ? (
              <Link
                to={`/home/profile/${userId}`}
                className='text-white bg-[#B9205A] hover:bg-[#F8C8D2] text-lg px-4 py-2 rounded-lg'
              >
                Thông tin tài khoản
              </Link>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className='text-white bg-gray-500 hover:bg-gray-700 text-lg px-4 py-2 rounded-lg'
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default HeaderC;
