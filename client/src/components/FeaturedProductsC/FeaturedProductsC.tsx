import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { useEffect, useContext } from 'react';
import { fetchProducts } from '~/store/slices/productSlice';
import { addToCart } from '~/store/slices/cartSlice';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AuthContext } from '~/contexts/authContext';

function FeaturedProductsC() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  console.log('User from context:', user);

  const {
    items: products,
    loading,
    error
  } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated || !user?.id) {
      toast.warn('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    const variant = product.variants?.[0];
    if (!variant) {
      toast.error('Sản phẩm chưa có biến thể!');
      return;
    }

    try {
      await dispatch(
        addToCart({
          userId: user.id,
          variantId: variant.id,
          quantity: 1
        })
      ).unwrap();

      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      toast.error('Lỗi khi thêm vào giỏ hàng!');
      console.error(err);
    }
  };

  const handleBuyNow = (product: any) => {
    handleAddToCart(product);
    navigate('/home/checkout');
  };

  return (
    <div className='max-w-screen-xl mx-auto py-12 px-4 pt-5'>
      <h2 className='text-2xl font-semibold text-black mb-6'>Hoa Nổi Bật</h2>

      {loading ? (
        <p>Đang tải sản phẩm nổi bật...</p>
      ) : error ? (
        <p className='text-red-600'>Lỗi: {error}</p>
      ) : (
        <>
          {/* Dòng 1: 20 sản phẩm đầu */}
          <div className='flex gap-6 overflow-x-auto pb-4 mb-8'>
            {products.slice(0, 13).map(product => (
              <div
                key={product._id}
                className='min-w-[250px] max-w-[250px] bg-[#f9f9f9] p-4 rounded-lg flex-shrink-0 flex flex-col items-center'
              >
                {/* ...phần hiển thị sản phẩm... */}
                <div className='relative w-full h-[320px] group'>
                  <img
                    src={product.thumbnailImage}
                    alt={product.title}
                    className='w-full h-full object-cover rounded'
                  />
                  <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded'>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className='bg-pink-500 text-white px-4 py-2 rounded-full font-semibold'
                    >
                      Mua ngay
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className='border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent'
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
                <Link to={`/home/products/${product._id}`}>
                  <h3 className='text-black font-medium text-sm text-center mt-3 hover:text-pink-600 transition'>
                    {product.title}
                  </h3>
                </Link>
                {product.variants?.[0] ? (
                  <div className='flex space-x-2 text-sm mb-2 mt-1'>
                    <span className='text-black font-semibold'>
                      {product.variants[0].salePrice.toLocaleString()}đ
                    </span>
                    {product.variants[0].listPrice >
                      product.variants[0].salePrice && (
                      <span className='line-through text-red-500'>
                        {product.variants[0].listPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 italic text-sm'>Chưa có giá</p>
                )}
              </div>
            ))}
          </div>
          {/* Dòng 2: 2 sản phẩm tiếp theo */}

          <div className='flex items-center gap-4 mb-8'>
            <span className='inline-block bg-pink-500 text-white px-5 py-2 rounded-full text-lg font-extrabold shadow-lg border-2 border-white animate-bounce z-10'>
              🎉 20/10
            </span>
            <h2 className='text-4xl font-extrabold text-pink-600 drop-shadow-lg tracking-wide'>
              Hoa Chào Mừng 20/10
            </h2>
          </div>
          <div className='flex gap-8 overflow-x-auto pb-6'>
            {products.slice(13, 26).map(product => (
              <div
                key={product._id}
                className='min-w-[260px] max-w-[260px] bg-gradient-to-br from-pink-50 via-white to-pink-100 p-5 rounded-xl flex-shrink-0 flex flex-col items-center shadow-lg border border-pink-200 relative hover:scale-105 transition-transform duration-300'
              >
                {/* Badge 20/10 */}
                <span className='absolute top-3 left-3 bg-pink-500 text-white px-3 py-1 rounded-full text-base font-bold shadow-lg border-2 border-white z-10'>
                  20/10
                </span>
                {/* ...phần hiển thị sản phẩm... */}
                <div className='relative w-full h-[320px] group'>
                  <img
                    src={product.thumbnailImage}
                    alt={product.title}
                    className='w-full h-full object-cover rounded-xl border-2 border-pink-200 shadow'
                  />
                  <div className='absolute inset-0 bg-pink-600/30 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className='bg-pink-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition'
                    >
                      Mua ngay
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className='border border-white text-white px-5 py-2 rounded-full font-semibold bg-transparent hover:bg-white hover:text-pink-600 transition'
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
                <Link to={`/home/products/${product._id}`}>
                  <h3 className='text-pink-700 font-bold text-base text-center mt-4 hover:text-pink-500 transition'>
                    {product.title}
                  </h3>
                </Link>
                {product.variants?.[0] ? (
                  <div className='flex space-x-2 text-base mb-2 mt-2 items-center'>
                    <span className='text-pink-600 font-bold'>
                      {product.variants[0].salePrice.toLocaleString()}đ
                    </span>
                    {product.variants[0].listPrice >
                      product.variants[0].salePrice && (
                      <span className='line-through text-red-400'>
                        {product.variants[0].listPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-400 italic text-sm'>Chưa có giá</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FeaturedProductsC;
