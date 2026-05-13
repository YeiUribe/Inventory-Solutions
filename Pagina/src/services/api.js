const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

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
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
      details: r.details,
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
