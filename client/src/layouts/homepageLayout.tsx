import { Outlet } from 'react-router';
import FooterC from '~/components/footer/FooterC';
import HeaderC from '~/components/header/HeaderC';

export default function HomepageLayout() {
  return (
    <div className='bg-white min-h-screen flex flex-col'>
      <HeaderC />
      <main className='flex-1'>
        <Outlet />
      </main>
      <FooterC />
    </div>
  );
}
