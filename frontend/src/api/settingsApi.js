import api from './axios';

export const getPublicSettings = () => api.get('/api/settings/public');
export const getSettings = () => api.get('/api/settings');
export const updateSettings = (data) => api.put('/api/settings', data);
