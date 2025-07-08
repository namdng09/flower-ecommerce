import express, { Router } from 'express';
import auth from './authController';
import asyncHandler from '~/utils/asyncHandler';

const router: Router = express.Router();

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/refresh-token', asyncHandler(auth.refreshToken));
router.post('/request-reset-password', asyncHandler(auth.requestResetPassword));
router.post('/logout', asyncHandler(auth.logout));

export default router as Router;
