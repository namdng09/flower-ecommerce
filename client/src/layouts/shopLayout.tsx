import { Outlet } from 'react-router';

const ShopLayout = () => {
  return (
    <div className=' min-h-screen'>
      <div className='mx-auto p-4'>
        <Outlet />
      </div>
    </div>
  );
};

export default ShopLayout;
