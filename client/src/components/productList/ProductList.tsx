import { useEffect, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchProducts, filterProducts } from '~/store/slices/productSlice';
import { addToCart } from '~/store/slices/cartSlice';
import ListCategory from '~/components/listcategory/ListCategory';
import { AuthContext } from '~/contexts/authContext';
import banner from '~/assets/banner1.webp';
import { Link } from 'react-router';
import AddressFilter from '~/components/filter-address/AddressFilter';

const ProductList = () => {
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;

  const {
    items: products,
    loading,
    error
  } = useAppSelector(state => state.products);

  const [sortBy, setSortBy] = useState('A-Z');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');

  useEffect(() => {
    dispatch(
      filterProducts({
        province,
        ward,
        category: selectedCategoryId || undefined,
        sortBy: sortBy === 'PriceLowHigh' ? 'salePrice' : 'title',
        sortOrder: sortBy === 'Z-A' ? 'desc' : 'asc'
      })
    );
  }, [dispatch, province, ward, selectedCategoryId, sortBy]);

  const handleAddressFilter = (province: string, ward: string) => {
    setProvince(province);
    setWard(ward);
  };

  useEffect(() => {
    console.log('Products:', products);
  }, [products]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  console.log(products);

  const filteredProducts = selectedCategoryId
    ? products.filter(
        p =>
          Array.isArray(p.categories) &&
          p.categories.some(cat => cat._id === selectedCategoryId)
      )
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aVar = a.variants?.[0];
    const bVar = b.variants?.[0];
    if (sortBy === 'A-Z') return a.title.localeCompare(b.title);
    if (sortBy === 'Z-A') return b.title.localeCompare(a.title);
    if (sortBy === 'PriceLowHigh')
      return (aVar?.salePrice ?? 0) - (bVar?.salePrice ?? 0);
    return 0;
  });

  const handleAddToCart = (variantId: string) => {
    if (!userId) return alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
    dispatch(addToCart({ userId, variantId, quantity: 1 }));
  };

  return (
    <div className='container mx-auto px-4 pt-[200px] mb-5'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar */}
        <div className='lg:w-1/5 space-y-6 text-black'>
          <div>
            <h3 className='font-semibold mb-2'>Loại sản phẩm</h3>
            <ListCategory
              onFilter={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
            />
          </div>
          <AddressFilter onFilter={handleAddressFilter} />
        </div>

        {/* Content */}
        <div className='flex-1'>
          <div className='mb-6'>
            <img src={banner} alt='Banner' className='w-full rounded' />
          </div>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 text-black gap-4'>
            <p>
              Hiển thị {sortedProducts.length} sản phẩm
              {selectedCategoryId && ` theo danh mục đã chọn`}
            </p>
            <div>
              <label className='mr-2'>Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500'
              >
                <option value='A-Z'>A-Z</option>
                <option value='Z-A'>Z-A</option>
                <option value='PriceLowHigh'>Giá: Thấp đến Cao</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : error ? (
            <p className='text-red-600'>Lỗi: {error}</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {sortedProducts.map(product => {
                const variant = product.variants?.[0];
                return (
                  <div
                    key={product._id}
                    className='border border-gray-100 rounded p-4 text-center bg-white'
                  >
                    <div className='relative group overflow-hidden rounded'>
                      <img
                        src={product.thumbnailImage}
                        alt={product.title}
                        className='w-[450px] h-[450px] object-cover rounded transition-transform duration-300 group-hover:scale-105'
                      />
                      <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <button className='bg-pink-500 text-white px-4 py-2 rounded-full font-semibold'>
                          Mua ngay
                        </button>
                        <button
                          onClick={() => handleAddToCart(variant?._id)}
                          className='border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent'
                        >
                          Thêm vào giỏ hàng
                        </button>
                      </div>
                    </div>

                    <Link to={`/home/products/${product._id}`}>
                      <h4 className='font-medium mt-5 mb-1 text-black hover:text-pink-600 transition'>
                        {product.title}
                      </h4>
                    </Link>

                    {variant ? (
                      <>
                        {variant.listPrice > variant.salePrice && (
                          <p className='line-through text-gray-400 text-sm mb-1'>
                            {variant.listPrice.toLocaleString()}đ
                          </p>
                        )}
                        <p className='text-pink-600 font-semibold'>
                          {variant.salePrice.toLocaleString()}đ
                        </p>
                      </>
                    ) : (
                      <p className='text-gray-500 italic'>Chưa có giá</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
