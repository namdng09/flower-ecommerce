import { useForm } from 'react-hook-form';
import { type LoginFormFields, loginSchema } from '~/types/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { AuthContext } from '~/contexts/authContext';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormFields) => {
    try {
      await login(data);
      alert('Login successful! Redirecting to dashboard...');
      reset();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: Error | unknown) {
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div>
      <form className='flex flex-col gap-3' onSubmit={handleSubmit(onSubmit)}>
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
          <label className='label cursor-pointer'>
            <input
              type='checkbox'
              className='checkbox checkbox-primary'
              {...register('rememberMe')}
            />
            <span className='label-text'>Remember me</span>
          </label>
        </div>
        <button className='btn btn-primary w-full' type='submit'>
          {isSubmitting ? 'Login...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
