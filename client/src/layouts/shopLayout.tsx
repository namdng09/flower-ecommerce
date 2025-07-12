import { Outlet, useLocation } from 'react-router';
import Sidebar from '~/components/shop/sidebar/Sidebar';

const ShopLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/shop/login';

  return (
    <div className='min-h-screen flex'>
      {!isLoginPage && <Sidebar />}
      <main className='flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;
