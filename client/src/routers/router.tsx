import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
// import PrivateRoutes from '../components/privateRoutes';

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
      },
      {
        path: 'reset-password',
        Component: lazy(() => import('../app/auth/reset-password/page'))
      }
    ]
  },
  {
    path: '/home',
    Component: lazy(() => import('../layouts/homepageLayout')),
    children: [
      {
        index: true,
        Component: lazy(() => import('../app/home/page'))
      },
      {
        path: 'shop',
        Component: lazy(() => import('../app/home/shop/page'))
      },
      {
        path: 'products/:id',
        Component: lazy(() => import('../app/home/products/[id]/page'))
      },
      {
        path: 'about',
        Component: lazy(() => import('../app/home/about/page'))
      },
      {
        path: 'checkout',
        Component: lazy(() => import('../app/home/checkout/page'))
      },
      {
        path: 'profile/:id',
        Component: lazy(() => import('../app/home/profile/[id]/page'))
      }
    ]
  }
]);

export default router;
