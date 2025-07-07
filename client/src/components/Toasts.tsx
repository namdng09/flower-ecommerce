interface ToastProps {
  message: string;
  show: boolean;
  setShow: (show: boolean) => void;
}

export const SuccessToast = ({ message, show, setShow }: ToastProps) => {
  if (!show) return null;

  return (
    <div className='toast toast-top toast-end z-50'>
      <div className='alert alert-success'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='stroke-current shrink-0 h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <span>{message}</span>
        <button
          className='btn btn-sm btn-circle btn-ghost'
          onClick={() => setShow(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const ErrorToast = ({ message, show, setShow }: ToastProps) => {
  if (!show) return null;

  return (
    <div className='toast toast-top toast-end z-50'>
      <div className='alert alert-error'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='stroke-current shrink-0 h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <span>{message}</span>
        <button
          className='btn btn-sm btn-circle btn-ghost'
          onClick={() => setShow(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
