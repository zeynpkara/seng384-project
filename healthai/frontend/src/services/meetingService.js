import api from './api'

export const meetingService = {
  create: (data) => api.post('/api/meetings', data),
  list: (params) => api.get('/api/meetings', { params }),
  get: (id) => api.get(`/api/meetings/${id}`),
  accept: (id, acceptedTime) => api.patch(`/api/meetings/${id}/accept`, { accepted_time: acceptedTime }),
  decline: (id) => api.patch(`/api/meetings/${id}/decline`),
  complete: (id) => api.patch(`/api/meetings/${id}/complete`),
  cancel: (id) => api.patch(`/api/meetings/${id}/cancel`),
}
