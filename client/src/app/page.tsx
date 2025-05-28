import { NavLink } from 'react-router';

const LandingPage = () => {
  return (
    <>
      <NavLink to='/auth/login'>
        <button className='btn btn-primary'>Login</button>
      </NavLink>
      <NavLink to='/auth/register'>
        <button className='btn btn-active'>Register</button>
      </NavLink>
    </>
  );
};

export default LandingPage;
