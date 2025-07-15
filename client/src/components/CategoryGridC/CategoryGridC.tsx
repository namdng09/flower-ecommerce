import camelliasImg from '../../../src/assets/banner63.jpg';
import bergamotImg from '../../../src/assets/banner64.jpg';
import bottlebrushImg from '../../../src/assets/hoa68.jpg';

const categories = [
  {
    title: 'Hoa Hồng Đỏ',
    image: camelliasImg,
    link: '/shop/camellias'
  },
  {
    title: 'Hoa Camellias',
    image: bergamotImg,
    link: '/shop/bergamot'
  },
  {
    title: 'Hoa Cát Tường Vàng',
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
              <span className='text-sm font-semibold underline'>MUA NGAY!</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default CategoryGridC;
