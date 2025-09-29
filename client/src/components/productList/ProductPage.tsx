import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { getProductById } from '~/store/slices/productDetailSlice';
import { fetchVariants } from '~/store/slices/variantSlice';
import { addToCart } from '~/store/slices/cartSlice';
import { useAppSelector } from '~/hooks/useAppSelector';
import { AuthContext } from '~/contexts/authContext';
import {
  fetchFavouritesByUser,
  addFavouriteItem,
  removeFavouriteItem
} from '~/store/slices/favouriteSlice';
// Thêm import cho fetchProductsByShop
import { fetchProductsByShop } from '~/store/slices/productSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<any>();
  const { user } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);

  const { product, loading, error } = useAppSelector(
    state => state.productDetail
  );
  const { items: favourites } = useAppSelector(state => state.favourites);
  // Thêm selector cho shopProducts
  const { shopProducts, loading: shopProductsLoading } = useAppSelector(
    state => state.products
  );

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [isFavourited, setIsFavourited] = useState(false);

  useEffect(() => {
    if (id) dispatch(getProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
        setMainImage(product.variants[0].image);
      } else {
        setMainImage(product.thumbnailImage);
        setSelectedVariant(null);
      }
    }
  }, [product]);

  // Thêm useEffect để fetch sản phẩm khác của shop
  useEffect(() => {
    if (product?.shop?._id) {
      dispatch(fetchProductsByShop(product.shop._id));
    }
  }, [dispatch, product]);

  useEffect(() => {
    dispatch(fetchVariants());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFavouritesByUser(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (product && Array.isArray(favourites)) {
      const isFav = favourites.some(
        f => f.productId === product._id || f.productId?._id === product._id
      );
      setIsFavourited(isFav);
    }
  }, [favourites, product]);

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.warn('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm!');
      return;
    }

    if (quantity < 1) {
      toast.warn('Số lượng phải lớn hơn 0!');
      return;
    }

    try {
      await dispatch(
        addToCart({
          userId: user.id,
          variantId: selectedVariant._id,
          quantity
        })
      );

      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi thêm vào giỏ hàng!');
    }
  };

  const handleToggleFavourite = async () => {
    if (!user?.id || !product) {
      toast.warn('Bạn cần đăng nhập để sử dụng mục yêu thích!');
      return;
    }

    try {
      if (isFavourited) {
        await dispatch(
          removeFavouriteItem({ userId: user.id, productId: product._id })
        );
        setIsFavourited(false);
        toast.success('Đã xoá khỏi mục yêu thích!');
      } else {
        await dispatch(
          addFavouriteItem({ userId: user.id, productId: product._id })
        );
        setIsFavourited(true);
        toast.success('Đã thêm vào mục yêu thích!');
      }
    } catch (err) {
      console.error('Lỗi khi xử lý yêu thích:', err);
      toast.error('Đã xảy ra lỗi khi xử lý mục yêu thích!');
    }
  };

  // Lọc sản phẩm khác của shop (loại bỏ sản phẩm hiện tại)
  const otherShopProducts = shopProducts.filter(p => p._id !== product?._id);

  if (loading)
    return <p className='pt-[200px] text-center'>Đang tải sản phẩm...</p>;
  if (error)
    return <p className='pt-[200px] text-center text-red-600'>Lỗi: {error}</p>;
  if (!product) return null;

  return (
    <div className='container mx-auto px-4 pt-[200px] text-black mb-5'>
      <div className='flex flex-col lg:flex-row gap-10'>
        <div className='lg:w-1/3'>
          <img
            src={mainImage}
            alt={product.title}
            className='w-[650px] h-[650px] object-cover rounded-lg shadow mb-4'
          />
          <div className='flex gap-4'>
            <img
              src={product.thumbnailImage}
              onClick={() => {
                setMainImage(product.thumbnailImage);
                setSelectedVariant(null);
              }}
              className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${
                mainImage === product.thumbnailImage && !selectedVariant
                  ? 'border-pink-600 border-2'
                  : 'border-gray-300'
              }`}
            />
            {product.variants.map(variant => (
              <img
                key={variant._id}
                src={variant.image}
                onClick={() => {
                  setMainImage(variant.image);
                  setSelectedVariant(variant);
                }}
                className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${
                  selectedVariant?._id === variant._id
                    ? 'border-pink-600 border-2'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className='lg:w-1/2 space-y-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>{product.title}</h1>
            <button
              onClick={handleToggleFavourite}
              className='text-2xl'
              title={isFavourited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              {isFavourited ? (
                <FaHeart className='text-pink-600' />
              ) : (
                <FaRegHeart className='text-gray-400 hover:text-pink-600' />
              )}
            </button>
          </div>

          {product.variants.map(v => (
            <div
              key={v._id}
              className={`border p-4 rounded mb-3 shadow-sm cursor-pointer ${selectedVariant?._id === v._id ? 'border-pink-600 border-2' : ''}`}
              onClick={() => {
                setSelectedVariant(v);
                setMainImage(v.image);
              }}
            >
              <p className='text-md font-medium'>{v.title}</p>
              <p className='text-sm text-gray-500'>(Kho: {v.inventory})</p>
            </div>
          ))}

          {selectedVariant && (
            <div className='mt-4'>
              <span>Thành tiền: </span>
              {selectedVariant.listPrice > selectedVariant.salePrice && (
                <span className='line-through text-gray-400 text-sm mr-2'>
                  {selectedVariant.listPrice.toLocaleString()}đ
                </span>
              )}
              <span className='text-pink-600 text-2xl font-bold'>
                {selectedVariant.salePrice.toLocaleString()}đ
              </span>
            </div>
          )}

          <div className='flex gap-4 mt-4 items-center'>
            <span>Số lượng: </span>
            <input
              type='number'
              min='1'
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className='w-16 border rounded px-2 py-1 text-black'
            />
            <button
              onClick={handleAddToCart}
              className='bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700'
            >
              Thêm vào giỏ
            </button>
            <button className='bg-yellow-400 px-6 py-2 rounded hover:bg-yellow-500 text-black font-semibold'>
              Mua ngay
            </button>
          </div>

          <div className='pt-6 text-sm space-y-1'>
            <p>
              <strong>Danh mục:</strong>{' '}
              {product.categories.map(c => c.title).join(', ')}
            </p>
            {/* <p>
              <strong>Người bán:</strong> {product.shop.fullName} (
              {product.shop.username})
            </p> */}
            {/* <p>
              <strong>Liên hệ:</strong> {product.shop.phoneNumber} -{' '}
              {product.shop.email}
            </p> */}
          </div>

          <div className='flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-gray-50 mt-4'>
            <div className='w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xl font-bold'>
              {product.shop.fullName?.charAt(0).toUpperCase()}
            </div>

            <div className='flex-1'>
              <p className='text-sm text-gray-600'>Người bán:</p>
              <Link
                to={`/home/shop-profile/${product.shop._id}`}
                className='text-md font-medium text-pink-600 hover:underline'
              >
                {product.shop.fullName} ({product.shop.username})
              </Link>
            </div>

            <Link
              to={`/home/shop-profile/${product.shop._id}`}
              className='text-sm px-4 py-1 bg-pink-100 text-pink-700 font-medium rounded hover:bg-pink-200 transition'
            >
              Xem shop
            </Link>
          </div>

          <div className='mt-6 p-4 border rounded-lg shadow-sm bg-gray-50'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3'>
              Mô tả sản phẩm
            </h3>
            <div className='text-sm text-gray-700 leading-relaxed'>
              {product.description
                .replace(/"/g, '')
                .split('\n')
                .map((line, index) => (
                  <p key={index} className='mb-2 last:mb-0'>
                    {line.trim()}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phần hiển thị sản phẩm khác của shop với thanh kéo ngang */}
      {otherShopProducts.length > 0 && (
        <div className='mt-12'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-800'>
              Sản phẩm khác của {product.shop.fullName}
            </h2>
            <Link
              to={`/home/shop-profile/${product.shop._id}`}
              className='text-pink-600 hover:text-pink-800 font-medium text-sm'
            >
              Xem tất cả →
            </Link>
          </div>

          {shopProductsLoading ? (
            <p className='text-center text-gray-500'>
              Đang tải sản phẩm khác...
            </p>
          ) : (
            <div className='relative'>
              {/* Scrollable container */}
              <div
                className='flex gap-4 overflow-x-auto scrollbar-hide pb-4'
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {otherShopProducts.map(shopProduct => (
                  <Link
                    key={shopProduct._id}
                    to={`/home/products/${shopProduct._id}`} // Sửa từ 'products' thành 'product' cho khớp với routing
                    className='group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex-none w-64'
                  >
                    <div className='aspect-square overflow-hidden'>
                      <img
                        src={shopProduct.thumbnailImage}
                        alt={shopProduct.title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                    <div className='p-4'>
                      <h3 className='font-medium text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors'>
                        {shopProduct.title}
                      </h3>

                      {shopProduct.variants &&
                        shopProduct.variants.length > 0 &&
                        shopProduct.variants[0] &&
                        typeof shopProduct.variants[0].salePrice ===
                          'number' && (
                          <div className='space-y-1'>
                            {shopProduct.variants[0].listPrice &&
                              shopProduct.variants[0].listPrice >
                                shopProduct.variants[0].salePrice && (
                                <span className='text-xs text-gray-400 line-through'>
                                  {shopProduct.variants[0].listPrice.toLocaleString()}
                                  đ
                                </span>
                              )}
                            <p className='text-pink-600 font-bold text-sm'>
                              {shopProduct.variants[0].salePrice.toLocaleString()}
                              đ
                            </p>
                          </div>
                        )}

                      <p className='text-xs text-gray-500 mt-2'>
                        {shopProduct.categories?.map(c => c.title).join(', ') ||
                          'Chưa phân loại'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Gradient fade effect */}
              <div className='absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white to-transparent pointer-events-none'></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
