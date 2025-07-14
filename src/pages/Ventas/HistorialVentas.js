import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getVentas, eliminarVenta } from "../../api/ventasService";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa"; // Importa los iconos aquí

function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVentas();
      console.log("Ventas obtenidas del backend (con detalles):", res);

      const ventasData = Array.isArray(res.data) ? res.data : res; // Asegurarse de que sea un array
      const ventasConTotal = ventasData.map(venta => {
        let totalCalculado = 0;
        if (venta.detalles?.length > 0) {
          totalCalculado = venta.detalles.reduce((acc, detalle) => {
            const precio = Number(detalle.precio_unitario);
            return acc + (detalle.cantidad * precio);
          }, 0);
        }
        return {
          ...venta,
          totalCalculado
        };
      });

      setVentas(ventasConTotal);
    } catch (err) {
      console.error("Error al cargar historial de ventas:", err);
      setError("Error al cargar historial. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const handleViewDetails = (id) => navigate(`/ventas/detalles/${id}`);
  const handleEditSale = (id) => navigate(`/ventas/editar/${id}`);
  const handleDeleteSale = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer y ajustará el stock de los productos.")) {
      try {
        await eliminarVenta(id);
        alert("Venta eliminada exitosamente y stock ajustado.");
        fetchVentas();
      } catch (err) {
        console.error("Error al eliminar venta:", err);
        alert("Error al eliminar la venta.");
      }
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}> {/* Añadido minHeight para consistencia */}
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: "1rem" }}> {/* Añadida clase y padding */}
        <h2>Historial de Ventas</h2>

        <button
          onClick={() => navigate("/ventas/registrar")}
          className="btn btn-primary"
          style={{ marginBottom: "1rem" }}
        >
          Registrar Nueva Venta
        </button>

        {loading && <p>Cargando historial de ventas...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {ventas.length > 0 ? (
              <div className="table-responsive" style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                {/* Añadida la clase 'responsive-table' */}
                <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>ID Venta</th>
                      <th>Fecha</th>
                      <th>Usuario ID</th>
                      <th>Productos Vendidos</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th> {/* Centrar el encabezado de acciones */}
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map(venta => (
                      <tr key={venta.id}>
                        {/* Añadidos data-label a cada td */}
                        <td data-label="ID Venta">{venta.id}</td>
                        <td data-label="Fecha">{new Date(venta.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                        <td data-label="Usuario ID">{venta.usuario_id}</td>
                        <td data-label="Productos Vendidos">
                          {venta.detalles?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}> {/* Añadido margin: 0 */}
                              {venta.detalles.map(detalle => (
                                <li key={detalle.id}>
                                  {detalle.producto?.nombre || 'Producto Desconocido'} (x{detalle.cantidad}) - ${Number(detalle.precio_unitario).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Sin productos"
                          )}
                        </td>
                        <td data-label="Total">${venta.totalCalculado.toFixed(2)}</td>
                        <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleViewDetails(venta.id)}
                            className="btn btn-primary btn-icon" // Clase btn-icon para el icono
                            aria-label="Ver detalles de venta"
                          >
                            <FaEye /> {/* Icono de ojo */}
                          </button>
                          <button
                            onClick={() => handleEditSale(venta.id)}
                            className="btn btn-secondary btn-icon" // Cambiado a btn-secondary para el color amarillo/naranja
                            aria-label="Editar venta"
                          >
                            <FaPencilAlt /> {/* Icono de lápiz */}
                          </button>
                          <button
                            onClick={() => handleDeleteSale(venta.id)}
                            className="btn btn-danger btn-icon" // Clase btn-icon para el icono
                            aria-label="Eliminar venta"
                          >
                            <FaTrashAlt /> {/* Icono de basura */}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay ventas registradas aún.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HistorialVentas;