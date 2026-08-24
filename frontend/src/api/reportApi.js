import api from './axios';

export const getCustomerHistoryPdf = (id) =>
  api.get(`/api/reports/customer/${id}/pdf`, { responseType: 'blob' });

export const getDailyReportPdf = (date) =>
  api.get('/api/reports/daily/pdf', { params: { date }, responseType: 'blob' });

export const getCustomersPdf = () =>
  api.get('/api/reports/customers/pdf', { responseType: 'blob' });

export const getOrdersPdf = (from, to) =>
  api.get('/api/reports/orders/pdf', { params: { from, to }, responseType: 'blob' });

export const getOrdersExcel = (from, to) =>
  api.get('/api/reports/orders/excel', { params: { from, to }, responseType: 'blob' });

export const getCustomersExcel = () =>
  api.get('/api/reports/customers/excel', { responseType: 'blob' });

export const downloadBlob = (data, filename) => {
  if (!data) return;

  // Determine MIME type from extension
  let mimeType = 'application/octet-stream';
  if (filename.endsWith('.xlsx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (filename.endsWith('.pdf')) {
    mimeType = 'application/pdf';
  }

  const blob = data instanceof Blob ? new Blob([data], { type: mimeType }) : new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }, 200);
};

