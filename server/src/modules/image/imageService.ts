interface UploadResult {
  url: string;
  publicId: string;
}

const uploadToCloudinary = async (
  fileBuffer?: Buffer,
  fileName?: string,
  mimeType?: string,
  uploadPreset?: string,
  folder?: string,
  publicId?: string
): Promise<UploadResult> => {
  try {
    // Validate parameters
    if (!fileBuffer) {
      throw new Error('No file provided');
    }

    if (!uploadPreset || !folder) {
      throw new Error('upload_preset and folder are required');
    }

    if (!fileName || !mimeType) {
      throw new Error('fileName and mimeType are required');
    }

    const formData = new FormData();

    const file = new Blob([fileBuffer], {
      type: mimeType
    });
    formData.append('file', file, fileName);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
    formData.append('resource_type', 'auto');

    if (publicId) {
      formData.append('public_id', publicId);
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new Error('Cloudinary URL not configured');
    }

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export { uploadToCloudinary };
