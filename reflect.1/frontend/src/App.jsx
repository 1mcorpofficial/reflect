import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { router } from './router';

function App() {
  const { hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return <RouterProvider router={router} />;
}

export default App;

