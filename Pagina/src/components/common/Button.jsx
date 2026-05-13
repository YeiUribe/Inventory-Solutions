import React from 'react';

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '500',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    gap: '0.5rem',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary-blue)',
      color: 'white',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--border-color)',
      color: 'var(--text-dark)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-gray)',
      padding: '0.375rem',
    }
  };

  return (
    <button 
      style={{ ...baseStyles, ...variants[variant] }} 
      className={className} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
