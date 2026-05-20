import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import InventoryList from '../components/dashboard/InventoryList';
import ItemDetails from '../components/dashboard/ItemDetails';
import AddItemModal from '../components/dashboard/AddItemModal';
import InventoryStats from '../components/dashboard/InventoryStats';
import AddItemPage from './AddItemPage';
import HistoryView from './HistoryView';
import HistorialAuditoria from '../components/dashboard/HistorialAuditoria';
import ReportsView from './ReportsView';
import Usuarios from './Usuarios';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { generatePDFReport, generateExcelReport } from '../services/reports';
import { Download, MoreHorizontal } from 'lucide-react';
import '../styles/dashboard.css';

const InventoryDashboard = () => {
  const { items, loading, addItem, updateItem, deleteItem, assignItem, returnItem } = useInventory();
  const { hasRole } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleExportPDF = () => generatePDFReport(items);
  const handleExportExcel = () => generateExcelReport(items);

  const handleAddItem = async (data) => {
    return await addItem(data);
  };

  useEffect(() => {
    if (!selectedItem?.id) return;

    const current = items.find((i) => i.id === selectedItem.id);
    if (current) {
      setSelectedItem(current);
    }
  }, [items, selectedItem?.id]);

  const handleUpdateItem = async (id, data) => {
    const result = await updateItem(id, data);
    if (result?.success && result?.data) {
      setSelectedItem(result.data);
    }
    return result;
  };

  const handleRefreshAfterAssignment = () => {
    // El inventario ya se refresco en assignItem, esperar un poco y actualizar el item
    setTimeout(() => {
      if (selectedItem?.id) {
        // Buscar el item actualizado en la lista refrescada
        const updatedItem = items.find(i => i.id === selectedItem.id);
        if (updatedItem) {
          setSelectedItem({ ...updatedItem });
        }
      }
    }, 100);
  };

  const handleReturnEquipment = async (id) => {
    const result = await returnItem(id);
    if (result?.success) {
      // Buscar el item actualizado
      const updatedItem = items.find(i => i.id === id);
      if (updatedItem) {
        setSelectedItem({ ...updatedItem });
      }
    }
    return result;
  };

  const DashboardMainView = () => (
    <>
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Inventario</h1>
        <button type="button" className="dashboard-view-btn" aria-label="Más opciones">
          <MoreHorizontal size={22} />
        </button>
      </div>

      <InventoryStats items={items} />

      <div className="dashboard-content-row">
        <div className="dashboard-table-col">
          <InventoryList
            items={items}
            loading={loading}
            onSelectItem={setSelectedItem}
          />
        </div>
        <div className="dashboard-details-col">
          <ItemDetails
            item={selectedItem}
            onUpdate={handleUpdateItem}
            onDelete={async (id) => {
              const r = await deleteItem(id);
              if (r?.success) setSelectedItem(null);
              return r;
            }}
            onAssign={assignItem}
            onReturn={handleReturnEquipment}
            onItemUpdate={handleRefreshAfterAssignment}
            canEdit={hasRole(['Administrador', 'Jefe de Sistemas'])}
          />
        </div>
      </div>

      <div className="dashboard-actions">
        {hasRole(['Administrador', 'Jefe de Sistemas']) && (
          <button
            type="button"
            className="dashboard-action-btn primary"
            onClick={() => setShowAddModal(true)}
          >
            Añadir Nuevo Dispositivo
          </button>
        )}
        <button
          type="button"
          className="dashboard-action-btn primary"
          onClick={handleExportPDF}
        >
          <Download size={20} /> Generar Reporte PDF
        </button>
        <button
          type="button"
          className="dashboard-action-btn success"
          onClick={handleExportExcel}
        >
          <Download size={20} /> Generar Reporte Excel
        </button>
      </div>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />
    </>
  );

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="inventory" replace />} />
        <Route path="inventory" element={<DashboardMainView />} />
        <Route path="add" element={<AddItemPage />} />
        <Route path="history" element={<HistorialAuditoria />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Routes>
    </DashboardLayout>
  );
};

export default InventoryDashboard;
