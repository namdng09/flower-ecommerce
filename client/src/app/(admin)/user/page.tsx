import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import {
  fetchUsers,
  deleteUser,
  setFilters,
  clearError
} from '~/store/slices/userSlice';
import { Link, useSearchParams } from 'react-router';
import DynamicTable from '~/components/DynamicTable';
import Pagination from '~/components/Pagination';
import { ConfirmModal } from '~/components/ConfirmModal';
import { SuccessToast, ErrorToast } from '~/components/Toasts';
import type { User } from '~/types/user';

const filterSchema = z.object({
  search: z.string(),
  role: z.string(),
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc'])
});

type FilterFormData = z.infer<typeof filterSchema>;

const UserPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, loading, error, totalPages, currentPage, totalUsers } =
    useAppSelector(state => state.users);

  const [page, setPage] = useState(() =>
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [limit, setLimit] = useState(() =>
    parseInt(searchParams.get('limit') || '2', 10)
  );

  // Modal and Toast states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        search: searchParams.get('search') || '',
        role: searchParams.get('role') || '',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
      }
    });

  const updateURLParams = (
    filters: FilterFormData,
    currentPage: number,
    currentLimit: number
  ) => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.role) params.set('role', filters.role);
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc')
      params.set('sortOrder', filters.sortOrder);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    params.set('limit', currentLimit.toString());

    setSearchParams(params);
  };

  useEffect(() => {
    setValue('search', searchParams.get('search') || '');
    setValue('role', searchParams.get('role') || '');
    setValue('sortBy', searchParams.get('sortBy') || 'createdAt');
    setValue(
      'sortOrder',
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );

    setPage(parseInt(searchParams.get('page') || '1', 10));
    setLimit(parseInt(searchParams.get('limit') || '10', 10));
  }, [searchParams, setValue]);

  useEffect(() => {
    const currentFilters = watch();
    const filters = {
      ...currentFilters,
      page,
      limit
    };
    dispatch(setFilters(filters));
    dispatch(fetchUsers(filters));
  }, [searchParams, dispatch, page, limit, watch]);

  const onSubmit = (data: FilterFormData) => {
    setPage(1); // Reset to first page when applying filters
    updateURLParams(data, 1, limit);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      role: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    reset(resetFilters);
    setPage(1);
    updateURLParams(resetFilters, 1, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const currentFilters = watch();
    updateURLParams(currentFilters, newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    const currentFilters = watch();
    updateURLParams(currentFilters, 1, newLimit);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      setToastMessage(
        `User "${userToDelete.fullName}" has been deleted successfully`
      );
      setShowSuccessToast(true);

      const currentFilters = watch();
      const filters = {
        ...currentFilters,
        page,
        limit
      };
      dispatch(fetchUsers(filters));
    } catch (error) {
      setToastMessage('Failed to delete user. Please try again.');
      setShowErrorToast(true);
      console.error('Failed to delete user:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: 'avatarUrl' as keyof User,
      header: 'Avatar',
      render: (value: string, row: User) => (
        <div className='avatar'>
          <div className='w-12 h-12 rounded-full'>
            {value ? (
              <img src={value} alt={row.fullName} className='rounded-full' />
            ) : (
              <div className='bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center'>
                <span className='text-gray-600 text-sm font-medium'>
                  {row.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'fullName' as keyof User,
      header: 'Full Name'
    },
    {
      accessorKey: 'username' as keyof User,
      header: 'Username'
    },
    {
      accessorKey: 'email' as keyof User,
      header: 'Email'
    },
    {
      accessorKey: 'phoneNumber' as keyof User,
      header: 'Phone'
    },
    {
      accessorKey: 'role' as keyof User,
      header: 'Role',
      render: (value: string) => (
        <span
          className={`badge ${
            value === 'admin'
              ? 'badge-error'
              : value === 'shop'
                ? 'badge-warning'
                : 'badge-info'
          }`}
        >
          {value}
        </span>
      )
    },
    {
      accessorKey: 'createdAt' as keyof User,
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      accessorKey: '_id' as keyof User,
      header: 'Actions',
      render: (_: string, row: User) => (
        <div className='flex gap-2'>
          <Link
            to={`/admin/user/${row._id}`}
            className='btn btn-sm btn-outline btn-info'
          >
            View
          </Link>
          <Link
            to={`/admin/user/${row._id}?edit=true`}
            className='btn btn-sm btn-outline btn-warning'
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row)}
            className='btn btn-sm btn-outline btn-error'
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className='alert alert-error'>
        <span>{error}</span>
        <button onClick={() => dispatch(clearError())} className='btn btn-sm'>
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>User Management</h1>
          <p className='text-gray-600 mt-2'>
            Total: {totalUsers} users | Page {currentPage} of {totalPages}
          </p>
        </div>
        <Link to='/admin/user/create' className='btn btn-primary'>
          Add New User
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Search</span>
            </label>
            <input
              type='text'
              placeholder='Search by name, email, username...'
              className='input input-bordered'
              {...register('search')}
            />
          </div>

          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Role</span>
            </label>
            <select className='select select-bordered' {...register('role')}>
              <option value=''>All Roles</option>
              <option value='admin'>Admin</option>
              <option value='shop'>Shop</option>
              <option value='customer'>Customer</option>
            </select>
          </div>

          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Sort By</span>
            </label>
            <select className='select select-bordered' {...register('sortBy')}>
              <option value='createdAt'>Created Date</option>
              <option value='fullName'>Full Name</option>
              <option value='email'>Email</option>
              <option value='role'>Role</option>
            </select>
          </div>

          <div className='form-control'>
            <label className='label'>
              <span className='label-text'>Order</span>
            </label>
            <select
              className='select select-bordered'
              {...register('sortOrder')}
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </div>
        </div>

        <div className='flex gap-4 mb-6'>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            Apply Filters
          </button>
          <button
            type='button'
            onClick={handleResetFilters}
            className='btn btn-outline'
            disabled={loading}
          >
            Reset Filters
          </button>
        </div>
      </form>

      {loading && (
        <div className='flex justify-center my-8'>
          <span className='loading loading-spinner loading-lg'></span>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <DynamicTable data={users} columns={columns} />
          <div className='flex justify-center mt-6'>
            <Pagination
              page={currentPage}
              setPage={handlePageChange}
              totalPages={totalPages}
              limit={limit}
              setLimit={handleLimitChange}
              totalItems={totalUsers}
            />
          </div>
        </>
      )}

      {!loading && users.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>No users found</p>
          <Link to='/admin/user/create' className='btn btn-primary mt-4'>
            Create First User
          </Link>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        title='Delete User'
        message={
          userToDelete
            ? `Are you sure you want to delete "${userToDelete.fullName}"? This action cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        confirmText='Delete'
        cancelText='Cancel'
      />

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

export default UserPage;
