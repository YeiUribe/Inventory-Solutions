import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';

export const useInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const logs = await api.getHistory();
      setHistory(logs);
    } catch (err) {
      console.error("Error fetching history");
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Agregar dispositivo al inventario
  const addItem = async (data) => {
    try {
      const newItem = await api.addInventoryItem(data, user);
      setItems((prev) => [...prev, newItem]);
      fetchHistory();
      return { success: true, data: newItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Actualizar información del dispositivo
  const updateItem = async (id, data) => {
    try {
      const updated = await api.updateInventoryItem(id, data, user);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      fetchHistory();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Eliminar dispositivo del inventario
  const deleteItem = async (id) => {
    try {
      await api.deleteInventoryItem(id, user);
      setItems((prev) => prev.filter((i) => i.id !== id));
      fetchHistory();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Crear asignación de equipo a colaborador
  const assignItem = async (data) => {
    try {
      const result = await api.createAssignment(data);
      // Refrescar el inventario después de asignar
      await fetchInventory();
      await fetchHistory();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Devolver equipo (desasignar)
  const returnItem = async (activo_fijo) => {
    try {
      await api.devolverEquipo(activo_fijo);
      await fetchInventory();
      await fetchHistory();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    items,
    history,
    loading,
    error,
    refreshInventory: fetchInventory,
    refreshHistory: fetchHistory,
    addItem,
    updateItem,
    deleteItem,
    assignItem,
    returnItem
  };
};
