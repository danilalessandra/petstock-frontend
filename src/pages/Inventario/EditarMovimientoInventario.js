// src/pages/Inventario/EditarMovimientoInventario.js
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api"; // Usaremos directamente la instancia de axios configurada
import { useNavigate, useParams } from "react-router-dom";

function EditarMovimientoInventario() {
  const { id } = useParams();
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState(""); // <<< NUEVO ESTADO PARA EL MOTIVO
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDatos() {
      try {
        // Carga productos
        const prodResponse = await api.get("/productos");
        setProductos(prodResponse.data);

        // Carga el movimiento específico a editar por su ID
        const movimientoResponse = await api.get(`/movimientos-inventario/${id}`);
        const movimiento = movimientoResponse.data;

        if (!movimiento) {
          setError("Movimiento no encontrado.");
          return; // Salir de la función si no se encuentra el movimiento
        }

        setProductoId(movimiento.producto_id);
        setTipo(movimiento.tipo);
        setCantidad(movimiento.cantidad);
        setFecha(movimiento.fecha ? new Date(movimiento.fecha).toISOString().slice(0, 10) : "");
        setMotivo(movimiento.motivo || ""); // <<< INICIALIZAR EL MOTIVO
      } catch (err) {
        console.error("Error al cargar datos del movimiento o productos:", err);
        setError("Error al cargar datos. Asegúrate de que el ID es correcto y el backend funciona.");
      } finally {
        setLoading(false);
      }
    }

    fetchDatos();
  }, [id]); // id como dependencia para recargar si cambia la URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!productoId || !tipo || !cantidad || !fecha || !motivo.trim()) { // <<< VALIDAR MOTIVO
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (parseInt(cantidad) <= 0) {
      setError("La cantidad debe ser un número positivo.");
      return;
    }

    const usuario_id = parseInt(localStorage.getItem("userId")) || 1;

    const movimientoData = {
      producto_id: parseInt(productoId),
      tipo,
      cantidad: parseInt(cantidad),
      fecha: new Date(fecha).toISOString(), // Enviar como ISO string es buena práctica
      motivo: motivo.trim(), // <<< INCLUIR EL MOTIVO EN LOS DATOS ENVIADOS
      usuario_id,
    };

    try {
      await api.put(`/movimientos-inventario/${id}`, movimientoData);
      alert("Movimiento actualizado exitosamente.");
      navigate("/movimientos-inventario");
    } catch (err) {
      console.error("Error al actualizar el movimiento:", err);
      if (err.response) {
        setError(`Error al actualizar el movimiento: ${err.response.data.error || err.response.data.message || err.message}`);
      } else {
        setError("Error de red o desconocido al actualizar el movimiento. Intenta de nuevo.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "1rem" }}>
          <p>Cargando datos del movimiento...</p>
        </main>
      </div>
    );
  }

  // Si hay un error después de la carga inicial, lo mostramos.
  // El 'movimiento' no se usa aquí directamente.
  if (error) { // <<< CORRECCIÓN DE ESLINT: Eliminado '!movimiento'
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "1rem" }}>
          <p style={{ color: "red" }}>{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <div className="container mt-4">
          <h2>Editar Movimiento de Inventario</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
            <div className="mb-3">
              <label htmlFor="producto" className="form-label">Producto:</label>
              <select
                id="producto"
                className="form-select"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                required
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="tipo" className="form-label">Tipo:</label>
              <select
                id="tipo"
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="cantidad" className="form-label">Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                className="form-control"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="fecha" className="form-label">Fecha:</label>
              <input
                id="fecha"
                type="date"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)} // <<< CORRECCIÓN DE ESLINT: setSetFecha a setFecha
                required
              />
            </div>

            <div className="mb-3"> {/* <<< NUEVO CAMPO PARA EL MOTIVO */}
              <label htmlFor="motivo" className="form-label">Motivo:</label>
              <textarea
                id="motivo"
                className="form-control"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows="3"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Actualizar Movimiento
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditarMovimientoInventario;