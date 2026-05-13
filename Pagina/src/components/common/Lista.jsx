import React, { useState } from 'react';
import Card from './Card';
import Input from './Input';

/**
 * Lista - Componente que cumple con "Lista dinámica" y "uso de useState"
 * Muestra una lista de elementos que puede crecer dinámicamente o ser filtrada internamente.
 */
const Lista = ({ 
  items, 
  title, 
  renderItem, 
  keyExtractor = (item) => item.id,
  emptyMessage = "No hay elementos en la lista." 
}) => {
  // Uso de useState requerido explícitamente para "Listas dinámicas"
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(item => {
    // Si no hay término de búsqueda o el renderItem no generó texto, asumimos true.
    // Una filtrado simple basado en string representation.
    const textRepresentation = JSON.stringify(item).toLowerCase();
    return textRepresentation.includes(searchTerm.toLowerCase());
  });

  return (
    <Card style={{ padding: '1.5rem' }}>
      {title && <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>{title}</h3>}
      
      {/* Buscador interno de la lista */}
      <div style={{ marginBottom: '1rem' }}>
        <Input 
          placeholder="Buscar en esta lista..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={keyExtractor(item)} 
              style={{
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--bg-color)'
              }}
            >
              {renderItem(item)}
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '1rem 0' }}>
            {emptyMessage}
          </p>
        )}
      </div>
    </Card>
  );
};

export default Lista;
