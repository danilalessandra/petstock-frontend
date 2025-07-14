import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // 'Link' ha sido removido ya que no se utiliza
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa"; // Importar los iconos

function ListarMovimientosInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const { user, loading, accessToken } = useContext(AuthContext);

  console.log("ListarMovimientosInventario: Componente montado.");
  console.log("ListarMovimientosInventario: User from context:", user);
  console.log("ListarMovimientosInventario: AccessToken from context:", accessToken ? "Presente" : "Ausente");
  console.log("ListarMovimientosInventario: Loading state from context:", loading);

  // Envuelve fetchMovimientos en useCallback
  const fetchMovimientos = useCallback(async () => {
    setError(null); // Limpiar errores previos al intentar cargar

    if (!user || !accessToken) {
      console.warn("ListarMovimientosInventario: Intentando cargar movimientos sin user/accessToken.");
      setError("No autenticado para cargar movimientos.");
      return;
    }

    try {
      console.log("ListarMovimientosInventario: Llamando a /api/movimientos-inventario...");
      const response = await api.get("/movimientos-inventario");
      setMovimientos(response.data);
      console.log("ListarMovimientosInventario: Movimientos cargados exitosamente.", response.data);
    } catch (err) {
      console.error("ListarMovimientosInventario: Error al cargar movimientos:", err);
      if (err.response) {
        setError(`Error al cargar movimientos de inventario: ${err.response.data.error || err.message}`);
      } else {
        setError("Error de red o desconocido al cargar movimientos.");
      }
    }
  }, [user, accessToken]); // Dependencias de fetchMovimientos: user y accessToken

  const handleEditar = (id) => {
    console.log(`Editar movimiento con ID: ${id}`);
    navigate(`/movimientos-inventario/editar/${id}`);
  };

  const handleEliminar = async (id) => {
    // NOTA: En una aplicación de producción, se recomienda reemplazar window.confirm y alert
    // con un modal personalizado para una mejor experiencia de usuario y diseño.
    if (!window.confirm("¿Estás seguro de que quieres eliminar este movimiento?")) { // Agregado "!" para que funcione correctamente
      return;
    }
    try {
      await api.delete(`/movimientos-inventario/${id}`);
      setMensaje("Movimiento eliminado exitosamente.");
      fetchMovimientos(); // Volver a cargar la lista de movimientos después de eliminar
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      setError("Error al eliminar el movimiento.");
    }
  };

  const handleRegistrarNuevo = () => {
    console.log("ListarMovimientosInventario: Clic en 'Registrar Nuevo Movimiento'. Navegando a /movimientos-inventario/registrar");
    navigate("/movimientos-inventario/registrar");
  };

  useEffect(() => {
    // Solo intenta cargar movimientos si el AuthContext ya ha cargado y el usuario es válido
    if (!loading && user && accessToken) {
      fetchMovimientos();
    } else if (!loading && !user && !accessToken) {
        console.warn("ListarMovimientosInventario useEffect: AuthContext finalizó carga, pero sin usuario/token. Posiblemente no autenticado.");
    } else {
        console.log("ListarMovimientosInventario useEffect: Esperando que AuthContext termine de cargar (loading es true).");
    }
  }, [user, loading, accessToken, fetchMovimientos]); // Añadido fetchMovimientos a las dependencias

  // Renderizado condicional mientras carga la autenticación o los productos
  if (loading) { // Simplificado: si loading es true, siempre muestra cargando
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flexGrow: 1, padding: "1rem" }}>
                <div>Cargando autenticación o productos...</div>
            </main>
        </div>
    );
  }

  // Si no hay usuario y no está cargando (lo que debería ser capturado por PrivateRoute)
  if (!user && !loading) {
    console.warn("ListarMovimientosInventario: Estado no autenticado alcanzado fuera de PrivateRoute.");
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flexGrow: 1, padding: "1rem" }}>
                <div>Acceso no autorizado. Redirigiendo...</div>
            </main>
        </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}> {/* Añadido minHeight para consistencia */}
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: "1rem" }}> {/* Añadida clase y padding */}
        <h2>Historial de Movimientos de Inventario</h2>
        {/* Botón "Registrar Nuevo Movimiento" al mismo nivel que "Agregar producto" */}
        <button
          onClick={handleRegistrarNuevo}
          className="btn btn-primary"
          style={{ marginBottom: "1rem" }} // Mantén solo estilos que no son sobreescritos por btn-primary
        >
          Registrar Nuevo Movimiento
        </button>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {/* Mensaje si no hay movimientos */}
        {movimientos.length === 0 && !loading && !error ? (
          <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay movimientos de inventario registrados.</p>
        ) : (
          // Contenedor de la tabla para aplicar estilos globales
          <div className="table-responsive" style={{ marginTop: "1rem", boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
            {/* AÑADIDA CLASE responsive-table AQUÍ */}
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Motivo</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th> {/* Centrar el encabezado de acciones */}
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    {/* AÑADIDOS data-label A CADA TD */}
                    <td data-label="ID">{movimiento.id}</td>
                    <td data-label="Producto">{movimiento.producto ? movimiento.producto.nombre : 'Producto Desconocido'}</td>
                    <td data-label="Tipo">{movimiento.tipo}</td>
                    <td data-label="Cantidad">{movimiento.cantidad}</td>
                    <td data-label="Fecha">{new Date(movimiento.fecha).toLocaleDateString('es-ES')}</td>
                    <td data-label="Usuario">{movimiento.usuario ? movimiento.usuario.nombre : 'Usuario Desconocido'}</td>
                    <td data-label="Motivo">{movimiento.motivo}</td>
                    <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}> {/* Centrar los botones en la celda */}
                      <button
                        onClick={() => handleEditar(movimiento.id)}
                        className="btn btn-secondary btn-icon" // Cambiado a btn-secondary para el color amarillo/naranja
                        aria-label="Editar movimiento"
                      >
                        <FaPencilAlt /> {/* Icono de lápiz */}
                      </button>
                      <button
                        onClick={() => handleEliminar(movimiento.id)}
                        className="btn btn-danger btn-icon" // Clase btn-icon para el icono
                        aria-label="Eliminar movimiento"
                      >
                        <FaTrashAlt /> {/* Icono de basura */}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListarMovimientosInventario;