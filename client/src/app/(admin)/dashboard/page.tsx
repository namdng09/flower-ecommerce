import RevenueChart from '~/components/RevenueChart';
// Main Dashboard Component
const DashboardPage = () => {
  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>
        Revenue Dashboard
      </h1>
      <RevenueChart />
    </div>
  );
};

export default DashboardPage;
