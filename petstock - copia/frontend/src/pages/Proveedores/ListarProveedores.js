import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../../components/Sidebar";
import { getProveedores, eliminarProveedor } from "../../api/proveedoresService";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa"; // Importa los iconos aquí

function ListarProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.rol === "administrador";

  useEffect(() => {
    async function fetchProveedores() {
      try {
        setLoading(true);
        setError(null); // Limpiar errores previos
        const res = await getProveedores();
        console.log("Proveedores obtenidos del backend:", res);
        setProveedores(Array.isArray(res) ? res : res.data); // Asegúrate de que 'res' o 'res.data' sea un array
      } catch (err) {
        console.error("Error al cargar proveedores en ListarProveedores:", err);
        if (err.response?.data?.error) {
          setError("Error al cargar proveedores: " + err.response.data.error);
        } else {
          setError("Error al cargar proveedores. Por favor, intenta de nuevo.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProveedores();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await eliminarProveedor(id);
      alert("Proveedor eliminado exitosamente.");
      setProveedores(proveedores.filter(p => p.id !== id)); // Filtra el proveedor eliminado del estado
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      if (err.response?.data?.error) {
        alert("Error al eliminar proveedor: " + err.response.data.error);
      } else if (err.response?.data?.details) {
        alert("Error al eliminar proveedor: " + err.response.data.details);
      } else {
        alert("Hubo un problema al eliminar el proveedor. Por favor, inténtalo de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}> {/* Añadido minHeight para consistencia */}
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: "1rem" }}> {/* Añadida clase y padding */}
        <h2>Proveedores</h2>
        {/* Botón "Agregar proveedor" solo visible para administradores */}
        {isAdmin && (
          <button
            onClick={() => navigate("/proveedores/agregar")}
            className="btn btn-primary" // Aplicar clases de estilo global
            style={{ marginBottom: "1rem" }} // Margen inferior para separar del título/tabla
          >
            Agregar proveedor
          </button>
        )}

        {loading && <p>Cargando proveedores...</p>}
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        {!loading && !error && (
          <>
            {proveedores.length > 0 ? (
              <div style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                {/* Añadida la clase 'responsive-table' */}
                <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Dirección</th>
                      {/* La columna de acciones solo aparece para administradores */}
                      {isAdmin && (
                        // Centrar el encabezado de acciones
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map(p => (
                      <tr key={p.id}>
                        {/* Añadidos data-label a cada td */}
                        <td data-label="ID">{p.id}</td>
                        <td data-label="Nombre">{p.nombre}</td>
                        <td data-label="Contacto">{p.contacto}</td>
                        <td data-label="Dirección">{p.direccion || 'N/A'}</td>
                        {/* Los botones de acción solo aparecen para administradores */}
                        {isAdmin && (
                          <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <Link to={`/proveedores/editar/${p.id}`} style={{ textDecoration: 'none' }}>
                              <button
                                className="btn btn-secondary btn-icon" // CAMBIADO A btn-secondary
                                aria-label="Editar proveedor"
                              >
                                <FaPencilAlt /> {/* Icono de lápiz */}
                              </button>
                            </Link>
                            <button
                              onClick={() => handleEliminar(p.id)}
                              className="btn btn-danger btn-icon" // Clase btn-icon para el icono
                              aria-label="Eliminar proveedor"
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
              <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay proveedores registrados aún.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ListarProveedores;