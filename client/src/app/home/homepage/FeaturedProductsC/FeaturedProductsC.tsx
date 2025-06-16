import { useState } from 'react';
import hoa1 from '../../../../assets/hoa1.webp';
import hoa2 from '../../../../assets/hoa2.webp';
import hoa3 from '../../../../assets/hoa3.webp';
import hoa4 from '../../../../assets/hoa4.webp';

const products = [
  {
    id: 1,
    name: 'Evergreen Candytuft',
    price: 50,
    image: hoa1
  },
  {
    id: 2,
    name: 'Flowers Bouquet Pink',
    price: 100,
    image: hoa2
  },
  {
    id: 3,
    name: 'Pearly Everlasting',
    price: 100,
    oldPrice: 120,
    image: hoa3
  },
  {
    id: 4,
    name: 'Flowers Bouquet Pink',
    price: 150,
    image: hoa4
  }
];

const categories = ['Winter', 'Various', 'Greens'];

function FeaturedProductsC() {
  const [activeCategory, setActiveCategory] = useState('Winter');

  return (
    <div className='max-w-screen-xl mx-auto py-12 px-4'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold text-black'>Featured Products</h2>
        <div className='flex items-center space-x-4'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium ${
                activeCategory === cat ? 'text-[#B9205A]' : 'text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
          <button className='w-8 h-8 border rounded flex items-center justify-center text-gray-500 hover:text-black'>
            &lt;
          </button>
          <button className='w-8 h-8 border rounded flex items-center justify-center text-gray-500 hover:text-black'>
            &gt;
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
        {products.map(product => (
          <div
            key={product.id}
            className='bg-[#f9f9f9] rounded-lg p-4 flex flex-col items-center relative group overflow-hidden'
          >
            <img
              src={product.image}
              alt={product.name}
              className='w-80 h-80 object-contain mb-4 text-black'
            />

            <h3 className='text-center text-sm font-medium mb-1 text-black'>
              {product.name}
            </h3>
            <div className='flex space-x-2 text-sm'>
              <span className='font-semibold text-black'>
                ${product.price.toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className='line-through text-red-500'>
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

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
  );
}

export default FeaturedProductsC;
