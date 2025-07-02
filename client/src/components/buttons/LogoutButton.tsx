// LogoutButton.tsx
import { useContext } from 'react';
import { AuthContext } from '~/contexts/authContext'; // Đường dẫn tùy vào cấu trúc dự án của bạn
import { useNavigate } from 'react-router';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login'); // Chuyển hướng về trang đăng nhập
  };

  return <button onClick={handleLogout}>Đăng xuất</button>;
};

export default LogoutButton;
