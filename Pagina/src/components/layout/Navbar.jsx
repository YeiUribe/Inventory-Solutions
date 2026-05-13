import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navbar — Componente reutilizable para páginas públicas
 * Muestra logo, navegación y acciones según estado de sesión
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Logo */}
        <NavLink to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <Package size={20} color="white" />
          </div>
          <span style={styles.logoText}>Inventory Solutions</span>
        </NavLink>

        {/* Nav desktop */}
        <nav style={{ ...styles.nav, ...(isMobile ? styles.navHidden : {}) }}>
          <NavLink to="/" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
            Inicio
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
              >
                Dashboard
              </NavLink>
              <span style={styles.userName}>Hola, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} style={styles.btnOutline}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={styles.btnPrimary}>
              Iniciar sesión
            </button>
          )}
        </nav>

        {/* Hamburger mobile */}
        <button
          style={{ ...styles.hamburger, ...(isMobile ? styles.hamburgerVisible : {}) }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          <NavLink to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLinkBtn}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Iniciar sesión</NavLink>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none',
    color: 'var(--text-dark)',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--primary-blue)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-dark)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navHidden: {
    display: 'none',
  },
  link: {
    textDecoration: 'none',
    color: 'var(--text-gray)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  linkActive: {
    color: 'var(--primary-blue)',
  },
  userName: {
    fontSize: '0.875rem',
    color: 'var(--text-gray)',
    fontWeight: 500,
  },
  btnPrimary: {
    background: 'var(--primary-blue)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.2rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnOutline: {
    background: 'transparent',
    color: 'var(--primary-blue)',
    border: '1.5px solid var(--primary-blue)',
    borderRadius: '8px',
    padding: '0.5rem 1.1rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-dark)',
    padding: '0.25rem',
  },
  hamburgerVisible: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    gap: '0.75rem',
    background: 'white',
  },
  mobileLink: {
    textDecoration: 'none',
    color: 'var(--text-dark)',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  mobileLinkBtn: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    color: '#dc2626',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: 0,
  },
};

export default Navbar;
