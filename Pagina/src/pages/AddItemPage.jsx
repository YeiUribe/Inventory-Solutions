import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard.css';

const TIPOS = ['Portatil', 'Desktop', 'Monitor', 'Periférico', 'Movil', 'Tableta', 'Otro'];
const ESTADOS = ['Disponible', 'Activo', 'En uso', 'Mantenimiento', 'Archivado'];

const AddItemPage = () => {
  const navigate = useNavigate();
  const { addItem } = useInventory();
  const { hasRole } = useAuth();
  const [form, setForm] = useState({
    activo_fijo: '',
    serial: '',
    nombre_equipo: '',
    marca: '',
    detalle_equipo: '',
    tipo_equipo: TIPOS[0],
    estado: ESTADOS[0],
    ocs: '',
    techpulse: '',
    sophos: '',
    id_contrato: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.activo_fijo?.trim()) {
      setError('El activo fijo es obligatorio.');
      return false;
    }
    if (!form.nombre_equipo?.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await addItem({
      ...form,
    });

    if (result?.success) {
      navigate('/dashboard/inventory');
    } else {
      setError(result?.error || 'Error al guardar.');
    }
  };

  if (!hasRole(['Administrador', 'Jefe de Sistemas'])) {
    return <Navigate to="/dashboard/inventory" replace />;
  }

  return (
    <div>
      <h1 className="dashboard-page-title">Agregar item</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>Registrar Activo.</p>
      <Card style={{ maxWidth: '560px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Activo fijo" name="activo_fijo" value={form.activo_fijo} onChange={handleChange} placeholder="Ej: ML-000001" required />
          <Input label="Serial" name="serial" value={form.serial} onChange={handleChange} placeholder="Serial del equipo" />
          <Input label="Nombre del equipo" name="nombre_equipo" value={form.nombre_equipo} onChange={handleChange} placeholder="Ej: GAFML156594" required />
          <Input label="Marca" name="marca" value={form.marca} onChange={handleChange} placeholder="Ej: Dell" />
          <Input label="Detalle del equipo" name="detalle_equipo" value={form.detalle_equipo} onChange={handleChange} placeholder="Ej: Computador Portatil Core i5-1135G7" />
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>Tipo de equipo</label>
            <select name="tipo_equipo" value={form.tipo_equipo} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
              {TIPOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <Input label="OCS" name="ocs" value={form.ocs} onChange={handleChange} placeholder="OK / pendiente" />
          <Input label="TECHPULSE" name="techpulse" value={form.techpulse} onChange={handleChange} placeholder="OK / pendiente" />
          <Input label="SOPHOS" name="sophos" value={form.sophos} onChange={handleChange} placeholder="OK / pendiente" />
          <Input label="Contrato" name="id_contrato" value={form.id_contrato} onChange={handleChange} placeholder="Ej: CONT_1" />

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/inventory')} style={{ flex: 1 }}>Cancelar</Button>
            <Button type="submit" style={{ flex: 1 }}>Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddItemPage;
