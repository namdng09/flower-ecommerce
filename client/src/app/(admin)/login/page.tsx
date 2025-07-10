import LoginForm from '~/components/forms/LoginForm';

const Page = () => {
  return (
    <LoginForm title='Đăng nhập quản trị viên' redirectUrl='/admin/dashboard' />
  );
};

export default Page;
