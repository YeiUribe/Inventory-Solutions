// Reusable UI for CRUD Operations
import React from 'react';
import Card from './Card';
import Button from './Button';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
      backdropFilter: 'blur(2px)' // Premium UI touch
    }}>
      <Card padding="0" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{title}</h3>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </Button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </Card>
    </div>
  );
};

export default Modal;
