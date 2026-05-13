import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import InventoryDashboard from './pages/InventoryDashboard';
import Usuarios from './pages/Usuarios';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/dashboard/*" element={<InventoryDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
