const API_BASE = (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '').replace(/\/$/, '');

const getErrorMessage = async (res) => {
  try {
    const data = await res.json();
    return data?.error || data?.message || `Error HTTP ${res.status}`;
  } catch {
    return `Error HTTP ${res.status}`;
  }
};

const request = async (path, options = {}) => {
  const { headers, ...restOptions } = options;
  // Attach current session headers automatically if available
  let session;
  try {
    session = localStorage.getItem('inventory_session');
    session = session ? JSON.parse(session) : null;
  } catch {
    session = null;
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(session ? { 'x-user-name': session.name || session.username || 'Sistema', 'x-user-role': session.role || '' } : {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...defaultHeaders,
      ...(headers || {}),
    },
    ...restOptions,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  login: async (username, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  getInventory: async () => {
    const items = await request('/api/inventory');
    return Array.isArray(items) ? items : [];
  },

  addInventoryItem: async (item, user) => {
    return request('/api/inventory', {
      method: 'POST',
      headers: {
        'x-user-name': user?.name || 'Sistema',
      },
      body: JSON.stringify(item),
    });
  },

  updateInventoryItem: async (id, data) => {
    return request(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteInventoryItem: async (id) => {
    return request(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  },

  getHistory: async () => {
    const rows = await request('/api/history');
    if (!Array.isArray(rows)) return [];

    // Normaliza el formato devuelto por backend al contrato usado por la UI.
    return rows.map((r) => ({
      id: r.id,
      created_at: r.created_at || r.date,
      action: r.action,
      user_name: r.user_name || r.user,
      resumen: r.resumen || '',
      tabla: r.tabla || '',
      id_registro: r.id_registro || '',
      detailsText: typeof r.details === 'string' ? r.details : (r.details ? JSON.stringify(r.details) : ''),
      detailsObj: (typeof r.details === 'string' ? (() => { try { return JSON.parse(r.details); } catch { return null; } })() : (r.details || null)),
    }));
  },

  getColaboradores: async () => {
    const rows = await request('/api/colaboradores');
    return Array.isArray(rows) ? rows : [];
  },

  getAsignaciones: async (params = '') => {
    const rows = await request(`/api/asignaciones${params}`);
    return Array.isArray(rows) ? rows : [];
  },

  createAsignacion: async (data) => {
    return request('/api/asignaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createAssignment: async (data) => {
    return request('/api/asignaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  devolverEquipo: async (activo_fijo) => {
    return request(`/api/asignaciones/devolver/${activo_fijo}`, {
      method: 'PUT',
    });
  },
};
