import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
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
    Component: lazy(() => import('../layouts/mainLayout')),
    children: [
      {
        path: '/login',
        Component: lazy(() => import('../app/auth/login/page'))
      },
      {
        path: '/register',
        Component: lazy(() => import('../app/auth/register/page'))
      }
    ]
  },
  {
    path: '/quizzes',
    Component: lazy(() => import('../layouts/mainLayout')),
    children: [
      {
        path: '/',
        Component: lazy(() => import('../app/quizzes/page'))
      }
    ]
  }
]);

export default router;
