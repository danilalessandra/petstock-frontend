import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { getOrden, editarOrden } from "../../api/ordenesCompraService";
import { getProveedores } from "../../api/proveedoresService";

function EditarOrden() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: "",
    fecha: "",
    estado: "",
    detalles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedProveedores, fetchedOrden] = await Promise.all([
          getProveedores(),
          getOrden(id),
        ]);

        setProveedores(fetchedProveedores);

        const formattedDetalles = fetchedOrden.detalles.map(d => ({
          ...d,
          cantidad: parseFloat(d.cantidad) || 0,
          precio: parseFloat(d.precio) || 0
        }));

        setFormData({
          proveedor_id: fetchedOrden.proveedor_id || "",
          fecha: fetchedOrden.fecha?.substring(0, 10) || "",
          // Asegúrate de que el estado cargado se use correctamente
          estado: fetchedOrden.estado || "", 
          detalles: formattedDetalles || []
        });

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar la orden:", err);
        setError("Error al cargar la orden.");
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    if (field === "precio" || field === "cantidad") {
      const parsedValue = parseFloat(value);
      nuevosDetalles[index][field] = isNaN(parsedValue) ? 0 : parsedValue;
    } else {
      nuevosDetalles[index][field] = value;
    }
    setFormData(prev => ({ ...prev, detalles: nuevosDetalles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeConfirmacion(null);

    if (!formData.proveedor_id || !formData.fecha || !formData.estado) {
      setError("Todos los campos principales son obligatorios.");
      return;
    }

    const invalidDetalles = formData.detalles.some(d =>
        isNaN(d.cantidad) || d.cantidad < 0 || isNaN(d.precio) || d.precio < 0
    );

    if (invalidDetalles) {
      setError("Las cantidades y precios de los productos deben ser números válidos y no negativos.");
      return;
    }

    try {
      const productosParaEnviar = formData.detalles.map(detalle => ({
        id: detalle.id, // Asegúrate de enviar el ID del detalle si existe para la actualización
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio: detalle.precio
      }));

      await editarOrden(id, {
        proveedor_id: Number(formData.proveedor_id),
        fecha: formData.fecha,
        estado: formData.estado, // Envía el estado tal cual está en el formulario
        productos: productosParaEnviar
      });

      setMensajeConfirmacion("Orden de compra actualizada exitosamente.");
      setTimeout(() => navigate("/ordenes", { state: { refresh: true } }), 1500);
    } catch (err) {
      console.error("Error al actualizar la orden:", err.response ? err.response.data : err.message);
      setError("Error al actualizar la orden. " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "1rem" }}>
          <p>Cargando datos...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Editar Orden #{id}</h2>
        {mensajeConfirmacion && <p style={{ color: "green", fontWeight: "bold" }}>{mensajeConfirmacion}</p>}
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label>Proveedor:</label><br />
            <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} required>
              <option value="">Seleccione proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Fecha:</label><br />
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
          </div>

          <div>
            <label>Estado:</label><br />
            <select name="estado" value={formData.estado} onChange={handleChange} required>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="recibida">Recibida</option> {/* AGREGADO: Opción para 'recibida' */}
            </select>
          </div>

          <h3>Detalles de productos:</h3>
          {formData.detalles.length === 0 && <p>No hay productos en esta orden.</p>}
          {formData.detalles.map((detalle, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
              <p><strong>Producto:</strong> {detalle.producto?.nombre}</p>
              <label>Cantidad:</label>
              <input
                type="number"
                value={detalle.cantidad}
                min="0"
                onChange={(e) => handleDetalleChange(index, "cantidad", e.target.value)}
              />
              <br />
              <label>Precio Unitario:</label>
              <input
                type="number"
                value={detalle.precio}
                step="0.01"
                min="0"
                onChange={(e) => handleDetalleChange(index, "precio", e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Guardar Cambios</button>
            <button type="button" onClick={() => navigate("/ordenes")} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditarOrden;
