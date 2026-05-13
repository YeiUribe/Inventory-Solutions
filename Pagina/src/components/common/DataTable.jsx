import React from 'react';

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
            {columns.map((col, index) => (
              <th key={index} style={{ padding: '0.75rem 1rem', color: 'var(--text-gray)', fontWeight: '500', fontSize: '0.875rem' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>
                No hay registros disponibles.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseOver={(e) => { if(onRowClick) e.currentTarget.style.backgroundColor = 'var(--bg-color)'; }}
                onMouseOut={(e) => { if(onRowClick) e.currentTarget.style.backgroundColor = 'white'; }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-dark)' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
