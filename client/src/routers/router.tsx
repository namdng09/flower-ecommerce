import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import PrivateRoutes from '../components/privateRoutes';

const QuizLayout = lazy(() => import('../layouts/quizLayout'));

const router = createBrowserRouter([
  {
    Component: lazy(() => import('../layouts/mainLayout')),
    children: [
      {
        path: '/',
        Component: lazy(() => import('../app/page'))
      }
    ]
  },
  {
    path: '/auth',
    children: [
      {
        path: 'register',
        Component: lazy(() => import('../app/auth/register/page'))
      },
      {
        path: 'login',
        Component: lazy(() => import('../app/auth/login/page'))
      }
    ]
  },
  {
    path: '/quizzes',
    Component: () => (
      <PrivateRoutes role='customer'>
        <Suspense fallback={<div>Loading layout...</div>}>
          <QuizLayout />
        </Suspense>
      </PrivateRoutes>
    ),
    children: [
      {
        path: '',
        Component: lazy(() => import('../app/quizzes/page'))
      }
    ]
  }
]);

export default router;
