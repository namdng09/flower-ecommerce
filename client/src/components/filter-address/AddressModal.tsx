import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';

interface WardOption {
  value: string;
  label: string;
}

interface AddressModalProps {
  onSelect: (province: string, ward: string) => void;
  wards: string[];
  onClose?: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  onSelect,
  wards,
  onClose
}) => {
  const [selectedWard, setSelectedWard] = useState<WardOption | null>(null);
  const [error, setError] = useState('');
  const selectRef = useRef<any>(null);

  const options: WardOption[] = wards.map(ward => ({
    value: ward,
    label: ward
  }));

  useEffect(() => {
    setTimeout(() => {
      selectRef.current?.focus();
    }, 100); // slight delay to allow modal mount
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard) {
      setError('Vui lòng chọn phường/xã!');
      return;
    }
    setError('');
    onSelect('Hà Nội', selectedWard.value);
  };

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='relative bg-white rounded-2xl shadow-2xl w-[380px] p-6 animate-fade-in'>
        {onClose && (
          <button
            onClick={onClose}
            className='absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors'
            aria-label='Close modal'
          >
            <X size={20} />
          </button>
        )}
        <h2 className='text-xl font-semibold mb-6 text-gray-800 text-center'>
          Chọn phường/xã tại Hà Nội
        </h2>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Tỉnh/Thành phố
            </label>
            <input
              type='text'
              value='Hà Nội'
              disabled
              className='w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed'
            />
          </div>
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Phường/Xã
            </label>
            <Select
              ref={selectRef}
              options={options}
              value={selectedWard}
              onChange={option => setSelectedWard(option)}
              placeholder='Tìm địa chỉ...'
              isClearable
              className='text-sm'
              classNamePrefix='react-select'
              noOptionsMessage={() => 'Không tìm thấy phường/xã'}
              styles={{
                control: base => ({
                  ...base,
                  borderRadius: '0.5rem',
                  minHeight: '42px',
                  padding: '2px 4px',
                  borderColor: '#e5e7eb',
                  boxShadow: 'none'
                }),
                menu: base => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
            {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
          </div>
          <div className='space-y-2'>
            <button
              type='submit'
              className='w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition duration-200'
            >
              Xác nhận
            </button>
            {onClose && (
              <button
                type='button'
                onClick={onClose}
                className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition duration-200'
              >
                Bỏ qua
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
