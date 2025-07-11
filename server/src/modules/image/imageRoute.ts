import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from './imageController';
import asyncHandler from '~/utils/asyncHandler';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload endpoint
router.post('/upload', upload.single('file'), asyncHandler(uploadImage));

export default router;
