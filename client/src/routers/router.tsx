import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import PrivateRoutes from '../components/privateRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/home' replace />
  },
  {
    path: '/playground',
    Component: lazy(() => import('../layouts/homepageLayout')),
    children: [
      {
        index: true,
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
      },
      {
        path: 'change-password',
        Component: lazy(() => import('../app/auth/change-password/page'))
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
        path: 'privacy',
        Component: lazy(() => import('../app/home/privacy/page'))
      },
      {
        path: 'profile/:id',
        Component: lazy(() => import('../app/home/profile/[id]/page'))
      },
      {
        path: 'cart',
        Component: lazy(() => import('../app/home/cart/page'))
      },
      {
        path: 'order',
        Component: lazy(() => import('../app/home/order/page'))
      },
      {
        path: 'order-success/:orderId',
        Component: lazy(
          () => import('../app/home/order-success/[orderId]/page')
        )
      },
      {
        path: 'order-tracking/:orderId',
        Component: lazy(
          () => import('../app/home/order-tracking/[orderId]/page')
        )
      },
      {
        path: 'order-fail',
        Component: lazy(() => import('../app/home/order-fail/page'))
      },
      {
        path: 'shop-profile/:shopId',
        Component: lazy(() => import('../app/home/shopProfile/[shopId]/page'))
      },
      {
        path: 'order-tracking-detail',
        Component: lazy(() => import('../app/home/order-tracking-detail/page'))
      }
    ]
  },
  {
    path: '/admin',
    Component: lazy(() => import('../layouts/adminLayout')),
    children: [
      {
        index: true,
        Component: lazy(() => import('../app/(admin)/dashboard/page'))
      },
      {
        path: 'login',
        Component: lazy(() => import('../app/(admin)/login/page'))
      },
      {
        path: 'dashboard',
        Component: lazy(() => import('../app/(admin)/dashboard/page'))
      },
      {
        path: 'category',
        Component: lazy(() => import('../app/(admin)/category/page'))
      },
      {
        path: 'category/:id',
        Component: lazy(() => import('../app/(admin)/category/[id]/page'))
      },
      {
        path: 'order',
        Component: lazy(() => import('../app/(admin)/order/page'))
      },
      {
        path: 'order/:id',
        Component: lazy(() => import('../app/(admin)/order/[id]/page'))
      },
      {
        path: 'product',
        Component: lazy(() => import('../app/(admin)/product/page'))
      },
      {
        path: 'product/:id',
        Component: lazy(() => import('../app/(admin)/product/[id]/page'))
      },
      {
        path: 'product/create',
        Component: lazy(() => import('../app/(admin)/product/create/page'))
      },
      {
        path: 'review',
        Component: lazy(() => import('../app/(admin)/review/page'))
      },
      {
        path: 'user',
        Component: lazy(() => import('../app/(admin)/user/page'))
      },
      {
        path: 'user/create',
        Component: lazy(() => import('../app/(admin)/user/create/page'))
      },
      {
        path: 'user/:id',
        Component: lazy(() => import('../app/(admin)/user/[id]/page'))
      }
    ]
  },
  {
    path: '/shop',
    Component: lazy(() => import('../layouts/shopLayout')),
    children: [
      {
        index: true,
        Component: lazy(() => import('../app/(shop)/dashboard/page'))
      },
      {
        path: 'login',
        Component: lazy(() => import('../app/(shop)/login/page'))
      },
      {
        path: 'register',
        Component: lazy(() => import('../app/(shop)/register/page'))
      },
      {
        path: 'dashboard',
        Component: lazy(() => import('../app/(shop)/dashboard/page'))
      },
      {
        path: 'order',
        Component: lazy(() => import('../app/(shop)/order/page'))
      },
      {
        path: 'order/:id',
        Component: lazy(() => import('../app/(shop)/order/[id]/page'))
      },
      {
        path: 'product',
        Component: lazy(() => import('../app/(shop)/product/page'))
      },
      {
        path: 'product/:id',
        Component: lazy(() => import('../app/(shop)/product/[id]/page'))
      },
      {
        path: 'product/create',
        Component: lazy(() => import('../app/(shop)/product/create/page'))
      },
      {
        path: 'product/update/:id',
        Component: lazy(() => import('../app/(shop)/product/update/page'))
      }
    ]
  }
]);

export default router;
