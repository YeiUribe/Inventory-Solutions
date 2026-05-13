import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { generatePDFReport, generateExcelReport } from '../services/reports';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const ReportsView = () => {
  const { items } = useInventory();
  const { hasRole } = useAuth();

  const handlePDF = () => generatePDFReport(items);
  const handleExcel = () => generateExcelReport(items);

  return (
    <div>
      <h1 className="dashboard-page-title">Reportes</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>Genera informes del inventario en diferentes formatos.</p>
      <Card>
        <div className="reports-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {hasRole(['Administrador', 'Jefe de Sistemas']) && (
            <>
              <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
                <FileText size={40} color="var(--primary-blue)" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Reporte PDF</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>Exportar inventario en formato PDF.</p>
                <Button onClick={handlePDF} style={{ display: 'inline-flex', gap: '0.5rem' }}>
                  <Download size={18} /> Generar PDF
                </Button>
              </div>
              <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
                <FileSpreadsheet size={40} color="#107c41" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Reporte Excel</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>Exportar inventario en formato Excel.</p>
                <Button onClick={handleExcel} style={{ display: 'inline-flex', gap: '0.5rem', backgroundColor: '#107c41' }}>
                  <Download size={18} /> Generar Excel
                </Button>
              </div>
            </>
          )}
        </div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-gray)', fontSize: '0.875rem' }}>
          Total de elementos en inventario: <strong>{items.length}</strong>
        </p>
      </Card>
    </div>
  );
};

export default ReportsView;
