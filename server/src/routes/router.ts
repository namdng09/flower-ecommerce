import { Router } from 'express';
import passport from 'passport';
import quizRoutes from '~/modules/quiz/quizRoute';
import authRoutes from '~/modules/auth/authRoute';

const router = Router();
// Non-auth routes
router.use('/auth', authRoutes);
// Auth routes
router.use(
  '/quizzes',
  passport.authenticate('jwt', { session: false }),
  quizRoutes
);

export default router;
