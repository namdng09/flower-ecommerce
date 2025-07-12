import axiosInstance from '~/config/axiosConfig';
const SERVER_UPLOAD_URL = `/api/images/upload`;

interface UploadResult {
  url: string;
  publicId: string;
}

const uploadSingleAsset = async ({
  asset,
  preset,
  folderPath,
  publicId
}: {
  asset: File;
  preset: string;
  folderPath: string;
  publicId?: string;
}): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', asset);
  formData.append('upload_preset', preset);
  formData.append('folder', folderPath);
  formData.append('resource_type', 'auto');

  if (publicId) {
    formData.append('public_id', publicId);
  }

  try {
    const response = await axiosInstance.post(SERVER_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status !== 200) {
      throw new Error('Upload failed');
    }

    const result = response.data.data;
    return {
      url: result.url,
      publicId: result.publicId
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const uploadAssets = async (
  assets: File | File[],
  preset: string,
  folder: string,
  publicId?: string
): Promise<UploadResult | UploadResult[]> => {
  if (Array.isArray(assets)) {
    const uploadPromises = assets.map((asset, index) =>
      uploadSingleAsset({
        asset,
        preset,
        folderPath: folder,
        publicId: publicId ? `${publicId}_${index}` : undefined
      })
    );
    return Promise.all(uploadPromises);
  } else {
    return uploadSingleAsset({
      asset: assets,
      preset,
      folderPath: folder,
      publicId
    });
  }
};

export default uploadAssets;
