// Open/Closed Principle: A configurable container that accepts any children
import React from 'react';

const Card = ({ children, padding = "1.5rem", className = "", style = {}, ...props }) => {
  const baseStyles = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    padding: padding,
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  return (
    <div style={baseStyles} className={`surface ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
