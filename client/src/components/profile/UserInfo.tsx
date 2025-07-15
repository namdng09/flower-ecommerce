import React, { useRef } from 'react';
import { Link,useNavigate } from 'react-router';
import { FaUserCircle } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';
import uploadAssets from '~/utils/uploadAssets';
import axiosInstance from '~/config/axiosConfig';
interface UserInfoProps {
  form: {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    role: string;
    createdAt?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleLogout: () => void;
  defaultAva: string;
  userId: string | undefined;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const UserInfo: React.FC<UserInfoProps> = ({
  form,
  handleChange,
  handleSubmit,
  handleLogout,
  defaultAva,
  userId,
  setForm
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      const result = await uploadAssets(
        file,
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        `users/${userId}`
      );
      // Gọi API PATCH cập nhật avatar lên server
      const res = await axiosInstance.patch(`/api/users/${userId}/avatar`, {
        avatarUrl: result.url
      });
      setForm((prev: any) => ({
        ...prev,
        avatarUrl: res.data.data.avatarUrl
      }));
    } catch {
      alert('Upload ảnh thất bại!');
    }
  };

  const handleUnifiedLogout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    // Nếu có refreshToken ở cookie, có thể gọi API logout ở backend
    // await axiosInstance.post('/api/auth/logout');
    if (handleLogout) handleLogout();
    navigate('/auth/login');
    window.location.reload();
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-md p-6'>
      <h2 className='text-xl font-bold text-center mb-6 flex items-center justify-center gap-2'>
        <FaUserCircle className='text-lime-600 text-2xl' />
        Thông tin tài khoản
      </h2>

      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 md:grid-cols-2 gap-6'
      >
        {/* Avatar */}
        <div className='md:col-span-2 text-center'>
          <div
            className='relative w-28 h-28 mx-auto mb-2 cursor-pointer group'
            onClick={handleAvatarClick}
            title='Đổi ảnh đại diện'
          >
            <img
              src={form.avatarUrl?.trim() !== '' ? form.avatarUrl : defaultAva}
              alt='Avatar'
              className='w-28 h-28 rounded-full object-cover border-2 border-lime-500 shadow-md'
            />
            <div className='absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform'>
              <FiCamera size={16} className='text-gray-600' />
            </div>
            <input
              type='file'
              accept='image/*'
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Form inputs */}
        <input
          name='fullName'
          value={form.fullName}
          onChange={handleChange}
          className='border p-2 rounded'
          placeholder='Họ và tên'
        />
        <input
          name='username'
          value={form.username}
          onChange={handleChange}
          className='border p-2 rounded'
          placeholder='Tên đăng nhập'
        />
        <input
          name='email'
          value={form.email}
          disabled
          className='border p-2 rounded bg-gray-100 text-gray-500'
          placeholder='Email'
        />
        <input
          name='phoneNumber'
          value={form.phoneNumber}
          onChange={handleChange}
          className='border p-2 rounded'
          placeholder='SĐT'
        />
        <input
          name='role'
          value={form.role}
          disabled
          className='border p-2 rounded bg-gray-100 text-gray-500'
          placeholder='Vai trò'
        />
        <input
          name='createdAt'
          value={
            form.createdAt
              ? new Date(form.createdAt).toLocaleDateString('vi-VN')
              : ''
          }
          disabled
          className='border p-2 rounded bg-gray-100 text-gray-500'
          placeholder='Ngày tạo'
        />

        {/* Buttons */}
        <div className='md:col-span-2 flex flex-wrap justify-center gap-4 pt-6'>
          <button
            type='submit'
            className='bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200'
          >
            Cập nhật
          </button>
          <Link
            to='/auth/login'
            onClick={handleLogout}
            className='bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200'
          >
            Đăng xuất
          </Link>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;
