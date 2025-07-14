// frontend/src/pages/Reportes/Reportes.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ThemeToggle from '../../components/ThemeToggle';

// Import icons from react-icons - FaFileInvoice removed
import { FaEye, FaExclamationTriangle, FaBox, FaChartBar, FaClipboardList, FaUsers, FaTag } from 'react-icons/fa';

import { useTheme } from '../../context/ThemeContext'; // Import useTheme context

import {
  getReporteVentasMensuales,
  getReporteInventario,
  getReporteProveedores,
  getReporteOrdenes,
  getReporteVentas
} from '../../api/reportesService';

function Reportes() {
  const [activeTab, setActiveTab] = useState('ventas');
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [ultimasVentas, setUltimasVentas] = useState([]);
  const [reporteInventario, setReporteInventario] = useState(null);
  const [reporteProveedores, setReporteProveedores] = useState(null);
  const [reporteOrdenes, setReporteOrdenes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the theme context to get the current theme mode
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'ventas') {
          const [mensualesData, ventasData, inventarioData] = await Promise.all([
            getReporteVentasMensuales(),
            getReporteVentas(),
            getReporteInventario()
          ]);
          setVentasMensuales(mensualesData.ventasPorMes);
          setUltimasVentas(ventasData.ultimasVentas);
          setReporteInventario(inventarioData);
        } else if (activeTab === 'inventario') {
          const data = await getReporteInventario();
          setReporteInventario(data);
        } else if (activeTab === 'proveedores') {
          const data = await getReporteProveedores();
          setReporteProveedores(data);
        } else if (activeTab === 'ordenes') {
          const data = await getReporteOrdenes();
          setReporteOrdenes(data);
        }
      } catch (err) {
        console.error(`Error al cargar el reporte de ${activeTab}:`, err);
        setError(`Error al cargar el reporte de ${activeTab}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, [activeTab]);

  // Función para formatear fechas en formato DD/MM/YYYY utilizando los componentes UTC
  const formatUTCDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para simular un gráfico de barras con divs (puedes reemplazar esto con una librería como Chart.js, Recharts, etc.)
  const renderBarChart = () => {
    if (!ventasMensuales || ventasMensuales.length === 0) {
      return <p style={{ color: 'var(--color-secondary)' }}>No hay datos de ventas mensuales disponibles para el gráfico.</p>;
    }

    // Encuentra el valor máximo para escalar las barras
    const maxSales = Math.max(...ventasMensuales.map(v => parseFloat(v.totalVentas)));
    // Asegura que maxSales no sea cero para evitar divisiones por cero
    const scaleFactor = maxSales > 0 ? 100 / maxSales : 0;

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '200px',
        paddingBottom: '10px',
        gap: '5px',
        width: '100%',
        position: 'relative',
        borderLeft: '1px solid var(--color-border)', // Use CSS variable
        borderBottom: '1px solid var(--color-border)', // Use CSS variable
        paddingLeft: '5px',
        paddingRight: '5px',
        justifyContent: 'space-around', // Distribuye el espacio entre las barras
        boxSizing: 'border-box', // Ensure padding is included in width
      }}>
        {/* Líneas de guía horizontales para el gráfico */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => (
          <div
            key={`line-${idx}`}
            style={{
              position: 'absolute',
              bottom: `${level * 100}%`,
              left: 0,
              width: '100%',
              borderTop: `1px dashed ${isDarkMode ? '#555' : '#eee'}`, // Adjust for theme
              zIndex: 0
            }}
          ></div>
        ))}

        {ventasMensuales.map((venta, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: `${(100 / ventasMensuales.length) * 0.8}%`, // Ancho relativo para cada barra, con un poco de espacio
            height: `${parseFloat(venta.totalVentas) * scaleFactor}%`, // Altura escalada
            backgroundColor: 'var(--color-primary)', // Use CSS variable
            borderRadius: '4px',
            position: 'relative',
            zIndex: 1, // Para que las barras estén por encima de las líneas de guía
            margin: '0 auto' // Centrar la barra en su espacio asignado
          }}>
            <span style={{ fontSize: '0.75rem', position: 'absolute', top: '-20px', color: 'var(--color-text)' }}>
              ${parseFloat(venta.totalVentas).toFixed(0)}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-secondary)', marginTop: '5px' }}>
              {monthNames[parseInt(venta.periodo.substring(5)) - 1]} {/* Muestra abreviatura del mes */}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
      <Sidebar />
      <main style={{
        flexGrow: 1,
        padding: '2rem',
        boxSizing: 'border-box',
        width: window.innerWidth < 768 ? '100%' : 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <ThemeToggle />
        </div>

        <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
            <li>Inicio</li>
            <li style={{ margin: '0 5px' }}>/</li>
            <li style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>Informes</li>
          </ol>
        </nav>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>Panel de informes</h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '2rem' }}>
          Visualiza y genera informes de ventas, inventario, proveedores y órdenes.
        </p>

        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          overflowX: 'auto', // Allow horizontal scrolling on small screens
        }}>
          <button
            onClick={() => setActiveTab('ventas')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'ventas' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'ventas' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'ventas' ? 'var(--color-primary)' : 'var(--color-secondary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              whiteSpace: 'nowrap', // Prevent text wrapping
            }}
          >
            <FaChartBar style={{ marginRight: '8px' }} /> Ventas
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'inventario' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'inventario' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'inventario' ? 'var(--color-primary)' : 'var(--color-secondary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              whiteSpace: 'nowrap',
            }}
          >
            <FaBox style={{ marginRight: '8px' }} /> Inventario
          </button>
          <button
            onClick={() => setActiveTab('proveedores')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'proveedores' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'proveedores' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'proveedores' ? 'var(--color-primary)' : 'var(--color-secondary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              whiteSpace: 'nowrap',
            }}
          >
            <FaUsers style={{ marginRight: '8px' }} /> Proveedores
          </button>
          <button
            onClick={() => setActiveTab('ordenes')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'ordenes' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'ordenes' ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === 'ordenes' ? 'var(--color-primary)' : 'var(--color-secondary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              whiteSpace: 'nowrap',
            }}
          >
            <FaClipboardList style={{ marginRight: '8px' }} /> Órdenes
          </button>
        </div>

        {loading && <p style={{ color: 'var(--color-primary)' }}>Cargando reportes...</p>}
        {error && <p style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>{error}</p>}

        {!loading && !error && (
          <div style={{
            backgroundColor: 'var(--color-bg-glass)', // Using glass background for card effect
            padding: '1.5rem',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--glass-shadow)',
            transition: 'background-color var(--transition), box-shadow var(--transition)',
          }}>
            {activeTab === 'ventas' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Resumen de ventas</h3>
                {renderBarChart()}

                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Ventas recientes</h3>
                <div className="responsive-table" style={{ overflowX: 'auto' }}> {/* Add responsive-table class */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Fecha</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Usuario</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Total</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Estado</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'center', color: 'var(--color-secondary)' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimasVentas.length > 0 ? (
                        ultimasVentas.map(venta => (
                          <tr key={venta.id} className={venta.id % 2 === 0 ? 'even' : 'odd'}> {/* Add even/odd classes for zebra striping if needed, otherwise CSS handles it */}
                            <td data-label="Fecha" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{formatUTCDate(venta.fecha)}</td>
                            <td data-label="Usuario" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{venta.usuario}</td>
                            <td data-label="Total" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>${venta.total.toFixed(2)}</td>
                            <td data-label="Estado" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{venta.estado}</td>
                            <td data-label="Acciones" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              <button className="btn btn-icon" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                <FaEye style={{ color: 'var(--color-primary)' }} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-text)' }}>No hay ventas recientes.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Inventario bajo</h3>
                <div className="responsive-table" style={{ overflowX: 'auto' }}> {/* Add responsive-table class */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Producto</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Existencias</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Categoría</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Proveedor</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'center', color: 'var(--color-secondary)' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteInventario && reporteInventario.productosDetalle && reporteInventario.productosDetalle.length > 0 ? (
                        reporteInventario.productosDetalle
                          .filter(p => p.stock < 10)
                          .map(producto => (
                            <tr key={producto.id} className={producto.id % 2 === 0 ? 'even' : 'odd'}>
                              <td data-label="Producto" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>
                                <FaTag style={{ marginRight: '8px', color: 'var(--color-secondary)' }} />
                                {producto.nombre}
                              </td>
                              <td data-label="Existencias" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{producto.stock}</td>
                              <td data-label="Categoría" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{producto.categoria || 'N/A'}</td>
                              <td data-label="Proveedor" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{producto.proveedor}</td>
                              <td data-label="Acciones" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                <button className="btn btn-icon" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                  <FaExclamationTriangle style={{ color: 'var(--color-warning)' }} />
                                </button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr><td colSpan="5" style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-text)' }}>No hay productos bajo stock.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventario' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Reporte de Inventario</h3>
                {reporteInventario && (
                  <div>
                    <p style={{ color: 'var(--color-text)' }}>Total de Productos: {reporteInventario.totalProductos}</p>
                    <p style={{ color: 'var(--color-text)' }}>Cantidad de Productos Bajo Stock: {reporteInventario.cantidadProductosBajoStock}</p>
                    <h4 style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>Detalle de Productos:</h4>
                    <div className="responsive-table" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>ID</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Nombre</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Descripción</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Precio</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Stock</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Fecha Vencimiento</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Proveedor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteInventario.productosDetalle.map(p => (
                            <tr key={p.id} className={p.id % 2 === 0 ? 'even' : 'odd'}>
                              <td data-label="ID" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.id}</td>
                              <td data-label="Nombre" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.nombre}</td>
                              <td data-label="Descripción" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.descripcion}</td>
                              <td data-label="Precio" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>${p.precio.toFixed(2)}</td>
                              <td data-label="Stock" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.stock}</td>
                              <td data-label="Fecha Vencimiento" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.fecha_vencimiento ? formatUTCDate(p.fecha_vencimiento) : 'N/A'}</td>
                              <td data-label="Proveedor" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.proveedor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'proveedores' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Reporte de Proveedores</h3>
                {reporteProveedores && (
                  <div>
                    <p style={{ color: 'var(--color-text)' }}>Total de Proveedores: {reporteProveedores.totalProveedores}</p>
                    <h4 style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>Lista de Proveedores:</h4>
                    <div className="responsive-table" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>ID</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Nombre</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Contacto</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Dirección</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteProveedores.listaProveedores.map(p => (
                            <tr key={p.id} className={p.id % 2 === 0 ? 'even' : 'odd'}>
                              <td data-label="ID" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.id}</td>
                              <td data-label="Nombre" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.nombre}</td>
                              <td data-label="Contacto" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.contacto}</td>
                              <td data-label="Dirección" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{p.direccion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ordenes' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Reporte de Órdenes de Compra</h3>
                {reporteOrdenes && (
                  <div>
                    <p style={{ color: 'var(--color-text)' }}>Total de Órdenes Registradas: {reporteOrdenes.totalOrdenesRegistradas}</p>
                    <h4 style={{ marginTop: '1rem', color: 'var(--color-secondary)' }}>Últimas Órdenes:</h4>
                    <div className="responsive-table" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-bg-header-table)' }}>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>ID</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Fecha</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Proveedor</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-secondary)' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteOrdenes.ultimasOrdenes.map(o => (
                            <tr key={o.id} className={o.id % 2 === 0 ? 'even' : 'odd'}>
                              <td data-label="ID" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{o.id}</td>
                              <td data-label="Fecha" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{formatUTCDate(o.fecha)}</td>
                              <td data-label="Proveedor" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{o.proveedor}</td>
                              <td data-label="Estado" style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{o.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Reportes;