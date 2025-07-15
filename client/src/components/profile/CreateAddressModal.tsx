import React from 'react';
import Select from 'react-select';

interface CreateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newAddressForm: any;
  setNewAddressForm: React.Dispatch<React.SetStateAction<any>>;
  wards: { value: string; label: string }[];
  userRole?: string;
}

const CreateAddressModal: React.FC<CreateAddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newAddressForm,
  setNewAddressForm,
  wards,
  userRole
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg w-[95%] max-w-md shadow-lg border'>
        <h3 className='text-lg font-bold mb-4'>Thêm địa chỉ mới</h3>
        {/* Nếu không phải shop thì hiển thị trường họ tên người nhận */}
        {userRole !== 'shop' && (
          <input
            placeholder='Họ và tên người nhận'
            className='w-full border p-2 mb-2 rounded text-sm'
            value={newAddressForm.fullName}
            onChange={e =>
              setNewAddressForm((prev: any) => ({
                ...prev,
                fullName: e.target.value
              }))
            }
          />
        )}
        <input
          placeholder='Số điện thoại'
          className='w-full border p-2 mb-2 rounded text-sm'
          value={newAddressForm.phone}
          onChange={e =>
            setNewAddressForm((prev: any) => ({
              ...prev,
              phone: e.target.value
            }))
          }
        />
        <input
          placeholder='Địa chỉ cụ thể (số nhà, đường)'
          className='w-full border p-2 mb-2 rounded text-sm'
          value={newAddressForm.street}
          onChange={e =>
            setNewAddressForm((prev: any) => ({
              ...prev,
              street: e.target.value
            }))
          }
        />
        {/* Phường/Xã dạng react-select có thể tìm kiếm */}
        <Select
          options={wards}
          value={wards.find(w => w.value === newAddressForm.ward) || null}
          onChange={option =>
            setNewAddressForm((prev: any) => ({
              ...prev,
              ward: option ? option.value : ''
            }))
          }
          placeholder='Chọn hoặc tìm phường/xã'
          isClearable
          className='mb-2'
        />
        {/* Tỉnh/Thành phố cố định là Hà Nội */}
        <input
          value='Hà Nội'
          disabled
          className='w-full border p-2 mb-2 rounded text-sm bg-gray-100 text-gray-500'
        />
        <select
          name='addressType'
          value={newAddressForm.addressType}
          onChange={e =>
            setNewAddressForm((prev: any) => ({
              ...prev,
              addressType: e.target.value
            }))
          }
          className='w-full border p-2 mb-2 rounded text-sm'
        >
          <option value='home'>🏠 Nhà riêng</option>
          <option value='office'>🏢 Công ty</option>
          <option value='other'>🏬 Khác</option>
        </select>
        {/* Checkbox mặc định */}
        <label className='flex items-center gap-2 mt-2'>
          <input
            type='checkbox'
            checked={newAddressForm.isDefault}
            onChange={e =>
              setNewAddressForm((prev: any) => ({
                ...prev,
                isDefault: e.target.checked
              }))
            }
          />
          Đặt làm địa chỉ mặc định
        </label>
        <div className='flex justify-end gap-2 mt-4'>
          <button onClick={onClose} className='px-4 py-2 bg-gray-200 rounded'>
            Huỷ
          </button>
          <button
            onClick={onSubmit}
            className='px-4 py-2 bg-[#C4265B] text-white rounded'
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAddressModal;
