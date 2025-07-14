// src/pages/Ventas/DetallesVenta.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getVenta } from '../../api/ventasService';
import moment from 'moment'; // Importar moment para formatear fechas

function DetallesVenta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usa el contexto del tema si es necesario para estilos específicos, aunque la mayoría se gestiona con CSS global
  // const { isDarkMode } = useTheme();

  useEffect(() => {
    async function fetchVentaDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVenta(id);
        console.log("Detalles de Venta obtenidos (con Usuario):", data);
        setVenta(data);
      } catch (err) {
        console.error(`Error al cargar detalles de la venta ${id}:`, err);
        setError(`Error al cargar los detalles de la venta. ${err.response?.data?.error || 'Intenta de nuevo.'}`);
      } finally {
        setLoading(false);
      }
    }
    fetchVentaDetails();
  }, [id]);

  const totalVentaCalculado = venta?.detalles?.reduce((acc, detalle) => {
    const precio = Number(detalle.precio_unitario);
    return acc + (detalle.cantidad * precio);
  }, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <p>Cargando detalles de la venta...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <p style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>{error}</p>
          <button
            onClick={() => navigate('/ventas')}
            className="btn" // Usar la clase global de botón
            style={{ marginTop: '1rem' }}
          >
            Volver al historial
          </button>
        </main>
      </div>
    );
  }

  if (!venta) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '1rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <p>Venta no encontrada.</p>
          <button
            onClick={() => navigate('/ventas')}
            className="btn" // Usar la clase global de botón
            style={{ marginTop: '1rem' }}
          >
            Volver al historial
          </button>
        </main>
      </div>
    );
  }

  const nombreUsuario = venta?.Usuario?.nombre || venta?.Usuario?.email || 'Desconocido';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: '1rem' }}>
        <h2 style={{ color: 'var(--color-secondary)' }}>Detalles de Venta #{venta.id}</h2>

        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="btn" // Aplicar la clase global de botón
          style={{ marginBottom: '1rem', background: 'var(--color-secondary)', color: 'var(--color-text-light)' }} // Estilo personalizado o btn-secondary
        >
          Volver
        </button>

        {/* Contenedor de detalles de la venta */}
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
          <p><strong>ID Venta:</strong> {venta.id}</p>
          <p><strong>Fecha:</strong> {moment(venta.fecha).format("DD/MM/YYYY")}</p>
          <p>
            <strong>Registrada por:</strong> {nombreUsuario} (ID: {venta.usuario_id})
          </p>
          <p><strong>Fecha de Creación:</strong> {moment(venta.createdAt).format("DD/MM/YYYY HH:mm")}</p>
          <p><strong>Última Actualización:</strong> {moment(venta.updatedAt).format("DD/MM/YYYY HH:mm")}</p>
        </div>

        <h3 style={{ marginTop: '20px', color: 'var(--color-secondary)' }}>Productos en esta Venta:</h3>
        {venta.detalles && venta.detalles.length > 0 ? (
          <div className="responsive-table"> {/* Añadir clase para tablas responsivas */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                  <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Producto</th>
                  <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Cantidad</th>
                  <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Precio Unitario</th>
                  <th style={{ padding: '1rem', border: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.detalles.map((detalle, index) => (
                  <tr key={detalle.id || index} className={index % 2 === 0 ? 'even' : 'odd'}> {/* Añadir clases para zebra-striping */}
                    <td data-label="Producto" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                      {detalle.producto ? detalle.producto.nombre : 'Producto Desconocido'}
                    </td>
                    <td data-label="Cantidad" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>{detalle.cantidad}</td>
                    <td data-label="Precio Unitario" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>${Number(detalle.precio_unitario).toFixed(2)}</td>
                    <td data-label="Subtotal" style={{ padding: '0.75rem 1rem', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                      ${(detalle.cantidad * Number(detalle.precio_unitario)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--color-text)' }}>No hay productos registrados para esta venta.</p>
        )}

        {/* Posición del total de la venta - ahora en la misma línea que DetallesOrden */}
        <h3 style={{ marginTop: "20px", color: 'var(--color-secondary)' }}>
          Total de la Venta: ${totalVentaCalculado?.toFixed(2) || '0.00'}
        </h3>

        {/* Botón Volver al Historial */}
        <button
          onClick={() => navigate('/ventas')}
          className="btn" // Usar la clase global de botón
          style={{ marginTop: '1rem' }}
        >
          Volver al Historial
        </button>
      </main>
    </div>
  );
}

export default DetallesVenta;