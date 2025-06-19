import { useAppSelector } from '~/hooks/useAppSelector';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchProducts } from '~/store/slices/productSlice';
import banner from '../../../../assets/banner1.webp';

const ProductList = () => {
  const [sortBy, setSortBy] = useState('A-Z');
  const dispatch = useDispatch();

  const { items: products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'A-Z') return a.title.localeCompare(b.title);
    if (sortBy === 'Z-A') return b.title.localeCompare(a.title);
    if (sortBy === 'PriceLowHigh') return a.variants[0].salePrice - b.variants[0].salePrice;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 pt-[200px]">
      <div className="flex flex-col lg:flex-row gap-8">

        <div className="lg:w-1/5 lg:order-1 space-y-6 text-black">
          <div>
            <h3 className="font-semibold mb-2">Availability</h3>
            <label className="block">
              <input type="checkbox" className="mr-2" /> In stock (41)
            </label>
            <label className="block">
              <input type="checkbox" className="mr-2" /> Out of stock (5)
            </label>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Price</h3>
            <div className="flex items-center gap-2 mb-2">
              <input type="number" placeholder="0" className="border p-1 w-20" />
              <span>to</span>
              <input type="number" placeholder="150" className="border p-1 w-20" />
            </div>
            <button className="bg-black text-white px-4 py-1">Filter</button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Product type</h3>
            <p className="text-sm text-gray-500">0 selected</p>
          </div>
        </div>

        <div className="flex-1 lg:order-2">
          <div className="mb-6">
            <img src={banner} alt="New Collection" className="w-full rounded" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 text-black gap-4">
            <p>Showing 1–{sortedProducts.length} of {sortedProducts.length} item(s)</p>
            <div>
              <label className="mr-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="A-Z">Alphabetically, A-Z</option>
                <option value="Z-A">Alphabetically, Z-A</option>
                <option value="PriceLowHigh">Price, low to high</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : error ? (
            <p className="text-red-600">Lỗi: {error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedProducts.map((product) => (
                <div
                  key={product._id}
                  className="border rounded p-4 text-center relative group overflow-hidden bg-white"
                >
                  <img
                    src={product.thumbnailImage}
                    alt={product.title}
                    className="w-full h-72 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <h4 className="font-medium mb-1 text-black mt-5">{product.title}</h4>
                  {product.variants[0]?.listPrice > product.variants[0]?.salePrice && (
                    <p className="line-through text-gray-400 text-sm mb-1">
                      {product.variants[0].listPrice.toLocaleString()}đ
                    </p>
                  )}
                  <p className="text-pink-600 font-semibold">
                    {product.variants[0].salePrice.toLocaleString()}đ
                  </p>

                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold">
                      Mua ngay
                    </button>
                    <button className="border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent">
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
