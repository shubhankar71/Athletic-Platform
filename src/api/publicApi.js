const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PUBLIC_BASE_URL = RAW_URL.endsWith('/api') ? `${RAW_URL}/public` : `${RAW_URL}/api/public`;

async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
    let data = null;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // JSON parse error handling
    }

    if (!response.ok) {
      const errMsg = (data && (data.message || data.error)) || response.statusText || 'Request failed';
      throw new Error(errMsg);
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: unable to connect to public server.');
    }
    throw err;
  }
}

/**
 * Fetch Public Cricket News (World & Indian/Domestic)
 */
export async function getPublicNewsApi() {
  return await safeFetch(`${PUBLIC_BASE_URL}/cricket/news`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Fetch Public Live Cricket Scores & Recent Matches
 */
export async function getPublicLiveScoresApi() {
  return await safeFetch(`${PUBLIC_BASE_URL}/cricket/live`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Fetch Public Active Cricket Opportunities
 */
export async function getPublicOpportunitiesApi({ search = '', battingRole = 'all' } = {}) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (battingRole && battingRole !== 'all') queryParams.append('battingRole', battingRole);

  const url = `${PUBLIC_BASE_URL}/opportunities?${queryParams.toString()}`;
  return await safeFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}
