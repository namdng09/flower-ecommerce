import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import {
  fetchUserById,
  updateUser,
  updateUserAvatar,
  updateUserCover,
  deleteUser,
  clearCurrentUser,
  clearError
} from '~/store/slices/userSlice';
import { userFormSchema, type UserFormData } from '~/types/userSchema';
import uploadAssets from '~/utils/uploadAssets';

const UserUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector(state => state.users);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema)
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentUser) {
      reset({
        fullName: currentUser.fullName,
        username: currentUser.username,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        role: currentUser.role
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: UserFormData) => {
    if (!id) return;

    try {
      await dispatch(updateUser({ id, userData: data })).unwrap();
      navigate('/admin/user');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (
      window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        navigate('/admin/user');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    if (!id) return;
    try {
      const timestamp = Date.now();
      const result = await uploadAssets(
        file,
        'simple-upload',
        'avatars',
        `avatar_${id}_${timestamp}`
      );
      if (!Array.isArray(result)) {
        await dispatch(
          updateUserAvatar({ id, avatarUrl: result.url })
        ).unwrap();
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const handleCoverUpdate = async (file: File) => {
    if (!id) return;
    try {
      const timestamp = Date.now();
      const result = await uploadAssets(
        file,
        'simple-upload',
        'covers',
        `cover_${id}_${timestamp}`
      );
      if (!Array.isArray(result)) {
        await dispatch(updateUserCover({ id, coverUrl: result.url })).unwrap();
      }
    } catch (error) {
      console.error('Failed to update cover:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='alert alert-error'>
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className='btn btn-sm'>
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className='p-6'>
        <div className='alert alert-warning'>
          <span>User not found</span>
          <button
            onClick={() => navigate('/admin/user')}
            className='btn btn-sm'
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Update User</h1>
          <p className='text-gray-600'>Edit user information</p>
        </div>
        <div className='flex gap-2'>
          <button onClick={handleDelete} className='btn btn-error'>
            Delete User
          </button>
          <button
            onClick={() => navigate('/admin/user')}
            className='btn btn-outline'
          >
            Back to Users
          </button>
        </div>
      </div>

      {error && (
        <div className='alert alert-error mb-6'>
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className='btn btn-sm btn-ghost'
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className='bg-white rounded-lg shadow-lg overflow-hidden mb-6'>
        {/* Cover Photo */}
        <div className='relative h-48 bg-gradient-to-r from-blue-500 to-purple-600'>
          {currentUser.coverUrl && (
            <img
              src={currentUser.coverUrl}
              alt='Cover'
              className='w-full h-full object-cover'
            />
          )}
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = e => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleCoverUpdate(file);
              };
              input.click();
            }}
            className='absolute top-4 right-4 btn btn-sm btn-outline bg-white/20 backdrop-blur'
          >
            Change Cover
          </button>
        </div>

        {/* Profile Info */}
        <div className='relative px-6 pb-6'>
          <div className='flex items-start gap-6 -mt-8'>
            <div className='relative'>
              <div className='w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg'>
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-4xl font-bold text-gray-600'>
                    {currentUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleAvatarUpdate(file);
                  };
                  input.click();
                }}
                className='absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary'
              >
                📷
              </button>
            </div>
            <div className='flex-1 pt-10'>
              <h2 className='text-2xl font-bold'>{currentUser.fullName}</h2>
              <p className='text-gray-600'>@{currentUser.username}</p>
              <span
                className={`badge ${
                  currentUser.role === 'admin'
                    ? 'badge-error'
                    : currentUser.role === 'shop'
                      ? 'badge-warning'
                      : 'badge-info'
                } mt-2`}
              >
                {currentUser.role.toUpperCase()}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
            <div>
              <h3 className='font-semibold text-gray-700 mb-2'>
                Account Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <span className='text-sm text-gray-500'>Created</span>
                  <p className='font-medium'>
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>Last Updated</span>
                  <p className='font-medium'>
                    {new Date(currentUser.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h3 className='text-xl font-semibold mb-6'>Edit Information</h3>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='form-control w-full'>
              <label className='label'>
                <span className='label-text font-medium'>
                  Full Name <span className='text-red-500'>*</span>
                </span>
              </label>
              <input
                type='text'
                {...register('fullName')}
                className={`input input-bordered w-full focus:input-primary ${
                  errors.fullName ? 'input-error' : ''
                }`}
                placeholder='Enter full name'
              />
              {errors.fullName && (
                <label className='label'>
                  <span className='label-text-alt text-red-500'>
                    {errors.fullName.message}
                  </span>
                </label>
              )}
            </div>

            <div className='form-control w-full'>
              <label className='label'>
                <span className='label-text font-medium'>
                  Username <span className='text-red-500'>*</span>
                </span>
              </label>
              <input
                type='text'
                {...register('username')}
                className={`input input-bordered w-full focus:input-primary ${
                  errors.username ? 'input-error' : ''
                }`}
                placeholder='Enter username'
              />
              {errors.username && (
                <label className='label'>
                  <span className='label-text-alt text-red-500'>
                    {errors.username.message}
                  </span>
                </label>
              )}
            </div>

            <div className='form-control w-full'>
              <label className='label'>
                <span className='label-text font-medium'>
                  Email <span className='text-red-500'>*</span>
                </span>
              </label>
              <input
                type='email'
                {...register('email')}
                className={`input input-bordered w-full focus:input-primary ${
                  errors.email ? 'input-error' : ''
                }`}
                placeholder='Enter email address'
              />
              {errors.email && (
                <label className='label'>
                  <span className='label-text-alt text-red-500'>
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            <div className='form-control w-full'>
              <label className='label'>
                <span className='label-text font-medium'>
                  Phone Number <span className='text-red-500'>*</span>
                </span>
              </label>
              <input
                type='tel'
                {...register('phoneNumber')}
                className={`input input-bordered w-full focus:input-primary ${
                  errors.phoneNumber ? 'input-error' : ''
                }`}
                placeholder='Enter phone number'
              />
              {errors.phoneNumber && (
                <label className='label'>
                  <span className='label-text-alt text-red-500'>
                    {errors.phoneNumber.message}
                  </span>
                </label>
              )}
            </div>

            <div className='form-control w-full md:col-span-2'>
              <label className='label'>
                <span className='label-text font-medium'>
                  Role <span className='text-red-500'>*</span>
                </span>
              </label>
              <select
                {...register('role')}
                className={`select select-bordered w-full focus:select-primary ${
                  errors.role ? 'select-error' : ''
                }`}
              >
                <option value='customer'>Customer</option>
                <option value='shop'>Shop</option>
                <option value='admin'>Admin</option>
              </select>
              {errors.role && (
                <label className='label'>
                  <span className='label-text-alt text-red-500'>
                    {errors.role.message}
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className='flex gap-4 pt-6'>
            <button
              type='submit'
              disabled={loading || !isDirty}
              className='btn btn-primary'
            >
              {loading ? (
                <>
                  <span className='loading loading-spinner loading-sm'></span>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
            <button
              type='button'
              onClick={() => navigate('/admin/user')}
              className='btn btn-outline'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserUpdatePage;
