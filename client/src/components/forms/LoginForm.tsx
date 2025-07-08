import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginFormFields, loginSchema } from '~/types/login';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate } from 'react-router';

interface LoginFormProps {
  title?: string;
  redirectUrl?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  title = 'Đăng nhập',
  redirectUrl = '/home'
}) => {
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
      await login({ ...data });
      alert('Login successful! Redirecting to dashboard...');
      reset();
      navigate(redirectUrl);
    } catch {
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <div className='relative'>
        <label className='text-sm text-black font-bold tracking-wide'>
          Email
        </label>
        <input
          className={`w-full text-black text-base py-2 border-b border-black focus:outline-none focus:border-black ${errors.email ? 'border-black' : ''}`}
          type='email'
          placeholder='Nhập email của bạn'
          autoComplete='email'
          {...register('email')}
        />
        {errors.email && (
          <span className='text-xs text-red-500'>{errors.email.message}</span>
        )}
      </div>
      <div className='mt-8 content-center'>
        <label className='text-sm font-bold text-black  tracking-wide'>
          Mật khẩu
        </label>
        <input
          className={`w-full text-black content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.password ? 'border-red-500' : ''}`}
          type='password'
          placeholder='Nhập mật khẩu của bạn'
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
          <label htmlFor='rememberMe' className='ml-2 block text-sm text-black'>
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
        <button
          type='submit'
          className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
