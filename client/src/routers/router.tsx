import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import PrivateRoutes from '../components/privateRoutes';

const QuizLayout = lazy(() => import('../layouts/quizLayout'));

const router = createBrowserRouter([
  {
    Component: lazy(() => import('../layouts/mainLayout')),
    children: [
      {
        path: '',
        Component: lazy(() => import('../app/page'))
      }
    ]
  },
  {
    path: '/auth',
    Component: lazy(() => import('../layouts/mainLayout')),
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
      <PrivateRoutes allowedRoles={['customer']}>
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
  },
  {
    path: '/home',
    Component: lazy(() => import('../layouts/homepageLayout')),
    children: [
      {
        index: true,
        Component: lazy(() => import('../app/home/homepage/Homepage'))
      },
      {
        path: 'shop',
        Component: lazy(
          () => import('../app/home/homepage/productList/ProductList')
        )
      },
      {
        path: 'products',
        Component: lazy(
          () => import('../app/home/homepage/productList/ProductPage')
        )
      },
      {
        path: 'about',
        Component: lazy(() => import('../app/home/homepage/about-us/AboutC'))
      }
    ]
  }
]);

export default router;
