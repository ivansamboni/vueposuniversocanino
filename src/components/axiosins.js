import axios from 'axios';


const axiosInst = axios.create();

// Interceptor de solicitud para agregar token y tenant_id
axiosInst.interceptors.request.use((config) => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const userls = JSON.parse(userString);
      const token = userls.accessToken;
      const tenantId = userls.tenant_id;
      const role = userls.role; // <-- agrega role en tu objeto user al guardar
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    } catch (error) {
      console.error('Error al parsear el JSON de localStorage:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de respuesta para manejar errores globales
axiosInst.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        window.location.href = '/noautorizado';
      }     
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }   
    }
    return Promise.reject(error);
  }
);

export default axiosInst;
