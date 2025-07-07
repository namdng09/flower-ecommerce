import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '~/contexts/authContext';
import { fetchAddresses, createAddress } from '~/store/slices/addressSlice';
import type { RootState } from '~/store';

const AddressSelectorWithModal: React.FC<{
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
}> = ({ selectedAddressId, setSelectedAddressId }) => {
  const dispatch = useDispatch<any>();
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const addresses = useSelector(
    (state: RootState) => state.addresses.addresses
  );

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    province: ''
  });

  useEffect(() => {
    if (userId) dispatch(fetchAddresses(userId));
  }, [dispatch, userId]);

  const handleCreate = async () => {
    const addressData = { ...formData, user: userId };
    const result = await dispatch(createAddress(addressData));
    if (createAddress.fulfilled.match(result)) {
      setShowModal(false);
      setFormData({
        fullName: '',
        phone: '',
        street: '',
        ward: '',
        province: ''
      });
    } else {
      alert('❌ Không thể thêm địa chỉ');
    }
  };

  return (
    <div className='mb-6 text-black'>
      <h3 className='text-lg font-semibold mb-2 text-[#C4265B]'>
        📍 Địa chỉ giao hàng
      </h3>
      {addresses.length === 0 ? (
        <div>
          <p className='text-black'>Bạn chưa có địa chỉ nào.</p>
          <button
            onClick={() => setShowModal(true)}
            className='text-blue-600 underline mt-2'
          >
            ➕ Thêm địa chỉ mới
          </button>
        </div>
      ) : (
        <div className='space-y-2'>
          {addresses.map(addr => (
            <label
              key={addr._id}
              className='block border p-3 rounded cursor-pointer hover:bg-gray-50 text-black'
            >
              <input
                type='radio'
                name='selectedAddress'
                className='mr-2'
                checked={selectedAddressId === addr._id}
                onChange={() => setSelectedAddressId(addr._id)}
              />
              <span className='font-semibold'>{addr.fullName}</span> -{' '}
              {addr.phone}
              <div className='text-sm text-gray-600'>
                {addr.street}, {addr.ward}, {addr.province}
              </div>
            </label>
          ))}
          <button
            onClick={() => setShowModal(true)}
            className='text-blue-600 underline'
          >
            ➕ Thêm địa chỉ khác
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 text-black'>
          <div className='bg-white/80 backdrop-blur-lg p-6 rounded-lg w-full max-w-md shadow-xl border border-gray-200'>
            <h2 className='text-lg font-bold mb-4'>Thêm địa chỉ mới</h2>
            <div className='space-y-2'>
              <input
                type='text'
                placeholder='Họ và tên'
                value={formData.fullName}
                onChange={e =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className='w-full border p-2 rounded placeholder-black text-black bg-white/70 backdrop-blur'
              />
              <input
                type='text'
                placeholder='Số điện thoại'
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className='w-full border p-2 rounded placeholder-black text-black bg-white/70 backdrop-blur'
              />
              <input
                type='text'
                placeholder='Địa chỉ cụ thể (số nhà, đường)'
                value={formData.street}
                onChange={e =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className='w-full border p-2 rounded placeholder-black text-black bg-white/70 backdrop-blur'
              />
              <input
                type='text'
                placeholder='Phường/Xã'
                value={formData.ward}
                onChange={e =>
                  setFormData({ ...formData, ward: e.target.value })
                }
                className='w-full border p-2 rounded placeholder-black text-black bg-white/70 backdrop-blur'
              />
              <input
                type='text'
                placeholder='Tỉnh/Thành phố'
                value={formData.province}
                onChange={e =>
                  setFormData({ ...formData, province: e.target.value })
                }
                className='w-full border p-2 rounded placeholder-black text-black bg-white/70 backdrop-blur'
              />
            </div>
            <div className='flex justify-end mt-4 gap-3'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 bg-gray-200 rounded text-black'
              >
                Huỷ
              </button>
              <button
                onClick={handleCreate}
                className='px-4 py-2 bg-[#C4265B] text-white rounded'
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelectorWithModal;
