import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TIPOS = ['Portatil', 'Desktop', 'Monitor', 'Periférico', 'Movil', 'Tableta', 'Otro'];
const ESTADOS = ['Disponible', 'Activo', 'En uso', 'Mantenimiento', 'Archivado'];

const AddItemModal = ({ isOpen, onClose, onSubmit, error: externalError }) => {
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

    const result = await onSubmit({
      ...form,
    });

    if (result?.success) {
      setForm({ activo_fijo: '', serial: '', nombre_equipo: '', marca: '', detalle_equipo: '', tipo_equipo: TIPOS[0], estado: ESTADOS[0], ocs: '', techpulse: '', sophos: '', id_contrato: '' });
      onClose();
    } else {
      setError(result?.error || externalError || 'Error al guardar.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Dispositivo">
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

        {(error || externalError) && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            {error || externalError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
          <Button type="submit" style={{ flex: 1 }}>Guardar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemModal;
