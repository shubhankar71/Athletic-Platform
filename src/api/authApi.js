const API_BASE_URL = 'http://localhost:5000/api/auth';

// Helper to wrap fetch and provide friendlier error messages for network/server errors
async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
    let data = null;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // ignore JSON parse errors, keep data as null
    }

    if (!response.ok) {
      const errMsg = (data && (data.message || data.error)) || response.statusText || 'Request failed';
      throw new Error(errMsg);
    }

    return data;
  } catch (err) {
    // Network errors (e.g. server not running or CORS) surface as TypeError from fetch
    if (err instanceof TypeError) {
      throw new Error('Network error: could not reach authentication server. Is the backend running?');
    }
    throw err;
  }
}

/**
 * Register a new user
 */
export async function registerApi({ name, email, password, role }) {
  return await safeFetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  });
}

/**
 * Login user
 */
export async function loginApi({ email, password }) {
  return await safeFetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get current authenticated user profile
 */
export async function getMeApi(token) {
  return await safeFetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}
