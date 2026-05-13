import React, { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import Card from '../components/common/Card';
import Lista from '../components/common/Lista';

const HistoryView = () => {
  const { history, refreshHistory } = useInventory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshHistory().finally(() => setLoading(false));
  }, [refreshHistory]);

  return (
    <div>
      <h1 className="dashboard-page-title">Historial de modificaciones</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>Registro de cambios realizados sobre el inventario.</p>
      {loading ? (
        <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>Cargando historial...</Card>
      ) : (
        <Lista 
          title="Registro de auditoría"
          items={[...history].reverse()} // Mostrar los más recientes primero
          keyExtractor={(item) => item.id}
          emptyMessage="No hay modificaciones registradas."
          renderItem={(h) => (
            <div className="history-item" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <span className="history-item-date">
                {new Date(h.created_at || (new Date()).toISOString()).toLocaleString('es-CO')}
              </span>
              <div>
                <span className="history-item-action">{h.action}</span>: {h.details}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>{h.user_name}</span>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default HistoryView;
