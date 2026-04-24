import api from './api'

export const postService = {
  list: (params) => api.get('/api/posts', { params }),
  mine: () => api.get('/api/posts/mine'),
  get: (id) => api.get(`/api/posts/${id}`),
  create: (data) => api.post('/api/posts', data),
  update: (id, data) => api.put(`/api/posts/${id}`, data),
  changeStatus: (id, status) => api.patch(`/api/posts/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/posts/${id}`),
}
