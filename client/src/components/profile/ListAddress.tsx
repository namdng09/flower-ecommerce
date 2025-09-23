import React from 'react';
import { FaMapMarkerAlt, FaEdit, FaTrashAlt } from 'react-icons/fa';

interface ListAddressProps {
  addresses: any[];
  addressLoading: boolean;
  editingAddressId: string | null;
  editForm: any;
  handleEditAddress: (addr: any) => void;
  handleChangeEdit: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmitEdit: () => void;
  handleDeleteAddress: (id: string) => void;
  setEditingAddressId: React.Dispatch<React.SetStateAction<string | null>>;
  userRole?: string; // Thêm prop userRole
}

const ListAddress: React.FC<ListAddressProps> = ({
  addresses,
  addressLoading,
  editingAddressId,
  editForm,
  handleEditAddress,
  handleChangeEdit,
  handleSubmitEdit,
  handleDeleteAddress,
  setEditingAddressId,
  userRole
}) => {
  const getAddressTypeDisplay = (addressType: string) => {
    if (userRole === 'shop') {
      switch (addressType) {
        case 'home':
          return '🏪 Nhà riêng';
        case 'office':
          return '🏭 Cửa hàng';
        case 'other':
          return '🏢 Khác';
        default:
          return '🏢 Khác';
      }
    } else {
      switch (addressType) {
        case 'home':
          return '🏠 Nhà riêng';
        case 'office':
          return '🏢 Công ty';
        case 'other':
          return '🏬 Khác';
        default:
          return '🏬 Khác';
      }
    }
  };

  return (
    <div className='bg-white border border-gray-200 rounded-xl shadow-md p-6'>
      {addressLoading ? (
        <p className='text-gray-500 italic'>Đang tải địa chỉ...</p>
      ) : addresses.length === 0 ? (
        <p className='text-gray-500 italic'>Bạn chưa thêm địa chỉ nào.</p>
      ) : (
        <div className='space-y-4'>
          {addresses.map((addr: any) => (
            <div
              key={addr._id}
              className='p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm relative'
            >
              {editingAddressId === addr._id ? (
                <div className='space-y-3'>
                  <input
                    name='fullName'
                    value={editForm.fullName}
                    onChange={handleChangeEdit}
                    placeholder={
                      userRole === 'shop' ? 'Tên cửa hàng' : 'Họ tên'
                    }
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  />
                  <input
                    name='phone'
                    value={editForm.phone}
                    onChange={handleChangeEdit}
                    placeholder='SĐT'
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  />
                  <input
                    name='street'
                    value={editForm.street}
                    onChange={handleChangeEdit}
                    placeholder={
                      userRole === 'shop'
                        ? 'Địa chỉ cửa hàng (số nhà, đường)'
                        : 'Số nhà, đường'
                    }
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  />
                  <input
                    name='ward'
                    value={editForm.ward}
                    onChange={handleChangeEdit}
                    placeholder='Phường/xã'
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  />
                  <input
                    name='province'
                    value={editForm.province}
                    onChange={handleChangeEdit}
                    placeholder='Tỉnh/thành phố'
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  />
                  <select
                    name='addressType'
                    value={editForm.addressType}
                    onChange={handleChangeEdit}
                    className='border border-gray-300 w-full px-3 py-2 rounded-md'
                  >
                    {userRole === 'shop' ? (
                      <>
                        <option value='home'>🏪 Nhà riêng</option>
                        <option value='office'>🏭 Cửa hàng</option>
                        <option value='other'>🏢 Khác</option>
                      </>
                    ) : (
                      <>
                        <option value='home'>🏠 Nhà riêng</option>
                        <option value='office'>🏢 Công ty</option>
                        <option value='other'>🏬 Khác</option>
                      </>
                    )}
                  </select>
                  <label className='flex items-center gap-2 mt-2'>
                    <input
                      type='checkbox'
                      name='isDefault'
                      checked={editForm.isDefault}
                      onChange={handleChangeEdit}
                    />
                    {userRole === 'shop'
                      ? 'Đặt làm địa chỉ cửa hàng chính'
                      : 'Đặt làm địa chỉ mặc định'}
                  </label>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={handleSubmitEdit}
                      className='bg-green-600 text-white px-4 py-1 rounded-md text-sm hover:bg-green-700 transition'
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingAddressId(null)}
                      className='bg-gray-300 px-4 py-1 rounded-md text-sm hover:bg-gray-400 transition'
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className='font-semibold text-gray-800'>
                    {addr.fullName} - {addr.phone}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {addr.street}, {addr.ward}, {addr.province}
                  </div>
                  <div className='text-xs text-gray-500 mt-1 italic'>
                    {getAddressTypeDisplay(addr.addressType)}
                    {addr.isDefault && (
                      <span className='ml-2 text-green-600 font-medium'>
                        {userRole === 'shop'
                          ? '[Cửa hàng chính]'
                          : '[Mặc định]'}
                      </span>
                    )}
                  </div>
                  <div className='absolute top-3 right-4 flex gap-3'>
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className='text-indigo-600 hover:text-indigo-800 text-sm'
                      title='Sửa địa chỉ'
                    >
                      <FaEdit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className='text-red-500 hover:text-red-700 text-sm'
                      title='Xoá địa chỉ'
                    >
                      <FaTrashAlt className='w-4 h-4' />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListAddress;
