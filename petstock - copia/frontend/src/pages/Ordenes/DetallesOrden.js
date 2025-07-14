// frontend/src/pages/Ordenes/DetallesOrden.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getOrden, confirmarRecepcionOrden } from "../../api/ordenesCompraService";
import moment from "moment";


function DetallesOrden() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        setLoading(true);
        const data = await getOrden(id);
        setOrden(data);
      } catch (err) {
        setError("Error al cargar los detalles de la orden");
      } finally {
        setLoading(false);
      }
    };
    fetchOrden();
  }, [id]);

  const calcularTotal = () => {
    if (!orden?.detalles) return 0;
    return orden.detalles.reduce((suma, item) => suma + (item.cantidad * parseFloat(item.precio || 0)), 0);
  };

  const confirmarRecepcion = async () => {
    try {
      await confirmarRecepcionOrden(id);
      alert("Recepción confirmada. Stock actualizado.");
      // Recargar los datos actualizados
      const data = await getOrden(id);
      setOrden(data);
    } catch (error) {
      console.error("Error al confirmar recepción:", error);
      alert("Hubo un problema al confirmar la recepción.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2 style={{ color: 'var(--color-secondary)' }}>Detalles de Orden #{id}</h2>

        {/* Botón Volver (al historial inmediato) */}
        <button
          onClick={() => navigate(-1)}
          className="btn" // Aplicar la clase global de botón
          style={{ marginBottom: '1rem', background: 'var(--color-secondary)', color: 'var(--color-text-light)' }}
        >
          Volver
        </button>

        {loading && <p style={{ color: 'var(--color-primary)' }}>Cargando...</p>}
        {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}

        {!loading && orden && (
          <>
            {/* Contenedor de detalles de la orden */}
            <div style={{
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--glass-shadow)',
              backgroundColor: 'var(--color-bg-glass)',
              color: 'var(--color-text)',
              transition: 'background-color var(--transition), border-color var(--transition), box-shadow var(--transition), color var(--transition)'
            }}>
              <p><strong>Proveedor:</strong> {orden.proveedor?.nombre}</p>
              <p><strong>Fecha:</strong> {moment(orden.fecha).format("DD/MM/YYYY")}</p>
              <p><strong>Estado:</strong> {orden.estado}</p>
            </div>

            {orden.estado !== "recibida" && (
              <button
                onClick={confirmarRecepcion}
                className="btn" // Usar la clase global de botón
                style={{ marginBottom: "1.5rem", background: 'var(--color-success)', color: 'var(--color-text-light)' }}
              >
                Confirmar Recepción
              </button>
            )}

            <h3 style={{ marginTop: "20px", color: 'var(--color-secondary)' }}>Productos en esta Orden:</h3>
            <div className="responsive-table">
              <table style={{ width: "100%", borderCollapse: "collapse" }} border="1">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                    <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Producto</th>
                    <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Cantidad</th>
                    <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Precio Unitario</th>
                    <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.detalles?.map((item, index) => {
                    const precio = parseFloat(item.precio || 0);
                    return (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'even' : 'odd'}>
                        <td data-label="Producto" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>{item.producto?.nombre}</td>
                        <td data-label="Cantidad" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>{item.cantidad}</td>
                        <td data-label="Precio Unitario" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>${precio.toFixed(2)}</td>
                        <td data-label="Subtotal" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>${(item.cantidad * precio).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total de la Orden */}
            <h3 style={{ marginTop: "30px", color: 'var(--color-secondary)' }}>
              Total de la Orden: ${calcularTotal().toFixed(2)}
            </h3>

            {/* Botón Volver al Historial de Órdenes */}
            <button
              onClick={() => navigate('/ordenes')} // Asume que el historial de órdenes está en /ordenes
              className="btn"
              style={{ marginTop: '1.5rem' }} // Agrega un poco de espacio superior
            >
              Volver al Historial de Órdenes
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default DetallesOrden;