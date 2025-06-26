const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;

interface UploadResult {
  url: string;
  publicId: string;
}

const uploadSingleAsset = async ({
  asset,
  preset,
  folderPath
}: {
  asset: File;
  preset: string;
  folderPath: string;
}): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', asset);
  formData.append('upload_preset', preset);
  formData.append('folder', folderPath);
  formData.append('resource_type', 'auto');

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const uploadAssets = async (
  assets: File | File[],
  preset: string,
  folder: string
): Promise<UploadResult | UploadResult[]> => {
  if (Array.isArray(assets)) {
    const uploadPromises = assets.map(asset =>
      uploadSingleAsset({ asset, preset, folderPath: folder })
    );
    return Promise.all(uploadPromises);
  } else {
    return uploadSingleAsset({ asset: assets, preset, folderPath: folder });
  }
};

export default uploadAssets;
