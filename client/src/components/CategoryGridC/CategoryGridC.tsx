import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchCategories } from '~/store/slices/categorySlice';
import camelliasImg from '../../../src/assets/banner63.jpg';
import bergamotImg from '../../../src/assets/banner64.jpg';
import bottlebrushImg from '../../../src/assets/hoa68.jpg';

// Mapping tên category với hình ảnh
const categoryImageMap = {
  'Hoa Cảm Ơn': camelliasImg,
  'Hoa Cảm ơn': camelliasImg,
  'Hoa Tình Yêu': bergamotImg,
  'Hoa Tình yêu': bergamotImg,
  'Hoa Tốt Nghiệp': bottlebrushImg,
  'Hoa Tốt nghiệp': bottlebrushImg
};

function CategoryGridC() {
  const dispatch = useDispatch();
  const { items: categories, loading } = useAppSelector(
    state => state.categories
  );

  // Fetch categories khi component mount
  useEffect(() => {
    if (categories.length === 0 && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, loading]);

  // Tạo featured categories từ API data
  const featuredCategories = useMemo(() => {
    if (!categories.length) return [];

    const featured = [];

    categories.forEach(parentCategory => {
      if (parentCategory.subCategory?.length > 0) {
        parentCategory.subCategory.forEach((subCat: any) => {
          // Tìm image phù hợp
          const imageKey = Object.keys(categoryImageMap).find(key =>
            key
              .toLowerCase()
              .includes(subCat.title.toLowerCase().replace(/\s+/g, ' '))
          );

          if (imageKey) {
            featured.push({
              title: subCat.title,
              categoryId: subCat._id,
              image: categoryImageMap[imageKey as keyof typeof categoryImageMap]
            });
          }
        });
      }
    });

    // Nếu không tìm thấy từ API, fallback về static data với categoryId giả
    if (featured.length === 0) {
      return [
        { title: 'Hoa Cảm Ơn', image: camelliasImg, categoryId: 'fallback-1' },
        { title: 'Hoa Tình Yêu', image: bergamotImg, categoryId: 'fallback-2' },
        {
          title: 'Hoa Tốt Nghiệp',
          image: bottlebrushImg,
          categoryId: 'fallback-3'
        }
      ];
    }

    return featured.slice(0, 3); // Chỉ lấy 3 category đầu tiên
  }, [categories]);

  if (loading) {
    return (
      <div className='py-12 px-4 max-w-screen-xl mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='bg-gray-200 animate-pulse rounded-lg h-64'
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='py-12 px-4 max-w-screen-xl mx-auto'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredCategories.map((item, index) => (
          <Link
            to={`/home/shop?category=${item.categoryId}`}
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
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryGridC;
