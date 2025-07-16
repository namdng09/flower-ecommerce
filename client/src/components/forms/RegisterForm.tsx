import React from 'react';
import { useForm } from 'react-hook-form';
import { type RegisterFormFields, registerSchema } from '~/types/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate } from 'react-router';

interface RegisterFormProps {
  title?: string;
  role?: 'customer' | 'shop';
  redirectUrl?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  title = 'Đăng ký',
  role = 'customer',
  redirectUrl = '/home'
}) => {
  const { signUp } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterFormFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: role
    }
  });

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await signUp(data);
      alert(
        'Registration successful! Please check your email to verify your account.'
      );
      reset();
      navigate(redirectUrl);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: Error | unknown) {
      alert(
        error.response.data.message || 'An error occurred during registration.'
      );
    }
  };

  return (
    <form className='w-full' onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-row gap-8'>
        {/* Cột trái */}
        <div className='flex-1 space-y-6'>
          <div>
            <label className='text-sm text-black font-bold tracking-wide'>
              Họ tên
            </label>
            <input
              className={`w-full text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.fullName ? 'border-red-500' : ''}`}
              type='text'
              placeholder='Nhập họ tên'
              autoComplete='name'
              {...register('fullName')}
            />
            {errors.fullName && (
              <span className='text-xs text-red-500'>
                {errors.fullName.message}
              </span>
            )}
          </div>
          <div>
            <label className='text-sm text-black font-bold tracking-wide'>
              Tài khoản đăng nhập
            </label>
            <input
              className={`w-full  text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.username ? 'border-red-500' : ''}`}
              type='text'
              placeholder='Nhập username'
              autoComplete='username'
              {...register('username')}
            />
            {errors.username && (
              <span className='text-xs text-red-500'>
                {errors.username.message}
              </span>
            )}
          </div>
          <div>
            <label className='text-sm font-bold text-black tracking-wide'>
              Email
            </label>
            <input
              className={`w-full text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.email ? 'border-red-500' : ''}`}
              type='email'
              placeholder='Nhập email'
              autoComplete='email'
              {...register('email')}
            />
            {errors.email && (
              <span className='text-xs text-red-500'>
                {errors.email.message}
              </span>
            )}
          </div>
        </div>
        {/* Cột phải */}
        <div className='flex-1 space-y-6'>
          <div>
            <label className='text-sm font-bold text-black tracking-wide'>
              Số điện thoại
            </label>
            <input
              className={`w-full text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.phoneNumber ? 'border-red-500' : ''}`}
              type='tel'
              placeholder='Nhập số điện thoại'
              autoComplete='tel'
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <span className='text-xs text-red-500'>
                {errors.phoneNumber.message}
              </span>
            )}
          </div>
          <div>
            <label className='text-sm font-bold text-black tracking-wide'>
              Mật khẩu
            </label>
            <input
              className={`w-full text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.password ? 'border-red-500' : ''}`}
              type='password'
              placeholder='Nhập mật khẩu'
              autoComplete='new-password'
              {...register('password')}
            />
            {errors.password && (
              <span className='text-xs text-red-500'>
                {errors.password.message}
              </span>
            )}
          </div>
          <div>
            <label className='text-sm font-bold text-black tracking-wide'>
              Xác nhận mật khẩu
            </label>
            <input
              className={`w-full text-black text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              type='password'
              placeholder='Nhập lại mật khẩu'
              autoComplete='new-password'
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className='text-xs text-red-500'>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className='mt-10'>
        <button
          type='submit'
          className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
