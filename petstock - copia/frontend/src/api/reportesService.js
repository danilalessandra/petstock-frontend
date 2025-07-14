// frontend/src/api/reportesService.js
import api from "./api"; // Asegúrate de que tu instancia de Axios 'api' está configurada

// Función auxiliar para obtener los headers de autorización
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

// Obtener reporte de ventas generales
export const getReporteVentas = async () => { // <--- ¡NUEVA FUNCIÓN AÑADIDA!
  try {
    const config = getAuthHeaders();
    const response = await api.get("/reportes/ventas", config); // Apunta a la ruta /reportes/ventas
    return response.data;
  } catch (error) {
    console.error("Error en getReporteVentas (servicio):", error);
    throw error;
  }
};

// Obtener reporte de ventas mensuales
export const getReporteVentasMensuales = async () => {
  try {
    const config = getAuthHeaders();
    const response = await api.get("/reportes/ventas-mensuales", config);
    return response.data;
  } catch (error) {
    console.error("Error en getReporteVentasMensuales (servicio):", error);
    throw error;
  }
};

// Obtener reporte de inventario
export const getReporteInventario = async () => {
  try {
    const config = getAuthHeaders();
    const response = await api.get("/reportes/inventario", config);
    return response.data;
  } catch (error) {
    console.error("Error en getReporteInventario (servicio):", error);
    throw error;
  }
};

// Obtener reporte de proveedores
export const getReporteProveedores = async () => {
  try {
    const config = getAuthHeaders();
    const response = await api.get("/reportes/proveedores", config);
    return response.data;
  } catch (error) {
    console.error("Error en getReporteProveedores (servicio):", error);
    throw error;
  }
};

// Obtener reporte de órdenes de compra
export const getReporteOrdenes = async () => {
  try {
    const config = getAuthHeaders();
    const response = await api.get("/reportes/ordenes", config);
    return response.data;
  } catch (error) {
    console.error("Error en getReporteOrdenes (servicio):", error);
    throw error;
  }
};
