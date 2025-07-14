// frontend/src/api/usuariosService.js
import api from './api'; // Asegúrate de que 'api.js' configura tu instancia de Axios

// Función auxiliar para obtener el token de localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }
  return {};
};

// Obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const config = getAuthHeaders();
    const response = await api.get('/usuarios', config);
    return response.data;
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    throw error;
  }
};

// Obtener un usuario por ID
export const getUsuario = async (id) => {
  try {
    const config = getAuthHeaders();
    const response = await api.get(`/usuarios/${id}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error en getUsuario (ID: ${id}):`, error);
    throw error;
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (userData) => {
  try {
    const config = getAuthHeaders();
    const response = await api.post('/usuarios', userData, config);
    return response.data;
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    throw error;
  }
};

// Actualizar un usuario existente
export const actualizarUsuario = async (id, userData) => {
  try {
    const config = getAuthHeaders();
    const response = await api.put(`/usuarios/${id}`, userData, config);
    return response.data;
  } catch (error) {
    console.error(`Error en actualizarUsuario (ID: ${id}):`, error);
    throw error;
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (id) => {
  try {
    const config = getAuthHeaders();
    const response = await api.delete(`/usuarios/${id}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error en eliminarUsuario (ID: ${id}):`, error);
    throw error;
  }
};
