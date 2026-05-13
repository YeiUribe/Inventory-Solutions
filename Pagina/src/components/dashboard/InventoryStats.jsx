import React from 'react';
import Card from '../common/Card';
import '../../styles/dashboard.css';

const InventoryStats = ({ items = [] }) => {
  // Calcular estadísticas consolidadas de TODOS los equipos
  // Un equipo está asignado si tiene un responsible, independientemente del status
  const stats = {
    total: items.length,
    disponibles: items.filter(i => !i.responsible && i.status !== 'Archivado').length,
    asignados: items.filter(i => i.responsible).length,
    mantenimiento: items.filter(i => i.status === 'Mantenimiento').length,
    activos: items.filter(i => i.status === 'Activo' || i.status === 'Disponible').length,
  };

  const StatCard = ({ label, value, color, percentage }) => (
    <Card style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: color ? `${color}10` : 'var(--surface-color)',
      borderLeft: color ? `4px solid ${color}` : 'none'
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: color || 'var(--text-dark)',
        marginBottom: '0.5rem'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--text-gray)',
        textAlign: 'center',
        marginBottom: '0.5rem'
      }}>
        {label}
      </div>
      {percentage !== undefined && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-gray)',
          fontWeight: '500'
        }}>
          {percentage}% del total
        </div>
      )}
    </Card>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <StatCard
        label="Total Equipos"
        value={stats.total}
        color="var(--primary-blue)"
        percentage={100}
      />
      <StatCard
        label="Disponibles"
        value={stats.disponibles}
        color="var(--status-active)"
        percentage={stats.total > 0 ? Math.round((stats.disponibles / stats.total) * 100) : 0}
      />
      <StatCard
        label="Asignados"
        value={stats.asignados}
        color="#8b5cf6"
        percentage={stats.total > 0 ? Math.round((stats.asignados / stats.total) * 100) : 0}
      />
      <StatCard
        label="Mantenimiento"
        value={stats.mantenimiento}
        color="var(--status-warning)"
        percentage={stats.total > 0 ? Math.round((stats.mantenimiento / stats.total) * 100) : 0}
      />
      <StatCard
        label="Activos"
        value={stats.activos}
        color="#06b6d4"
        percentage={stats.total > 0 ? Math.round((stats.activos / stats.total) * 100) : 0}
      />
    </div>
  );
};

export default InventoryStats;
