import { useEffect, useState, useContext, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '~/hooks/useAppSelector';
import { fetchProducts, filterProducts } from '~/store/slices/productSlice';
import { addToCart } from '~/store/slices/cartSlice';
import ListCategory from '~/components/listcategory/ListCategory';
import { AuthContext } from '~/contexts/authContext';
import banner from '~/assets/pb.jpg';
import { Link, useSearchParams } from 'react-router';
import AddressFilter from '~/components/filter-address/AddressFilter';
import AddressModal from '~/components/filter-address/AddressModal';
import PriceFilter from '~/components/filter-price/PriceFilter';
import ProductFilter from '~/components/filter-product/ProductFilter';
import { toast } from 'react-toastify';

const ProductList = () => {
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    items: products,
    loading,
    error
  } = useAppSelector(state => state.products);

  const [sortBy, setSortBy] = useState('A-Z');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(true);
  const [wards, setWards] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedWardOption, setSelectedWardOption] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = searchParams.get('page');
    return pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
  });
  const itemsPerPage = 12;

  // Đọc category từ URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategoryId(categoryFromUrl);
    }
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl, 10));
    }
  }, [searchParams]);

  // Handler cho category filter
  const handleCategoryFilter = useCallback(
    (categoryId: string | null) => {
      setSelectedCategoryId(categoryId);
      setCurrentPage(1);

      const params = new URLSearchParams(searchParams);
      if (categoryId) {
        params.set('category', categoryId);
      } else {
        params.delete('category');
      }
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Lấy danh sách phường/xã và kiểm tra sessionStorage khi vào trang
  useEffect(() => {
    fetch('/hn_geo_names.json')
      .then(res => res.json())
      .then(data =>
        setWards(data.map((item: any) => `${item.type} ${item.name}`))
      );

    const savedAddress = sessionStorage.getItem('selectedAddress');
    if (savedAddress) {
      try {
        const { province, ward } = JSON.parse(savedAddress);
        setProvince(province);
        setWard(ward);
        setSelectedWardOption({ value: ward, label: ward, province, ward });
        setShowAddressModal(false);
      } catch (error) {
        console.error('Error parsing saved address:', error);
      }
    }
  }, []);

  // Chọn địa chỉ từ modal
  const handleAddressSelect = useCallback((province: string, ward: string) => {
    const option = { value: ward, label: ward, province, ward };
    setProvince(province);
    setWard(ward);
    setSelectedWardOption(option);
    setShowAddressModal(false);
    setCurrentPage(1);
    try {
      sessionStorage.setItem(
        'selectedAddress',
        JSON.stringify({ province, ward })
      );
    } catch (error) {
      console.error('Error saving address:', error);
    }
  }, []);

  // Chọn địa chỉ từ filter sidebar
  const handleAddressFilter = useCallback((province: string, ward: string) => {
    setProvince(province);
    setWard(ward);
    setCurrentPage(1);
    const selectedOption = { value: ward, label: ward, province, ward };
    setSelectedWardOption(selectedOption);
    try {
      sessionStorage.setItem(
        'selectedAddress',
        JSON.stringify({ province, ward })
      );
    } catch (error) {
      console.error('Error saving address:', error);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      filterProducts({
        province: province || undefined,
        ward: ward || undefined,
        category: selectedCategoryId || undefined,
        title: searchTerm || undefined,
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
  }, [
    dispatch,
    province,
    ward,
    selectedCategoryId,
    searchTerm,
    sortBy,
    priceRange
  ]);

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

  // Handler cho search function
  const handleSearchFilter = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  }, []);

  const handleAddToCart = useCallback(
    async (variantId: string) => {
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
    },
    [dispatch, userId]
  );

  // Pagination logic
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    if (selectedCategoryId) {
      params.set('category', selectedCategoryId);
    }
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key='first'
          onClick={() => handlePageChange(1)}
          className='px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:border-pink-500 transition'
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key='dots1' className='px-2 text-gray-400'>
            ...
          </span>
        );
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            currentPage === i
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:border-pink-500'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key='dots2' className='px-2 text-gray-400'>
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key='last'
          onClick={() => handlePageChange(totalPages)}
          className='px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:border-pink-500 transition'
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
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
              onFilter={handleCategoryFilter}
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

          {/* Search Filter */}
          <div className='mb-6'>
            <ProductFilter
              onFilter={handleSearchFilter}
              placeholder='Tìm kiếm sản phẩm theo tên...'
              className='w-full max-w-md'
            />
          </div>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 text-black gap-4'>
            <p>
              Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng
              số {totalItems} sản phẩm
              {selectedCategoryId && ` theo danh mục đã chọn`}
              {searchTerm && ` với từ khóa "${searchTerm}"`}
              {province && ` tại ${province}`}
              {ward && `, ${ward}`}
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
            <div className='flex justify-center items-center h-96'>
              <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500'></div>
            </div>
          ) : error ? (
            <p className='text-red-600 text-center'>Lỗi: {error}</p>
          ) : currentProducts.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {currentProducts.map(product => {
                  const variant = product.variants?.[0];
                  return (
                    <div
                      key={product._id}
                      className='border border-gray-100 rounded p-4 text-center bg-white hover:shadow-lg transition-shadow duration-300'
                    >
                      <div className='relative group overflow-hidden rounded'>
                        <img
                          src={product.thumbnailImage}
                          alt={product.title}
                          className='w-[450px] h-[450px] object-cover rounded transition-transform duration-300 group-hover:scale-105'
                        />
                        <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                          <Link
                            to={`/home/products/${product._id}`}
                            className='bg-pink-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-600 transition'
                          >
                            Xem chi tiết
                          </Link>
                          <button
                            onClick={() => handleAddToCart(variant?._id)}
                            className='border border-white text-white px-4 py-2 rounded-full font-semibold bg-transparent hover:bg-white hover:text-pink-500 transition'
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='text-sm text-gray-600'>
                    Trang {currentPage} / {totalPages}
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:border-pink-500'
                      }`}
                    >
                      ‹ Trước
                    </button>

                    {/* Page numbers */}
                    {renderPaginationButtons()}

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-pink-50 hover:border-pink-500'
                      }`}
                    >
                      Sau ›
                    </button>
                  </div>

                  <div className='text-sm text-gray-600'>
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;