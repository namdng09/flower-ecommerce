import { RouterProvider } from 'react-router';
import router from './routers/router';

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
