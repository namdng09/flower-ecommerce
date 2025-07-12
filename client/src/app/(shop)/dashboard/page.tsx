import { useContext } from 'react';
import RevenueChart from '~/components/RevenueChart';
import { AuthContext } from '~/contexts/authContext';

const ShopDashboardPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Shop Dashboard</h1>
      {user ? (
        <RevenueChart isShop shopId={user._id} />
      ) : (
        <div className='text-center p-10 text-gray-500'>
          Please login to view your shop's revenue
        </div>
      )}
    </div>
  );
};

export default ShopDashboardPage;
