import api from './axios';

export const getCanStatus = () => api.get('/api/orders/can-status');
export const createPublicOrder = (data) => api.post('/api/orders/public', data);
export const createOrderForCustomer = (customerId, data) => api.post(`/api/orders/customer/${customerId}`, data);
export const getAllOrders = (from, to) => api.get('/api/orders', { params: { from, to } });
export const getTodayOrders = () => api.get('/api/orders/today');
export const getOrderById = (id) => api.get(`/api/orders/${id}`);
export const getOrdersByCustomer = (customerId) => api.get(`/api/orders/customer/${customerId}`);
export const addPayment = (id, data) => api.post(`/api/orders/${id}/payment`, data);
export const addEmptyCanReturn = (id, data) => api.post(`/api/orders/${id}/empty-can`, data);
export const updateOrderStatus = (id, status, canNumbers) => api.put(`/api/orders/${id}/status`, { status, canNumbers });
export const deleteOrder = (id) => api.delete(`/api/orders/${id}`);
