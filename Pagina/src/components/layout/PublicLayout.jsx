import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PublicLayout — Layout reutilizable para páginas públicas (Landing, Login)
 * Incluye Navbar en la parte superior y Footer en la inferior
 */
const PublicLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
