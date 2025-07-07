import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { createUser, clearError } from '~/store/slices/userSlice';
import { userFormSchema, type UserFormData } from '~/types/user';
import { SuccessToast, ErrorToast } from '~/components/Toasts';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.users);

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      role: 'customer'
    }
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      setToastMessage('User created successfully!');
      setShowSuccessToast(true);
      reset();
    } catch (error) {
      setToastMessage('Failed to create user. Please try again.');
      setShowErrorToast(true);
      console.error('Failed to create user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/user');
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Create New User</h1>
        <p className='text-gray-600'>
          Fill in the form below to create a new user account
        </p>
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

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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

        <div className='form-control w-full'>
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

        <div className='flex gap-4 pt-6'>
          <button
            type='submit'
            disabled={loading}
            className='btn btn-primary flex-1'
          >
            {loading ? (
              <>
                <span className='loading loading-spinner loading-sm'></span>
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </button>
          <button
            type='button'
            onClick={handleCancel}
            className='btn btn-outline flex-1'
          >
            Cancel
          </button>
        </div>
      </form>

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-medium mb-2'>Note:</h3>
        <p className='text-sm text-gray-600'>
          A random password will be generated for this user. Make sure to notify
          the user about their login credentials after account creation.
        </p>
      </div>

      {/* Toast Notifications */}
      <SuccessToast
        message={toastMessage}
        show={showSuccessToast}
        setShow={setShowSuccessToast}
      />
      <ErrorToast
        message={toastMessage}
        show={showErrorToast}
        setShow={setShowErrorToast}
      />
    </div>
  );
};

export default CreateUserPage;
