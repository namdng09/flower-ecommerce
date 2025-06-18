import React from 'react';
import backgroundlogin1 from '../../../assets/backgroundlogin1.jpg';
import googlelogo from '../../../assets/Googlelogo.svg.webp';

const Register: React.FC = () => {
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <div className='flex flex-row justify-center items-center space-x-3 my-4'>
          <span className='w-11 h-11 items-center justify-center inline-flex rounded-full font-bold text-lg text-white bg-sky-200 hover:shadow-lg cursor-pointer transition ease-in duration-300 '>
            <img className='w-4 h-4' src={googlelogo} alt='Google' />
          </span>
        </div>
        <div className='flex items-center justify-center space-x-2 w-full mb-6'>
          <span className='h-px w-32 bg-gray-300'></span>
          <span className='text-gray-500 font-normal'>OR</span>
          <span className='h-px w-32 bg-gray-300'></span>
        </div>
        <form className='w-full' action='#' method='POST'>
          <div className='flex flex-row gap-8'>
            {/* Cột trái */}
            <div className='flex-1 space-y-6'>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Họ tên
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='text'
                  placeholder='Nhập họ tên'
                  autoComplete='name'
                />
              </div>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Tài khoản đăng nhập
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='text'
                  placeholder='username'
                  autoComplete='username'
                />
              </div>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Email
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='email'
                  placeholder='mail@gmail.com'
                  autoComplete='email'
                />
              </div>
            </div>
            {/* Cột phải */}
            <div className='flex-1 space-y-6'>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Số điện thoại
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='tel'
                  placeholder='Nhập số điện thoại'
                  autoComplete='tel'
                />
              </div>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Mật khẩu
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='password'
                  placeholder='Nhập mật khẩu'
                  autoComplete='new-password'
                />
              </div>
              <div>
                <label className='text-sm font-bold text-gray-700 tracking-wide'>
                  Xác nhận mật khẩu
                </label>
                <input
                  className='w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  type='password'
                  placeholder='Nhập lại mật khẩu'
                  autoComplete='new-password'
                />
              </div>
            </div>
          </div>
          <div className='mt-10'>
            <button
              type='submit'
              className='w-full flex justify-center bg-rose-400 text-gray-100 p-4 rounded-full tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-rose-600 shadow-lg cursor-pointer transition ease-in duration-300'
            >
              Đăng ký
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

export default Register;
