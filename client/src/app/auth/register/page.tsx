import RegisterForm from '~/components/forms/RegisterForm';

const Register = () => {
  return (
    <div>
      <RegisterForm
        title='Đăng ký khách hàng'
        role='customer'
        redirectUrl='/home'
      />
    </div>
  );
};

export default Register;
