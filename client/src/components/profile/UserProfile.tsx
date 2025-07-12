import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '~/contexts/authContext';
import { type Profile } from '~/types/profile';
import axiosInstance from '~/config/axiosConfig';
import LogoutButton from '../buttons/LogoutButton';
import { NavLink } from 'react-router';

const UserProfile = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.id) return;
      setProfileLoading(true);
      try {
        const response = await axiosInstance.get(`/api/users/${user.id}`);
        const profileData = response.data.data
          ? response.data.data
          : response.data;
        setProfile(profileData);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (isAuthenticated && user && user.id) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  if (loading || profileLoading) return <div>Đang tải...</div>;
  if (!isAuthenticated || !user) return <div>Bạn chưa đăng nhập.</div>;
  if (!profile) return <div>Không tìm thấy thông tin người dùng.</div>;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8
      }}
    >
      <h2>Thông tin người dùng</h2>
      <div>
        <strong>Họ tên:</strong> {profile.fullName}
      </div>
      <div>
        <strong>Tên đăng nhập:</strong> {profile.username}
      </div>
      <div>
        <strong>Email:</strong> {profile.email}
      </div>
      <div>
        <strong>Số điện thoại:</strong> {profile.phoneNumber}
      </div>
      <div>
        <strong>Vai trò:</strong> {user.role}
      </div>
      <NavLink to='/login' className='text-blue-500 hover:underline'>
        <LogoutButton />
      </NavLink>
    </div>
  );
};

export default UserProfile;
