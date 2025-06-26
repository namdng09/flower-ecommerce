import { Router } from 'express';
import passport from 'passport';
import authRoutes from '~/modules/auth/authRoute';
import productRoute from '~/modules/product/productRoute';
import categoryRoute from '~/modules/category/categoryRoute';
import addressRoute from '~/modules/address/addressRoute';
import variantRoute from '~/modules/variant/variantRoute';
import userRoute from '~/modules/user/userRoute';
import reviewRoute from '~/modules/review/reviewRoute';
import cartRoute from '~/modules/cart/cartRoute';
import favouriteRoute from '~/modules/favourite/favouriteRoute';
import { authorize } from '~/middleware/authorize';
import jwtAuth from '~/middleware/jwtAuth';

const router = Router();
// Non-auth routes
router.use('/auth', authRoutes);

// Auth routes

router.use('/products', productRoute);

router.use('/categories', categoryRoute);

router.use('/addresses', jwtAuth, addressRoute);

router.use('/users', userRoute);

router.use('/variants', variantRoute);

router.use('/reviews', reviewRoute);

router.use('/favourites', favouriteRoute);

router.use('/carts', cartRoute);

export default router;
