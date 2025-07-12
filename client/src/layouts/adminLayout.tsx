import { Outlet } from 'react-router';
import SidebarAdmin from '~/components/admin/SidebarAdmin';

const AdminLayout = () => {
  return (
    <div className='bg-white min-h-screen flex'>
      <SidebarAdmin />

      <main className='flex-1 p-6 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
