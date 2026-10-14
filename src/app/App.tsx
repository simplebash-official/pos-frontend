import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers';
import { router } from './router';
import { ROUTES } from '@/constants';
import { saveSuspension, setSuspensionHandler } from '@/features/account/lib/suspension';

// A refused (suspended) shop opens its page wherever the request came from.
setSuspensionHandler((suspension) => {
  saveSuspension(suspension);
  void router.navigate(ROUTES.SUSPENDED, { replace: true });
});

const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
