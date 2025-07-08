import backgroundlogin1 from '~/assets/backgroundlogin1.jpg';
import googlelogo from '~/assets/Googlelogo.svg.webp';
import RegisterForm from '~/components/forms/RegisterForm';

const Register = () => {
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
        <RegisterForm title='Đăng ký' role='customer' redirectUrl='/home' />
        <p className='flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500'>
          <span>Đã có tài khoản?</span>
          <a
            href='login'
            className='text-indigo-500 hover:text-indigo-500 no-underline hover:underline cursor-pointer transition ease-in duration-300'
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
