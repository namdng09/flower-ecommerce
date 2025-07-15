import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface AddressOption {
  name?: string;
  type: string;
  province?: string;
  ward?: string;
}

const AddressFilter: React.FC<{
  onFilter: (province: string, ward: string) => void;
  selectedOption: any;
}> = ({ onFilter, selectedOption }) => {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);

  useEffect(() => {
    fetch('/hn_geo_names.json')
      .then(res => res.json())
      .then(data => setAddresses(data));
  }, []);

  const options = addresses.map(addr => ({
    value: addr.name ? `${addr.type} ${addr.name}` : addr.type,
    label: addr.name ? `${addr.type} ${addr.name}` : addr.type,
    province: 'Hà Nội',
    ward: addr.name || ''
  }));

  const handleChange = (option: any) => {
    onFilter(option?.province || '', option?.ward || '');
  };

  return (
    <div className='mb-4'>
      <label className='block font-medium mb-1'>Tìm theo địa chỉ</label>
      <Select
        options={[
          { value: '', label: 'Tất cả', province: '', ward: '' },
          ...options
        ]}
        value={selectedOption}
        onChange={handleChange}
        isClearable
        placeholder='Tìm địa chỉ...'
      />
    </div>
  );
};

export default AddressFilter;
