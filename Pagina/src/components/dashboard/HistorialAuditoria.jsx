/**
 * Componente para visualizar el Historial de Auditoría
 * Muestra todos los movimientos del sistema (creación, edición, asignaciones, etc.)
 */
import React, { useEffect, useState } from 'react';
import '../../styles/audit-history.css';

const HistorialAuditoria = () => {
  const [historial, setHistorial] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarHistorial();
  }, [filtroTipo, filtroUsuario]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      if (filtroTipo) params.append('tipo', filtroTipo);
      if (filtroUsuario) params.append('usuario', filtroUsuario);

      const response = await fetch(`/api/history?${params}`, {
        headers: { 'x-user-name': localStorage.getItem('username') || 'Sistema' }
      });

      if (!response.ok) throw new Error('Error al cargar historial');
      const data = await response.json();
      setHistorial(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const obtenerIcono = (tipo) => {
    const iconos = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      ASSIGN: '📤',
      RETURN: '📥',
    };
    return iconos[tipo] || '📋';
  };

  const obtenerColor = (tipo) => {
    const colores = {
      CREATE: '#4CAF50',
      UPDATE: '#2196F3',
      DELETE: '#f44336',
      ASSIGN: '#FF9800',
      RETURN: '#9C27B0',
    };
    return colores[tipo] || '#757575';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (cargando) return <div className="audit-loading">Cargando historial...</div>;
  if (error) return <div className="audit-error">Error: {error}</div>;

  return (
    <div className="audit-historia-container">
      <h2>📊 Historial Completo de Movimientos</h2>
      
      <div className="audit-filtros">
        <div className="filtro-grupo">
          <label>Tipo de Movimiento:</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Edición</option>
            <option value="DELETE">Eliminación</option>
            <option value="ASSIGN">Asignación</option>
            <option value="RETURN">Devolución</option>
          </select>
        </div>
        
        <div className="filtro-grupo">
          <label>Usuario:</label>
          <input
            type="text"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            placeholder="Nombre del usuario"
          />
        </div>

        <button onClick={cargarHistorial} className="btn-refrescar">🔄 Refrescar</button>
      </div>

      <div className="audit-lista">
        {historial.length === 0 ? (
          <p className="sin-registros">No hay registros que coincidan con los filtros</p>
        ) : (
          historial.map((item) => (
            <div key={item.id} className="audit-item" style={{ borderLeftColor: obtenerColor(item.action) }}>
              <div className="audit-header">
                <span className="audit-icono">{obtenerIcono(item.action)}</span>
                <div className="audit-info-principal">
                  <h4>{item.resumen}</h4>
                  <p className="audit-timestamp">{formatearFecha(item.date)}</p>
                </div>
                <span className="audit-badge" style={{ backgroundColor: obtenerColor(item.action) }}>
                  {item.action}
                </span>
              </div>

              {item.details && Object.keys(item.details).length > 0 && (
                <div className="audit-detalles">
                  <strong>Detalles:</strong>
                  <ul>
                    {Object.entries(item.details).map(([clave, valor]) => (
                      <li key={clave}>
                        <span className="clave">{clave}:</span> 
                        <span className="valor">{JSON.stringify(valor)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.estado_anterior && item.estado_nuevo && (
                <div className="audit-cambios">
                  <strong>Cambios:</strong>
                  <div className="cambio-comparacion">
                    <div className="antes">
                      <h5>Antes:</h5>
                      <ul>
                        {Object.entries(item.estado_anterior).map(([k, v]) => (
                          <li key={k}>{k}: {JSON.stringify(v)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flecha">→</div>
                    <div className="despues">
                      <h5>Después:</h5>
                      <ul>
                        {Object.entries(item.estado_nuevo).map(([k, v]) => (
                          <li key={k}>{k}: {JSON.stringify(v)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="audit-usuario">
                <small>Realizado por: <strong>{item.user}</strong></small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorialAuditoria;
