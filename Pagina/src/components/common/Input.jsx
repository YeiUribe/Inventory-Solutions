import React from 'react';

const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', marginBottom: '1rem' }}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)' }}>{label}</label>}
      <input
        style={{
          padding: '0.625rem',
          borderRadius: 'var(--border-radius-sm)',
          border: `1px solid ${error ? '#dc2626' : 'var(--border-color)'}`,
          outline: 'none',
          fontSize: '0.875rem',
          backgroundColor: 'var(--surface-color)',
          color: 'var(--text-dark)',
          transition: 'border-color 0.2s',
          width: '100%',
        }}
        className={className}
        {...props}
      />
      {error && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</span>}
    </div>
  );
};

export default Input;
