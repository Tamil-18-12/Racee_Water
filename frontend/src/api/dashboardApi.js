import api from './axios';

export const getDashboardSummary = () => api.get('/api/dashboard/summary');
export const getDashboardToday = () => api.get('/api/dashboard/today');
