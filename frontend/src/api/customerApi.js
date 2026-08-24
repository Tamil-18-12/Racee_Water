import api from './axios';

export const createCustomer = (data) => api.post('/api/customers', data);
export const getAllCustomers = () => api.get('/api/customers');
export const getCustomerById = (id) => api.get(`/api/customers/${id}`);
export const getCustomerByMobile = (mobile) => api.get(`/api/customers/mobile/${mobile}`);
export const searchCustomers = (query) => api.get('/api/customers/search', { params: { query } });
export const updateCustomer = (id, data) => api.put(`/api/customers/${id}`, data);
