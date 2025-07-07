import { Outlet } from 'react-router';

const AdminLayout = () => {
  return (
    <div className='bg-white min-h-screen flex flex-col'>
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
