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
}> = ({ onFilter }) => {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch('/hn_geo_names.json')
      .then(res => res.json())
      .then(data => setAddresses(data));
  }, []);

  // Tạo danh sách options cho Select
  const options = addresses.map(addr => ({
    value: addr.name ? `${addr.type} ${addr.name}` : addr.type,
    label: addr.name ? `${addr.type} ${addr.name}` : addr.type,
    province: 'Hà Nội', // Nếu chỉ lọc Hà Nội
    ward: addr.name || ''
  }));

  const handleChange = (option: any) => {
    setSelected(option);
    // Truyền province và ward cho filter ngoài
    onFilter(option?.province || '', option?.ward || '');
  };

  return (
    <div className='mb-4'>
      <label className='block font-medium mb-1'>Lọc theo địa chỉ</label>
      <Select
        options={[
          { value: '', label: 'Tất cả', province: '', ward: '' },
          ...options
        ]}
        value={selected}
        onChange={handleChange}
        isClearable
        placeholder='Tìm địa chỉ...'
      />
    </div>
  );
};

export default AddressFilter;
