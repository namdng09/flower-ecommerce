import { useOutletContext } from 'react-router';
import hoa1 from '../../../../assets/hoa1.webp';
import hoa2 from '../../../../assets/hoa2.webp';
import hoa3 from '../../../../assets/hoa3.webp';
import hoa4 from '../../../../assets/hoa4.webp';

interface OutletContextType {
  onAddToCart: (product: any) => void;
}

function FeaturedProductsC() {
  const { onAddToCart } = useOutletContext<OutletContextType>();

  const products = [
    { id: 1, name: 'Evergreen Candytuft', price: 50, image: hoa1 },
    { id: 2, name: 'Flowers Bouquet Pink', price: 100, image: hoa2 },
    { id: 3, name: 'Pearly Everlasting', price: 100, oldPrice: 120, image: hoa3 },
    { id: 4, name: 'Flowers', price: 150, image: hoa4 }
  ];

  return (
    <div className='max-w-screen-xl mx-auto py-12 px-4 pt-40'>
      <h2 className='text-2xl font-semibold text-black mb-6'>Featured Products</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
        {products.map(product => (
          <div key={product.id} className='bg-[#f9f9f9] p-4 rounded-lg relative group overflow-hidden flex flex-col items-center'>
            <img src={product.image} alt={product.name} className='w-80 h-80 object-contain mb-4' />
            <h3 className='text-black font-medium text-sm'>{product.name}</h3>
            <div className='flex space-x-2 text-sm'>
              <span className='text-black font-semibold'>${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className='line-through text-red-500'>${product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <button className='bg-pink-500 text-white px-4 py-2 rounded-full font-semibold'>
                Mua ngay
              </button>
              <button
                onClick={() => onAddToCart(product)}
                className='border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent'
              >
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
