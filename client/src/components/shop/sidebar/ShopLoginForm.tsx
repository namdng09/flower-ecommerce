import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { fetchUserById } from '~/store/slices/userSlice';
import { useNavigate } from 'react-router';
import * as z from 'zod';

const shopLoginSchema = z.object({
  shopId: z.string().min(1, 'Shop ID không được để trống')
});

type ShopLoginFields = z.infer<typeof shopLoginSchema>;

const ShopLoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ShopLoginFields>({
    resolver: zodResolver(shopLoginSchema)
  });

  const onSubmit = async (data: ShopLoginFields) => {
    try {
      const user = await dispatch(fetchUserById(data.shopId) as any).unwrap();
      if (user && user.role === 'shop') {
        localStorage.setItem('currentUser', JSON.stringify(user));
        reset();
        navigate('/shop/dashboard');
      } else {
        alert('Shop ID không hợp lệ hoặc không phải tài khoản shop!');
      }
    } catch {
      alert('Không tìm thấy shop!');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <form
        className='bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6'
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className='text-2xl font-bold text-center mb-4'>Shop Login</h2>
        <div>
          <label className='block text-sm font-medium mb-1'>Shop ID</label>
          <input
            className={`w-full border px-3 py-2 rounded ${errors.shopId ? 'border-red-500' : 'border-gray-300'}`}
            type='text'
            placeholder='Nhập Shop ID'
            {...register('shopId')}
          />
          {errors.shopId && (
            <span className='text-xs text-red-500'>
              {errors.shopId.message}
            </span>
          )}
        </div>
        <button
          type='submit'
          className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default ShopLoginForm;
