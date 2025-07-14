// frontend/src/pages/Inventario/RegistrarMovimientoInventario.js
import React, { useState, useEffect, useContext } from "react";
import api from "../../api/api"; // Asegúrate de que esta importación sea correcta y apunte a tu instancia de axios configurada con interceptores
import { useNavigate } from "react-router-dom"; // Se mantiene por si necesitas redirecciones locales por otras razones
import { AuthContext } from "../../context/AuthContext"; // Importa AuthContext
import Sidebar from "../../components/Sidebar"; // Asumiendo que usas Sidebar en esta página también

const RegistrarMovimientoInventario = () => {
  const [productos, setProductos] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState("entrada");
  const [cantidad, setCantidad] = useState("");
  const [productoId, setProductoId] = useState(""); // Este es el ID seleccionado del <select>
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user, accessToken, loading } = useContext(AuthContext); // Obtén user, accessToken, loading del contexto

  console.log("RegistrarMovimientoInventario: Componente montado.");
  console.log("RegistrarMovimientoInventario: User from context:", user);
  console.log("RegistrarMovimientoInventario: AccessToken from context:", accessToken ? "Presente" : "Ausente");
  console.log("RegistrarMovimientoInventario: Loading state from context:", loading);


  useEffect(() => {
    console.log("RegistrarMovimientoInventario useEffect: Intentando cargar productos...");
    // Verificar si el usuario está cargado y si hay un accessToken antes de intentar la llamada API
    // `!loading && user && accessToken` asegura que AuthContext ha terminado de cargar y hay un usuario válido.
    if (!loading && user && accessToken) { 
        const fetchProductos = async () => {
            try {
                console.log("RegistrarMovimientoInventario: Realizando llamada a /api/productos...");
                const response = await api.get("/productos"); // Ruta para obtener la lista de productos
                setProductos(response.data);
                console.log("RegistrarMovimientoInventario: Productos cargados exitosamente:", response.data.length, "productos.");
            } catch (err) {
                console.error("RegistrarMovimientoInventario: Error al cargar productos:", err);
                // El interceptor de Axios debería manejar los errores 401/403.
                // Aquí solo mostramos un error genérico o específico si el status no es 401/403.
                if (err.response) {
                    setError(`Error al cargar la lista de productos: ${err.response.data.error || err.message}`);
                } else {
                    setError("Error de red o desconocido al cargar productos.");
                }
            }
        };
        fetchProductos();
    } else {
        console.log("RegistrarMovimientoInventario useEffect: No se pueden cargar productos todavía. Estado: Loading:", loading, "User:", user ? "Presente" : "Ausente", "AccessToken:", accessToken ? "Presente" : "Ausente");
        // Si no hay user o accessToken después de que `loading` sea `false`, significa que
        // PrivateRoute debería haber redirigido, o el componente fue accedido directamente sin autenticación.
        if (!loading && !user && !accessToken) {
             console.warn("RegistrarMovimientoInventario useEffect: AuthContext cargado, pero sin usuario/token. Se esperaría que PrivateRoute hubiera redirigido.");
        }
    }
  }, [user, loading, accessToken]); // Dependencias: re-ejecuta si user, loading o accessToken cambian


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpia errores previos
    setSuccess(""); // Limpia mensajes de éxito previos

    // Validaciones de frontend antes de enviar
    if (!productoId) { // Verifica que se haya seleccionado un producto
        setError("Por favor, selecciona un producto.");
        return;
    }
    if (!tipoMovimiento) { 
        setError("El tipo de movimiento es obligatorio.");
        return;
    }
    // Asegúrate de que `cantidad` sea un número y mayor que cero.
    // Si el input `type="number"` está vacío, `cantidad` es un string vacío. `parseInt("")` es `NaN`.
    if (!cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) <= 0) { 
        setError("La cantidad debe ser un número positivo.");
        return;
    }
    if (!motivo.trim()) { // .trim() para asegurar que no sean solo espacios en blanco
        setError("El motivo del movimiento es obligatorio.");
        return;
    }

    // Verificar si el usuario está autenticado (aunque ya lo valida PrivateRoute)
    if (!user || !accessToken) {
        setError("Error de autenticación. Por favor, reinicia la sesión.");
        return;
    }

    try {
      const data = {
        // *** CAMBIO CLAVE AQUÍ: Usar snake_case para 'producto_id' ***
        producto_id: parseInt(productoId), 
        tipo: tipoMovimiento,
        cantidad: parseInt(cantidad),   
        motivo,
        // *** CAMBIO CLAVE ADICIONAL: Añadir 'usuario_id' del contexto ***
        usuario_id: user.id 
      };
      console.log("RegistrarMovimientoInventario: Enviando datos de movimiento:", data);
      const response = await api.post("/movimientos-inventario", data); 
      setSuccess("Movimiento registrado exitosamente.");
      console.log("RegistrarMovimientoInventario: Respuesta de registro exitoso:", response.data);

      // Limpiar formulario
      setCantidad("");
      setProductoId(""); // Restablece a la opción por defecto
      setMotivo("");

      // *** AÑADIR ESTA LÍNEA PARA REDIRECCIONAR ***
      // Puedes elegir entre redirección inmediata o con un pequeño retardo
      setTimeout(() => {
        navigate("/movimientos-inventario"); // Redirige a la ruta donde se listan los movimientos
      }, 1500); // Redirige después de 1.5 segundos para que el usuario vea el mensaje de éxito

    } catch (err) {
      console.error("RegistrarMovimientoInventario: Error al registrar movimiento:", err);
      if (err.response) {
        // Errores específicos del servidor (ej. 400 Bad Request)
        console.error("Detalles del error de respuesta:", err.response.data);
        setError(err.response.data.error || "Error al registrar el movimiento. Verifica los datos ingresados.");
      } else if (err.request) {
        // Error de red (el servidor no respondió)
        setError("No se pudo conectar al servidor. Verifica tu conexión.");
      } else {
        // Otros errores (problemas con la configuración de Axios, etc.)
        setError("Ocurrió un error inesperado. Intenta de nuevo.");
      }
    }
  };

  // Puedes añadir un estado de carga si `productos` tarda mucho en cargar
  if (loading || (accessToken && !user)) { // Si AuthContext aún está cargando o el usuario no se ha establecido
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
    console.warn("RegistrarMovimientoInventario: Estado no autenticado alcanzado fuera de PrivateRoute.");
    // No redirigimos aquí; si el usuario llega a este punto, PrivateRoute falló o se accedió directamente.
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
    <div style={{ display: "flex" }}>
      <Sidebar />
      {/* ¡LA CORRECCIÓN ESTÁ AQUÍ! SE AÑADIÓ LA COMILLA DE CIERRE DESPUÉS DE "1rem" */}
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <div className="container mt-4">
          <h2>Registrar Nuevo Movimiento de Inventario</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productoId" className="form-label">Producto</label>
              <select
                id="productoId"
                className="form-select"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                required // HTML5 validation
              >
                <option value="">Selecciona un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="tipoMovimiento" className="form-label">Tipo de Movimiento</label>
              <select
                id="tipoMovimiento"
                className="form-select"
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value)}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="cantidad" className="form-label">Cantidad</label>
              <input
                type="number"
                id="cantidad"
                className="form-control"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                min="1" // Cantidad mínima de 1
              />
            </div>
            <div className="mb-3">
              <label htmlFor="motivo" className="form-label">Motivo</label>
              <textarea
                id="motivo"
                className="form-control"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows="3"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Registrar Movimiento</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegistrarMovimientoInventario;