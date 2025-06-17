import { useForm } from 'react-hook-form';
import { type RegisterFormFields, registerSchema } from '~/types/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { AuthContext } from '~/contexts/authContext';

const RegisterForm = () => {
  const { signUp } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterFormFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer'
    }
  });

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await signUp(data);
      alert(
        'Registration successful! Please check your email to verify your account.'
      );
      reset();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: Error | unknown) {
      alert('Registration failed. Please try again later.');
    }
  };

  return (
    <div>
      <form className='flex flex-col gap-3' onSubmit={handleSubmit(onSubmit)}>
        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Fullname</span>
          </label>
          <input
            type='text'
            placeholder='Fullname'
            {...register('fullName')}
            className={`input w-full ${errors.fullName ? 'input-error' : ''}`}
          />
          {errors.fullName && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.fullName.message}
              </span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Username</span>
          </label>
          <input
            type='text'
            placeholder='Username'
            {...register('username')}
            className={`input w-full ${errors.username ? 'input-error' : ''}`}
          />
          {errors.username && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.username.message}
              </span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Email</span>
          </label>
          <input
            type='email'
            placeholder='Email'
            {...register('email')}
            className={`input w-full ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.email.message}
              </span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Phone</span>
          </label>
          <input
            type='text'
            placeholder='Phone number'
            {...register('phoneNumber')}
            className={`input w-full ${errors.phoneNumber ? 'input-error' : ''}`}
          />
          {errors.phoneNumber && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.phoneNumber.message}
              </span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Password</span>
          </label>
          <input
            type='password'
            placeholder='Password'
            {...register('password')}
            className={`input w-full ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.password.message}
              </span>
            </label>
          )}
        </div>

        <div className='form-control w-full'>
          <label className='label'>
            <span className='label-text'>Confirm Password</span>
          </label>
          <input
            type='password'
            placeholder='Confirm Password'
            {...register('confirmPassword')}
            className={`input w-full ${errors.confirmPassword ? 'input-error' : ''}`}
          />
          {errors.confirmPassword && (
            <label className='label'>
              <span className='label-text-alt text-error'>
                {errors.confirmPassword.message}
              </span>
            </label>
          )}
        </div>

        <button className='btn btn-primary w-full' type='submit'>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
