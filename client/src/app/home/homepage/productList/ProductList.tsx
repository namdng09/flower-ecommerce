import { useState } from 'react';
import hoa from '../../../../assets/hoa1.webp';
import hoa1 from '../../../../assets/hoa2.webp';
import hoa2 from '../../../../assets/hoa3.webp';
import banner from '../../../../assets/banner1.webp';

const products = [
  { id: 1, name: 'Affiliate Link Product', price: 80, image: hoa1 },
  { id: 2, name: "Dutchman's Breeches", price: 80, oldPrice: 110, image: hoa2 },
  { id: 3, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 4, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 5, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 6, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 7, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 8, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa },
  { id: 9, name: "Dutchman's Breeches", price: 50, image: hoa }
];

function ProductList() {
  const [sortBy, setSortBy] = useState('A-Z');

  return (
    <div className='flex flex-col lg:flex-row gap-8 p-4 pt-[200px]'>
      <div className='lg:w-1/5 space-y-6 text-black'>
        <div>
          <h3 className='font-semibold mb-2'>Availability</h3>
          <label className='block'>
            <input type='checkbox' /> In stock (41)
          </label>
          <label className='block'>
            <input type='checkbox' /> Out of stock (5)
          </label>
        </div>

        <div>
          <h3 className='font-semibold mb-2'>Price</h3>
          <div className='flex items-center gap-2 mb-2'>
            <input type='number' placeholder='0' className='border p-1 w-20' />
            <span>to</span>
            <input
              type='number'
              placeholder='150'
              className='border p-1 w-20'
            />
          </div>
          <button className='bg-black text-white px-4 py-1'>Filter</button>
        </div>

        <div>
          <h3 className='font-semibold mb-2'>Product type</h3>
          <p className='text-sm text-gray-500'>0 selected</p>
        </div>
      </div>

      <div className='flex-1'>
        <div className='mb-6'>
          <img src={banner} alt='New Collection' className='w-full rounded' />
        </div>

        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 text-black gap-4'>
          <p>Showing 1-9 of {products.length} item(s)</p>
          <div>
            <label className='mr-2'>Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='border p-1'
            >
              <option value='A-Z'>Alphabetically, A-Z</option>
              <option value='Z-A'>Alphabetically, Z-A</option>
              <option value='PriceLowHigh'>Price, low to high</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {products.map(product => (
            <div
              key={product.id}
              className='border rounded p-4 text-center relative group overflow-hidden bg-white'
            >
              <img
                src={product.image}
                alt={product.name}
                className='mx-auto mb-3 h-100 object-contain'
              />
              <h4 className='font-medium mb-1 text-black'>{product.name}</h4>
              {product.oldPrice && (
                <p className='line-through text-gray-400 text-sm mb-1'>
                  ${product.oldPrice}
                </p>
              )}
              <p className='text-pink-600 font-semibold'>${product.price}</p>

              <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <button className='bg-pink-500 text-white px-4 py-2 rounded-full font-semibold'>
                  Mua ngay
                </button>
                <button className='border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent'>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
