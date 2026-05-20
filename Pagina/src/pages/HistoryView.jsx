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
          items={[...history].reverse()}
          keyExtractor={(item) => item.id}
          emptyMessage="No hay modificaciones registradas."
          renderItem={(h) => {
            const fecha = new Date(h.created_at || new Date().toISOString()).toLocaleString('es-CO');
            const mainText = (h.resumen && h.resumen.length > 0) ? h.resumen : `${h.action}: ${h.detailsText}`;
            return (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ minWidth: '12rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{fecha}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{h.action}</strong>
                    <span>{mainText}</span>
                  </div>

                  {h.detailsObj && typeof h.detailsObj === 'object' && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {Object.entries(h.detailsObj).map(([k, v]) => (
                        <div key={k} style={{ background: 'var(--bg-muted)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <strong style={{ color: 'var(--text-dark)' }}>{k}:</strong> <span style={{ color: 'var(--text-gray)' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ minWidth: '9rem', textAlign: 'right', color: 'var(--text-gray)' }}>{h.user_name}</div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
};

export default HistoryView;
