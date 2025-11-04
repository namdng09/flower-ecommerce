// ...existing code...
import { useEffect, useState } from 'react';
import { initFlowbite } from 'flowbite';
import { useNavigate } from 'react-router';
import axios from '~/config/axiosConfig';

import pic1 from '../../../src/assets/carousel7.png';
import pic2 from '../../../src/assets/carousel6.png';
import pic3 from '../../../src/assets/carousel5.png';
import pic4 from '../../../src/assets/carousel10.png';
import pic5 from '../../../src/assets/carousel11.png';
const images = [pic1, pic2, pic3, pic4, pic5];

type Props = {
  shopId?: string;
};

function CarouselC({ shopId = '68639bde2445ea75963ef783' }: Props) {
  useEffect(() => {
    initFlowbite();
  }, []);

  const navigate = useNavigate();
  const [shop, setShop] = useState<any | null>(null);
  const [loadingShop, setLoadingShop] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!shopId) return;
    setLoadingShop(true);
    axios
      .get(`/api/users/${shopId}`)
      .then(res => {
        if (!mounted) return;
        setShop(res.data.data || res.data); // adapt to API shape
      })
      .catch(() => {
        if (!mounted) return;
        setShop(null);
      })
      .finally(() => {
        if (mounted) setLoadingShop(false);
      });
    return () => {
      mounted = false;
    };
  }, [shopId]);

  return (
    <div className='w-screen h-[90vh] relative z-10'>
      {/* Centered shop overlay: fullName large on top, username below, button under them */}
      <div className='absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none px-4 text-center'>
        {loadingShop ? (
          <div className='pointer-events-auto'>
            <div className='h-8 w-56 bg-white/30 rounded-lg mx-auto animate-pulse mb-2' />
            <div className='h-4 w-32 bg-white/20 rounded mx-auto animate-pulse mb-4' />
            <div className='h-10 w-44 bg-white/90 rounded-full mx-auto animate-pulse' />
          </div>
        ) : shop ? (
          <div className='pointer-events-auto'>
            <div className='text-5xl md:text-5xl font-extrabold text-white drop-shadow-lg'>
              {shop.fullName || shop.username}
            </div>
            <div className='text-xl text-white/90 mt-1'>@{shop.username}</div>

            <div className='mt-4 flex justify-center'>
              <button
                onClick={() => navigate(`/home/shop-profile/${shopId}`)}
                className='bg-white/95 text-blue-700 font-semibold px-6 py-3 rounded-full shadow-xl hover:scale-105 transition transform'
                aria-label='Xem shop'
              >
                ❄️ Xem cửa hàng
              </button>
            </div>
          </div>
        ) : (
          <div className='pointer-events-auto'>
            <div className='text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg'>
              Cửa hàng
            </div>
            <div className='text-sm text-white/80 mt-1'>
              Thông tin không tìm thấy
            </div>
            <div className='mt-4'>
              <button
                onClick={() => navigate('/home/shop-profile')}
                className='bg-white/95 text-blue-700 font-semibold px-6 py-3 rounded-full shadow-md hover:scale-105 transition transform'
              >
                ❄️ Xem cửa hàng
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        id='custom-carousel'
        className='relative w-full h-full'
        data-carousel='static'
      >
        <div className='relative w-full h-full overflow-hidden bg-black'>
          {images.map((imgSrc, index) => (
            <div
              key={index}
              className={`${index === 0 ? 'block' : 'hidden'} duration-700 ease-in-out w-full h-full`}
              data-carousel-item={index === 0 ? 'active' : ''}
            >
              <img
                src={imgSrc}
                alt={`Slide ${index + 1}`}
                className='w-full h-full object-cover'
              />
            </div>
          ))}
        </div>

        <button
          type='button'
          className='absolute top-1/2 left-4 z-30 flex items-center justify-center -translate-y-1/2 h-12 w-12 cursor-pointer group focus:outline-none'
          data-carousel-prev
        >
          <span className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white group-focus:ring-4 group-focus:ring-white'>
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </span>
        </button>

        <button
          type='button'
          className='absolute top-1/2 right-4 z-30 flex items-center justify-center -translate-y-1/2 h-12 w-12 cursor-pointer group focus:outline-none'
          data-carousel-next
        >
          <span className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white group-focus:ring-4 group-focus:ring-white'>
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M9 5l7 7-7 7'
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export default CarouselC;
// ...existing code...
