/**
 * Local Store — reemplaza el backend MySQL con localStorage
 * Datos iniciales: 3 usuarios y algunos dispositivos de ejemplo
 */

const KEYS = {
  USERS: 'inv_users',
  INVENTORY: 'inv_items',
  HISTORY: 'inv_history',
};

// Datos iniciales
// No hardcoded defaults here; the app must use DB-driven data or explicit migration seeds.

// Helpers
const load = (key, defaults = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const nextId = (items) =>
  items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;

const addHistory = (action, userName, details) => {
  const history = load(KEYS.HISTORY, []);
  history.unshift({
    id: nextId(history),
    created_at: new Date().toISOString(),
    action,
    user_name: userName,
    details,
  });
  save(KEYS.HISTORY, history);
};

// Do not auto-seed localStorage; prefer DB-driven data or explicit migration seeds.

// API local interna
export const localStore = {
  // Auth
  login(username, password) {
    const users = load(KEYS.USERS);
    const user  = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) throw new Error('Credenciales inválidas');
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  // Inventario
  getInventory() {
    return load(KEYS.INVENTORY);
  },

  addInventoryItem(item, user) {
    const items  = load(KEYS.INVENTORY);
    const newItem = { ...item, id: nextId(items) };
    items.push(newItem);
    save(KEYS.INVENTORY, items);
    addHistory('Agregado', user?.name || 'Desconocido', `Dispositivo: ${newItem.device}`);
    return newItem;
  },

  updateInventoryItem(id, data, user) {
    const items   = load(KEYS.INVENTORY);
    const idx     = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Dispositivo no encontrado');
    const updated = { ...items[idx], ...data, id };
    items[idx]    = updated;
    save(KEYS.INVENTORY, items);
    addHistory('Actualizado', user?.name || 'Desconocido', `Dispositivo: ${updated.device}`);
    return updated;
  },

  deleteInventoryItem(id, user) {
    const items = load(KEYS.INVENTORY);
    const item  = items.find((i) => i.id === id);
    if (!item) throw new Error('Dispositivo no encontrado');
    save(KEYS.INVENTORY, items.filter((i) => i.id !== id));
    addHistory('Eliminado', user?.name || 'Desconocido', `Dispositivo: ${item.device}`);
  },

  // Historial
  getHistory() {
    return load(KEYS.HISTORY, []);
  },

  // Colaboradores (stub vacío para compatibilidad)
  getColaboradores() {
    return [];
  },

  createAsignacion(data) {
    addHistory('Asignación', data.user_name || 'Desconocido', JSON.stringify(data));
    return { success: true };
  },
};
