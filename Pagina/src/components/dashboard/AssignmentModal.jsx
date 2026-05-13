import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { api } from '../../services/api';

const AssignmentModal = ({ isOpen, onClose, item, onSuccess, onAssign }) => {
  const [form, setForm] = useState({
      cedula: '',
      id_ubicacion: '',
      fecha_entrega: '',
      fecha_ingreso: '',
      perfil: '',
      concepto: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchColaboradores();
      fetchActiveAssignments();
      setForm({
          cedula: '',
          id_ubicacion: item?.id_ubicacion || '',
          fecha_entrega: item?.date || new Date().toISOString().slice(0, 10),
          fecha_ingreso: item?.fecha_ingreso || '',
          perfil: item?.perfil || '',
          concepto: item?.concepto || ''
      });
      setError('');
    }
  }, [isOpen, item]);

  const fetchColaboradores = async () => {
    try {
      const data = await api.getColaboradores?.() || [];
      setColaboradores(data);
    } catch (err) {
      console.error('Error fetching colaboradores:', err);
      setColaboradores([]);
    }
  };

  const fetchActiveAssignments = async () => {
    try {
      const data = await api.getAsignaciones?.() || [];
      setActiveAssignments((Array.isArray(data) ? data : []).filter(asg => !asg.fecha_devolucion));
    } catch (err) {
      console.error('Error fetching asignaciones:', err);
      setActiveAssignments([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (item?.responsible) {
      setError(`Este equipo ya está asignado a: ${item.responsible}. Debe desvincular primero.`);
      return false;
    }
    const existingByCedula = activeAssignments.find(asg => String(asg.cedula) === String(form.cedula));
    if (existingByCedula) {
      setError(
        `Esta persona ya tiene un equipo activo asignado (${existingByCedula.activo_fijo}${existingByCedula.nombre_equipo ? ` - ${existingByCedula.nombre_equipo}` : ''}). Debe desvincularlo primero.`
      );
      return false;
    }
    if (!form.cedula?.trim()) {
      setError('Debe seleccionar un responsable.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !item) return;

    setLoading(true);
    try {
      const result = onAssign ? await onAssign({
        activo_fijo: item.id,
        cedula: form.cedula,
        id_ubicacion: form.id_ubicacion || null,
        fecha_entrega: form.fecha_entrega || null,
        fecha_ingreso: form.fecha_ingreso || null,
        perfil: form.perfil || null,
        concepto: form.concepto || null
      }) : await api.createAssignment({
        activo_fijo: item.id,
        cedula: form.cedula,
        id_ubicacion: form.id_ubicacion || null,
        fecha_entrega: form.fecha_entrega || null,
        fecha_ingreso: form.fecha_ingreso || null,
        perfil: form.perfil || null,
        concepto: form.concepto || null
      });

      if (result?.success !== false) {
        onSuccess?.();
        onClose();
      } else {
        setError(result?.error || 'Error al crear asignación');
      }
    } catch (err) {
      setError(err.message || 'Error al crear asignación');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Asignar activo: ${item.nombre_equipo || item.device}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Activo Fijo
          </label>
          <input
            type="text"
            value={item.id}
            disabled
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-gray)',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Nombre del equipo
          </label>
          <input
            type="text"
            value={item.nombre_equipo || item.device}
            disabled
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-gray)',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Responsable *
          </label>
          <select
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'white'
            }}
          >
            <option value="">-- Seleccionar responsable --</option>
            {colaboradores.map(col => (
              <option key={col.cedula} value={col.cedula}>
                {col.nombre_usuario} ({col.cedula})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="ID Ubicación"
          name="id_ubicacion"
          value={form.id_ubicacion}
          onChange={handleChange}
          placeholder="Ej: UBIC_1"
        />

        <Input
          label="Fecha de entrega"
          name="fecha_entrega"
          type="date"
          value={form.fecha_entrega}
          onChange={handleChange}
        />

        <Input
          label="Fecha de ingreso"
          name="fecha_ingreso"
          type="date"
          value={form.fecha_ingreso}
          onChange={handleChange}
        />

        <Input
          label="Perfil"
          name="perfil"
          value={form.perfil}
          onChange={handleChange}
          placeholder="Ej: Perfil A"
        />

        <Input
          label="Concepto"
          name="concepto"
          value={form.concepto}
          onChange={handleChange}
          placeholder="Ej: USUARIO NUEVO"
        />

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {item?.responsible && (
          <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            ⚠️ Este equipo ya está asignado a: <strong>{item.responsible}</strong>. Para reasignar, primero debe desvincularse.
          </div>
        )}

        {!item?.responsible && form.cedula && activeAssignments.some(asg => String(asg.cedula) === String(form.cedula)) && (
          <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
            ⚠️ Esta persona ya tiene un equipo activo asignado y no puede recibir otro hasta desvincularlo.
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} style={{ flex: 1 }} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" style={{ flex: 1 }} disabled={loading || !!item?.responsible || (!!form.cedula && activeAssignments.some(asg => String(asg.cedula) === String(form.cedula)))}>
            {loading ? 'Asignando...' : 'Asignar equipo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignmentModal;
