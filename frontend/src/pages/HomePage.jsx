import { Header } from '../components/Header';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div style={{ padding: '2rem' }}>
        <h2>Welcome {user?.name || 'User'}</h2>
        <p>Role: {user?.role}</p>
        {/* More content to come */}
      </div>
    </>
  );
};
