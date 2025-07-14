// frontend/src/api/api.js
import axios from 'axios';

// Define la URL base de la API usando una variable de entorno.
// Si process.env.REACT_APP_API_URL no está definida (ej. en algunos entornos de desarrollo local
// o si la variable no se carga por alguna razón), usará la URL de Render como fallback.
// Esto asegura que siempre haya una URL válida para las llamadas.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://petstock-backend-api.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Añade "/api" aquí si todas tus rutas de backend lo incluyen
  withCredentials: true, // Importante para enviar y recibir cookies
});

// Interceptor de solicitud para añadir el token de acceso
api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de respuesta para manejar la expiración del token y el refresh
api.interceptors.response.use(response => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  // Si el error es 401 (Unauthorized) y no es la petición de login/refresh y no se ha reintentado
  if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
    originalRequest._retry = true; // Marca la petición como reintentada
    try {
      // Intenta refrescar el token usando la URL de la API desplegada
      const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
      const newAccessToken = refreshResponse.data.accessToken;

      // Actualiza el token en localStorage y el encabezado de la petición original
      localStorage.setItem('accessToken', newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

      // Reintenta la petición original con el nuevo token
      return api(originalRequest);
    } catch (refreshError) {
      console.error("Error al refrescar token o al reintentar la petición:", refreshError);
      // Si falla el refresh o el token sigue inválido, redirige al login
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; 
      return Promise.reject(refreshError); 
    }
  } 
  // Si el error es 403 (Forbidden) también redirige al login
  else if (error.response.status === 403) {
      console.error("Acceso prohibido (403). Redirigiendo al login.");
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
  }
  // Para otros errores (400, 500, etc.), simplemente propaga el error
  return Promise.reject(error);
});

export default api;
