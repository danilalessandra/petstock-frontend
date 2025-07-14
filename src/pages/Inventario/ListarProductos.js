import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../../components/Sidebar";
import { getProductos, eliminarProducto } from "../../api/productosService";
import { Link, useNavigate } from "react-router-dom"; // Sintaxis de importación corregida
import { AuthContext } from "../../context/AuthContext";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa"; // Importa los iconos aquí

function ListarProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.rol === "administrador";

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProductos();
      setProductos(Array.isArray(res.data) ? res.data : res);
      console.log("Productos obtenidos del backend:", res);
    } catch (err) {
      console.error("Error al cargar productos en ListarProductos:", err);
      if (err.response?.data?.error) {
        setError("Error al cargar productos: " + err.response.data.error);
      } else {
        setError("Error al cargar productos. Por favor, intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await eliminarProducto(id);
      alert("Producto eliminado exitosamente.");
      fetchProductos(); // Volver a cargar la lista de productos
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      if (err.response?.data?.error) {
        alert("Error al eliminar producto: " + err.response.data.error);
      } else if (err.response?.data?.details) {
        alert("Error al eliminar producto: " + err.response.data.details);
      } else {
        alert("Hubo un problema al eliminar el producto. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Inventario - Productos</h2>

        {isAdmin && (
          <button
            onClick={() => navigate("/inventario/agregar")}
            className="btn btn-primary"
            style={{ marginBottom: "1rem" }}
          >
            Agregar producto
          </button>
        )}

        {loading && <p>Cargando productos...</p>}
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        {!loading && !error && (
          <>
            {productos.length > 0 ? (
              <div style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                {/* Añade la clase 'responsive-table' a la tabla */}
                <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th style={{ textAlign: 'right' }}>Stock</th>
                      <th style={{ textAlign: 'right' }}>Precio</th>
                      <th>Vencimiento</th>
                      <th>Proveedor</th>
                      <th style={{ textAlign: 'right' }}>Días Tránsito</th>
                      <th style={{ textAlign: 'right' }}>Factor Seguridad</th>
                      <th style={{ textAlign: 'right' }}>Stock Mín. Sugerido</th>
                      {isAdmin && <th style={{ textAlign: 'center' }}>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        {/* Añade data-label a cada td */}
                        <td data-label="ID">{p.id}</td>
                        <td data-label="Nombre">{p.nombre}</td>
                        <td data-label="Descripción">{p.descripcion || 'N/A'}</td>
                        <td data-label="Stock" style={{ textAlign: 'right' }}>{p.stock}</td>
                        <td data-label="Precio" style={{ textAlign: 'right' }}>{formatCurrency(p.precio)}</td>
                        <td data-label="Vencimiento">{formatExpiryDate(p.fecha_vencimiento)}</td>
                        <td data-label="Proveedor">{p.Proveedor?.nombre || 'N/A'}</td>
                        <td data-label="Días Tránsito" style={{ textAlign: 'right' }}>{p.dias_transito_proveedor || 'N/A'}</td>
                        <td data-label="Factor Seguridad" style={{ textAlign: 'right' }}>{p.factor_seguridad_stock || 'N/A'}</td>
                        <td data-label="Stock Mín. Sugerido" style={{ textAlign: 'right' }}>{p.stock_minimo_sugerido || 'N/A'}</td>
                        {isAdmin && (
                          <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <Link to={`/inventario/editar/${p.id}`} style={{ textDecoration: 'none' }}>
                              <button
                                className="btn btn-secondary btn-icon" // Cambiado a btn-secondary para el color amarillo/naranja
                                aria-label="Editar producto"
                              >
                                <FaPencilAlt /> {/* Icono de lápiz */}
                              </button>
                            </Link>
                            <button
                              onClick={() => handleEliminar(p.id)}
                              className="btn btn-danger btn-icon" // Clase btn-icon para el icono
                              aria-label="Eliminar producto"
                            >
                              <FaTrashAlt /> {/* Icono de basura */}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay productos registrados aún.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ListarProductos;