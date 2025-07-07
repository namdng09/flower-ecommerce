interface ConfirmModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal = ({
  show,
  setShow,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    setShow(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className='modal modal-open'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>{title}</h3>
        <div className='alert mt-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            className='stroke-current shrink-0 w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span>{message}</span>
        </div>
        <div className='modal-action'>
          <button className='btn btn-ghost' onClick={handleCancel}>
            {cancelText}
          </button>
          <button className='btn btn-primary' onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
