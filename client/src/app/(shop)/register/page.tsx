import React from 'react';
import RegisterForm from '~/components/forms/RegisterForm';

const Page = () => {
  return (
    <RegisterForm
      title='Đăng ký cửa hàng'
      role='shop'
      redirectUrl='/shop/dashboard'
    />
  );
};

export default Page;
