import { useForm } from 'react-hook-form';
import { type RegisterFormFields, registerSchema } from '~/types/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { AuthContext } from '~/contexts/authContext';
import backgroundlogin1 from '../../assets/backgroundlogin1.jpg';
import googlelogo from '../../assets/Googlelogo.svg.webp';
import { useNavigate } from 'react-router';

const RegisterForm = () => {
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
      role: 'customer'
    }
  });

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await signUp(data);
      alert(
        'Registration successful! Please check your email to verify your account.'
      );
      reset();
      navigate('/home'); // Redirect to home page after successful registration
    } catch (error: Error | unknown) {
      alert('Registration failed. Please try again later.');
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
      <div className='w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-2xl z-10 p-10 flex flex-col items-center shadow-lg'>
        <div className='text-center w-full'>
          <h2 className='mt-2 text-3xl font-bold text-gray-900'>Đăng ký</h2>
        </div>
        <button
          type='button'
          className='flex items-center gap-2 px-4 py-2 rounded-full font-medium text-gray-700 bg-white border border-gray-200 shadow hover:bg-blue-50 transition-all duration-200 mt-3 mx-auto mb-4'
          style={{ minWidth: 0, width: 'fit-content' }}
        >
          <img src={googlelogo} alt='Google' className='w-5 h-5' />
          <span className='text-base'>Đăng ký với Google</span>
        </button>
        <div className='flex items-center justify-center space-x-2 w-full mb-6'>
          <span className='h-px w-32 bg-gray-300'></span>
          <span className='text-gray-500 font-normal'>Hoặc</span>
          <span className='h-px w-32 bg-gray-300'></span>
        </div>
        <form className='w-full' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-row gap-8'>
            {/* Cột trái */}
            <div className='flex-1 space-y-6'>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Họ tên
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.fullName ? 'border-red-500' : ''}`}
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
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Tài khoản đăng nhập
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.username ? 'border-red-500' : ''}`}
                  type='text'
                  placeholder='tài khoản đăng nhập'
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
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Email
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
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
            </div>
            {/* Cột phải */}
            <div className='flex-1 space-y-6'>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Số điện thoại
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.phoneNumber ? 'border-red-500' : ''}`}
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
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Mật khẩu
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.password ? 'border-red-500' : ''}`}
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
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Xác nhận mật khẩu
                </label>
                <input
                  className={`w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
          <p className='flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500'>
            <span>Đã có tài khoản?</span>
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

export default RegisterForm;