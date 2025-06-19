import { useEffect } from 'react';
import { useParams } from 'react-router';
import { getProductById } from '~/store/slices/productDetailSlice';
import { useAppSelector } from '~/hooks/useAppSelector';
import { useDispatch } from 'react-redux';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading, error } = useAppSelector((state) => state?.productDetail);

  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
    }
  }, [dispatch, id]);

  if (loading) return <p className="pt-[200px] text-center">Đang tải sản phẩm...</p>;
  if (error) return <p className="pt-[200px] text-center text-red-600">Lỗi: {error}</p>;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 pt-[200px] text-black">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/2">
          <img
            src={product.thumbnailImage}
            alt={product.title}
            className="w-full h-[420px] object-cover rounded-lg shadow mb-4"
          />
          <div className="flex gap-4">
            {product.variants.map((v) => (
              <img
                key={v._id}
                src={v.image}
                alt={v.title}
                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
              />
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">{product.title}</h1>

          <p className="text-sm text-gray-600">{product.description.replace(/"/g, '')}</p>

          <div>
            {product.variants.map((v) => (
              <div key={v._id} className="border p-4 rounded mb-3 shadow-sm">
                <p className="text-md font-medium">{v.title}</p>
                <div className="flex gap-4 items-center">
                  {v.listPrice > v.salePrice && (
                    <p className="line-through text-gray-400 text-sm">
                      {v.listPrice.toLocaleString()}đ
                    </p>
                  )}
                  <p className="text-pink-600 text-lg font-semibold">
                    {v.salePrice.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-500">(Kho: {v.inventory})</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <input
              type="number"
              min="1"
              defaultValue="1"
              className="w-16 border rounded px-2 py-1"
            />
            <button className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">
              Thêm vào giỏ
            </button>
            <button className="bg-yellow-400 px-6 py-2 rounded hover:bg-yellow-500 text-black font-semibold">
              Mua ngay
            </button>
          </div>

          <div className="pt-6 text-sm space-y-1">
            <p>
              <strong>Danh mục:</strong>{' '}
              {product.categories.map((cat) => cat.title).join(', ')}
            </p>
            <p>
              <strong>Người bán:</strong> {product.shop.fullName} (
              {product.shop.username})
            </p>
            <p>
              <strong>Liên hệ:</strong> {product.shop.phoneNumber} -{' '}
              {product.shop.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;