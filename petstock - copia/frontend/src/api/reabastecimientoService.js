// src/api/reabastecimientoService.js

import api from "./api"; // Importa tu instancia de Axios configurada

// Función para obtener las sugerencias de reabastecimiento
export async function obtenerSugerenciasReabastecimiento(diasAnalisis = 90, umbralStock = 14, diasCobertura = 30) {
    try {
        const params = {
            dias_analisis: diasAnalisis,
            umbral_dias_stock_minimo: umbralStock,
            dias_cobertura_deseados: diasCobertura
        };
        
        // Usar la instancia de Axios 'api'. El interceptor se encargará de los headers.
        const response = await api.get("/inventario/sugerencias-reabastecimiento", { params });
        
        return response.data;

    } catch (error) {
        console.error('Error en obtenerSugerenciasReabastecimiento:', error);
        // Axios ya envuelve los errores de respuesta en error.response
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw error; // Propagar el error original
    }
}

// Función para generar una orden de compra
export async function generarOrdenCompra(productosSeleccionados) {
    try {
        // Usar la instancia de Axios 'api'. El interceptor se encargará de los headers.
        const response = await api.post(
            "/ordenes-compra/generar-desde-sugerencias", 
            { productosSeleccionados: productosSeleccionados } // El body esperado por el backend
        );
        
        return response.data;

    } catch (error) {
        console.error('Error en generarOrdenCompra:', error);
        // Axios ya envuelve los errores de respuesta en error.response
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw error; // Propagar el error original
    }
}