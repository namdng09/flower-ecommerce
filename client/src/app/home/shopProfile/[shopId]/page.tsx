// ...existing code...
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchProductsByShop } from '~/store/slices/productSlice';
import { fetchUserById } from '~/store/slices/userSlice'; // added
import { Link } from 'react-router';
import {
  FaEnvelope,
  FaPhoneAlt,
  FaUserCircle,
  FaStore,
  FaShoppingBag
} from 'react-icons/fa';

const ShopProfilePage = () => {
  const { shopId } = useParams();
  const dispatch = useDispatch<any>();

  const { shopProducts, shopInfo, loading, error } = useAppSelector(
    state => state.products
  );

  const { currentUser: shopUser, loading: userLoading } = useAppSelector(
    state => state.users
  ); // get fetched user details

  useEffect(() => {
    if (shopId) {
      dispatch(fetchProductsByShop(shopId));
      dispatch(fetchUserById(shopId)); // fetch full shop (user) info
    }
  }, [dispatch, shopId]);

  if (loading || userLoading)
    return (
      <div className='pt-[200px] text-center'>Đang tải dữ liệu shop...</div>
    );

  if (error)
    return (
      <div className='pt-[200px] text-center text-red-600'>❌ {error}</div>
    );

  // prefer detailed user info when available
  const shop = shopUser || shopInfo || null;

  return (
    <div className='max-w-7xl mx-auto px-4 py-12 text-black mt-40'>
      {shop && (
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-10'>
          {/* cover */}
          <div
            className='w-full h-40 bg-cover bg-center'
            style={{
              backgroundImage: `url(${shop.coverUrl || shop.avatarUrl || ''})`
            }}
            aria-hidden
          />
          <div className='p-6 flex flex-col sm:flex-row items-center gap-6'>
            <div className='w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner'>
              {shop.avatarUrl ? (
                <img
                  src={shop.avatarUrl}
                  alt={shop.fullName || shop.username}
                  className='w-full h-full object-cover'
                />
              ) : (
                <FaUserCircle className='text-4xl text-gray-400' />
              )}
            </div>

            <div className='flex-1 space-y-1 text-left'>
              <h2 className='text-xl font-bold text-pink-700 flex items-center gap-2'>
                <FaStore className='text-pink-600' />
                {shop.fullName || shop.username}{' '}
                <span className='text-sm text-gray-500'>({shop.username})</span>
              </h2>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className='text-lg font-semibold mb-4 text-pink-600 flex items-center gap-2'>
          <FaShoppingBag className='text-pink-600' />
          Sản phẩm đang bán ({shopProducts.length})
        </h3>

        {shopProducts.length === 0 ? (
          <p className='text-gray-500 italic'>
            Shop hiện chưa có sản phẩm nào.
          </p>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
            {shopProducts.map(product => (
              <Link
                to={`/home/products/${product._id}`}
                key={product._id}
                className='bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group'
              >
                <img
                  src={product.thumbnailImage}
                  alt={product.title}
                  className='w-full h-48 object-cover group-hover:scale-105 transition'
                />
                <div className='p-3 flex-1 flex flex-col justify-between'>
                  <h4 className='text-sm font-semibold text-gray-900 line-clamp-2 mb-1'>
                    {product.title}
                  </h4>
                  <p className='text-xs text-gray-500 line-clamp-2 mb-2'>
                    {product.description?.replace(/"/g, '')}
                  </p>
                  <span className='text-[13px] text-pink-600 font-medium'>
                    ➤ Xem chi tiết
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfilePage;
// ...existing code...
