import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct } from '~/store/slices/productSlice';
import { fetchCategories } from '~/store/slices/categorySlice';
import type { RootState } from '~/store';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const CreateProductPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );
  // Ép kiểu shopId thành string
  const shopId =
    currentUser?.role === 'shop' && currentUser?._id
      ? String(currentUser._id)
      : null;

  const { items: categoryItems = [], loading: catLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { loading, error } = useSelector((state: RootState) => state.products);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    categories: [] as string[],
    status: 'active',
    thumbnailImage: '',
    description: '',
    image: '',
    weight: '',
    dimension: { length: '', width: '', height: '' },
    variants: [
      { title: '', listPrice: '', salePrice: '', inventory: '', image: '' }
    ]
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (categoryItems.length === 0) dispatch(fetchCategories());
  }, [dispatch, categoryItems.length]);

  useEffect(() => {
    if (selectedCategory) {
      setForm(prev => ({ ...prev, categories: [selectedCategory._id] }));
    }
  }, [selectedCategory]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('dimension.')) {
      const key = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        dimension: { ...prev.dimension, [key]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
  };

  const validateForm = () => {
    if (!shopId) return 'Only shop accounts can create products';
    if (!form.title.trim()) return 'Title is required';
    if (!form.categories.length) return 'Category is required';
    if (!form.variants.length) return 'At least one variant is required';
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
    const payload = {
      ...form,
      shop: shopId,
      weight: parseFloat(form.weight),
      image: [form.image],
      variants: form.variants.map(v => ({
        ...v,
        listPrice: Number(v.listPrice),
        salePrice: Number(v.salePrice),
        inventory: Number(v.inventory)
      }))
    };
    try {
      await dispatch(createProduct(payload)).unwrap();
      alert('Product created successfully!');
    } catch (err: any) {
      setFormError(err?.message || 'Create failed');
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto bg-white rounded shadow-sm'>
      <h2 className='text-xl font-bold mb-4'>Create Product</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h3 className='font-semibold mt-4 mb-2'>Variants</h3>
          {form.variants.map((variant, idx) => (
            <div key={idx} className='grid grid-cols-5 gap-2 mb-2'>
              <input
                name='title'
                value={variant.title}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Title'
                className='input'
              />
              <input
                name='listPrice'
                value={variant.listPrice}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='List Price'
                className='input'
              />
              <input
                name='salePrice'
                value={variant.salePrice}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Sale Price'
                className='input'
              />
              <input
                name='inventory'
                value={variant.inventory}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Inventory'
                className='input'
              />
              <input
                name='image'
                value={variant.image}
                onChange={e => handleVariantChange(idx, e)}
                placeholder='Image URL'
                className='input'
              />
            </div>
          ))}
          <button
            type='button'
            onClick={addVariant}
            className='text-sm text-blue-600 mt-1'
          >
            + Add Variant
          </button>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <input
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='Title'
            className='input'
          />

          <div>
            <Listbox value={selectedCategory} onChange={setSelectedCategory}>
              <div className='relative'>
                <Listbox.Button className='relative w-full cursor-default rounded-lg border bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'>
                  <span className='block truncate'>
                    {selectedCategory
                      ? selectedCategory.title
                      : 'Pick a category'}
                  </span>
                  <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                    <ChevronUpDownIcon
                      className='h-5 w-5 text-gray-400'
                      aria-hidden='true'
                    />
                  </span>
                </Listbox.Button>

                <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                  {catLoading ? (
                    <Listbox.Option value={null} disabled>
                      Loading...
                    </Listbox.Option>
                  ) : (
                    categoryItems.map(cat => (
                      <Listbox.Option
                        key={cat._id}
                        value={cat}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {cat.title}
                            </span>
                            {selected && (
                              <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600'>
                                <CheckIcon
                                  className='h-5 w-5'
                                  aria-hidden='true'
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          <input
            name='status'
            value={form.status}
            onChange={handleChange}
            placeholder='Status'
            className='input'
          />
          <input
            name='thumbnailImage'
            value={form.thumbnailImage}
            onChange={handleChange}
            placeholder='Thumbnail URL'
            className='input'
          />
          <input
            name='image'
            value={form.image}
            onChange={handleChange}
            placeholder='Main Image URL'
            className='input'
          />
        </div>

        <textarea
          name='description'
          value={form.description}
          onChange={handleChange}
          placeholder='Description'
          className='w-full p-2 border rounded'
        />

        <div className='grid grid-cols-3 gap-4'>
          <input
            name='weight'
            value={form.weight}
            onChange={handleChange}
            placeholder='Weight (kg)'
            className='input'
          />
          <input
            name='dimension.length'
            value={form.dimension.length}
            onChange={handleChange}
            placeholder='Length'
            className='input'
          />
          <input
            name='dimension.width'
            value={form.dimension.width}
            onChange={handleChange}
            placeholder='Width'
            className='input'
          />
          <input
            name='dimension.height'
            value={form.dimension.height}
            onChange={handleChange}
            placeholder='Height'
            className='input'
          />
        </div>

        <button
          type='submit'
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>

        {(formError || error) && (
          <p className='text-red-500'>{formError || error}</p>
        )}
      </form>
    </div>
  );
};

export default CreateProductPage;
