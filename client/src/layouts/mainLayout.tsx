import { Outlet } from 'react-router';

const MainLayout = () => {
  return (
    <div className=' min-h-screen'>
      <div className='mx-auto p-4'>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
