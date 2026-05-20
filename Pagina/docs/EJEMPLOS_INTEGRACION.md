// Ejemplo de integración del componente HistorialAuditoria
// en tu aplicación React

// 1. En tu archivo de rutas (ej: src/App.jsx o router.js)
import HistorialAuditoria from './components/dashboard/HistorialAuditoria';

// 2. Agregalo a tu estructura de rutas
const routes = [
  {
    path: '/dashboard',
    element: <InventoryDashboard />
  },
  {
    path: '/historial',
    element: <HistorialAuditoria />
  },
  // ... otras rutas
];

// 3. O intégralo en una pestaña dentro del dashboard
export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="dashboard">
      <nav>
        <button onClick={() => setActiveTab('inventory')}>
          📦 Inventario
        </button>
        <button onClick={() => setActiveTab('historial')}>
          📊 Historial
        </button>
        <button onClick={() => setActiveTab('reportes')}>
          📈 Reportes
        </button>
      </nav>

      {activeTab === 'inventory' && <InventoryList />}
      {activeTab === 'historial' && <HistorialAuditoria />}
      {activeTab === 'reportes' && <ReportsView />}
    </div>
  );
}

// 4. O crear una vista de historial específico de un equipo
export function HistorialEquipo({ equipoId }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    fetch(`/api/history/equipo/${equipoId}`)
      .then(r => r.json())
      .then(data => setHistorial(data))
      .catch(err => console.error('Error:', err));
  }, [equipoId]);

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
      <h3>📋 Historial de {equipoId}</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {historial.map(item => (
          <li key={item.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <strong>{item.action}</strong> - {new Date(item.date).toLocaleString('es-ES')}
            <p style={{ margin: '0.25rem 0', color: '#666' }}>{item.resumen}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 5. O crear un timeline visual
export function TimelineHistorial({ equipoId }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    fetch(`/api/history/equipo/${equipoId}`)
      .then(r => r.json())
      .then(data => setHistorial(data))
      .catch(err => console.error('Error:', err));
  }, [equipoId]);

  const getIcon = (action) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      ASSIGN: '📤',
      RETURN: '📥'
    };
    return icons[action] || '📋';
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      <div style={{
        position: 'absolute',
        left: '0.5rem',
        top: 0,
        bottom: 0,
        width: '2px',
        background: '#2196F3'
      }} />
      
      {historial.map(item => (
        <div key={item.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '-0.9rem',
            fontSize: '1.5rem',
            background: 'white',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIcon(item.action)}
          </div>
          
          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.resumen}</h4>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
              {new Date(item.date).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 6. Ejemplo de uso en ItemDetails
export function ItemDetails({ equipoId }) {
  const [equipo, setEquipo] = useState(null);

  useEffect(() => {
    fetch(`/api/inventory`)
      .then(r => r.json())
      .then(data => {
        const item = data.find(e => e.id === equipoId);
        setEquipo(item);
      });
  }, [equipoId]);

  if (!equipo) return <div>Cargando...</div>;

  return (
    <div className="item-details">
      <div className="info-section">
        <h2>{equipo.nombre_equipo}</h2>
        <p>Serial: {equipo.serial}</p>
        <p>Asignado a: {equipo.responsible}</p>
      </div>

      {/* Historial completo del equipo */}
      <TimelineHistorial equipoId={equipoId} />
    </div>
  );
}
