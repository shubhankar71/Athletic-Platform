const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

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
 * Uploads a local video file to Cloudinary via backend.
 * Protected by requireAthlete backend middleware.
 */
export async function uploadVideoToCloudinary(file) {
  const formData = new FormData();
  formData.append('video', file);

  const token = localStorage.getItem('authToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = (json && json.message) || `Upload failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return json;
  } catch (error) {
    console.error('uploadVideoToCloudinary error:', error);
    throw error;
  }
}

/**
 * Sends Cloudinary secure URL to backend analysis API (which calls ML service).
 * Protected by requireAthlete backend middleware.
 */
export async function triggerCricketMLAnalysis(videoUrl, publicId) {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ videoUrl, publicId }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = (json && json.message) || `Analysis failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return json.data || json;
  } catch (error) {
    console.error('triggerCricketMLAnalysis error:', error);
    throw error;
  }
}

/**
 * Fetches user's analysis session history from backend.
 * Protected by requireAthlete backend middleware.
 */
export async function getAnalysisSessions() {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('Failed to fetch backend analysis sessions:', err);
  }
  return [];
}

/**
 * Fetches a single analysis session record by ID with ownership verification.
 */
export async function getAnalysisSessionById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/sessions/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn(`Failed to fetch analysis session ${id}:`, err);
  }
  return null;
}


/**
 * Fetches admin statistics for Admin Dashboard
 */
export async function getAdminStatsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    if (res.ok) {
      const json = await res.json();
      return json.stats;
    }
  } catch (err) {
    console.warn('Failed to fetch admin stats:', err);
  }
  return null;
}

/**
 * Constructs full downloadable URL for PDF report.
 */
export function getPdfDownloadUrl(pdfFilename) {
  if (!pdfFilename) return '#';
  return `${ML_SERVICE_URL}/api/ml/pdf/${pdfFilename}`;
}
