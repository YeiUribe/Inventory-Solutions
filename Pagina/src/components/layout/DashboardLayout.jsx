import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut } from 'lucide-react';
import '../../styles/dashboard.css';

// Mapa de subruta → nombre visible en el header
const SECTION_NAMES = {
  inventory: 'Inventario',
  add: 'Agregar dispositivo',
  usuarios: 'Usuarios',
  history: 'Historial de cambios',
  reports: 'Reportes',
};

const DashboardLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 900);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener la última parte de la ruta: /dashboard/history → 'history'
  const segment = location.pathname.split('/').filter(Boolean).pop();
  const sectionName = SECTION_NAMES[segment] ?? 'Dashboard';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-gray)' }}>
      Cargando sesión...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
        <div style={styles.headerLeft}>

          <span style={styles.breadcrumbActive}>{sectionName}</span>
        </div>
        <div style={{ ...styles.headerRight, ...(isMobile ? styles.headerRightMobile : {}) }}>
          <button style={styles.iconBtn} aria-label="Notificaciones"><Bell size={18} /></button>
          <button style={styles.iconBtn} aria-label="Configuración"><Settings size={18} /></button>
          <div style={{ ...styles.userBadge, ...(isMobile ? styles.userBadgeMobile : {}) }}>
            <div style={styles.avatar}>{user.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <div>
              <div style={styles.userName}>{user.name}</div>
              {!isMobile && <div style={styles.userRole}>{user.role}</div>}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ ...styles.logoutBtn, ...(isMobile ? styles.logoutBtnMobile : {}) }}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="dashboard-container" style={{ flex: 1, height: 'auto' }}>
          <Sidebar />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  header: {
    height: '60px',
    background: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    zIndex: 50,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  breadcrumb: { color: 'var(--text-gray)' },
  sep: { color: 'var(--border-color)', fontWeight: 300 },
  breadcrumbActive: { color: 'var(--text-dark)', fontWeight: 600 },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerMobile: {
    height: 'auto',
    minHeight: '60px',
    padding: '0.75rem 1rem',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  headerRightMobile: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-gray)',
    transition: 'all 0.2s',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.75rem',
    background: 'var(--bg-color)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  userBadgeMobile: {
    padding: '0.35rem 0.55rem',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--primary-blue)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-dark)',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '0.72rem',
    color: 'var(--text-gray)',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#dc2626',
    transition: 'all 0.2s',
  },
  logoutBtnMobile: {
    width: '32px',
    height: '32px',
  },
};

export default DashboardLayout;

