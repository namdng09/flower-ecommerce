import { Link, useNavigate } from 'react-router';
import MiniCartModal from '../Cart/Cart';
import logo1 from '../../../../assets/logo1.svg';

function HeaderC({ cartItems, openCart, setOpenCart }) {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  return (
    <div>
      <nav className='bg-[#FFFDFA] fixed w-full z-20 top-0 start-0 border-b border-[#F8F5F2]'>
        <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
          <Link to='/home' className='flex items-center space-x-3'>
            <img src={logo1} alt='Ribbon Box Logo' className='h-35' />
          </Link>

          <ul className='hidden md:flex space-x-8 text-black font-medium'>
            <li><Link to='/home'>Trang Chủ</Link></li>
            <li><Link to='/home/shop'>Cửa Hàng</Link></li>
            <li><Link to='/home/products'>Sản Phẩm</Link></li>
            <li><Link to='/home/about'>Về Chúng Tôi</Link></li>
            <li><Link to='/home/contact'>Liên Hệ</Link></li>
          </ul>

          <div className='flex items-center space-x-6 md:order-2 relative'>
            <button
              onClick={() => setOpenCart(true)}
              className='text-black relative'
            >
              🛒 Giỏ hàng <span className='text-pink-600'>({totalQuantity} sản phẩm)</span>
            </button>

            <MiniCartModal
              isOpen={openCart}
              onClose={() => setOpenCart(false)}
              items={cartItems}
              onNavigateCart={() => {
                setOpenCart(false);
                navigate('/home/cart');
              }}
            />

            <button className='text-white bg-[#B9205A] hover:bg-[#F8C8D2] text-lg px-4 py-2 rounded-lg'>
              Bắt đầu mua sắm
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default HeaderC;
