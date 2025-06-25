import { NavLink } from 'react-router';

import Chunked from '~/components/chunked';

const LandingPage = () => {
  return (
    <>
      <NavLink to='/auth/login'>
        <button className='btn btn-primary'>Login</button>
      </NavLink>
      <NavLink to='/auth/register'>
        <button className='btn btn-active'>Register</button>
      </NavLink>
      <Chunked />
    </>
  );
};

export default LandingPage;
