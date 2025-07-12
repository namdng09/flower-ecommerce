import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ResetPasswordFormFields,
  resetPasswordSchema
} from '~/types/resetPassword';
import backgroundlogin1 from '../../assets/backgroundlogin1.jpg';
import axiosInstance from '~/config/axiosConfig';

const ResetPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ResetPasswordFormFields>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormFields) => {
    try {
      await axiosInstance.post('/api/auth/request-reset-password', data);
      reset();
    } finally {
      alert(
        'Đã gửi email xác nhận đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
      );
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
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Đặt lại mật khẩu{' '}
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='relative'>
            <label className='text-sm font-bold text-gray-700 tracking-wide'>
              Email
            </label>
            <input
              className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.email ? 'border-red-500' : ''}`}
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
          <div>
            <button
              type='submit'
              className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi email xác nhận...' : 'Đặt lại mật khẩu'}
            </button>
          </div>
          <p className='flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500'>
            <span>Quay lại đăng nhập</span>
            <a
              href='login'
              className='text-indigo-500 hover:text-indigo-500 no-underline hover:underline cursor-pointer transition ease-in duration-300'
            >
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
