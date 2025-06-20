import axios from 'axios';

const axiosInst = axios.create();

// Interceptor de solicitud para agregar el token
axiosInst.interceptors.request.use((config) => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const userls = JSON.parse(userString); // Parsear la cadena JSON
      const token = userls.accessToken; // Acceder al token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al parsear el JSON de localStorage:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de respuesta para manejar errores
axiosInst.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Token inválido: cerrar sesión
        console.error('Token inválido, cerrando sesión');
        localStorage.removeItem('user');
        window.location.href = '/auth/login'; // Redirigir al login
      } 
      
      else if (status === 403) {
        // No autorizado pero sesión válida: redirigir sin cerrar sesión
        
        console.warn('Acceso denegado, redirigiendo...');       
        window.location.href = '/noautorizado'; 
      
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInst;
