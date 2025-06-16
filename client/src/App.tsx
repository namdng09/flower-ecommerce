import { RouterProvider } from 'react-router';
import router from './routers/router';
import ContextWrapper from './components/contextWrapper';

const App = () => {
  return (
    <ContextWrapper>
      <RouterProvider router={router} />
    </ContextWrapper>
  );
};

export default App;
