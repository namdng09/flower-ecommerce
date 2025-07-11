import { Request, Response } from 'express';
import { uploadToCloudinary } from './imageService';
import { apiResponse } from '~/types/apiResponse';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

type MulterRequest = Request & {
  file?: MulterFile;
};

const uploadImage = async (req: MulterRequest, res: Response) => {
  try {
    const { upload_preset, folder, public_id } = req.body;

    const result = await uploadToCloudinary(
      req.file?.buffer,
      req.file?.originalname,
      req.file?.mimetype,
      upload_preset,
      folder,
      public_id
    );

    return res.status(200).json(
      apiResponse.success('Image uploaded successfully', {
        url: result.url,
        publicId: result.publicId
      })
    );
  } catch (error) {
    console.error('Upload error:', error);

    // Handle validation errors with appropriate status codes
    const errorMessage =
      error instanceof Error ? error.message : 'Upload failed';
    const statusCode =
      errorMessage.includes('required') ||
      errorMessage.includes('No file provided')
        ? 400
        : 500;

    res.status(statusCode).json({ error: errorMessage });
  }
};

export { uploadImage };
