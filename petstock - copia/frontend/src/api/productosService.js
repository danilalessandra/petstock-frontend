// src/api/productosService.js
import api from './api'; // Asegúrate de que esta es tu instancia configurada de Axios

// Función auxiliar para obtener el token de localStorage
// Esto asegura que cada solicitud incluye el token JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // Obtenemos el token guardado en el login
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}` // Formato estándar para enviar tokens JWT
      }
    };
  }
  return {}; // Si no hay token, devuelve un objeto de configuración vacío
};

// Función para obtener todos los productos
export const getProductos = async () => {
  try {
    const config = getAuthHeaders(); // Obtiene los headers de autorización
    const response = await api.get("/productos", config); // Pasa la configuración a la solicitud
    return response.data;
  } catch (error) {
    console.error("Error en getProductos:", error);
    throw error;
  }
};

// Función para obtener un producto por ID
export const getProducto = async (id) => {
  try {
    const config = getAuthHeaders();
    const response = await api.get(`/productos/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Error en getProducto:", error);
    throw error;
  }
};

// Función para agregar un producto
export const agregarProducto = async (productoData) => {
  try {
    const config = getAuthHeaders();
    const response = await api.post("/productos", productoData, config); // Pasa la configuración a la solicitud
    return response.data;
  } catch (error) {
    console.error("Error en agregarProducto:", error);
    throw error;
  }
};

// Función para editar un producto
export const editarProducto = async (id, productoData) => {
  try {
    const config = getAuthHeaders();
    const response = await api.put(`/productos/${id}`, productoData, config);
    return response.data;
  } catch (error) {
    console.error("Error en editarProducto:", error);
    throw error;
  }
};

// Función para eliminar un producto
export const eliminarProducto = async (id) => {
  try {
    const config = getAuthHeaders();
    const response = await api.delete(`/productos/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Error en eliminarProducto:", error);
    throw error;
  }
};
