import { useAppSelector } from '~/hooks/useAppSelector';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchProducts } from '~/store/slices/productSlice';
import { useOutletContext, useNavigate } from 'react-router';

interface OutletContextType {
  onAddToCart: (product: any) => void;
}

function FeaturedProductsC() {
  const { onAddToCart } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: products, loading, error } = useAppSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleBuyNow = (product: any) => {
    onAddToCart(product);
    navigate('/home/checkout');
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 pt-5">
      <h2 className="text-2xl font-semibold text-black mb-6">Featured Products</h2>

      {loading ? (
        <p>Đang tải sản phẩm nổi bật...</p>
      ) : error ? (
        <p className="text-red-600">Lỗi: {error}</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {products.map(product => (
            <div
              key={product._id}
              className="min-w-[250px] max-w-[250px] bg-[#f9f9f9] p-4 rounded-lg relative group flex-shrink-0 flex flex-col items-center"
            >
              <img
                src={product.thumbnailImage}
                alt={product.title}
                className="w-80 h-80 object-bottom mb-4"
              />
              <h3 className="text-black font-medium text-sm text-center">{product.title}</h3>

              {product.variants?.[0] ? (
                <div className="flex space-x-2 text-sm mb-2">
                  <span className="text-black font-semibold">
                    {product.variants[0].salePrice.toLocaleString()}đ
                  </span>
                  {product.variants[0].listPrice > product.variants[0].salePrice && (
                    <span className="line-through text-red-500">
                      {product.variants[0].listPrice.toLocaleString()}đ
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Chưa có giá</p>
              )}

              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleBuyNow(product)}
                  className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold"
                >
                  Mua ngay
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent"
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedProductsC;
