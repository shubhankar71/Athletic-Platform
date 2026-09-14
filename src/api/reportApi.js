const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
 * Submit an issue report (Athletes & Coaches)
 */
export async function submitReportApi(reportData) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(reportData),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Report submission failed (${res.status})`);
    }

    return json;
  } catch (error) {
    console.error('submitReportApi error:', error);
    throw error;
  }
}

/**
 * Fetch all reports for Admin management with optional role, status, search filters
 */
export async function getReportsApi({ role = 'all', status = 'all', search = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/reports/admin/all?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed to fetch reports (${res.status})`);
    }

    return json;
  } catch (error) {
    console.error('getReportsApi error:', error);
    throw error;
  }
}

/**
 * Fetch unresolved report count for badge indicator
 */
export async function getUnresolvedCountApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/admin/unresolved-count`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json) {
      return json.count || 0;
    }
  } catch (error) {
    console.warn('getUnresolvedCountApi error:', error);
  }
  return 0;
}

/**
 * Update report status and admin response
 */
export async function updateReportApi(id, { status, adminResponse }) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/admin/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status, adminResponse }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed to update report (${res.status})`);
    }

    return json;
  } catch (error) {
    console.error('updateReportApi error:', error);
    throw error;
  }
}
