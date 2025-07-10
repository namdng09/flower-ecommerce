import { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProduct, fetchProducts } from '~/store/slices/productSlice';
import { fetchCategories } from '~/store/slices/categorySlice';
import type { RootState } from '~/store';
import { AuthContext } from '~/contexts/authContext';
import { useNavigate, useParams } from 'react-router';
import uploadAssets from '~/utils/uploadAssets';

const UpdateProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);

  const shopId = user?.role === 'shop' && user.id ? user.id : null;

  const { items: categories = [] } = useSelector(
    (state: RootState) => state.categories
  );
  const {
    items: products = [],
    loading,
    error
  } = useSelector((state: RootState) => state.products);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<(File | null)[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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
    image: [] as string[], // Thêm image vào form
    description: '',
    status: 'active',
    variants: [
      { title: '', listPrice: '', salePrice: '', inventory: '', image: '' }
    ]
  });
  const [formError, setFormError] = useState('');

  // Load categories & product data
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, categories.length, products.length]);

  // Load product info to form
  useEffect(() => {
    if (!id || categories.length === 0) return;
    const product = products.find((p: any) => p._id === id);
    if (product) {
      setForm({
        title: product.title || '',
        categories: product.categories || [],
        thumbnailImage: product.thumbnailImage || '',
        image: product.image || [],
        description: product.description || '',
        status: product.status || 'active',
        variants: product.variants?.map((v: any) => ({
          title: v.title || '',
          listPrice: v.listPrice?.toString() || '',
          salePrice: v.salePrice?.toString() || '',
          inventory: v.inventory?.toString() || '',
          image: v.image || ''
        })) || [
          { title: '', listPrice: '', salePrice: '', inventory: '', image: '' }
        ]
      });
      setWeight(product.weight?.toString() || '');
      setDimension({
        length: product.dimension?.length?.toString() || '',
        width: product.dimension?.width?.toString() || '',
        height: product.dimension?.height?.toString() || ''
      });
      setVariantFiles(product.variants?.map(() => null) || []);
      // Lấy selectedParents từ categories
      const parentIds = categories
        .filter((cat: any) =>
          cat.subCategory?.some((sub: any) =>
            product.categories?.includes(sub._id)
          )
        )
        .map((cat: any) => cat._id);
      setSelectedParents(parentIds);
    }
  }, [id, products, categories]);

  const parentCategories = categories.filter((cat: any) => !cat.parentId);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    if (parentId && !selectedParents.includes(parentId)) {
      setSelectedParents(prev => [...prev, parentId]);
    }
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
    updatedVariants[index][name] = value;
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
  };

  const removeVariant = (idx: number) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
    setVariantFiles(prev => prev.filter((_, i) => i !== idx));
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

    // Upload thumbnail nếu có file mới
    let thumbnailUrl = form.thumbnailImage;
    if (thumbnailFile) {
      const result = await uploadAssets(
        thumbnailFile,
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        'products/thumbnails'
      );
      thumbnailUrl = (result as any).url;
    }

    // Upload mảng imageFiles (tối đa 5 ảnh) nếu có file mới
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await Promise.all(
        imageFiles
          .slice(0, 5)
          .map(file =>
            uploadAssets(
              file,
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
              'products/images'
            ).then((res: any) => res.url)
          )
      );
    }

    // Upload ảnh biến thể nếu có file mới
    const variantImages = await Promise.all(
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
    );

    const payload = {
      ...form,
      shop: shopId,
      thumbnailImage: thumbnailUrl,
      image: imageUrls.length > 0 ? imageUrls : form.image, // Giữ lại ảnh cũ nếu chưa upload mới
      weight: Number(weight),
      dimension: {
        length: Number(dimension.length),
        width: Number(dimension.width),
        height: Number(dimension.height)
      },
      variants: form.variants.map((v, idx) => ({
        ...v,
        image: variantImages[idx],
        listPrice: Number(v.listPrice),
        salePrice: Number(v.salePrice),
        inventory: Number(v.inventory)
      }))
    };
    try {
      await dispatch(updateProduct({ id, updatedData: payload })).unwrap();
      alert('Cập nhật sản phẩm thành công!');
      navigate('/shop/product');
    } catch (err: any) {
      setFormError(err?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className='p-6 max-w-3xl mx-auto bg-white rounded shadow-sm'>
      <h2 className='text-xl font-bold mb-4'>Cập nhật sản phẩm</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <input
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='Tên sản phẩm'
            className='input'
            required
          />

          <div className='mb-4'>
            <select
              value=''
              onChange={handleParentChange}
              className='input w-full'
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
          </div>
        </div>

        {selectedParents.map(parentId => {
          const parent = parentCategories.find(
            (cat: any) => cat._id === parentId
          );
          const subCategories = parent?.subCategory || [];

          return (
            <div
              key={parentId}
              className='border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 shadow-sm'
            >
              <div className='mb-2'>
                <label className='block text-sm font-semibold text-gray-800 mb-1'>
                  {parent?.title}
                </label>
                <select
                  value=''
                  onChange={e => handleSubChange(parentId, e)}
                  className='input w-full'
                >
                  <option value=''>-- Chọn danh mục con --</option>
                  {subCategories
                    .filter((sub: any) => !form.categories.includes(sub._id))
                    .map((sub: any) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.title}
                      </option>
                    ))}
                </select>
              </div>

              {subCategories.some((s: any) =>
                form.categories.includes(s._id)
              ) && (
                <div className='flex flex-wrap gap-2 mt-2'>
                  {subCategories
                    .filter((sub: any) => form.categories.includes(sub._id))
                    .map((sub: any) => (
                      <span
                        key={sub._id}
                        className='inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-300'
                      >
                        {sub.title}
                        <button
                          type='button'
                          onClick={() => removeSubCategory(sub._id)}
                          className='ml-2 text-blue-500 hover:text-red-600 font-bold focus:outline-none'
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

        {/* Thêm input cho trọng lượng và kích thước */}
        <div className='grid grid-cols-2 gap-4'>
          <input
            name='weight'
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder='Khối lượng (kg)'
            className='input'
            required
            type='number'
            min={0.01}
            step={0.01}
          />
          <div className='flex gap-2'>
            <input
              name='length'
              value={dimension.length}
              onChange={e =>
                setDimension(d => ({ ...d, length: e.target.value }))
              }
              placeholder='Dài (cm)'
              className='input'
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
              placeholder='Rộng (cm)'
              className='input'
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
              placeholder='Cao (cm)'
              className='input'
              required
              type='number'
              min={1}
            />
          </div>
        </div>

        {/* Thumbnail upload */}
        <div className='flex items-center gap-2'>
          <input
            type='file'
            accept='image/*'
            ref={thumbnailInputRef}
            onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
            className='hidden'
          />
          <button
            type='button'
            className='px-3 py-2 bg-gray-200 rounded hover:bg-gray-300'
            onClick={() => thumbnailInputRef.current?.click()}
          >
            Chọn tệp ảnh đại diện
          </button>
          {thumbnailFile ? (
            <>
              <span className='text-sm'>{thumbnailFile.name}</span>
              <img
                src={URL.createObjectURL(thumbnailFile)}
                alt='thumbnail preview'
                className='w-16 h-16 object-cover rounded border ml-2'
              />
            </>
          ) : (
            form.thumbnailImage && (
              <img
                src={form.thumbnailImage}
                alt='thumbnail'
                className='w-16 h-16 object-cover rounded border ml-2'
              />
            )
          )}
        </div>

        {/* Upload nhiều ảnh sản phẩm (tối đa 5 ảnh) */}
        <div className='flex items-center gap-2 mt-2'>
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
            className='px-3 py-2 bg-gray-200 rounded hover:bg-gray-300'
            onClick={() => imageFilesInputRef.current?.click()}
          >
            Chọn tệp ảnh sản phẩm
          </button>
          {imageFiles.length > 0 && (
            <span className='text-sm'>
              {imageFiles.map(f => f.name).join(', ')}
            </span>
          )}
        </div>
        <p className='text-xs text-gray-500'>Chọn tối đa 5 ảnh</p>
        <div className='flex gap-2 mt-2'>
          {imageFiles.length > 0
            ? imageFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  className='w-16 h-16 object-cover rounded border'
                />
              ))
            : Array.isArray(form.image) && form.image.length > 0 &&
              form.image.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`old-img-${idx}`}
                  className='w-16 h-16 object-cover rounded border'
                />
              ))}
        </div>

        {/* Status toggle */}
        <div className='flex items-center gap-4'>
          <span className='font-semibold'>Trạng thái:</span>
          <button
            type='button'
            className={`px-3 py-1 rounded ${form.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setForm(prev => ({ ...prev, status: 'active' }))}
          >
            Active
          </button>
          <button
            type='button'
            className={`px-3 py-1 rounded ${form.status === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setForm(prev => ({ ...prev, status: 'inactive' }))}
          >
            Inactive
          </button>
        </div>

        {/* Biến thể (Variants) */}
        <div>
          <h3 className='font-semibold mt-4 mb-2'>Biến thể (Variants)</h3>
          {form.variants.map((variant, idx) => (
            <div key={idx} className='grid grid-cols-5 gap-2 mb-2'>
              <input
                name='title'
                value={variant.title}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Tên biến thể'
                className='input'
                required
              />
              <input
                name='listPrice'
                value={variant.listPrice}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Giá niêm yết'
                className='input'
                required
              />
              <input
                name='salePrice'
                value={variant.salePrice}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Giá bán'
                className='input'
                required
              />
              <input
                name='inventory'
                value={variant.inventory}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Tồn kho'
                className='input'
                required
              />
              {/* Ảnh biến thể */}
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
                className='px-3 py-2 bg-gray-200 rounded hover:bg-gray-300'
                onClick={() => variantInputRefs.current[idx]?.click()}
              >
                Chọn tệp biến thể
              </button>
              {variantFiles[idx] ? (
                <>
                  <span className='text-sm'>{variantFiles[idx]?.name}</span>
                  <img
                    src={URL.createObjectURL(variantFiles[idx] as File)}
                    alt='variant preview'
                    className='w-16 h-16 object-cover rounded border ml-2'
                  />
                </>
              ) : (
                variant.image && (
                  <img
                    src={variant.image}
                    alt='variant'
                    className='w-16 h-16 object-cover rounded border ml-2'
                  />
                )
              )}
              {form.variants.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeVariant(idx)}
                  className='text-red-500 ml-2'
                  title='Xóa biến thể'
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type='button'
            onClick={addVariant}
            className='text-sm text-blue-600 mt-1'
          >
            + Thêm biến thể
          </button>
        </div>

        <textarea
          name='description'
          value={form.description}
          onChange={handleChange}
          placeholder='Mô tả sản phẩm'
          className='w-full p-2 border rounded'
        />

        <button
          type='submit'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
        </button>
        {(formError || error) && (
          <p className='text-red-500'>{formError || error}</p>
        )}
      </form>
    </div>
  );
};

export default UpdateProductPage;