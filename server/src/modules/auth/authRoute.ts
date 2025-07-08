import express, { Router } from 'express';
import passport from 'passport';
import auth from './authController';
import asyncHandler from '~/utils/asyncHandler';

const router: Router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  asyncHandler(auth.loginWithGoogle)
);

router.get(
  '/google-dashbroad',
  passport.authenticate('google-dashbroad', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google-dashbroad/callback',
  passport.authenticate('google-dashbroad', {
    session: false,
    failureRedirect: '/login'
  }),
  asyncHandler(auth.loginDashbroadWithGoogle)
);

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/refresh-token', asyncHandler(auth.refreshToken));
router.post('/reset-password', asyncHandler(auth.resetPassword));
router.post('/logout', asyncHandler(auth.logout));

export default router as Router;
