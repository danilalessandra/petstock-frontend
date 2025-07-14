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

// Obtener todas las órdenes de compra
export const getOrdenes = async () => {
    try {
        const config = getAuthHeaders();
        // ¡CAMBIO AQUÍ! Usa '/ordenes-compra'
        const response = await api.get("/ordenes-compra", config); 
        return response.data; 
    } catch (error) {
        console.error("Error en getOrdenes (servicio):", error);
        throw error;
    }
};

// Obtener una orden de compra por ID
export const getOrden = async (id) => {
    try {
        const config = getAuthHeaders();
        // ¡CAMBIO AQUÍ! Usa '/ordenes-compra'
        const response = await api.get(`/ordenes-compra/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Error en getOrden (servicio):", error);
        throw error;
    }
};

// Registrar una nueva orden de compra
export const registrarOrden = async (ordenData) => {
    try {
        const config = getAuthHeaders();
        // ¡CAMBIO AQUÍ! Usa '/ordenes-compra'
        const response = await api.post("/ordenes-compra", ordenData, config);
        return response.data;
    } catch (error) {
        console.error("Error en registrarOrden (servicio):", error);
        throw error;
    }
};

// Editar una orden de compra existente
export const editarOrden = async (id, ordenData) => {
    try {
        const config = getAuthHeaders();
        // ¡CAMBIO AQUÍ! Usa '/ordenes-compra'
        const response = await api.put(`/ordenes-compra/${id}`, ordenData, config);
        return response.data;
    } catch (error) {
        console.error("Error en editarOrden (servicio):", error);
        throw error;
    }
};

// Eliminar una orden de compra
export const eliminarOrden = async (id) => {
    try {
        const config = getAuthHeaders();
        // ¡CAMBIO AQUÍ! Usa '/ordenes-compra'
        const response = await api.delete(`/ordenes-compra/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Error en eliminarOrden (servicio):", error);
        throw error;
    }
};

export const confirmarRecepcionOrden = async (id) => {
  try {
    const config = getAuthHeaders();
    const response = await api.post(`/ordenes-compra/${id}/confirmar-recepcion`, {}, config);
    return response.data;
  } catch (error) {
    console.error(`Error al confirmar recepción (Orden ID: ${id}):`, error);
    throw error;
  }
};









