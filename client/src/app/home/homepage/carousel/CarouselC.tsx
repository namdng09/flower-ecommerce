import { useEffect } from 'react';
import { initFlowbite } from 'flowbite';

import pic1 from '../../../../assets/carousel.jpg';
import pic2 from '../../../../assets/carousel1.jpg';
import pic3 from '../../../../assets/carousel2.jpg';
import pic4 from '../../../../assets/carousel3.jpg';
import pic5 from '../../../../assets/carousel4.jpg';

const images = [pic1, pic2, pic3, pic4, pic5];

function CarouselC() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <div className='w-screen h-screen mt-40'>
      <div
        id='custom-carousel'
        className='relative w-full h-full'
        data-carousel='static'
      >
        <div className='relative w-full h-full overflow-hidden rounded-none bg-black'>
          {images.map((imgSrc, index) => (
            <div
              key={index}
              className={`${index === 0 ? 'block' : 'hidden'} duration-700 ease-in-out w-full h-full`}
              data-carousel-item={index === 0 ? 'active' : ''}
            >
              <img
                src={imgSrc}
                alt={`Slide ${index + 1}`}
                className='w-full h-full object-cover block'
              />
            </div>
          ))}
        </div>

        {/* Prev button */}
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

        {/* Next button */}
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
