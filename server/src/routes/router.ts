import { Router } from 'express';
import passport from 'passport';
import authRoutes from '~/modules/auth/authRoute';
import productRoute from '~/modules/product/productRoute';
import categoryRoute from '~/modules/category/categoryRoute';
import addressRoute from '~/modules/address/addressRoute';
import variantRoute from '~/modules/variant/variantRoute';
import userRoute from '~/modules/user/userRoute';

const router = Router();
// Non-auth routes
router.use('/auth', authRoutes);

// Auth routes

router.use('/products', productRoute);

router.use('/categories', categoryRoute);

router.use(
  '/addresses',
  passport.authenticate('jwt', { session: false }),
  addressRoute
);

router.use('/users', userRoute);

router.use('/variants', variantRoute);

export default router;
