import api from "./api"; // Importa tu instancia de Axios configurada globalmente

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

// Obtener todos los proveedores
export const getProveedores = async () => {
    try {
        const config = getAuthHeaders(); // Incluir headers de autenticación
        const response = await api.get("/proveedores", config); 
        return response.data; 
    } catch (error) {
        console.error("Error en getProveedores (servicio):", error);
        throw error;
    }
};

// Obtener un proveedor por ID
export const getProveedor = async (id) => {
    try {
        const config = getAuthHeaders(); // Incluir headers de autenticación
        const response = await api.get(`/proveedores/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Error en getProveedor (servicio):", error);
        throw error;
    }
};

// Agregar un nuevo proveedor
export const agregarProveedor = async (proveedor) => {
    try {
        const config = getAuthHeaders(); // Incluir headers de autenticación
        const response = await api.post("/proveedores", proveedor, config);
        return response.data;
    } catch (error) {
        console.error("Error en agregarProveedor (servicio):", error);
        throw error;
    }
};

// Editar un proveedor existente
export const editarProveedor = async (id, proveedor) => {
    try {
        const config = getAuthHeaders(); // Incluir headers de autenticación
        const response = await api.put(`/proveedores/${id}`, proveedor, config);
        return response.data;
    } catch (error) {
        console.error("Error en editarProveedor (servicio):", error);
        throw error;
    }
};

// Eliminar un proveedor
export const eliminarProveedor = async (id) => {
    try {
        const config = getAuthHeaders(); // Incluir headers de autenticación
        const response = await api.delete(`/proveedores/${id}`, config);
        return response.data;
    } catch (error) {
        console.error("Error en eliminarProveedor (servicio):", error);
        throw error;
    }
};
