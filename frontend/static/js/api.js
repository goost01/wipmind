/**
 * WipMind API Client
 * Centraliza todas las llamadas al backend Django.
 */

const API_BASE = '/api';

function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('csrftoken='))
    ?.split('=')[1] ?? '';
}

async function apiRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    credentials: 'same-origin',
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = extractErrorMessage(data);
    throw new ApiError(msg, res.status, data);
  }
  return data;
}

function extractErrorMessage(data) {
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  return 'Error desconocido';
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// ── Auth ──────────────────────────────────────
const Auth = {
  register: (data) => apiRequest('POST', '/auth/register/', data),
  login: (data)    => apiRequest('POST', '/auth/login/', data),
  logout: ()       => apiRequest('POST', '/auth/logout/'),
  profile: ()      => apiRequest('GET',  '/auth/profile/'),
  updateProfile: (data) => apiRequest('PUT', '/auth/profile/', data),
};

// ── Tasks ─────────────────────────────────────
const Tasks = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest('GET', `/tasks/${qs ? '?' + qs : ''}`);
  },
  create: (data)         => apiRequest('POST',   '/tasks/', data),
  get: (id)              => apiRequest('GET',    `/tasks/${id}/`),
  update: (id, data)     => apiRequest('PUT',    `/tasks/${id}/`, data),
  delete: (id)           => apiRequest('DELETE', `/tasks/${id}/`),
  changeStatus: (id, estado) => apiRequest('PATCH', `/tasks/${id}/estado/`, { estado }),
  startPomodoro: (data)  => apiRequest('POST',  '/tasks/pomodoro/', data),
  completeCycle: (id, finalizar = false) =>
    apiRequest('PATCH', `/tasks/pomodoro/${id}/ciclo/`, { finalizar }),
};

// ── Cognitive ─────────────────────────────────
const Cognitive = {
  density: ()           => apiRequest('GET', '/cognitive/density/'),
  history: (dias = 30)  => apiRequest('GET', `/cognitive/density/history/?dias=${dias}`),
};

// ── Notifications ──────────────────────────────
const Notifications = {
  get: () => apiRequest('GET', '/notifications/'),
};

window.WipMindAPI = { Auth, Tasks, Cognitive, Notifications, ApiError };
