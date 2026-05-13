import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PublicLayout from '../components/layout/PublicLayout';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor llena ambos campos.');
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <PublicLayout>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f2f5 0%, #e6eff7 100%)', padding: '1rem' }}>
      <Card style={{ width: 'min(400px, 100%)', padding: 'clamp(1.25rem, 3.5vw, 2.5rem) clamp(1rem, 3vw, 2rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1rem' }}>
            <Package size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Iniciar Sesión</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>Accede al sistema Inventory Solutions</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input 
            label="Usuario" 
            placeholder="Ej. joquendo, yuribe, jpacheco..." 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="Clave (123)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.5rem' }}>
              {error}
            </div>
          )}

          <Button type="submit" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={isLoading}>
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
          <p>Ingresa con tu usuario de aplicación o con tu cédula.</p>
        </div>
      </Card>
    </div>
    </PublicLayout>
  );
};

export default Login;
