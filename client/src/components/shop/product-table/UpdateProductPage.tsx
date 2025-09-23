import { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateProduct,
  fetchProductById,
  clearCurrentProduct
} from '~/store/slices/productSlice';
import { fetchCategories } from '~/store/slices/categorySlice';
import type { RootState } from '~/store';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate, useParams } from 'react-router';
import uploadAssets from '~/utils/uploadAssets';

const formatCurrency = (value: string) => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const UpdateProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);

  const shopId = user?.role === 'shop' && user.id ? user.id : null;

  const { items: categories = [], loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { currentProduct, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<(File | null)[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const [dimension, setDimension] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [weight, setWeight] = useState('');

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imageFilesInputRef = useRef<HTMLInputElement>(null);
  const variantInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    categories: [] as string[],
    thumbnailImage: '',
    image: [] as string[],
    description: '',
    status: 'active',
    variants: [
      { title: '', listPrice: '', salePrice: '', inventory: '', image: '' }
    ]
  });
  const [formError, setFormError] = useState('');

  // Helper function to extract category IDs from product categories (similar to ProductDetailModal logic)
  const extractCategoryIds = (productCategories: any[]) => {
    if (!Array.isArray(productCategories)) return [];

    return productCategories
      .map(cat => {
        // Nếu là object có _id, lấy _id
        if (cat && typeof cat === 'object' && cat._id) return cat._id;
        // Nếu là string ID, trả về luôn
        if (typeof cat === 'string') return cat;
        return null;
      })
      .filter(Boolean);
  };

  // Helper function to get category titles for display (similar to ProductDetailModal)
  const getCategoryTitles = (categoryIds: string[]) => {
    if (!Array.isArray(categoryIds)) return [];
    return categoryIds.map(cat => {
      // Nếu là object có title
      if (cat && typeof cat === 'object' && (cat as any).title)
        return (cat as any).title;
      // Nếu là object có _id
      const id =
        typeof cat === 'object' && (cat as any)._id ? (cat as any)._id : cat;
      // Tìm danh mục cha
      const parent = categories.find((c: any) => c._id === id);
      if (parent) return parent.title;
      // Tìm danh mục con
      for (const c of categories) {
        const sub = c.subCategory?.find((sc: any) => sc._id === id);
        if (sub) return sub.title;
      }
      return id;
    });
  };

  // Helper function to find parent categories from subcategory IDs
  const findParentCategories = (subCategoryIds: string[]) => {
    const parentIds: string[] = [];

    categories.forEach((cat: any) => {
      if (cat.subCategory && Array.isArray(cat.subCategory)) {
        const hasSubInProduct = cat.subCategory.some((sub: any) =>
          subCategoryIds.includes(sub._id)
        );
        if (hasSubInProduct) {
          parentIds.push(cat._id);
        }
      }
    });

    return parentIds;
  };

  // Load data when component mounts
  useEffect(() => {
    dispatch(fetchCategories());
    if (id) {
      dispatch(fetchProductById(id));
    }

    // Cleanup when unmount
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  // Initialize form when product and categories are loaded
  useEffect(() => {
    if (!currentProduct || categories.length === 0 || isFormInitialized) return;

    console.log('Initializing form with product:', currentProduct);
    console.log('Available categories:', categories);

    // Extract category IDs từ product categories (có thể là objects hoặc IDs)
    const productCategoryIds = extractCategoryIds(
      currentProduct.categories || []
    );
    console.log('Extracted category IDs:', productCategoryIds);

    // Find parent categories based on subcategory IDs
    const parentIds = findParentCategories(productCategoryIds);
    console.log('Found parent IDs:', parentIds);

    const processedVariants =
      currentProduct.variants &&
      Array.isArray(currentProduct.variants) &&
      currentProduct.variants.length > 0
        ? currentProduct.variants.map((v: any) => ({
            title: v.title || '',
            listPrice: v.listPrice
              ? formatCurrency(v.listPrice.toString())
              : '',
            salePrice: v.salePrice
              ? formatCurrency(v.salePrice.toString())
              : '',
            inventory: v.inventory?.toString() || '0',
            image: v.image || ''
          }))
        : [
            {
              title: '',
              listPrice: '',
              salePrice: '',
              inventory: '0',
              image: ''
            }
          ];

    console.log('Processed variants:', processedVariants);

    setForm({
      title: currentProduct.title || '',
      categories: productCategoryIds,
      thumbnailImage: currentProduct.thumbnailImage || '',
      image: currentProduct.image || [],
      description: currentProduct.description || '',
      status: currentProduct.status || 'active',
      variants: processedVariants
    });

    setWeight(currentProduct.weight?.toString() || '');
    setDimension({
      length: currentProduct.dimension?.length?.toString() || '',
      width: currentProduct.dimension?.width?.toString() || '',
      height: currentProduct.dimension?.height?.toString() || ''
    });

    const variantCount = processedVariants.length;
    setVariantFiles(new Array(variantCount).fill(null));
    variantInputRefs.current = new Array(variantCount).fill(null);

    setSelectedParents(parentIds);
    setIsFormInitialized(true);
  }, [currentProduct, categories, isFormInitialized]);

  // Loading states
  if (loading || categoriesLoading) {
    return <div className='p-6 text-center'>Đang tải dữ liệu...</div>;
  }

  if (!currentProduct && !loading) {
    return (
      <div className='p-6 text-center text-red-500'>
        Không tìm thấy sản phẩm
      </div>
    );
  }

  if (!isFormInitialized) {
    return <div className='p-6 text-center'>Đang khởi tạo form...</div>;
  }

  const parentCategories = categories.filter((cat: any) => !cat.parentId);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    if (parentId && !selectedParents.includes(parentId)) {
      setSelectedParents(prev => [...prev, parentId]);
    }
  };

  const removeParentCategory = (parentId: string) => {
    // Remove parent and all its subcategories
    const parent = categories.find((cat: any) => cat._id === parentId);
    if (parent && parent.subCategory) {
      const subIds = parent.subCategory.map((sub: any) => sub._id);
      setForm(prev => ({
        ...prev,
        categories: prev.categories.filter(id => !subIds.includes(id))
      }));
    }
    setSelectedParents(prev => prev.filter(id => id !== parentId));
  };

  const handleSubChange = (
    parentId: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const subId = e.target.value;
    if (subId && !form.categories.includes(subId)) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, subId]
      }));
    }
  };

  const removeSubCategory = (subId: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(id => id !== subId)
    }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, e: any) => {
    const { name, value } = e.target;
    const updatedVariants = [...form.variants];
    if (name === 'listPrice' || name === 'salePrice') {
      updatedVariants[index][name] = formatCurrency(value);
    } else {
      updatedVariants[index][name] = value;
    }
    setForm(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { title: '', listPrice: '', salePrice: '', inventory: '', image: '' }
      ]
    }));
    setVariantFiles(prev => [...prev, null]);
    variantInputRefs.current.push(null);
  };

  const removeVariant = (idx: number) => {
    if (form.variants.length <= 1) return;

    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
    setVariantFiles(prev => prev.filter((_, i) => i !== idx));
    variantInputRefs.current = variantInputRefs.current.filter(
      (_, i) => i !== idx
    );
  };

  const validateForm = () => {
    if (!shopId) return 'Bạn không có quyền cập nhật sản phẩm';
    if (!form.title.trim()) return 'Tên sản phẩm là bắt buộc';
    if (!form.categories.length) return 'Chọn ít nhất 1 danh mục con';
    if (!form.variants.length) return 'Cần ít nhất 1 biến thể';
    if (!weight || !dimension.length || !dimension.width || !dimension.height)
      return 'Vui lòng nhập đủ trọng lượng và kích thước';
    return '';
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormError('');
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    try {
      // Upload files concurrently
      const [thumbnailUrl, imageUrls, variantImages] = await Promise.all([
        // Thumbnail
        thumbnailFile
          ? uploadAssets(
              thumbnailFile,
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
              'products/thumbnails'
            ).then((res: any) => res.url)
          : Promise.resolve(form.thumbnailImage),

        // Images
        imageFiles.length > 0
          ? Promise.all(
              imageFiles
                .slice(0, 5)
                .map(file =>
                  uploadAssets(
                    file,
                    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                    'products/images'
                  ).then((res: any) => res.url)
                )
            )
          : Promise.resolve(form.image),

        // Variant images
        Promise.all(
          form.variants.map(async (v, idx) => {
            if (variantFiles[idx]) {
              const result = await uploadAssets(
                variantFiles[idx] as File,
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                'products/variants'
              );
              return (result as any).url;
            }
            return v.image;
          })
        )
      ]);

      const payload = {
        ...form,
        shop: shopId,
        thumbnailImage: thumbnailUrl,
        image: imageUrls,
        weight: Number(weight),
        dimension: {
          length: Number(dimension.length),
          width: Number(dimension.width),
          height: Number(dimension.height)
        },
        variants: form.variants.map((v, idx) => ({
          ...v,
          image: variantImages[idx],
          listPrice: Number(v.listPrice.replace(/\D/g, '')),
          salePrice: Number(v.salePrice.replace(/\D/g, '')),
          inventory: Number(v.inventory)
        }))
      };

      await dispatch(updateProduct({ id, updatedData: payload })).unwrap();
      alert('Cập nhật sản phẩm thành công!');
      navigate('/shop/product');
    } catch (err: any) {
      setFormError(err?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>Cập nhật sản phẩm</h2>
        <button
          type='button'
          onClick={() => navigate('/shop/product')}
          className='px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50'
        >
          ← Quay lại
        </button>
      </div>

      {/* Debug info - Xóa khi production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6'>
          <h4 className='font-medium text-yellow-800 mb-2'>Debug Info:</h4>
          <p className='text-sm text-yellow-700'>
            <strong>Selected Categories:</strong> {JSON.stringify(form.categories)}
          </p>
          <p className='text-sm text-yellow-700'>
            <strong>Category Titles:</strong> {getCategoryTitles(form.categories).join(', ')}
          </p>
          <p className='text-sm text-yellow-700'>
            <strong>Selected Parents:</strong> {JSON.stringify(selectedParents)}
          </p>
        </div>
      )} */}

      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* I. Thông tin sản phẩm */}
        <section className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>
            I. Thông tin sản phẩm
          </h3>

          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tên sản phẩm *
              </label>
              <input
                type='text'
                name='title'
                value={form.title}
                onChange={handleChange}
                placeholder='Nhập tên sản phẩm'
                className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Mô tả sản phẩm
              </label>
              <textarea
                name='description'
                value={form.description}
                onChange={handleChange}
                placeholder='Nhập mô tả chi tiết sản phẩm'
                rows={4}
                className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Categories Section */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Danh mục sản phẩm *
              </label>

              {/* Current categories display */}
              {form.categories.length > 0 && (
                <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                  <p className='text-sm font-medium text-blue-800 mb-2'>
                    Danh mục hiện tại:
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {getCategoryTitles(form.categories).map((title, idx) => (
                      <span
                        key={idx}
                        className='bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium'
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <select
                value=''
                onChange={handleParentChange}
                className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>-- Chọn nhóm danh mục --</option>
                {parentCategories
                  .filter((cat: any) => !selectedParents.includes(cat._id))
                  .map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
              </select>

              {/* Selected parent categories */}
              <div className='mt-4 space-y-4'>
                {selectedParents.map(parentId => {
                  const parent = parentCategories.find(
                    (cat: any) => cat._id === parentId
                  );
                  const subCategories = parent?.subCategory || [];

                  return (
                    <div
                      key={parentId}
                      className='border border-gray-200 rounded-md p-4 bg-white'
                    >
                      <div className='flex justify-between items-center mb-3'>
                        <span className='font-medium text-gray-800'>
                          {parent?.title}
                        </span>
                        <button
                          type='button'
                          onClick={() => removeParentCategory(parentId)}
                          className='text-red-500 hover:text-red-700 font-bold text-lg'
                          title='Xóa nhóm danh mục'
                        >
                          ×
                        </button>
                      </div>

                      <select
                        value=''
                        onChange={e => handleSubChange(parentId, e)}
                        className='w-full p-2 border border-gray-300 rounded-md text-sm'
                      >
                        <option value=''>-- Chọn danh mục con --</option>
                        {subCategories
                          .filter(
                            (sub: any) => !form.categories.includes(sub._id)
                          )
                          .map((sub: any) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.title}
                            </option>
                          ))}
                      </select>

                      {/* Selected subcategories */}
                      {subCategories.some((s: any) =>
                        form.categories.includes(s._id)
                      ) && (
                        <div className='flex flex-wrap gap-2 mt-3'>
                          {subCategories
                            .filter((sub: any) =>
                              form.categories.includes(sub._id)
                            )
                            .map((sub: any) => (
                              <span
                                key={sub._id}
                                className='inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full'
                              >
                                {sub.title}
                                <button
                                  type='button'
                                  onClick={() => removeSubCategory(sub._id)}
                                  className='ml-2 text-blue-600 hover:text-red-600 font-bold'
                                  title='Bỏ chọn'
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Image uploads */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Thumbnail */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ảnh đại diện *
                </label>
                <div className='space-y-3'>
                  <input
                    type='file'
                    accept='image/*'
                    ref={thumbnailInputRef}
                    onChange={e =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
                    className='hidden'
                  />
                  <button
                    type='button'
                    className='w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 transition-colors'
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {thumbnailFile ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}
                  </button>

                  {thumbnailFile ? (
                    <div className='relative'>
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt='Thumbnail preview'
                        className='w-full h-32 object-cover rounded-md border'
                      />
                      <span className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded'>
                        Mới
                      </span>
                    </div>
                  ) : form.thumbnailImage ? (
                    <div className='relative'>
                      <img
                        src={form.thumbnailImage}
                        alt='Current thumbnail'
                        className='w-full h-32 object-cover rounded-md border'
                      />
                      <span className='absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded'>
                        Hiện tại
                      </span>
                    </div>
                  ) : (
                    <div className='w-full h-32 bg-gray-100 rounded-md border flex items-center justify-center'>
                      <span className='text-gray-400'>Chưa có ảnh</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product images */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ảnh sản phẩm (tối đa 5)
                </label>
                <div className='space-y-3'>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    ref={imageFilesInputRef}
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setImageFiles(prev => [...prev, ...files].slice(0, 5));
                    }}
                    className='hidden'
                  />
                  <button
                    type='button'
                    className='w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 transition-colors'
                    onClick={() => imageFilesInputRef.current?.click()}
                  >
                    Thêm ảnh sản phẩm
                  </button>

                  <div className='grid grid-cols-3 gap-2'>
                    {imageFiles.length > 0
                      ? imageFiles.map((file, idx) => (
                          <div key={idx} className='relative'>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx}`}
                              className='w-full h-20 object-cover rounded border'
                            />
                            <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full'>
                              Mới
                            </span>
                          </div>
                        ))
                      : form.image
                          ?.slice(0, 5)
                          .map((url: string, idx: number) => (
                            <div key={idx} className='relative'>
                              <img
                                src={url}
                                alt={`Current ${idx}`}
                                className='w-full h-20 object-cover rounded border'
                              />
                              <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full'>
                                Hiện tại
                              </span>
                            </div>
                          ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* II. Thông tin bán hàng */}
        <section className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>
            II. Thông tin bán hàng
          </h3>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Phân loại hàng *
            </label>

            <div className='space-y-4'>
              {form.variants.map((variant, idx) => (
                <div
                  key={idx}
                  className='border border-gray-200 rounded-lg p-4 bg-white'
                >
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                    <input
                      name='title'
                      value={variant.title}
                      onChange={e => handleVariantChange(idx, e)}
                      placeholder='Tên phân loại'
                      className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                    <input
                      name='listPrice'
                      value={variant.listPrice}
                      onChange={e => handleVariantChange(idx, e)}
                      placeholder='Giá niêm yết'
                      className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                    <input
                      name='salePrice'
                      value={variant.salePrice}
                      onChange={e => handleVariantChange(idx, e)}
                      placeholder='Giá bán'
                      className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                    <input
                      name='inventory'
                      value={variant.inventory}
                      onChange={e => handleVariantChange(idx, e)}
                      placeholder='Tồn kho'
                      className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                      type='number'
                      min={0}
                    />
                  </div>

                  {/* Variant image */}
                  <div className='flex items-center gap-4'>
                    <input
                      type='file'
                      accept='image/*'
                      ref={el => (variantInputRefs.current[idx] = el)}
                      onChange={e => {
                        const files = [...variantFiles];
                        files[idx] = e.target.files?.[0] || null;
                        setVariantFiles(files);
                      }}
                      className='hidden'
                    />

                    <button
                      type='button'
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium'
                      onClick={() => variantInputRefs.current[idx]?.click()}
                    >
                      {variantFiles[idx] || variant.image
                        ? 'Đổi ảnh'
                        : 'Chọn ảnh'}
                    </button>

                    <div className='flex items-center gap-3'>
                      {variantFiles[idx] ? (
                        <div className='relative'>
                          <img
                            src={URL.createObjectURL(variantFiles[idx] as File)}
                            alt='New variant preview'
                            className='w-16 h-16 object-cover rounded-md border'
                          />
                          <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full'>
                            Mới
                          </span>
                        </div>
                      ) : variant.image ? (
                        <div className='relative'>
                          <img
                            src={variant.image}
                            alt='Current variant'
                            className='w-16 h-16 object-cover rounded-md border'
                          />
                          <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full'>
                            Hiện tại
                          </span>
                        </div>
                      ) : (
                        <div className='w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center'>
                          <span className='text-gray-400 text-xs'>Chưa có</span>
                        </div>
                      )}

                      {variantFiles[idx] && (
                        <span className='text-sm text-green-600 font-medium'>
                          {variantFiles[idx]?.name}
                        </span>
                      )}
                    </div>

                    {form.variants.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removeVariant(idx)}
                        className='ml-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium'
                        title='Xóa phân loại này'
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type='button'
                onClick={addVariant}
                className='w-full p-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-md hover:border-blue-400 hover:bg-blue-50 font-medium'
              >
                + Thêm phân loại hàng
              </button>
            </div>
          </div>
        </section>

        {/* III. Thông tin vận chuyển */}
        <section className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>
            III. Thông tin vận chuyển
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Cân nặng (kg) *
              </label>
              <input
                name='weight'
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder='Ví dụ: 0.5'
                className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
                type='number'
                min={0.01}
                step={0.01}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kích thước (cm) *
              </label>
              <div className='grid grid-cols-3 gap-2'>
                <input
                  name='length'
                  value={dimension.length}
                  onChange={e =>
                    setDimension(d => ({ ...d, length: e.target.value }))
                  }
                  placeholder='Dài'
                  className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                  type='number'
                  min={1}
                />
                <input
                  name='width'
                  value={dimension.width}
                  onChange={e =>
                    setDimension(d => ({ ...d, width: e.target.value }))
                  }
                  placeholder='Rộng'
                  className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                  type='number'
                  min={1}
                />
                <input
                  name='height'
                  value={dimension.height}
                  onChange={e =>
                    setDimension(d => ({ ...d, height: e.target.value }))
                  }
                  placeholder='Cao'
                  className='p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                  type='number'
                  min={1}
                />
              </div>
            </div>
          </div>
        </section>

        {/* IV. Trạng thái */}
        <section className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold mb-4 text-gray-800'>
            IV. Trạng thái sản phẩm
          </h3>

          <div className='flex gap-4'>
            <button
              type='button'
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                form.status === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setForm(prev => ({ ...prev, status: 'active' }))}
            >
              Đang bán
            </button>
            <button
              type='button'
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                form.status === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setForm(prev => ({ ...prev, status: 'inactive' }))}
            >
              Tạm ẩn
            </button>
          </div>
        </section>

        {/* Error display */}
        {(formError || error) && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-red-600 font-medium'>{formError || error}</p>
          </div>
        )}

        {/* Submit buttons */}
        <div className='flex gap-4 pt-6 border-t border-gray-200'>
          <button
            type='submit'
            className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </button>
          <button
            type='button'
            onClick={() => navigate('/shop/product')}
            className='px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium'
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProductPage;
