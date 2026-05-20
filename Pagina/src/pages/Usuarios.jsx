import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const ROLES = [
  { id: 1, nombre_rol: 'Administrador' },
  { id: 2, nombre_rol: 'Moderador' },
  { id: 3, nombre_rol: 'Operador' },
];

const emptyForm = {
  cedula: '',
  nombre: '',
  cargo: '',
  usuario_login: '',
  password_hash: '',
  id_rol: '3',
  estado: true,
};

function Usuarios() {
  const { hasRole } = useAuth();
  // Prevent non-admins from using this page
  if (!hasRole(['Administrador'])) {
    return (
      <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1>Acceso restringido</h1>
        <p style={{ color: 'var(--text-gray)' }}>No tienes permisos para ver o gestionar usuarios.</p>
      </div>
    );
  }
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
  const URL = `${API_BASE}/api/usuarios`;

  const cargarUsuarios = async () => {
    try {
      // Ensure axios sends role header if session present
      try {
        const session = JSON.parse(localStorage.getItem('inventory_session') || 'null');
        if (session && session.role) axios.defaults.headers.common['x-user-role'] = session.role;
      } catch {}
      const res = await axios.get(URL);
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || 'Error al cargar usuarios');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      password_hash: form.password_hash || (editando ? undefined : ''),
      id_rol: Number(form.id_rol),
    };

    try {
      if (editando) {
        await axios.put(`${URL}/${editando}`, payload);
        setEditando(null);
      } else {
        await axios.post(URL, payload);
      }

      setForm(emptyForm);
      await cargarUsuarios();
    } catch (requestError) {
      setError(requestError?.response?.data?.error || 'Error al procesar la solicitud');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;

    try {
      await axios.delete(`${URL}/${id}`);
      await cargarUsuarios();
    } catch (requestError) {
      setError(requestError?.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const prepararEdicion = (u) => {
    setEditando(u.id);
    setForm({
      cedula: u.cedula || '',
      nombre: u.nombre || '',
      cargo: u.cargo || '',
      usuario_login: u.usuario_login || '',
      password_hash: '',
      id_rol: String(u.id_rol || 3),
      estado: Boolean(u.estado),
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Usuarios de aplicación</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-gray)' }}>
        Gestiona cuentas ligadas a empleados, roles y autenticación.
      </p>

      <form
        onSubmit={guardarUsuario}
        style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <input type="text" name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <input type="text" name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <input type="text" name="cargo" placeholder="Cargo" value={form.cargo} onChange={handleChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <input type="text" name="usuario_login" placeholder="Usuario login" value={form.usuario_login} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <input type="password" name="password_hash" placeholder={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'} value={form.password_hash} onChange={handleChange} required={!editando} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <select name="id_rol" value={form.id_rol} onChange={handleChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {ROLES.map((rol) => (
            <option key={rol.id} value={rol.id}>{rol.nombre_rol}</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} />
          Activo
        </label>
        <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
          <button type="submit" style={{ padding: '10px 20px', background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
          {editando && (
            <button type="button" onClick={() => { setEditando(null); setForm(emptyForm); }} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Cancelar edición
            </button>
          )}
        </div>
        {error && (
          <div style={{ gridColumn: '1 / -1', backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
      </form>

      <div style={{ display: 'grid', gap: '12px' }}>
        {usuarios.map((u) => (
          <div key={u.id} style={{ border: '1px solid var(--border-color)', background: 'var(--surface-color)', padding: '14px', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>
              <strong>{u.nombre || u.nombre_usuario}</strong> - {u.usuario_login} - {u.rol}
            </p>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-gray)', fontSize: '0.875rem' }}>
              Cédula: {u.cedula} · Cargo: {u.cargo || '-'} · Estado: {u.estado ? 'Activo' : 'Inactivo'}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => prepararEdicion(u)} style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => eliminar(u.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Usuarios;
