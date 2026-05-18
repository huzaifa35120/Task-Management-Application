const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // ignore: empty body
  }

  if (!res.ok) {
    const message = body?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = body?.details;
    throw error;
  }
  return body;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const tasksApi = {
  list: (filters) => request(`/tasks${buildQuery(filters)}`),
  stats: () => request('/tasks/stats'),
  meta: () => request('/meta'),
  create: (data) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id) =>
    request(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
