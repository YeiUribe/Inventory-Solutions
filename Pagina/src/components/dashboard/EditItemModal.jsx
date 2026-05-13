import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TIPOS = ['Portatil', 'Desktop', 'Monitor', 'Periférico', 'Movil', 'Tableta', 'Otro'];
const ESTADOS = ['Disponible', 'Activo', 'En uso', 'Mantenimiento', 'Archivado'];

const EditItemModal = ({ isOpen, onClose, item, onSubmit }) => {
  const [form, setForm] = useState({ nombre_equipo: '', tipo_equipo: '', estado: '', serial: '', marca: '', detalle_equipo: '', ocs: '', techpulse: '', sophos: '', id_contrato: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        nombre_equipo: item.nombre_equipo || item.device || '',
        tipo_equipo: item.tipo_equipo || item.category || TIPOS[0],
        estado: item.estado || item.status || ESTADOS[0],
        serial: item.serial || '',
        marca: item.marca || item.marca_modelo || '',
        detalle_equipo: item.detalle_equipo || '',
        ocs: item.ocs || '',
        techpulse: item.techpulse || '',
        sophos: item.sophos || '',
        id_contrato: item.id_contrato || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.nombre_equipo?.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !item) return;

    const result = await onSubmit(item.id, {
      nombre_equipo: form.nombre_equipo,
      tipo_equipo: form.tipo_equipo,
      estado: form.estado,
      serial: form.serial || null,
      marca: form.marca,
      detalle_equipo: form.detalle_equipo,
      ocs: form.ocs,
      techpulse: form.techpulse,
      sophos: form.sophos,
      id_contrato: form.id_contrato
    });

    if (result?.success) {
      onClose();
    } else {
      setError(result?.error || 'Error al actualizar.');
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar activo">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Activo fijo" name="activo_fijo" value={item.id} disabled placeholder="No editable" />
        <Input label="Nombre del equipo" name="nombre_equipo" value={form.nombre_equipo} onChange={handleChange} required />
        <Input label="Serial" name="serial" value={form.serial} onChange={handleChange} placeholder="Opcional" />
        <Input label="Marca" name="marca" value={form.marca} onChange={handleChange} />
        <Input label="Detalle del equipo" name="detalle_equipo" value={form.detalle_equipo} onChange={handleChange} />
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
        <Input label="OCS" name="ocs" value={form.ocs} onChange={handleChange} />
        <Input label="TECHPULSE" name="techpulse" value={form.techpulse} onChange={handleChange} />
        <Input label="SOPHOS" name="sophos" value={form.sophos} onChange={handleChange} />
        <Input label="Contrato" name="id_contrato" value={form.id_contrato} onChange={handleChange} />

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
          <Button type="submit" style={{ flex: 1 }}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditItemModal;
