import React from 'react';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceFilterProps {
  value: PriceRange | null; // chỉ một khoảng giá hoặc null
  onChange: (range: PriceRange | null) => void;
}

const priceOptions = [
  { label: '100k - 200k', value: { min: 100000, max: 200000 } },
  { label: '200k - 500k', value: { min: 200000, max: 500000 } },
  { label: '500k - 1 triệu', value: { min: 500000, max: 1000000 } },
  { label: 'Trên 1 triệu', value: { min: 1000000, max: Infinity } }
];

const PriceFilter: React.FC<PriceFilterProps> = ({ value, onChange }) => {
  return (
    <div className='space-y-2'>
      <h3 className='block font-medium mb-1'>Tìm theo mức giá</h3>
      {priceOptions.map(opt => (
        <label
          key={opt.label}
          className='flex items-center gap-2 cursor-pointer'
        >
          <input
            type='radio'
            name='price-filter'
            checked={
              value?.min === opt.value.min && value?.max === opt.value.max
            }
            onChange={() => onChange(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='radio'
          name='price-filter'
          checked={value === null}
          onChange={() => onChange(null)}
        />
        <span>Tất cả</span>
      </label>
    </div>
  );
};

export default PriceFilter;
