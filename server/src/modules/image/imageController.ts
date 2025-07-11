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
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { upload_preset, folder, public_id } = req.body;

    if (!upload_preset || !folder) {
      return res.status(400).json({
        error: 'upload_preset and folder are required'
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
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
    res.status(500).json({ error: 'Upload failed' });
  }
};

export { uploadImage };
