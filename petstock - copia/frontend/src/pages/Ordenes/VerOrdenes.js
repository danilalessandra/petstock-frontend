import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getOrdenes, eliminarOrden } from "../../api/ordenesCompraService";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { FaPencilAlt, FaTrashAlt, FaEye } from "react-icons/fa"; // Importa los iconos aquí

// Formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
};

function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await getOrdenes();
      setOrdenes(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    if (location.state?.refresh) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleEdit = (id) => navigate(`/ordenes/editar/${id}`);
  const handleViewDetails = (id) => navigate(`/ordenes/detalles/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta orden?")) return;
    try {
      await eliminarOrden(id);
      fetchOrdenes();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar la orden");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}> {/* Added minHeight for consistency */}
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: "1rem" }}> {/* Added class and padding */}
        <h2>Órdenes de compra</h2>
        <Link to="/ordenes/registrar">
          <button
            className="btn btn-primary" // Aplicar clases de estilo global
            style={{ marginBottom: "1rem" }} // Margen inferior para separar del título/tabla
          >
            Registrar Orden
          </button>
        </Link>

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="table-responsive" style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
            {/* Añadida la clase 'responsive-table' */}
            <table
              className="responsive-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th> {/* Centrar el encabezado de acciones */}
                </tr>
              </thead>
              <tbody>
                {ordenes.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>No hay órdenes registradas.</td>
                  </tr>
                )}

                {ordenes.map((orden) => {
                  const total = orden.detalles?.reduce(
                    (suma, detalle) => suma + detalle.cantidad * detalle.precio,
                    0
                  ) || 0;

                  return (
                    <tr key={orden.id}>
                      {/* Añadidos data-label a cada td */}
                      <td data-label="ID">{orden.id}</td>
                      <td data-label="Proveedor">{orden.proveedor?.nombre}</td>
                      <td data-label="Fecha">{moment(orden.fecha).format("DD/MM/YYYY")}</td>
                      <td data-label="Estado">{orden.estado}</td>
                      <td data-label="Productos">
                        {orden.detalles?.map((d) => (
                          <div key={d.id}>
                            {d.producto?.nombre} — {d.cantidad} x {formatCurrency(d.precio)}
                          </div>
                        ))}
                      </td>
                      <td data-label="Total">{formatCurrency(total)}</td>
                      {/* Aplicar display: flex, gap y white-space: nowrap a la celda de acciones */}
                      <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleViewDetails(orden.id)}
                          className="btn btn-primary btn-icon" // Aplicar clase de estilo
                          aria-label="Ver detalles de orden"
                        >
                          <FaEye /> {/* Icono de ojo */}
                        </button>
                        <button
                          onClick={() => handleEdit(orden.id)}
                          className="btn btn-secondary btn-icon" // Cambiado a btn-secondary para el color amarillo/naranja
                          aria-label="Editar orden"
                        >
                          <FaPencilAlt /> {/* Icono de lápiz */}
                        </button>
                        <button
                          onClick={() => handleDelete(orden.id)}
                          className="btn btn-danger btn-icon" // Aplicar clase de estilo
                          aria-label="Eliminar orden"
                        >
                          <FaTrashAlt /> {/* Icono de basura */}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default VerOrdenes;