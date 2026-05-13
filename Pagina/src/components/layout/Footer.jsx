import React from 'react';

/**
 * Footer — Barra compacta reutilizable para todas las páginas
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <span>© {year} Inventory Solutions · PPI — Tecnológico de Antioquia</span>
      <span style={styles.sep}>·</span>
      <span>Ingeniería en Software</span>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#21323f',
    color: '#8a9bac',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.5rem',
    flexShrink: 0,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  sep: {
    color: 'rgba(255,255,255,0.2)',
  },
};

export default Footer;
