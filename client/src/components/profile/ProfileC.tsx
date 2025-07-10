import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import defaultAva from '../../../src/assets/no-user.jpg';
import { AuthContext } from '~/contexts/authContext';
import axiosInstance from '~/config/axiosConfig';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchFavouritesByUser, removeFavouriteItem } from '~/store/slices/favouriteSlice';
import { fetchAddresses, updateAddress, deleteAddress } from '~/store/slices/addressSlice';
import { Link } from 'react-router';
import { FaUserCircle, FaHeart, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({
    fullName: '', phone: '', province: '', ward: '', street: '', addressType: ''
  });

  const { items: favourites, loading: favLoading } = useAppSelector(state => state.favourites);
  const { addresses, loading: addressLoading } = useAppSelector(state => state.addresses);

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
        toast.error('Không thể lấy dữ liệu người dùng!');
      }
    };

    if (userId) {
      fetchProfile();
      dispatch(fetchFavouritesByUser(userId));
      dispatch(fetchAddresses(userId));
    }
  }, [userId, accessToken, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !accessToken) return;

    try {
      await axiosInstance.put(
        `/api/users/${userId}`,
        { ...form },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Cập nhật thành công!');
      navigate(`/home/profile/${userId}`);
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/auth/login');
  };

  const handleRemoveFavourite = async (productId: string) => {
    if (!userId) return toast.warn('Vui lòng đăng nhập!');
    try {
      await dispatch(removeFavouriteItem({ userId, productId }));
      await dispatch(fetchFavouritesByUser(userId));
      toast.success('Đã xoá khỏi mục yêu thích!');
    } catch {
      toast.error('Xoá yêu thích thất bại!');
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr._id);
    setEditForm({ ...addr });
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async () => {
    try {
      if (!editingAddressId) return;
      await dispatch(updateAddress({ id: editingAddressId, updateData: editForm })).unwrap();
      toast.success('Địa chỉ đã được cập nhật!');
      setEditingAddressId(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật địa chỉ:', err);
      toast.error('Cập nhật địa chỉ thất bại!');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success('Đã xoá địa chỉ!');
      if (editingAddressId === id) setEditingAddressId(null);
    } catch (err) {
      toast.error('Xoá địa chỉ thất bại!');
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

          <input name="fullName" value={form.fullName} onChange={handleChange} className="border p-2 rounded" placeholder="Họ và tên" />
          <input name="username" value={form.username} onChange={handleChange} className="border p-2 rounded" placeholder="Tên đăng nhập" />
          <input name="email" value={form.email} disabled className="border p-2 rounded bg-gray-100 text-gray-500" placeholder="Email" />
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="border p-2 rounded" placeholder="SĐT" />
          <input name="role" value={form.role} disabled className="border p-2 rounded bg-gray-100 text-gray-500" placeholder="Vai trò" />
          <input name="createdAt" value={form.createdAt ? new Date(form.createdAt).toLocaleDateString('vi-VN') : ''} disabled className="border p-2 rounded bg-gray-100 text-gray-500" />

          <div className="md:col-span-2 flex justify-center gap-4 pt-4">
            <button type="submit" className="bg-lime-600 text-white px-6 py-2 rounded">Cập nhật</button>
            <button onClick={handleLogout} className="bg-pink-600 text-white px-6 py-2 rounded">Đăng xuất</button>
          </div>
        </form>
      </div>

      {/* FAVOURITES */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full">
        <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600 gap-2">
          <FaHeart className="text-xl" /> Danh sách yêu thích
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


      {/* ADDRESSES */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center text-indigo-600 gap-2">
          <FaMapMarkerAlt className="text-xl" /> Danh sách địa chỉ
        </h3>

        {addressLoading ? (
          <p className="text-gray-500 italic">Đang tải địa chỉ...</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-500 italic">Bạn chưa thêm địa chỉ nào.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr: any) => (
              <div
                key={addr._id}
                className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm relative"
              >
                {editingAddressId === addr._id ? (
                  <div className="space-y-3">
                    <input name="fullName" value={editForm.fullName} onChange={handleChangeEdit} placeholder="Họ tên"
                      className="border border-gray-300 w-full px-3 py-2 rounded-md" />
                    <input name="phone" value={editForm.phone} onChange={handleChangeEdit} placeholder="SĐT"
                      className="border border-gray-300 w-full px-3 py-2 rounded-md" />
                    <input name="street" value={editForm.street} onChange={handleChangeEdit} placeholder="Số nhà, đường"
                      className="border border-gray-300 w-full px-3 py-2 rounded-md" />
                    <input name="ward" value={editForm.ward} onChange={handleChangeEdit} placeholder="Phường/xã"
                      className="border border-gray-300 w-full px-3 py-2 rounded-md" />
                    <input name="province" value={editForm.province} onChange={handleChangeEdit} placeholder="Tỉnh/thành phố"
                      className="border border-gray-300 w-full px-3 py-2 rounded-md" />
                    <select name="addressType" value={editForm.addressType} onChange={handleChangeEdit}
                      className="border border-gray-300 w-full px-3 py-2 rounded-md">
                      <option value="home">🏠 Nhà riêng</option>
                      <option value="work">🏢 Công ty</option>
                    </select>
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSubmitEdit}
                        className="bg-green-600 text-white px-4 py-1 rounded-md text-sm hover:bg-green-700 transition">
                        Lưu
                      </button>
                      <button onClick={() => setEditingAddressId(null)}
                        className="bg-gray-300 px-4 py-1 rounded-md text-sm hover:bg-gray-400 transition">
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-gray-800">{addr.fullName} - {addr.phone}</div>
                    <div className="text-sm text-gray-700">
                      {addr.street}, {addr.ward}, {addr.province}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 italic">
                      {addr.addressType === 'home' ? '🏠 Nhà riêng' : '🏢 Công ty'}
                      {addr.isDefault && (
                        <span className="ml-2 text-green-600 font-medium">[Mặc định]</span>
                      )}
                    </div>
                    <div className="absolute top-3 right-4 flex gap-3">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                        title="Sửa địa chỉ"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Xoá địa chỉ"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
