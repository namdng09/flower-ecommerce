import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import type { RootState } from '~/store';
import {
  fetchReviewByProductId,
  createReview,
  updateReview,
  deleteReview
} from '~/store/slices/reviewSlice';
import { getProductById } from '~/store/slices/productDetailSlice';
import { AuthContext } from '~/contexts/authContext';

const ReviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const { productId } = useParams<{ productId: string }>();
  const { user } = useContext(AuthContext);

  const product = useSelector(
    (state: RootState) => state.productDetail?.product
  );
  const productLoading = useSelector(
    (state: RootState) => state.productDetail?.loading
  );
  const productError = useSelector(
    (state: RootState) => state.productDetail?.error
  );
  //Ensure reviews is always an array
  const reviews = useSelector((state: RootState) => {
    const reviewData = state.reviews?.currentReview;
    return Array.isArray(reviewData) ? reviewData : [];
  });
  const loading = useSelector((state: RootState) => state.reviews?.loading);
  const error = useSelector((state: RootState) => state.reviews?.error);

  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId) as any);
      dispatch(fetchReviewByProductId(productId) as any);
    }
  }, [productId, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!rating || rating < 1 || rating > 5) {
      setValidationError('Vui lòng chọn số sao đánh giá (1-5 sao)');
      return;
    }

    if (!description.trim()) {
      setValidationError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (!user) {
      setValidationError('Vui lòng đăng nhập để viết đánh giá');
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateReview({
            id: editingId,
            updateData: {
              userId: user?.id,
              productId: productId,
              targetType: 'product',
              description: description,
              rating: rating
            }
          }) as any
        );
        setEditingId(null);
        setDescription('');
        setRating(5);
      } else {
        await dispatch(
          createReview({
            userId: user?.id,
            productId: productId,
            targetType: 'product',
            description: description,
            rating: rating
          }) as any
        );
        setDescription('');
        setRating(5);
      }
      if (productId) {
        dispatch(fetchReviewByProductId(productId) as any);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setValidationError('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await dispatch(deleteReview(id) as any);
        if (productId) {
          dispatch(fetchReviewByProductId(productId) as any);
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleEdit = (review: any) => {
    setEditingId(review._id);
    setDescription(review.description);
    setRating(review.rating);
    setValidationError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setRating(5);
    setValidationError('');
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValidationError('');
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // Count ratings distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
    star,
    count: reviews.filter(review => review.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter(review => review.rating === star).length /
            reviews.length) *
          100
        : 0
  }));

  // Render product information
  const renderProductInfo = () => {
    if (productLoading)
      return (
        <div className='animate-pulse bg-gray-200 h-48 rounded mb-8'></div>
      );
    if (productError)
      return (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8'>
          {productError}
        </div>
      );
    if (!product) return null;

    const minPrice = product.variants?.reduce(
      (min: number, v: any) => (v.salePrice < min ? v.salePrice : min),
      product.variants?.[0]?.salePrice || 0
    );

    return (
      <div className='max-w-6xl mx-auto p-6 mt-50 text-black'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          <div className='flex-shrink-0'>
            <img
              src={product.thumbnailImage || product.image?.[0]}
              alt={product.title}
              className='w-48 h-48 object-cover rounded-lg border'
            />
          </div>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold text-gray-900 mb-3'>
              {product.title}
            </h1>
            <p className='text-gray-600 mb-4 leading-relaxed'>
              {product.description}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div className='flex items-center'>
                <span className='font-semibold text-gray-700 mr-2'>
                  Giá từ:
                </span>
                <span className='text-2xl font-bold text-red-600'>
                  {minPrice?.toLocaleString()}₫
                </span>
              </div>
              <div className='flex items-center'>
                <span className='font-semibold text-gray-700 mr-2'>Shop:</span>
                <span className='text-gray-800'>
                  {product.shop?.fullName || product.shop?.username}
                </span>
              </div>
            </div>

            {/* Product variants */}
            {product.variants && product.variants.length > 0 && (
              <div className='mb-4'>
                <h3 className='font-semibold text-gray-700 mb-2'>
                  Các tùy chọn sản phẩm:
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {product.variants.map(variant => (
                    <div
                      key={variant._id}
                      className='flex items-center justify-between border bg-gray-50 p-2 rounded'
                    >
                      <span className='text-sm text-gray-700'>
                        {variant.title}
                      </span>
                      <span className='text-sm font-semibold text-red-600'>
                        {variant.salePrice.toLocaleString()}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render stars
  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onClick?: (rating: number) => void
  ) => {
    const stars = [1, 2, 3, 4, 5].map(starNumber => {
      const isActive = starNumber <= rating;
      const starColor = isActive ? 'text-yellow-400' : 'text-gray-300';
      const interactiveClass = interactive
        ? 'hover:text-yellow-400 cursor-pointer'
        : '';

      return (
        <button
          key={starNumber}
          type='button'
          onClick={() => interactive && onClick?.(starNumber)}
          className={`text-2xl ${starColor} ${interactiveClass}`}
          disabled={!interactive}
        >
          ★
        </button>
      );
    });

    return <div className='flex gap-1'>{stars}</div>;
  };

  // Render rating summary
  const renderRatingSummary = () => {
    return (
      <div className='bg-gray-50 rounded-lg p-6 mb-6'>
        <div className='flex items-center gap-6 mb-4'>
          <div className='text-center'>
            <div className='text-4xl font-bold text-gray-900'>
              {averageRating}
            </div>
            <div className='flex justify-center mb-1'>
              {renderStars(Math.round(Number(averageRating)))}
            </div>
            <div className='text-sm text-gray-500'>
              {reviews.length} đánh giá
            </div>
          </div>
          <div className='flex-1'>
            {ratingDistribution.reverse().map(({ star, count, percentage }) => (
              <div key={star} className='flex items-center gap-2 mb-1'>
                <span className='text-sm w-8'>{star} ★</span>
                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-yellow-400 h-2 rounded-full'
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className='text-sm text-gray-600 w-8'>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-6xl mx-auto p-6 mt-8 bg-gray-50 min-h-screen'>
      {renderProductInfo()}

      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          Đánh giá sản phẩm
        </h2>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
            {error}
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
            {validationError}
          </div>
        )}

        {reviews.length > 0 && renderRatingSummary()}

        {/* Review form */}
        {user ? (
          <form
            onSubmit={handleSubmit}
            className='mb-8 p-6 bg-gray-50 rounded-lg'
          >
            <h3 className='text-lg font-semibold mb-4'>
              {editingId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
            </h3>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Đánh giá của bạn: <span className='text-red-500'>*</span>
              </label>
              {renderStars(rating, true, handleRatingChange)}
              <p className='text-sm text-gray-500 mt-1'>
                Nhấp vào sao để đánh giá ({rating} sao)
              </p>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nội dung đánh giá: <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...'
                rows={4}
                className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div className='flex gap-3'>
              <button
                type='submit'
                disabled={loading || !description.trim() || !rating}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {loading && (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                )}
                {editingId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>

              {editingId && (
                <button
                  type='button'
                  onClick={handleCancelEdit}
                  className='bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400'
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
            <p className='text-yellow-800'>
              Vui lòng đăng nhập để viết đánh giá sản phẩm.
            </p>
          </div>
        )}

        {/* Reviews list */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>
            Tất cả đánh giá ({reviews.length})
          </h3>

          {loading && !reviews.length ? (
            <div className='space-y-4'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='animate-pulse bg-gray-200 h-24 rounded-lg'
                ></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 text-6xl mb-4'>📝</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Chưa có đánh giá nào
              </h3>
              <p className='text-gray-500'>
                Hãy là người đầu tiên đánh giá sản phẩm này!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reviews.map((review: any) => (
                <div
                  key={review._id}
                  className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div>
                        <div className='font-semibold text-gray-900'>
                          {review.userId?.fullName} ({review.userId?.username} -{' '}
                          {review.userId?.email})
                        </div>
                        <div className='flex items-center gap-2'>
                          {renderStars(review.rating)}
                          <span className='text-sm text-gray-500'>
                            {new Date(review.createdAt).toLocaleDateString(
                              'vi-VN',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='text-gray-700 mb-4 leading-relaxed'>
                    {review.description}
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className='flex gap-2 mb-4 overflow-x-auto'>
                      {review.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Ảnh review ${idx + 1}`}
                          className='w-20 h-20 object-cover rounded border flex-shrink-0'
                        />
                      ))}
                    </div>
                  )}

                  {review.userId._id === user?.id && (
                    <div className='flex gap-2 pt-3 border-t border-gray-100'>
                      <button
                        onClick={() => handleEdit(review)}
                        className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className='text-red-600 hover:text-red-800 text-sm font-medium'
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
