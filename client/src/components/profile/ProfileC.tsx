// import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router';
// import defaultAva from '../../../src/assets/no-user.jpg';
// import { AuthContext } from '~/contexts/authContext';
// import axiosInstance from '~/config/axiosConfig';
// import { useDispatch } from 'react-redux';
// import { useAppSelector } from '~/hooks/useAppSelector';
// import { fetchFavouritesByUser } from '~/store/slices/favouriteSlice';
// import { Link } from 'react-router';
// import { FaUserCircle, FaHeart } from 'react-icons/fa';

// interface UserProfile {
//   fullName: string;
//   username: string;
//   email: string;
//   phoneNumber: string;
//   avatarUrl: string;
//   role: string;
//   createdAt?: string;
// }

// const EditProfile: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch<any>();
//   const { user, accessToken } = useContext(AuthContext);
//   const userId = user?.id;

//   const [form, setForm] = useState<UserProfile>({
//     fullName: '',
//     username: '',
//     email: '',
//     phoneNumber: '',
//     avatarUrl: '',
//     role: ''
//   });

//   const { items: favourites, loading: favLoading } = useAppSelector(
//     state => state.favourites
//   );

//   // Fetch user info
//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!userId || !accessToken) return;
//       try {
//         const res = await axiosInstance.get(`/api/users/${userId}`, {
//           headers: { Authorization: `Bearer ${accessToken}` }
//         });
//         const u = res.data.data;
//         setForm({
//           fullName: u.fullName || '',
//           username: u.username || '',
//           email: u.email || '',
//           phoneNumber: u.phoneNumber?.toString() || '',
//           avatarUrl: u.avatarUrl || '',
//           role: u.role || '',
//           createdAt: u.createdAt || ''
//         });
//       } catch {
//         alert('Không thể lấy dữ liệu người dùng');
//       }
//     };

//     if (userId) {
//       fetchProfile();
//       dispatch(fetchFavouritesByUser(userId));
//     }
//   }, [userId, accessToken, dispatch]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!userId || !accessToken) return;

//     try {
//       await axiosInstance.put(
//         `/api/users/${userId}`,
//         {
//           fullName: form.fullName,
//           username: form.username,
//           email: form.email,
//           phoneNumber: form.phoneNumber,
//           avatarUrl: form.avatarUrl,
//           role: form.role
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`
//           }
//         }
//       );
//       alert('Cập nhật thành công!');
//       navigate(`/home/profile/${userId}`);
//     } catch (err) {
//       alert('Cập nhật thất bại!');
//     }
//   };

//   const handleLogout = () => {
//     sessionStorage.removeItem('accessToken');
//     navigate('/auth/login');
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-10 text-black space-y-10 mt-40">
//       {/* USER INFO */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
//           <FaUserCircle className="text-lime-600 text-2xl" />
//           Thông tin tài khoản
//         </h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="md:col-span-2 text-center">
//             <img
//               src={form.avatarUrl?.trim() !== '' ? form.avatarUrl : defaultAva}
//               alt="Avatar"
//               className="w-24 h-24 rounded-full object-cover mx-auto border border-lime-500 shadow-sm"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Họ và tên</label>
//             <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Tên đăng nhập</label>
//             <input type="text" name="username" value={form.username} onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Email</label>
//             <input type="email" name="email" value={form.email} disabled
//               className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Số điện thoại</label>
//             <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
//               className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Vai trò</label>
//             <input type="text" value={form.role} disabled
//               className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Ngày tạo tài khoản</label>
//             <input type="text"
//               value={form.createdAt ? new Date(form.createdAt).toLocaleDateString('vi-VN') : ''}
//               disabled className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
//           </div>

//           <div className="md:col-span-2 flex justify-center gap-4 pt-4">
//             <button type="submit"
//               className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded shadow">
//               Cập nhật
//             </button>
//             <button type="button" onClick={handleLogout}
//               className="bg-[#B9205A] hover:bg-[#A3184D] text-white px-6 py-2 rounded shadow">
//               Đăng xuất
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* FAVOURITE LIST */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full">
//         <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600 gap-2">
//           <FaHeart className="text-xl" />
//           Danh sách yêu thích
//         </h3>

//         {favLoading ? (
//           <p className="text-gray-500 italic">Đang tải...</p>
//         ) : favourites.length === 0 ? (
//           <p className="text-gray-500 italic">Bạn chưa yêu thích sản phẩm nào.</p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//             {favourites.map((product: any) => (
//               <Link to={`/home/products/${product._id}`} key={product._id}
//                 className="border border-gray-200 rounded-lg hover:shadow-md transition bg-white overflow-hidden hover:-translate-y-1 duration-150">
//                 <img src={product.thumbnailImage} alt={product.title}
//                   className="w-full h-40 object-cover" />
//                 <div className="p-3">
//                   <h4 className="text-sm font-semibold line-clamp-1">{product.title}</h4>
//                   <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );

// };

// export default EditProfile;


import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import defaultAva from '../../../src/assets/no-user.jpg';
import { AuthContext } from '~/contexts/authContext';
import axiosInstance from '~/config/axiosConfig';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchFavouritesByUser, removeFavouriteItem, } from '~/store/slices/favouriteSlice';
import { Link } from 'react-router';
import { FaUserCircle, FaHeart, FaTimes } from 'react-icons/fa';

interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
  createdAt?: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { user, accessToken } = useContext(AuthContext);
  const userId = user?.id;

  const [form, setForm] = useState<UserProfile>({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
    role: ''
  });

  const { items: favourites, loading: favLoading } = useAppSelector(
    state => state.favourites
  );

  // Lấy thông tin người dùng & danh sách yêu thích
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !accessToken) return;
      try {
        const res = await axiosInstance.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const u = res.data.data;
        setForm({
          fullName: u.fullName || '',
          username: u.username || '',
          email: u.email || '',
          phoneNumber: u.phoneNumber?.toString() || '',
          avatarUrl: u.avatarUrl || '',
          role: u.role || '',
          createdAt: u.createdAt || ''
        });
      } catch {
        alert('Không thể lấy dữ liệu người dùng');
      }
    };

    if (userId) {
      fetchProfile();
      dispatch(fetchFavouritesByUser(userId));
    }
  }, [userId, accessToken, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !accessToken) return;

    try {
      await axiosInstance.put(
        `/api/users/${userId}`,
        {
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          phoneNumber: form.phoneNumber,
          avatarUrl: form.avatarUrl,
          role: form.role
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      alert('Cập nhật thành công!');
      navigate(`/home/profile/${userId}`);
    } catch (err) {
      alert('Cập nhật thất bại!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/auth/login');
  };

  const handleRemoveFavourite = async (productId: string) => {
    if (!userId) return;

    try {
      await dispatch(removeFavouriteItem({ userId, productId })).unwrap();

      await dispatch(fetchFavouritesByUser(userId));
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm khỏi yêu thích:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-black space-y-10 mt-40">
      {/* USER INFO */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <FaUserCircle className="text-lime-600 text-2xl" />
          Thông tin tài khoản
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 text-center">
            <img
              src={form.avatarUrl?.trim() !== '' ? form.avatarUrl : defaultAva}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mx-auto border border-lime-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Họ và tên</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
          </div>

          <div>
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <input type="text" name="username" value={form.username} onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" name="email" value={form.email} disabled
              className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
          </div>

          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded mt-1 shadow-sm" />
          </div>

          <div>
            <label className="text-sm font-medium">Vai trò</label>
            <input type="text" value={form.role} disabled
              className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
          </div>

          <div>
            <label className="text-sm font-medium">Ngày tạo tài khoản</label>
            <input type="text"
              value={form.createdAt ? new Date(form.createdAt).toLocaleDateString('vi-VN') : ''}
              disabled className="w-full border border-gray-200 px-3 py-2 rounded mt-1 bg-gray-100 text-gray-500" />
          </div>

          <div className="md:col-span-2 flex justify-center gap-4 pt-4">
            <button type="submit"
              className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded shadow">
              Cập nhật
            </button>
            <button type="button" onClick={handleLogout}
              className="bg-[#B9205A] hover:bg-[#A3184D] text-white px-6 py-2 rounded shadow">
              Đăng xuất
            </button>
          </div>
        </form>
      </div>

      {/* FAVOURITE LIST */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full">
        <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600 gap-2">
          <FaHeart className="text-xl" />
          Danh sách yêu thích
        </h3>

        {favLoading ? (
          <p className="text-gray-500 italic">Đang tải...</p>
        ) : favourites.length === 0 ? (
          <p className="text-gray-500 italic">Bạn chưa yêu thích sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favourites.map((product: any) => (
              <Link
                to={`/home/products/${product._id}`}
                key={product._id}
                className="relative border border-gray-200 rounded-lg hover:shadow-md transition bg-white overflow-hidden hover:-translate-y-1 duration-150 group"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavourite(product._id);
                  }}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-500 hover:text-red-500 z-10"
                >
                  <FaTimes className="w-4 h-4" />
                </button>

                <img src={product.thumbnailImage} alt={product.title}
                  className="w-full h-40 object-cover" />
                <div className="p-3">
                  <h4 className="text-sm font-semibold line-clamp-1">{product.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
