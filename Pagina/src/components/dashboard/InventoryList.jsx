import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import { Search, Filter, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import '../../styles/dashboard.css';


const InventoryList = ({ items, onSelectItem, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredItems = items.filter((item) => {
    const name = item.nombre_equipo || item.device || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || String(item.id).includes(searchTerm);
    const matchesType = filterType ? (item.tipo_equipo || item.category) === filterType : true;
    return matchesSearch && matchesType;
  });


  const columns = [
    { label: 'Activo fijo', key: 'id' },
    { label: 'Nombre', key: 'nombre_equipo', render: (_, row) => row.nombre_equipo || row.device || '-' },
    { label: 'Tipo', key: 'tipo_equipo', render: (_, row) => row.tipo_equipo || row.category || '-' },
    { 
      label: 'Estado', 
      key: 'status',
      render: (val, row) => {
        const displayStatus = val || row.estado || 'Disponible';
        const asignado = Boolean(row.responsible);
        return (
          <span style={{ 
            color: displayStatus === 'Disponible' ? 'var(--status-active)' : 
                   displayStatus === 'En uso' || displayStatus === 'Activo' ? 'var(--primary-blue)' : 
                   displayStatus === 'Mantenimiento' ? 'var(--status-warning)' : 
                   displayStatus === 'Archivado' ? 'var(--status-inactive)' : 'var(--status-inactive)',
            fontWeight: '500'
          }}>
            {displayStatus}{asignado ? ' (Asignado)' : ''}
          </span>
        );
      }
    },
    { label: 'Serial', key: 'serial' },
    { label: 'Contrato', key: 'id_contrato' }
  ];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-gray)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Buscar por activo fijo o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--text-dark)',
                background: 'var(--surface-color)',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterType(filterType ? '' : 'Portatil')}
            title="Filtrar por tipo"
            style={{
              height: '38px',
              width: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              background: filterType ? 'var(--primary-blue)' : 'var(--surface-color)',
              color: filterType ? 'white' : 'var(--text-gray)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="dashboard-view-toggles">
            <button
              type="button"
              className={`dashboard-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Vista lista"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              className={`dashboard-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button type="button" className="dashboard-view-btn" aria-label="Más opciones">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center" style={{ flex: 1, minHeight: '200px', color: 'var(--text-gray)' }}>Cargando datos...</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <DataTable 
            columns={columns} 
            data={filteredItems} 
            onRowClick={onSelectItem} 
          />
        </div>
      )}
    </div>
  );
};

export default InventoryList;
