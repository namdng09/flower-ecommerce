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
      console.log('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    const variant = product.variants?.[0];
    if (!variant) {
      console.log('Sản phẩm chưa có biến thể!');
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

      console.log('Đã thêm vào giỏ hàng!');
    } catch (err) {
      console.log('Lỗi khi thêm vào giỏ hàng!');
      console.error(err);
    }
  };

  const handleBuyNow = (product: any) => {
    handleAddToCart(product);
    navigate('/home/checkout');
  };

  return (
    <div className='max-w-screen-xl mx-auto py-12 px-4 pt-5'>
      <h2 className='text-2xl font-semibold text-black mb-6'>
        Featured Products
      </h2>

      {loading ? (
        <p>Đang tải sản phẩm nổi bật...</p>
      ) : error ? (
        <p className='text-red-600'>Lỗi: {error}</p>
      ) : (
        <div className='flex gap-6 overflow-x-auto pb-4'>
          {products.map(product => (
            <div
              key={product._id}
              className='min-w-[250px] max-w-[250px] bg-[#f9f9f9] p-4 rounded-lg flex-shrink-0 flex flex-col items-center'
            >
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
      )}
    </div>
  );
}

export default FeaturedProductsC;
