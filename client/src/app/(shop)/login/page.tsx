import LoginForm from '~/components/forms/LoginForm';
import React from 'react';
import logo1 from '../../../../src/assets/logo1.svg';

const Login = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-100'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-8'>
          <img src={logo1} alt='Ribbon Box Logo' className='h-35' />
          <h1 className='text-3xl font-bold text-rose-500 mb-2'>Flaura Shop</h1>
          <p className='text-gray-500'>
            Đăng nhập cửa hàng để quản lý sản phẩm, đơn hàng
          </p>
        </div>
        <LoginForm title='Đăng nhập cửa hàng' redirectUrl='/shop/product' />
      </div>
    </div>
  );
};

export default Login;
