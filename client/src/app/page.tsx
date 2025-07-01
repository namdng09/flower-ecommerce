import uploadAssets from '~/utils/uploadAssets';

const LandingPage = () => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const preset = 'simple-upload';

    const thumbnailImage = formData.get('thumbnailImage') as File;
    const images = formData.getAll('image') as File[];

    const thumbnailImageFolder = 'Products/BHP001/Thumbnail';
    const imageFolder = 'Products/BHP001/Image';

    try {
      const resultThumbnailImage = await uploadAssets(
        thumbnailImage,
        preset,
        thumbnailImageFolder
      );
      console.log('Upload successful:', resultThumbnailImage);

      const resultImages = await uploadAssets(images, preset, imageFolder);
      console.log('Upload successful:', resultImages);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Upload Images
          </h1>
          <p className='text-gray-600'>
            Upload your product images and thumbnail
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='card w-full bg-white shadow-2xl border-0'
        >
          <div className='card-body p-8 space-y-6'>
            {/* Multiple Images Upload */}
            <div className='form-control'>
              <label className='label pb-2'>
                <span className='label-text text-base font-semibold text-gray-700'>
                  Product Images
                </span>
                <span className='label-text-alt text-sm text-gray-500'>
                  Multiple files allowed
                </span>
              </label>
              <input
                type='file'
                id='images'
                name='image'
                accept='image/*'
                multiple
                className='file-input file-input-bordered file-input-primary w-full focus:file-input-primary'
              />
              <label className='label pt-1'>
                <span className='label-text-alt text-xs text-gray-500'>
                  Select multiple images for your product gallery
                </span>
              </label>
            </div>

            {/* Divider */}
            <div className='divider my-4'>
              <span className='text-gray-400 text-sm'>AND</span>
            </div>

            {/* Thumbnail Image Upload */}
            <div className='form-control'>
              <label className='label pb-2'>
                <span className='label-text text-base font-semibold text-gray-700'>
                  Thumbnail Image
                </span>
                <span className='label-text-alt text-sm text-gray-500'>
                  Single file only
                </span>
              </label>
              <input
                type='file'
                id='thumbnailImage'
                name='thumbnailImage'
                accept='image/*'
                className='file-input file-input-bordered file-input-secondary w-full focus:file-input-secondary'
              />
              <label className='label pt-1'>
                <span className='label-text-alt text-xs text-gray-500'>
                  This will be the main image displayed
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className='form-control mt-8'>
              <button
                type='submit'
                className='btn btn-primary btn-lg w-full text-white font-semibold hover:btn-primary-focus transition-all duration-200 transform hover:scale-[1.02]'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                  />
                </svg>
                Upload Images
              </button>
            </div>
          </div>
        </form>

        {/* Additional Info */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-500'>
            Supported formats: JPG, PNG, GIF • Max size: 10MB per file
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
