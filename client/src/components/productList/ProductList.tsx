import { useEffect, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchProducts, filterProducts } from '~/store/slices/productSlice';
import { addToCart } from '~/store/slices/cartSlice';
import ListCategory from '~/components/listcategory/ListCategory';
import { AuthContext } from '~/contexts/authContext';
import banner from '~/assets/pb.jpg';
import { Link } from 'react-router';
import AddressFilter from '~/components/filter-address/AddressFilter';
import AddressModal from '~/components/filter-address/AddressModal';
import PriceFilter from '~/components/filter-price/PriceFilter';
import { toast } from 'react-toastify';

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
  const [showAddressModal, setShowAddressModal] = useState(true);
  const [wards, setWards] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedWardOption, setSelectedWardOption] = useState<any>(null);

  // Lấy danh sách phường/xã và kiểm tra localStorage khi vào trang
  useEffect(() => {
    fetch('/hn_geo_names.json')
      .then(res => res.json())
      .then(data =>
        setWards(data.map((item: any) => `${item.type} ${item.name}`))
      );

    // Kiểm tra sessionStorage để lấy địa chỉ đã chọn
    const savedAddress = sessionStorage.getItem('selectedAddress');
    if (savedAddress) {
      const { province, ward } = JSON.parse(savedAddress);
      setProvince(province);
      setWard(ward);
      setSelectedWardOption({ value: ward, label: ward, province, ward });
      setShowAddressModal(false);
    }
  }, []);

  // Chọn địa chỉ từ modal
  const handleAddressSelect = (province: string, ward: string) => {
    const option = { value: ward, label: ward, province, ward };
    setProvince(province);
    setWard(ward);
    setSelectedWardOption(option);
    setShowAddressModal(false);
    sessionStorage.setItem(
      'selectedAddress',
      JSON.stringify({ province, ward })
    );
  };

  // Chọn địa chỉ từ filter sidebar
  const handleAddressFilter = (province: string, ward: string) => {
    setProvince(province);
    setWard(ward);
    const selectedOption = { value: ward, label: ward, province, ward };
    setSelectedWardOption(selectedOption);
    sessionStorage.setItem(
      'selectedAddress',
      JSON.stringify({ province, ward })
    );
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      filterProducts({
        province,
        ward,
        category: selectedCategoryId || undefined,
        sortBy:
          sortBy === 'PriceLowHigh' || sortBy === 'PriceHighLow'
            ? 'salePrice'
            : 'title',
        sortOrder:
          sortBy === 'Z-A'
            ? 'desc'
            : sortBy === 'PriceHighLow'
              ? 'desc'
              : 'asc',
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max,
        limit: 100000
      })
    );
  }, [dispatch, province, ward, selectedCategoryId, sortBy, priceRange]);

  const sortedProducts = [...products].sort((a, b) => {
    const aVar = a.variants?.[0];
    const bVar = b.variants?.[0];
    if (sortBy === 'A-Z') return a.title.localeCompare(b.title);
    if (sortBy === 'Z-A') return b.title.localeCompare(a.title);
    if (sortBy === 'PriceLowHigh')
      return (aVar?.salePrice ?? 0) - (bVar?.salePrice ?? 0);
    if (sortBy === 'PriceHighLow')
      return (bVar?.salePrice ?? 0) - (aVar?.salePrice ?? 0);
    return 0;
  });

  const handleAddToCart = async (variantId: string) => {
    if (!userId) {
      toast.warn('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    if (!variantId) {
      toast.error('Sản phẩm chưa có biến thể hợp lệ!');
      return;
    }
    try {
      await dispatch(addToCart({ userId, variantId, quantity: 1 }));
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thêm vào giỏ hàng!');
    }
  };

  return (
    <div className='container mx-auto px-4 pt-[200px] mb-5'>
      {showAddressModal && (
        <AddressModal wards={wards} onSelect={handleAddressSelect} />
      )}
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar */}
        <div className='lg:w-1/5 space-y-6 text-black'>
          <AddressFilter
            onFilter={handleAddressFilter}
            selectedOption={selectedWardOption}
          />
          <div>
            <h3 className='font-semibold mb-2'>Loại sản phẩm</h3>
            <ListCategory
              onFilter={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
            />
          </div>
          <PriceFilter value={priceRange} onChange={setPriceRange} />
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
                <option value='PriceHighLow'>Giá: Cao đến Thấp</option>
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
