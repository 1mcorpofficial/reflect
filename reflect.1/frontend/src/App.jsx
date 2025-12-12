import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, token, login, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const handleLoginSuccess = (userData, authToken) => {
    login(userData, authToken);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <HomePage />;
}

export default App;
