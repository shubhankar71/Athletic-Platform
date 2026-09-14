import { ATHLETE_ROSTER, OPPORTUNITY_POSTS } from '../data/mockData.js';

const RAW_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch cricket athlete roster for Coach (Applicants to Coach's opportunities)
 */
export async function getCoachAthletesApi({ search = '', battingRole = 'all' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (battingRole) params.append('battingRole', battingRole);

    const res = await fetch(`${API_BASE_URL}/coach/athletes?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.athletes)) {
        return json.athletes;
      }
    }
  } catch (err) {
    console.warn('Backend athlete roster fetch failed:', err);
  }

  return [];
}

/**
 * Fetch cricket opportunities with Server-Side & Local Role Fee Protection
 */
export async function getOpportunitiesApi({ search = '', battingRole = 'all', type = 'all', gender = 'all' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (battingRole) params.append('battingRole', battingRole);
    if (type) params.append('type', type);
    if (gender) params.append('gender', gender);

    const res = await fetch(`${API_BASE_URL}/coach/opportunities?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.opportunities)) {
        return json.opportunities;
      }
    }
  } catch (err) {
    console.warn('Backend opportunities fetch failed, using Cricket mock opportunities:', err);
  }

  // Determine user role for local fallback fee projection
  const currentToken = localStorage.getItem('authToken');
  let isAthlete = false;
  if (currentToken) {
    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      if (payload && payload.role === 'athlete') isAthlete = true;
    } catch (e) {
      // ignore token parse errors
    }
  }

  // Fallback to updated Cricket mock opportunities with fee serialization rules
  return OPPORTUNITY_POSTS.filter((o) => {
    const roleMatch =
      battingRole === 'all' ||
      battingRole === 'All Roles' ||
      battingRole === 'All' ||
      o.battingRole === battingRole;
    const typeMatch = type === 'all' || type === 'All' || o.type === type;
    const genderMatch = gender === 'all' || gender === 'All' || !o.gender || o.gender === 'Any' || o.gender === gender;
    const queryMatch =
      !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase()) ||
      (o.summary && o.summary.toLowerCase().includes(search.toLowerCase())) ||
      (o.battingRole && o.battingRole.toLowerCase().includes(search.toLowerCase()));
    return roleMatch && typeMatch && genderMatch && queryMatch;
  }).map((opp) => {
    const item = { ...opp };
    if (!isAthlete) {
      delete item.fee;
      delete item.formattedFee;
    } else {
      item.fee = item.fee !== undefined ? item.fee : 2000;
      item.formattedFee = item.fee === 0 ? 'Free' : `₹${item.fee.toLocaleString('en-IN')}`;
    }
    return item;
  });
}

/**
 * Post a new cricket opportunity as Coach (Recruitment or Trial ONLY)
 */
export async function createOpportunityApi(oppData) {
  try {
    const res = await fetch(`${API_BASE_URL}/coach/opportunities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(oppData),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed to create opportunity (${res.status})`);
    }

    return json;
  } catch (err) {
    console.warn('createOpportunityApi backend error:', err);
    throw err;
  }
}

/**
 * Delete a cricket opportunity (Coach only, must be owner)
 */
export async function deleteOpportunityApi(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/coach/opportunities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed to delete opportunity (${res.status})`);
    }

    return json;
  } catch (err) {
    console.warn('deleteOpportunityApi error:', err);
    throw err;
  }
}

/**
 * Apply to an opportunity as Athlete
 */
export async function applyToOpportunityApi(opportunityId) {
  try {
    const res = await fetch(`${API_BASE_URL}/athlete/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ opportunityId }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((json && json.message) || `Failed to submit application (${res.status})`);
    }

    return json;
  } catch (err) {
    console.warn('applyToOpportunityApi error:', err);
    throw err;
  }
}

/**
 * Fetch application history for logged-in Athlete
 */
export async function getAthleteApplicationsApi({ search = '', battingRole = 'all' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (battingRole) params.append('battingRole', battingRole);

    const res = await fetch(`${API_BASE_URL}/athlete/applications?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.applications)) {
        return json.applications;
      }
    }
  } catch (err) {
    console.warn('getAthleteApplicationsApi error:', err);
  }

  return [];
}
