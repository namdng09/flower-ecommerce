import camelliasImg from '../../../../assets/banner.webp';
import bergamotImg from '../../../../assets/banner2.webp';
import bottlebrushImg from '../../../../assets/banner3.jpg';

const categories = [
  {
    title: 'CAMELLIAS',
    image: camelliasImg,
    link: '/shop/camellias'
  },
  {
    title: 'BERGAMOT',
    image: bergamotImg,
    link: '/shop/bergamot'
  },
  {
    title: 'BOTTLEBRUSH',
    image: bottlebrushImg,
    link: '/shop/bottlebrush'
  }
];

function CategoryGridC() {
  return (
    <div className='py-12 px-4 max-w-screen-xl mx-auto'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categories.map((item, index) => (
          <a
            href={item.link}
            key={index}
            className='relative group overflow-hidden rounded-lg shadow-lg'
          >
            <img
              src={item.image}
              alt={item.title}
              className='w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-opacity-40 group-hover:bg-opacity-50 transition duration-300 flex flex-col items-center justify-center text-center text-white'>
              <h3 className='text-2xl font-bold mb-2'>{item.title}</h3>
              <span className='text-sm font-semibold underline'>SHOP NOW</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default CategoryGridC;
