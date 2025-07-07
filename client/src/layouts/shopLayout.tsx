import { Outlet } from 'react-router';
import Sidebar from '~/components/shop/sidebar/Sidebar';

const ShopLayout = () => {
  return (
    <div className='min-h-screen flex'>
      <Sidebar />
      <main className='flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;
