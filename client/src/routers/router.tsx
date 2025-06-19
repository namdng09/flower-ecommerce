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
      },
      {
        path: 'cart',
        Component: lazy(() => import('../app/home/homepage/Cart/CartDetails'))
      },
      {
        path: 'checkout',
        Component: lazy(
          () => import('../app/home/homepage/check-out/CheckoutPage')
        )
      },
      {
        path: 'profile/:id',
        Component: lazy(
          () => import('../app/home/homepage/profile/ProfileC')
        )
      }
    ]
  }
]);

export default router;
