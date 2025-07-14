// src/api/ventasService.js
import api from "./api"; // Importa tu instancia de Axios configurada globalmente

/**
 * Obtiene la lista de todas las ventas desde el backend.
 * Utiliza el interceptor de Axios para la autenticación.
 * @returns {Promise<Array>} Un array de objetos de venta.
 * @throws {Error} Si la solicitud falla.
 */
export const getVentas = async () => {
  try {
    const response = await api.get("/ventas");
    return response.data; // Retorna directamente los datos (el array de ventas)
  } catch (error) {
    console.error("Error en getVentas:", error);
    throw error; // Propaga el error para que el componente lo maneje
  }
};

/**
 * Obtiene una venta específica por su ID desde el backend.
 * Utiliza el interceptor de Axios para la autenticación.
 * @param {string|number} id El ID de la venta a obtener.
 * @returns {Promise<Object>} El objeto de la venta.
 * @throws {Error} Si la solicitud falla o la venta no se encuentra.
 */
export const getVenta = async (id) => {
  try {
    const response = await api.get(`/ventas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en getVenta (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * Registra una nueva venta en el backend.
 * Utiliza el interceptor de Axios para la autenticación.
 * @param {Object} ventaData Los datos de la nueva venta (fecha, usuario_id, detalles de productos).
 * @returns {Promise<Object>} El objeto de la venta recién creada.
 * @throws {Error} Si la solicitud falla.
 */
export const registrarVenta = async (ventaData) => {
  try {
    const response = await api.post("/ventas", ventaData);
    return response.data;
  } catch (error) {
    console.error("Error en registrarVenta:", error);
    throw error;
  }
};

/**
 * Actualiza una venta existente en el backend.
 * Utiliza el interceptor de Axios para la autenticación.
 * @param {string|number} id El ID de la venta a actualizar.
 * @param {Object} venta Los datos actualizados de la venta.
 * @returns {Promise<Object>} El objeto de la venta actualizada.
 * @throws {Error} Si la solicitud falla.
 */
export const editarVenta = async (id, venta) => {
  try {
    const response = await api.put(`/ventas/${id}`, venta);
    return response.data;
  } catch (error) {
    console.error(`Error en editarVenta (ID: ${id}):`, error);
    throw error;
  }
};

/**
 * Elimina una venta del backend.
 * Utiliza el interceptor de Axios para la autenticación.
 * @param {string|number} id El ID de la venta a eliminar.
 * @returns {Promise<Object>} Un mensaje de confirmación de eliminación.
 * @throws {Error} Si la solicitud falla.
 */
export const eliminarVenta = async (id) => {
  try {
    const response = await api.delete(`/ventas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en eliminarVenta (ID: ${id}):`, error);
    throw error;
  }
};
