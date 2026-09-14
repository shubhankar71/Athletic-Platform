const RAW_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

function getAuthHeaders(isJson = true) {
  const token = localStorage.getItem('authToken');
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch dynamic real-time administrative statistics from MongoDB
 */
export async function getAdminStatsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    console.error('getAdminStatsApi error:', error);
    throw error;
  }
}

/**
 * Fetch searchable user management list (Athletes & Coaches)
 */
export async function getUsersApi({ search = '', role = 'all' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);

    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed with status ${res.status}`);
    }

    return json.users || [];
  } catch (error) {
    console.error('getUsersApi error:', error);
    throw error;
  }
}

/**
 * Ban user (temporary or permanent)
 */
export async function banUserApi(id, banData) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/ban`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(banData),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Ban operation failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    console.error('banUserApi error:', error);
    throw error;
  }
}

/**
 * Unban user
 */
export async function unbanUserApi(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/unban`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Unban operation failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    console.error('unbanUserApi error:', error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUserApi(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Delete user failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    console.error('deleteUserApi error:', error);
    throw error;
  }
}
