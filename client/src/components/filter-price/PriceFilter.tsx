import React from 'react';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceFilterProps {
  value: PriceRange | null;
  onChange: (range: PriceRange | null) => void;
}

const priceOptions = [
  { label: '100k - 200k', value: { min: 100000, max: 200000 } },
  { label: '200k - 500k', value: { min: 200000, max: 500000 } },
  { label: '500k - 1 triệu', value: { min: 500000, max: 1000000 } },
  { label: 'Trên 1 triệu', value: { min: 1000000, max: Infinity } }
];

const PriceFilter: React.FC<PriceFilterProps> = ({ value, onChange }) => {
  const isSelected = (option: PriceRange) =>
    value?.min === option.min && value?.max === option.max;

  return (
    <div className='space-y-3'>
      <h3 className='font-semibold text-base text-gray-800'>Khoảng giá</h3>

      {priceOptions.map(opt => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          type='button'
          className={`flex items-center justify-between w-full px-4 py-2 rounded-md border text-left transition duration-150
            ${
              isSelected(opt.value)
                ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
            }`}
        >
          {opt.label}
          <div
            className={`w-4 h-4 border rounded-full flex items-center justify-center ${
              isSelected(opt.value)
                ? 'border-white bg-white'
                : 'border-gray-400'
            }`}
          >
            {isSelected(opt.value) && (
              <div className='w-2 h-2 bg-rose-500 rounded-full' />
            )}
          </div>
        </button>
      ))}

      {/* Tất cả */}
      <button
        onClick={() => onChange(null)}
        type='button'
        className={`flex items-center justify-between w-full px-4 py-2 rounded-md border transition duration-150
          ${
            value === null
              ? 'bg-rose-500 text-white border-rose-500 font-semibold'
              : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
          }`}
      >
        Tất cả
        <div
          className={`w-4 h-4 border rounded-full flex items-center justify-center ${
            value === null ? 'border-white bg-white' : 'border-gray-400'
          }`}
        >
          {value === null && (
            <div className='w-2 h-2 bg-rose-500 rounded-full' />
          )}
        </div>
      </button>
    </div>
  );
};

export default PriceFilter;
