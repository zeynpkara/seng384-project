const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  register: (data: { email: string; password: string; name: string; institution: string; role: string }) =>
    apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiCall<{ token: string; user: unknown }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiCall('/api/auth/logout', { method: 'POST' }),

  verifyEmail: (token: string) =>
    apiCall(`/api/auth/verify/${token}`),
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export const posts = {
  getPosts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/posts${qs}`);
  },

  getPost: (id: string) =>
    apiCall(`/api/posts/${id}`),

  createPost: (data: unknown) =>
    apiCall('/api/posts', { method: 'POST', body: JSON.stringify(data) }),

  updatePost: (id: string, data: unknown) =>
    apiCall(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  publishPost: (id: string) =>
    apiCall(`/api/posts/${id}/publish`, { method: 'PATCH' }),

  closePost: (id: string) =>
    apiCall(`/api/posts/${id}/close`, { method: 'PATCH' }),

  deletePost: (id: string) =>
    apiCall(`/api/posts/${id}`, { method: 'DELETE' }),

  getMyPosts: () =>
    apiCall('/api/posts/mine'),
};

// ─── Meetings ────────────────────────────────────────────────────────────────

export const meetings = {
  checkInterest: (postId: string) =>
    apiCall<{ hasInterest: boolean; meetingId?: string; status?: string }>(`/api/meetings/check/${postId}`),

  expressInterest: (postId: string, data: { message?: string }) =>
    apiCall<{ requiresNDA: boolean; meetingId: string; status?: string }>(
      `/api/meetings/express-interest/${postId}`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  acceptNda: (meetingId: string) =>
    apiCall(`/api/meetings/${meetingId}/accept-nda`, { method: 'POST' }),

  proposeSlots: (id: string, slots: Array<{ date: string; time: string }>) =>
    apiCall(`/api/meetings/${id}/propose-slots`, { method: 'POST', body: JSON.stringify({ slots }) }),

  confirmSlot: (id: string, slot: { date: string; time: string }) =>
    apiCall(`/api/meetings/${id}/confirm-slot`, { method: 'PATCH', body: JSON.stringify({ slot }) }),

  rejectMeeting: (id: string) =>
    apiCall(`/api/meetings/${id}/reject`, { method: 'PATCH' }),

  getMyMeetings: () =>
    apiCall('/api/meetings/mine'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const admin = {
  getUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/admin/users${qs}`);
  },

  suspendUser: (id: string) =>
    apiCall(`/api/admin/users/${id}/suspend`, { method: 'PATCH' }),

  deleteUser: (id: string) =>
    apiCall(`/api/admin/users/${id}`, { method: 'DELETE' }),

  getPosts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/admin/posts${qs}`);
  },

  deletePost: (id: string) =>
    apiCall(`/api/admin/posts/${id}`, { method: 'DELETE' }),

  getLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/admin/logs${qs}`);
  },

  exportLogs: () =>
    apiCall('/api/admin/logs/export'),
};

// ─── Profile / GDPR ──────────────────────────────────────────────────────────

export const profile = {
  getProfile: () =>
    apiCall('/api/users/me'),

  updateProfile: (data: unknown) =>
    apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  exportData: () =>
    apiCall('/api/users/me/export'),

  deleteAccount: (password: string) =>
    apiCall('/api/users/me', { method: 'DELETE', body: JSON.stringify({ password }) }),
};

// ─── File download helper ─────────────────────────────────────────────────────

export async function downloadFile(endpoint: string, fallbackFilename: string): Promise<void> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);

  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default apiCall;
