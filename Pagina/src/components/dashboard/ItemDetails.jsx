import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import DonutChart from '../common/DonutChart';
import Button from '../common/Button';
import EditItemModal from './EditItemModal';
import AssignmentModal from './AssignmentModal';
import { Pencil, Trash2, Plus, LogOut } from 'lucide-react';
import '../../styles/dashboard.css';

const ItemDetails = ({ item, onUpdate, onDelete, canEdit, onAssign, onItemUpdate, onReturn }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [displayItem, setDisplayItem] = useState(item);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    setDisplayItem(item);
  }, [item]);

  if (!displayItem) {
    return (
      <div className="dashboard-card">
        <div className="item-details-placeholder">
          <p>Selecciona un ítem de la tabla para ver sus detalles</p>
        </div>
      </div>
    );
  }

  const availabilityPercent = displayItem.responsible ? 100 : (displayItem.status === 'Activo' ? 80 : displayItem.status === 'Mantenimiento' ? 30 : 100);

  const renderImagePlaceholder = () => {
    const emojis = { 'Móvil': '📱', 'Movil': '📱', 'Tableta': '📋', 'Periférico': '🖥️', 'Monitor': '🖥️' };
    const emoji = emojis[displayItem.tipo_equipo || displayItem.category] || '💻';
    return (
      <div className="item-details-image">
        {emoji}
      </div>
    );
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${displayItem.nombre_equipo || displayItem.device}" (${displayItem.id})? Los activos con asignaciones no pueden eliminarse.`)) {
      onDelete?.(displayItem.id);
    }
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    // Esperar un poco y luego refrescar el item
    setTimeout(() => {
      if (onItemUpdate) {
        onItemUpdate();
      }
    }, 300);
  };

  const handleReturnEquipment = async () => {
    if (!window.confirm(`¿Devolver "${displayItem.nombre_equipo || displayItem.device}" de ${displayItem.responsible}?`)) {
      return;
    }

    setReturnLoading(true);
    try {
      await onReturn?.(displayItem.id || displayItem.activo_fijo);
      // Refrescar después de devolver
      setTimeout(() => {
        if (onItemUpdate) {
          onItemUpdate();
        }
      }, 300);
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="item-details-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
      <Card style={{ flex: '0 0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Detalles</h3>
          {canEdit && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="ghost" onClick={() => setShowEditModal(true)} aria-label="Editar" title="Editar" style={{ padding: '0.4rem' }}>
                <Pencil size={16} />
              </Button>
              {!displayItem.responsible && (
                <Button onClick={() => setShowAssignModal(true)} aria-label="Asignar equipo" title="Asignar equipo" style={{ 
                  padding: '0.4rem 0.75rem', 
                  backgroundColor: 'var(--primary-blue)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 'var(--border-radius-sm)', 
                  cursor: 'pointer', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  transition: 'all 0.2s ease'
                }}>
                  <Plus size={14} /> Asignar
                </Button>
              )}
              {displayItem.responsible && (
                <Button 
                  onClick={handleReturnEquipment} 
                  disabled={returnLoading}
                  aria-label="Desasignar equipo" 
                  title="Desasignar equipo" 
                  variant="ghost" 
                  style={{ 
                    padding: '0.4rem',
                    color: '#dc2626',
                    opacity: returnLoading ? 0.5 : 1,
                    cursor: returnLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <LogOut size={16} />
                </Button>
              )}
              <Button variant="ghost" onClick={handleDelete} aria-label="Eliminar" title="Eliminar" style={{ padding: '0.4rem', color: '#dc2626' }}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>

        {renderImagePlaceholder()}

        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.15rem' }}>{displayItem.nombre_equipo || displayItem.device}</h4>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Activo fijo: {displayItem.id}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-gray)' }}>Tipo:</span>
          <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.tipo_equipo || displayItem.category || '-'}</span>
          <span style={{ color: 'var(--text-gray)' }}>Serial:</span>
          <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.serial || '-'}</span>
          <span style={{ color: 'var(--text-gray)' }}>Marca:</span>
          <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.marca || displayItem.marca_modelo || '-'}</span>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-gray)' }}>Detalle: </span>
          <span style={{ fontWeight: '500' }}>{displayItem.detalle_equipo || '-'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--text-gray)' }}>OCS: {displayItem.ocs || '-'}</span>
          <span style={{ color: 'var(--text-gray)' }}>TP: {displayItem.techpulse || '-'}</span>
          <span style={{ color: 'var(--text-gray)' }}>SOPHOS: {displayItem.sophos || '-'}</span>
        </div>
      </Card>

      <Card style={{ flex: '0 0 auto' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0, marginBottom: '0.5rem' }}>
          Estado: <span style={{ color: displayItem.responsible ? 'var(--primary-blue)' : '#999' }}>{displayItem.status || displayItem.estado || 'Disponible'}{displayItem.responsible ? ' (Asignado)' : ''}</span>
        </h4>
        {displayItem.responsible ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-gray)' }}>Responsable:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.responsible}</span>
            <span style={{ color: 'var(--text-gray)' }}>Ubicación:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.ubicacion || '-'}</span>
            <span style={{ color: 'var(--text-gray)' }}>Entrega:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.date || '-'}</span>
            <span style={{ color: 'var(--text-gray)' }}>Perfil:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>{displayItem.perfil || '-'}</span>
          </div>
        ) : (
          <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
            Sin asignación
          </p>
        )}
      </Card>

      {canEdit && (
        <>
          <EditItemModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            item={displayItem}
            onSubmit={onUpdate}
          />
          <AssignmentModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            item={displayItem}
            onAssign={onAssign}
            onSuccess={handleAssignSuccess}
          />
        </>
      )}
    </div>
  );
};

export default ItemDetails;
