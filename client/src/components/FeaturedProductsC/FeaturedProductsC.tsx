// ...existing code...
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

  const calcDiscount = (v: any) => {
    if (!v || !v.listPrice || !v.salePrice) return 0;
    const diff = v.listPrice - v.salePrice;
    return diff > 0 ? Math.round((diff / v.listPrice) * 100) : 0;
  };

  return (
    <div className='relative max-w-screen-xl mx-auto py-12 px-6 pt-6'>
      {/* Winter subtle background */}
      <div className='absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-sky-50 to-blue-50 -z-10' />
      <div className='absolute right-6 top-6 opacity-20 -z-10'>
        <svg
          width='140'
          height='140'
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden
        >
          <path
            d='M12 2v20M5 7l14 10M5 17L19 7'
            stroke='#93C5FD'
            strokeWidth='0.9'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      <header className='mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
        <div>
          <h2 className='text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight'>
            Hoa Nổi Bật
          </h2>
          <p className='mt-1 text-sm text-slate-600'>
            Bộ sưu tập chọn lọc cho mùa đông — hoa tặng vào các ngày dịp lễ mùa
            đông
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <span className='inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-full text-base font-semibold shadow-lg border border-white'>
            ❄️ Mùa Đông
          </span>
        </div>
      </header>

      {loading ? (
        <p>Đang tải sản phẩm nổi bật...</p>
      ) : error ? (
        <p className='text-red-600'>Lỗi: {error}</p>
      ) : (
        <>
          {/* Row 1: Featured list */}
          <div className='flex gap-6 overflow-x-auto pb-6 mb-10'>
            {products.slice(0, 13).map(product => {
              const variant = product.variants?.[0];
              const discount = calcDiscount(variant);
              return (
                <div
                  key={product._id}
                  className='min-w-[250px] max-w-[250px] bg-white p-4 rounded-2xl flex-shrink-0 flex flex-col items-center shadow-md hover:shadow-xl transition-shadow duration-300'
                >
                  <div className='relative w-full h-[320px] group'>
                    {/* {discount > 0 && (
                      <div className="absolute top-3 right-3 z-20 transform -rotate-6">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                          -{discount}%
                        </span>
                      </div>
                    )} */}
                    <img
                      src={product.thumbnailImage}
                      alt={product.title}
                      className='w-full h-full object-cover rounded-2xl border-2 border-transparent group-hover:border-sky-200 transition-all duration-300 shadow-sm'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-sky-900/40 via-transparent to-transparent flex flex-col items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl p-4'>
                      <div className='w-full flex justify-between items-center'>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className='bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full font-semibold shadow'
                        >
                          Mua ngay
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className='bg-white text-sky-600 px-3 py-2 rounded-full font-semibold shadow-sm hover:bg-sky-50 transition'
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>

                  <Link to={`/home/products/${product._id}`} className='w-full'>
                    <h3 className='text-slate-900 font-medium text-sm text-center mt-3 hover:text-sky-600 transition'>
                      {product.title}
                    </h3>
                  </Link>

                  {variant ? (
                    <div className='flex items-center justify-center gap-3 mt-2'>
                      <span className='text-sky-700 font-bold'>
                        {variant.salePrice.toLocaleString()}đ
                      </span>
                      {variant.listPrice > variant.salePrice && (
                        <span className='line-through text-red-400 text-xs'>
                          {variant.listPrice.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className='text-gray-500 italic text-sm'>Chưa có giá</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row 2: Winter highlight section */}
          <section className='mb-8'>
            <div className='flex items-center gap-6 mb-6'>
              <span className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-5 py-2 rounded-full text-lg font-extrabold shadow-lg border border-white animate-pulse'>
                ❄️ Mùa Đông
              </span>
              <div>
                <h3 className='text-3xl md:text-4xl font-extrabold text-blue-800 drop-shadow-md'>
                  Hoa đẹp ngày đông sang
                </h3>
                <p className='text-sm text-slate-600 mt-1'>
                  Gợi ý bó hoa ấm áp, tông xanh - trắng cho mùa lễ
                </p>
              </div>
            </div>

            <div className='flex gap-8 overflow-x-auto pb-6'>
              {products.slice(13, 26).map(product => {
                const variant = product.variants?.[0];
                const discount = calcDiscount(variant);
                return (
                  <div
                    key={product._id}
                    className='min-w-[260px] max-w-[260px] bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 rounded-2xl flex-shrink-0 flex flex-col items-center shadow-lg border border-sky-100 relative hover:scale-105 transition-transform duration-300'
                  >
                    {/* Winter badge */}
                    <span className='absolute top-3 left-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow border border-white z-10'>
                      ❄️ Mùa Đông
                    </span>

                    <div className='relative w-full h-[320px] group'>
                      <img
                        src={product.thumbnailImage}
                        alt={product.title}
                        className='w-full h-full object-cover rounded-xl border-2 border-transparent group-hover:border-sky-200 shadow'
                      />
                      <div className='absolute inset-0 bg-blue-800/25 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl p-4'>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className='bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-800 transition'
                        >
                          Mua ngay
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className='border border-white text-white px-5 py-2 rounded-full font-semibold bg-transparent hover:bg-white hover:text-blue-600 transition'
                        >
                          Thêm vào giỏ hàng
                        </button>
                      </div>
                    </div>

                    <Link
                      to={`/home/products/${product._id}`}
                      className='w-full'
                    >
                      <h3 className='text-blue-800 font-bold text-base text-center mt-4 hover:text-sky-600 transition'>
                        {product.title}
                      </h3>
                    </Link>

                    {variant ? (
                      <div className='flex space-x-3 text-base mb-2 mt-2 items-center'>
                        <span className='text-blue-700 font-bold'>
                          {variant.salePrice.toLocaleString()}đ
                        </span>
                        {variant.listPrice > variant.salePrice && (
                          <span className='line-through text-red-400 text-sm'>
                            {variant.listPrice.toLocaleString()}đ
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className='text-gray-400 italic text-sm'>
                        Chưa có giá
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default FeaturedProductsC;
// ...existing code...
