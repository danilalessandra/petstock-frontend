import React, { useState, useEffect } from 'react';
import { obtenerSugerenciasReabastecimiento, generarOrdenCompra } from '../api/reabastecimientoService';
import Sidebar from './Sidebar'; // Importa el Sidebar, asumiendo que está en el mismo directorio (components)
import '../assets/css/Dashboard.css'; // Importa los estilos del dashboard para el layout general

function ReabastecimientoTabla() {
    const [sugerencias, setSugerencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        const loadSugerencias = async () => {
            try {
                const data = await obtenerSugerenciasReabastecimiento();
                const processedSugerencias = data.map(sug => {
                    return {
                        ...sug,
                        promedio_venta_diaria: parseFloat(sug.promedio_venta_diaria) || 0,
                        dias_stock_restantes: parseFloat(sug.dias_stock_restantes) || 0
                    };
                });
                setSugerencias(processedSugerencias);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSugerencias();
    }, []);

    const handleCheckboxChange = (product) => {
        setSelectedProducts(prevSelected => {
            const productIdToUse = product.id_producto || product.id;

            if (prevSelected.some(p => p.id === productIdToUse)) {
                return prevSelected.filter(p => p.id !== productIdToUse);
            } else {
                return [...prevSelected, { id: productIdToUse, cantidad_a_pedir: product.cantidad_sugerida_a_pedir }];
            }
        });
    };

    const handleGenerarOrdenCompra = async () => {
        if (selectedProducts.length === 0) {
            alert('Por favor, selecciona al menos un producto para la orden de compra.');
            return;
        }

        const productosParaOC = selectedProducts;

        console.log('Productos que se enviarán a generarOrdenCompra (FINAL CHECK):', productosParaOC);

        try {
            const result = await generarOrdenCompra(productosParaOC);
            alert(result.message || 'Órdenes de compra generadas exitosamente!');

            setSelectedProducts([]);
            // Si necesitas recargar las sugerencias después de generar la OC, descomenta la línea de abajo:
            // await loadSugerencias();

        } catch (err) {
            console.error('Error al crear la orden de compra:', err);
            alert(`Error al crear la orden de compra: ${err.message}`);
        }
    };

    // Renderiza la estructura completa del dashboard incluso durante la carga o error
    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <main className="dashboard-main" role="main" tabIndex={-1}>
                    <header className="dashboard-header">
                        <h1>Asistente de Reabastecimiento Inteligente</h1>
                    </header>
                    <p>Cargando sugerencias de reabastecimiento...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <main className="dashboard-main" role="main" tabIndex={-1}>
                    <header className="dashboard-header">
                        <h1>Asistente de Reabastecimiento Inteligente</h1>
                    </header>
                    <p style={{ color: 'red' }}>Error: {error}</p>
                </main>
            </div>
        );
    }

    return (
        // Envuelve todo el contenido de ReabastecimientoTabla con la estructura del dashboard
        <div className="dashboard-container">
            <Sidebar /> {/* Agrega el Sidebar aquí*/}
            <main className="dashboard-main" role="main" tabIndex={-1}> {/**/}
                <header className="dashboard-header"> {/**/}
                    <h1>Asistente de Reabastecimiento Inteligente</h1> {/**/}
                    <p>Gestiona las sugerencias de reabastecimiento para tu inventario.</p> {/**/}
                </header>

                {/* Contenedor de la tabla para aplicar estilos globales */}
                <div style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                    {sugerencias.length > 0 ? (
                        <>
                            {/* Añadida la clase 'responsive-table' */}
                            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th>Seleccionar</th>
                                        <th>Producto</th>
                                        <th>Stock Actual</th>
                                        <th>Venta Diaria Promedio</th>
                                        <th>Días Restantes</th>
                                        <th>Cant. Sugerida</th>
                                        <th>Proveedor</th>
                                        <th>Motivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sugerencias.map(sug => (
                                        <tr key={sug.id_producto || sug.id}>
                                            {/* Añadidos data-label a cada td */}
                                            <td data-label="Seleccionar">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.some(p => p.id === (sug.id_producto || sug.id))}
                                                    onChange={() => handleCheckboxChange(sug)}
                                                />
                                            </td>
                                            <td data-label="Producto">{sug.nombre_producto}</td>
                                            <td data-label="Stock Actual">{sug.stock_actual}</td>
                                            <td data-label="Venta Diaria Promedio">
                                                {
                                                    typeof sug.promedio_venta_diaria === 'number' && Number.isFinite(sug.promedio_venta_diaria)
                                                    ? sug.promedio_venta_diaria.toFixed(2)
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td data-label="Días Restantes">
                                                {
                                                    typeof sug.dias_stock_restantes === 'number' && Number.isFinite(sug.dias_stock_restantes)
                                                    ? sug.dias_stock_restantes.toFixed(2)
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td data-label="Cant. Sugerida">{sug.cantidad_sugerida_a_pedir}</td>
                                            <td data-label="Proveedor">{sug.proveedor_sugerido}</td>
                                            <td data-label="Motivo">{sug.motivo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                onClick={handleGenerarOrdenCompra}
                                disabled={selectedProducts.length === 0}
                                className="btn btn-primary" // Aplicar clases de estilo global
                                style={{ marginTop: '2rem', marginBottom: '1rem' }} // Añadir margen superior e inferior
                            >
                                Generar Orden de Compra de Seleccionados
                            </button>
                        </>
                    ) : (
                        <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay sugerencias de reabastecimiento en este momento.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ReabastecimientoTabla;