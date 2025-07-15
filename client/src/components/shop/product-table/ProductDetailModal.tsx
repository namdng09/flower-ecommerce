import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '~/store';

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  open,
  onClose
}) => {
  const { items: allCategories = [] } = useSelector(
    (state: RootState) => state.categories
  );
  const { items: allVariants = [] } = useSelector(
    (state: RootState) => state.variants || { items: [] }
  );

  if (!open || !product) return null;

  // Map category IDs to titles (cả cha và con)
  const getCategoryTitles = (cats: any[]) => {
    if (!Array.isArray(cats)) return [];
    return cats.map(cat => {
      // Nếu là object có title
      if (cat && typeof cat === 'object' && cat.title) return cat.title;
      // Nếu là object có _id
      const id = typeof cat === 'object' && cat._id ? cat._id : cat;
      // Tìm danh mục cha
      const parent = allCategories.find((c: any) => c._id === id);
      if (parent) return parent.title;
      // Tìm danh mục con
      for (const c of allCategories) {
        const sub = c.subCategory?.find((sc: any) => sc._id === id);
        if (sub) return sub.title;
      }
      return id;
    });
  };

  // Map variant IDs to variant objects
  const getVariantObjects = (variants: any[]) => {
    if (!Array.isArray(variants)) return [];
    // Nếu là object, trả về luôn; nếu là id, map sang object
    return variants
      .map(v => {
        if (v && typeof v === 'object' && v.title) return v;
        const id = typeof v === 'object' && v._id ? v._id : v;
        return allVariants.find((item: any) => item._id === id);
      })
      .filter(Boolean);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm justify-center'>
      <div className='bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative'>
        <button
          className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl'
          onClick={onClose}
        >
          ×
        </button>
        <h2 className='text-2xl font-bold mb-4'>{product.title}</h2>
        <div className='flex gap-6'>
          <div>
            <img
              src={product.thumbnailImage || '/placeholder.png'}
              alt={product.title}
              className='w-32 h-32 object-cover rounded border mb-2'
            />
            <div className='flex gap-2 flex-wrap'>
              {Array.isArray(product.image) &&
                product.image.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`img-${idx}`}
                    className='w-16 h-16 object-cover rounded border'
                  />
                ))}
            </div>
          </div>
          <div className='flex-1'>
            <p className='mb-2'>
              <span className='font-semibold'>Mô tả:</span>{' '}
              {product.description || '--'}
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>SKU:</span>{' '}
              {product.skuCode || '--'}
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>Danh mục:</span>{' '}
              {getCategoryTitles(product.categories).map((title, idx) => (
                <span
                  key={idx}
                  className='bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-medium mr-1'
                >
                  {title}
                </span>
              ))}
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>Trạng thái:</span>{' '}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {product.status === 'active' ? 'Đang bán' : 'Tạm ẩn'}
              </span>
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>Ngày tạo:</span>{' '}
              {product.createdAt
                ? new Date(product.createdAt).toLocaleString()
                : '--'}
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>Khối lượng:</span>{' '}
              {product.weight ? `${product.weight} kg` : '--'}
            </p>
            <p className='mb-2'>
              <span className='font-semibold'>Kích thước:</span>{' '}
              {product.dimension
                ? `${product.dimension.length} x ${product.dimension.width} x ${product.dimension.height} cm`
                : '--'}
            </p>
            <div className='mb-2'>
              <span className='font-semibold'>Phân loại hàng:</span>
              <ul className='list-disc ml-6 mt-1'>
                {getVariantObjects(product.variants).length > 0 ? (
                  getVariantObjects(product.variants).map(
                    (v: any, idx: number) => (
                      <li key={idx} className='mb-1'>
                        <span className='font-medium'>{v.title}</span> - Giá:{' '}
                        {v.salePrice}₫ / Tồn kho: {v.inventory}
                        {v.image && (
                          <img
                            src={v.image}
                            alt={`variant-${idx}`}
                            className='inline-block ml-2 w-8 h-8 object-cover rounded border'
                          />
                        )}
                      </li>
                    )
                  )
                ) : (
                  <li>--</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
