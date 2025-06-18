import React, { useState } from 'react';
import backgroundlogin1 from '../../../assets/backgroundlogin1.jpg';
import googlelogo from '../../../assets/Googlelogo.svg.webp';
const Login: React.FC = () => {
  // const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-no-repeat bg-cover'
      style={{
        backgroundImage: `url(${backgroundlogin1})`
      }}
    >
      <div className='absolute bg-black opacity-60 inset-0 z-0'></div>
      <div className='max-w-md w-full space-y-8 p-10 bg-white rounded-xl z-10'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>Đăng nhập </h2>
          {/* <p className="mt-2 text-sm text-gray-600">Đăng Nhập</p> */}
        </div>
        <div className='flex flex-row justify-center items-center space-x-3'>
          <span className=' w-11 h-11 items-center justify-center inline-flex rounded-full font-bold text-lg text-white bg-sky-200 hover:shadow-lg cursor-pointer transition ease-in duration-300 '>
            {/* Google SVG */}
            <img className='w-4 h-4 ' src={googlelogo} alt='Google' />
          </span>
        </div>
        <div className='flex items-center justify-center space-x-2'>
          <span className='h-px w-16 bg-gray-300'></span>
          <span className='text-gray-500 font-normal'>OR</span>
          <span className='h-px w-16 bg-gray-300'></span>
        </div>
        <form className='mt-8 space-y-6' action='#' method='POST'>
          <input type='hidden' name='remember' value='true' />
          <div className='relative'>
            <div className='absolute right-0 mt-4'></div>
            <label className='text-sm font-bold text-gray-700 tracking-wide'>
              Email
            </label>
            <input
              className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
              type='email'
              placeholder='mail@gmail.com'
              defaultValue=''
              autoComplete='email'
            />
          </div>
          <div className='mt-8 content-center'>
            <label className='text-sm font-bold text-gray-700 tracking-wide'>
              Password
            </label>
            <input
              className='w-full content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your password'
              defaultValue=''
              autoComplete='current-password'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember_me'
                name='remember_me'
                type='checkbox'
                className='h-4 w-4 bg-indigo-500 focus:ring-indigo-400 border-gray-300 rounded'
              />
              <label
                htmlFor='remember_me'
                className='ml-2 block text-sm text-gray-900'
              >
                Nhớ tài khoản
              </label>
            </div>
            <div className='text-sm'>
              <a
                href='#'
                className='font-medium text-indigo-500 hover:text-indigo-500'
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>
          <div>
            <button
              type='submit'
              className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
            >
              Đăng nhập
            </button>
          </div>
          <p className='flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500'>
            <span>Chưa có tài khoản?</span>
            <a
              href='register'
              className='text-indigo-500 hover:text-indigo-500 no-underline hover:underline cursor-pointer transition ease-in duration-300'
            >
              Đăng ký
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
