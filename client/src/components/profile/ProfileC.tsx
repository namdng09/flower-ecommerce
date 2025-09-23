import React, { useEffect, useState, useContext } from 'react';
import CreateAddressModal from './CreateAddressModal';
import ListFavourite from './ListFavourite';
import ListAddress from './ListAddress';
import UserInfo from './UserInfo';
import { useNavigate } from 'react-router';
import defaultAva from '../../../src/assets/no-user.jpg';
import { AuthContext } from '~/contexts/authContext';
import axiosInstance from '~/config/axiosConfig';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import {
  fetchFavouritesByUser,
  removeFavouriteItem
} from '~/store/slices/favouriteSlice';
import {
  fetchAddresses,
  updateAddress,
  deleteAddress,
  createAddress
} from '~/store/slices/addressSlice';
import { Link } from 'react-router';
import {
  FaUserCircle,
  FaHeart,
  FaTimes,
  FaMapMarkerAlt,
  FaEdit,
  FaTrashAlt
} from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Select from 'react-select';

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
    fullName: '',
    phone: '',
    province: '',
    ward: '',
    street: '',
    addressType: '',
    isDefault: false
  });

  // Modal tạo địa chỉ mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    province: 'Hà Nội',
    addressType: 'home',
    isDefault: false
  });

  // Danh sách phường/xã Hà Nội cho react-select
  const [wards, setWards] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    fetch('/hn_geo_names.json')
      .then(res => res.json())
      .then(data =>
        setWards(
          data.map((item: any) => ({
            value: `${item.type} ${item.name}`,
            label: `${item.type} ${item.name}`
          }))
        )
      );
  }, []);

  const { items: favourites, loading: favLoading } = useAppSelector(
    state => state.favourites
  );
  const { addresses, loading: addressLoading } = useAppSelector(
    state => state.addresses
  );

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

  const handleChangeEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      if (!editingAddressId) return;
      await dispatch(
        updateAddress({ id: editingAddressId, updateData: editForm })
      ).unwrap();
      toast.success('Địa chỉ đã được cập nhật!');
      setEditingAddressId(null);
    } catch (err) {
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

  // Tạo địa chỉ mới
  const handleCreateAddress = async () => {
    if (!userId) {
      toast.warn('⚠️ Vui lòng đăng nhập để tiếp tục!');
      return;
    }

    // Thêm userRole vào dữ liệu gửi đi
    const newAddress = {
      ...newAddressForm,
      user: userId,
      userRole: user?.role // Thêm role của user
    };

    console.log('Creating address for user role:', user?.role, newAddress);

    try {
      await dispatch(createAddress(newAddress)).unwrap();
      toast.success('🎉 Đã thêm địa chỉ mới thành công!');
      setNewAddressForm({
        fullName: '',
        phone: '',
        street: '',
        ward: '',
        province: 'Hà Nội',
        addressType: user?.role === 'shop' ? 'shop' : 'home', // Set default dựa trên role
        isDefault: false
      });
      setIsModalOpen(false);
      dispatch(fetchAddresses(userId));
    } catch (error) {
      console.error('Create address error:', error);
      toast.error('❌ Thêm địa chỉ thất bại!');
    }
  };

  return (
    <div className='max-w-6xl mx-auto px-4 py-10 text-black space-y-10 mt-40'>
      {/* USER INFO */}
      <UserInfo
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleLogout={handleLogout}
        defaultAva={defaultAva}
        userId={userId}
        setForm={setForm}
      />

      {/* FAVOURITES */}
      <ListFavourite
        favourites={favourites}
        favLoading={favLoading}
        handleRemoveFavourite={handleRemoveFavourite}
      />

      {/* ADDRESSES */}
      <div className='bg-white border border-gray-200 rounded-xl shadow-md p-6'>
        <h3 className='text-lg font-bold mb-4 flex items-center text-indigo-600 gap-2'>
          <FaMapMarkerAlt className='text-xl' /> Danh sách địa chỉ
        </h3>

        <button
          onClick={() => setIsModalOpen(true)}
          className='border px-3 py-1 rounded text-blue-600 border-blue-400 hover:bg-blue-50 flex items-center gap-1 mb-4'
        >
          <FiPlus className='text-blue-500' /> Thêm địa chỉ mới
        </button>

        {/* Modal thêm địa chỉ */}
        <CreateAddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateAddress}
          newAddressForm={newAddressForm}
          setNewAddressForm={setNewAddressForm}
          wards={wards}
          userRole={user?.role}
        />

        <ListAddress
          addresses={addresses}
          addressLoading={addressLoading}
          editingAddressId={editingAddressId}
          editForm={editForm}
          handleEditAddress={handleEditAddress}
          handleChangeEdit={handleChangeEdit}
          handleSubmitEdit={handleSubmitEdit}
          handleDeleteAddress={handleDeleteAddress}
          setEditingAddressId={setEditingAddressId}
        />
      </div>
    </div>
  );
};

export default EditProfile;
