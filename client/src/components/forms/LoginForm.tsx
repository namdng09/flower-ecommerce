import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginFormFields, loginSchema } from '~/types/login';
import { AuthContext } from '~/contexts/authContext';
import backgroundlogin1 from '../../assets/backgroundlogin1.jpg';
import googlelogo from '../../assets/Googlelogo.svg.webp';
// import { NavLink } from 'react-router';
import { useNavigate } from 'react-router';
// import { n } from 'node_modules/react-router/dist/development/lib-B8x_tOvL.d.mts';

const LoginForm: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormFields) => {
    try {
      await login(data);
      alert('Login successful! Redirecting to dashboard...');
      reset();
      navigate('/home'); // Redirect to home page after successful login
    } catch {
      alert('Login failed. Please check your credentials and try again.');
    }
  };

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
        </div>
        <button
          type='button'
          className='flex items-center gap-2 px-4 py-2 rounded-full font-medium text-gray-700 bg-white border border-gray-200 shadow hover:bg-blue-50 transition-all duration-200 mt-3 mx-auto mb-4'
          style={{ minWidth: 0, width: 'fit-content' }}
        >
          <img src={googlelogo} alt='Google' className='w-5 h-5' />
          <span className='text-base'>Đăng nhập với Google</span>
        </button>
        <div className='flex items-center justify-center space-x-2'>
          <span className='h-px w-16 bg-gray-300'></span>
          <span className='text-gray-500 font-normal'>Hoặc</span>
          <span className='h-px w-16 bg-gray-300'></span>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='relative'>
            <label className='text-sm font-bold text-gray-700 tracking-wide'>
              Email
            </label>
            <input
              className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.email ? 'border-red-500' : ''} text-gray-900`}
              type='email'
              placeholder='mail@gmail.com'
              autoComplete='email'
              {...register('email')}
            />
            {errors.email && (
              <span className='text-xs text-red-500'>
                {errors.email.message}
              </span>
            )}
          </div>
          <div className='mt-8 content-center'>
            <label className='text-sm font-bold text-gray-700 tracking-wide'>
              Mật khẩu
            </label>
            <input
              className={`w-full content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.password ? 'border-red-500' : ''} text-gray-900`}
              type='password'
              placeholder='Enter your password'
              autoComplete='current-password'
              {...register('password')}
            />
            {errors.password && (
              <span className='text-xs text-red-500'>
                {errors.password.message}
              </span>
            )}
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='rememberMe'
                type='checkbox'
                className='h-4 w-4 bg-indigo-500 focus:ring-indigo-400 border-gray-300 rounded'
                {...register('rememberMe')}
              />
              <label
                htmlFor='rememberMe'
                className='ml-2 block text-sm text-gray-900'
              >
                Nhớ tài khoản
              </label>
            </div>
            <div className='text-sm'>
              <a
                href='reset-password'
                className='font-medium text-indigo-500 hover:text-indigo-500'
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>
          <div>
            {/* <NavLink to ='/home'> */}
            <button
              type='submit'
              className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            {/* </NavLink> */}
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

export default LoginForm;
