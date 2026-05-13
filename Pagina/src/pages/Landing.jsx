import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Database, FileText } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import '../styles/landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const problemaRef = useRef(null);
  const funcionalidadesRef = useRef(null);
  const contactoRef = useRef(null);
  const mensajeDinamicoRef = useRef(null);

  // Scroll suave a secciones
  const scrollToSection = (ref) => {
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Función: mensaje dinámico con variables (requisito JavaScript)
  const mostrarMensajeDinamico = () => {
    const nombreSistema = 'Inventory Solutions';
    const version = '1.0';
    const fecha = new Date().toLocaleDateString('es-CO');
    const mensaje = `Bienvenido a ${nombreSistema} v${version}. Fecha: ${fecha}. ¡Gracias por su interés!`;

    if (mensajeDinamicoRef.current) {
      mensajeDinamicoRef.current.textContent = mensaje;
      mensajeDinamicoRef.current.classList.add('form-success');
      mensajeDinamicoRef.current.style.display = 'block';
    }
  };

  // Validación simple del formulario de contacto
  const handleContactoSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const nombre = form.nombre?.value?.trim();
    const email = form.email?.value?.trim();
    const mensaje = form.mensaje?.value?.trim();

    const errorEl = document.getElementById('contacto-error');
    const successEl = document.getElementById('contacto-success');

    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.style.display = 'none';

    if (!nombre || !email || !mensaje) {
      if (errorEl) errorEl.textContent = 'Por favor completa todos los campos.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorEl) errorEl.textContent = 'Ingresa un email válido.';
      return;
    }

    // Éxito
    if (successEl) {
      successEl.textContent = '¡Mensaje enviado correctamente! Te contactaremos pronto.';
      successEl.style.display = 'block';
    }
    form.reset();
  };

  useEffect(() => {
    const btnDinamico = document.getElementById('btn-mensaje-dinamico');
    if (btnDinamico) {
      btnDinamico.addEventListener('click', mostrarMensajeDinamico);
      return () => btnDinamico.removeEventListener('click', mostrarMensajeDinamico);
    }
  }, []);

  return (
    <PublicLayout>
    <div className="landing-page">
      <section className="landing-hero" id="inicio">
        <span className="landing-hero-badge">Proyecto Pedagógico Integrador (PPI)</span>
        <h1>
          Gestión Inteligente de <span className="accent">Recursos Tecnológicos</span>
        </h1>
        <p className="landing-hero-desc">
          Optimiza la productividad de tu empresa con un sistema centralizado que elimina errores manuales y garantiza trazabilidad total del inventario tecnológico.
        </p>
        <button type="button" className="landing-hero-btn" onClick={() => navigate('/login')}>
          Iniciar sesión
        </button>
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" id="btn-mensaje-dinamico" className="landing-btn-outline">
            Ver mensaje dinámico
          </button>
          <div ref={mensajeDinamicoRef} className="form-success" style={{ display: 'none', maxWidth: '400px' }} />
        </div>
      </section>

      <section className="landing-section landing-problema" ref={problemaRef} id="problema">
        <h2 className="landing-section-title">¿Qué problema resolvemos?</h2>
        <p className="landing-section-subtitle">
          La gestión manual de inventario genera ineficiencias que impactan a organizaciones de todos los tamaños.
        </p>
        <div className="landing-problema-grid">
          <div className="landing-problema-card">
            <h3>Problema central</h3>
            <p>
              La gestión de recursos tecnológicos se realiza de manera manual o mediante hojas de cálculo dispersas, generando duplicidad de datos, errores humanos y falta de trazabilidad.
            </p>
          </div>
          <div className="landing-problema-card">
            <h3>¿A quién va dirigido?</h3>
            <p>
              A pequeñas y medianas empresas del sector de servicios informáticos, administradores de sistemas, jefes de TI y gerentes que necesitan control centralizado de hardware, software y licencias.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section" ref={funcionalidadesRef} id="funcionalidades">
        <h2 className="landing-section-title">Funcionalidades</h2>
        <p className="landing-section-subtitle">
          Un sistema completo para gestionar tu inventario tecnológico de forma profesional.
        </p>
        <div className="landing-funcionalidades-grid">
          <div className="landing-func-card">
            <div className="landing-func-icon"><UserPlus size={28} /></div>
            <h3>Registro de usuarios</h3>
            <p>Sistema de autenticación con roles diferenciados (Administrador, Jefe de Sistemas, Operador) para controlar accesos y permisos.</p>
          </div>
          <div className="landing-func-card">
            <div className="landing-func-icon"><Database size={28} /></div>
            <h3>Gestión de datos</h3>
            <p>CRUD completo para inventario: registrar, consultar, actualizar y eliminar elementos. Búsqueda avanzada por categoría, estado y responsable.</p>
          </div>
          <div className="landing-func-card">
            <div className="landing-func-icon"><FileText size={28} /></div>
            <h3>Generación de reportes</h3>
            <p>Exporta informes detallados en PDF y Excel para optimizar la toma de decisiones administrativa. Historial de modificaciones incluido.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-contacto" ref={contactoRef} id="contacto">
        <h2 className="landing-section-title">Contacto</h2>
        <p className="landing-section-subtitle">Escríbenos para más información sobre el proyecto.</p>
        <form className="landing-contacto-form" onSubmit={handleContactoSubmit}>
          <input type="text" name="nombre" placeholder="Nombre completo" required />
          <input type="email" name="email" placeholder="Correo electrónico" required />
          <textarea name="mensaje" placeholder="Mensaje" required />
          <div id="contacto-error" className="form-error" />
          <div id="contacto-success" className="form-success" style={{ display: 'none' }} />
          <button type="submit" className="btn-submit">Enviar mensaje</button>
        </form>
      </section>

    </div>
    </PublicLayout>
  );
};

export default Landing;
