import { useState } from 'react';
import uploadAssets from '~/utils/uploadAssets';
const Playground = () => {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [singleUploadResult, setSingleUploadResult] = useState<string | null>(
    null
  );
  const [multipleUploadResult, setMultipleUploadResult] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSingleFile(file);
    }
  };

  const handleMultipleFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setMultipleFiles(files);
  };

  const handleSingleUpload = async () => {
    if (!singleFile) return;

    setLoading(true);
    try {
      const result = await uploadAssets(
        singleFile,
        'simple-upload', // upload preset
        'test/single', // folder
        'single_image' // public id
      );
      setSingleUploadResult(Array.isArray(result) ? result[0].url : result.url);
    } catch (error) {
      console.error('Single upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleUpload = async () => {
    if (multipleFiles.length === 0) return;

    setLoading(true);
    try {
      const results = await uploadAssets(
        multipleFiles,
        'simple-upload', // upload preset
        'test/multiple', // folder
        'multi_image' // public id base
      );
      const urls = Array.isArray(results)
        ? results.map(result => result.url)
        : [results.url];
      setMultipleUploadResult(urls);
    } catch (error) {
      console.error('Multiple upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-8'>
      <div className='max-w-2xl w-full space-y-8'>
        <h1 className='text-3xl font-bold text-center mb-8'>
          Upload Assets Test
        </h1>

        {/* Single File Upload */}
        <div className='border rounded-lg p-6 space-y-4'>
          <h2 className='text-xl font-semibold'>Single File Upload</h2>
          <input
            type='file'
            accept='image/*'
            onChange={handleSingleFileChange}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
          <button
            onClick={handleSingleUpload}
            disabled={!singleFile || loading}
            className='bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          >
            {loading ? 'Uploading...' : 'Upload Single Image'}
          </button>
          {singleUploadResult && (
            <div className='mt-4'>
              <p className='text-green-600'>Upload successful!</p>
              <p className='text-sm text-gray-600 break-all'>
                URL: {singleUploadResult}
              </p>
              <img
                src={singleUploadResult}
                alt='Uploaded'
                className='mt-2 max-w-xs rounded'
              />
            </div>
          )}
        </div>

        {/* Multiple Files Upload */}
        <div className='border rounded-lg p-6 space-y-4'>
          <h2 className='text-xl font-semibold'>Multiple Files Upload</h2>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleMultipleFilesChange}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100'
          />
          <p className='text-sm text-gray-600'>
            Selected: {multipleFiles.length} files
          </p>
          <button
            onClick={handleMultipleUpload}
            disabled={multipleFiles.length === 0 || loading}
            className='bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          >
            {loading ? 'Uploading...' : 'Upload Multiple Images'}
          </button>
          {multipleUploadResult.length > 0 && (
            <div className='mt-4'>
              <p className='text-green-600'>Upload successful!</p>
              <p className='text-sm text-gray-600'>
                Uploaded {multipleUploadResult.length} images:
              </p>
              <div className='grid grid-cols-2 gap-2 mt-2'>
                {multipleUploadResult.map((url, index) => (
                  <div key={index} className='space-y-1'>
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className='max-w-full rounded'
                    />
                    <p className='text-xs text-gray-500 break-all'>{url}</p>
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

export default Playground;
