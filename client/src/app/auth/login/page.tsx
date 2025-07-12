import backgroundlogin1 from '~/assets/backgroundlogin1.jpg';
import googlelogo from '~/assets/Googlelogo.svg.webp';
import LoginForm from '~/components/forms/LoginForm';

const Login = () => {
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
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>Đăng nhập</h2>
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
        <LoginForm title='Đăng nhập' redirectUrl='/home' />
        <p className='flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500'>
          <span>Chưa có tài khoản?</span>
          <a
            href='register'
            className='text-indigo-500 hover:text-indigo-500 no-underline hover:underline cursor-pointer transition ease-in duration-300'
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
