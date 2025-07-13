import React from 'react';
import { Link } from 'react-router';
import { FaHeart, FaTimes } from 'react-icons/fa';

interface ListFavouriteProps {
  favourites: any[];
  favLoading: boolean;
  handleRemoveFavourite: (productId: string) => void;
}

const ListFavourite: React.FC<ListFavouriteProps> = ({
  favourites,
  favLoading,
  handleRemoveFavourite
}) => {
  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-md p-6 w-full'>
      <h3 className='text-lg font-bold mb-4 flex items-center text-pink-600 gap-2'>
        <FaHeart className='text-xl' /> Danh sách yêu thích
      </h3>

      {favLoading ? (
        <p className='text-gray-500 italic'>Đang tải...</p>
      ) : favourites.length === 0 ? (
        <p className='text-gray-500 italic'>Bạn chưa yêu thích sản phẩm nào.</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {favourites.map((product: any) => (
            <Link
              to={`/home/products/${product._id}`}
              key={product._id}
              className='relative border border-gray-200 rounded-lg hover:shadow-md transition bg-white overflow-hidden hover:-translate-y-1 duration-150 group'
            >
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFavourite(product._id);
                }}
                className='absolute top-1 right-1 bg-white rounded-full p-1 text-gray-500 hover:text-red-500 z-10'
              >
                <FaTimes className='w-4 h-4' />
              </button>

              <img
                src={product.thumbnailImage}
                alt={product.title}
                className='w-full h-40 object-cover'
              />
              <div className='p-3'>
                <h4 className='text-sm font-semibold line-clamp-1'>
                  {product.title}
                </h4>
                <p className='text-xs text-gray-500 line-clamp-2'>
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListFavourite;
