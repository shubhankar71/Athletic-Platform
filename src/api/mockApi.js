const API_BASE = '/api';

export const fetchAthletes = async () => {
  const res = await fetch(`${API_BASE}/athletes`);
  if (!res.ok) throw new Error('Failed to fetch athletes');
  return res.json();
};

export const createAthlete = async (data) => {
  const res = await fetch(`${API_BASE}/athletes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create athlete');
  return res.json();
};

export const fetchOpportunities = async () => {
  const res = await fetch(`${API_BASE}/opportunities`);
  if (!res.ok) throw new Error('Failed to fetch opportunities');
  return res.json();
};

export const createOpportunity = async (data) => {
  const res = await fetch(`${API_BASE}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create opportunity');
  return res.json();
};
