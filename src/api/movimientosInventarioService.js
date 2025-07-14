// frontend/src/api/movimientosInventarioService.js
import api from "./api"; 

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

// Quita '/api' porque ya está en baseURL de api.js
const BASE_PATH = "/movimientos-inventario";

export const getMovimientosInventario = async () => {
    try {
        const config = getAuthHeaders();
        const response = await api.get(BASE_PATH, config);
        return response.data;
    } catch (error) {
        console.error("Error en getMovimientosInventario (servicio):", error);
        throw error;
    }
};

export const registrarMovimientoInventario = async (movimientoData) => {
    try {
        const config = getAuthHeaders();
        const response = await api.post(BASE_PATH, movimientoData, config);
        return response.data;
    } catch (error) {
        console.error("Error en registrarMovimientoInventario (servicio):", error);
        throw error;
    }
};

export const actualizarMovimientoInventario = async (id, movimientoData) => {
    try {
        const config = getAuthHeaders();
        const response = await api.put(`${BASE_PATH}/${id}`, movimientoData, config);
        return response.data;
    } catch (error) {
        console.error("Error en actualizarMovimientoInventario (servicio):", error);
        throw error;
    }
};

export const eliminarMovimientoInventario = async (id) => {
    try {
        const config = getAuthHeaders();
        const response = await api.delete(`${BASE_PATH}/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Error en eliminarMovimientoInventario (servicio):", error);
        throw error;
    }
};
