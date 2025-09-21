import { NavLink } from 'react-router';
import { AiOutlineDashboard, AiOutlineShoppingCart } from 'react-icons/ai';
import {
  FiPackage,
  FiStar,
  FiBox,
  FiGrid,
  FiBarChart2,
  FiList,
  FiFileText,
  FiLock
} from 'react-icons/fi';

const SidebarAdmin = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
    ${isActive ? 'text-green-600 font-semibold' : 'text-gray-500 hover:text-green-500'}
    `;

  const indicator = ({ isActive }: { isActive: boolean }) =>
    isActive ? (
      <span className='absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-green-500 rounded-full' />
    ) : null;

  return (
    <aside className='w-64 min-h-screen bg-white border-r px-4 py-6'>
      <div className='text-xl font-bold text-green-600 mb-8 text-center tracking-tight'>
        Flaura Admin 🌱
      </div>

      {/* MAIN MENU */}
      <div className='mb-6'>
        <p className='text-[11px] font-semibold text-gray-400 uppercase mb-3 px-2 tracking-wide'>
          Main Menu
        </p>
        <nav className='space-y-1'>
          <NavLink to='/admin/dashboard' className={linkClass}>
            {indicator}
            <AiOutlineDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to='/admin/product' className={linkClass}>
            {indicator}
            <FiBox size={16} />
            Products
          </NavLink>
          <NavLink to='/admin/order' className={linkClass}>
            {indicator}
            <AiOutlineShoppingCart size={16} />
            Orders
          </NavLink>
          <NavLink to='/admin/review' className={linkClass}>
            {indicator}
            <FiStar size={16} />
            Reviews
          </NavLink>
          <NavLink to='/admin/user' className={linkClass}>
            {indicator}
            <FiPackage size={16} />
            Users
          </NavLink>
          <NavLink to='/admin/category' className={linkClass}>
            {indicator}
            <FiGrid size={16} />
            Categories
          </NavLink>
        </nav>
      </div>

      {/* COMPONENTS */}
      <div className='mb-6'>
        <p className='text-[11px] font-semibold text-gray-400 uppercase mb-3 px-2 tracking-wide'>
          Components
        </p>
        <nav className='space-y-1'>
          <NavLink to='/admin/charts' className={linkClass}>
            {indicator}
            <FiBarChart2 size={16} />
            Charts
          </NavLink>
          <NavLink to='/admin/forms' className={linkClass}>
            {indicator}
            <FiList size={16} />
            Forms
          </NavLink>
          <NavLink to='/admin/tables' className={linkClass}>
            {indicator}
            <FiList size={16} />
            Tables
          </NavLink>
        </nav>
      </div>

      {/* CRAFTED */}
      <div>
        <p className='text-[11px] font-semibold text-gray-400 uppercase mb-3 px-2 tracking-wide'>
          Crafted
        </p>
        <nav className='space-y-1'>
          <NavLink to='/admin/pages' className={linkClass}>
            {indicator}
            <FiFileText size={16} />
            Pages
          </NavLink>
          <NavLink to='/admin/login' className={linkClass}>
            {indicator}
            <FiLock size={16} />
            Authentication
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
