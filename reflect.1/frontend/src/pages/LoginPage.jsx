import { useState } from 'react';
import { loginUser } from '../api/auth';
import { LoginForm } from '../components/LoginForm';
import { Header } from '../components/Header';

export const LoginPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginUser(credentials.email, credentials.password);
      localStorage.setItem('token', response.data.token);
      onLoginSuccess(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <LoginForm onSubmit={handleLogin} />
        {loading && <p>Loading...</p>}
      </div>
    </>
  );
};
