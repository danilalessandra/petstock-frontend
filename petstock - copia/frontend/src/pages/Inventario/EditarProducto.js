import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getProducto, editarProducto } from "../../api/productosService";
import { useNavigate, useParams } from "react-router-dom";

function EditarProducto() {
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  // NUEVOS ESTADOS PARA LOS CAMPOS ADICIONALES
  const [diasTransitoProveedor, setDiasTransitoProveedor] = useState("");
  const [factorSeguridadStock, setFactorSeguridadStock] = useState("");
  const [stockMinimoSugerido, setStockMinimoSugerido] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducto() {
      setError(null);
      try {
        const res = await getProducto(id);
        console.log("Datos de producto cargados para edición:", res);

        setNombre(res.nombre || "");
        setStock(res.stock || "");
        setPrecio(res.precio || "");
        setDescripcion(res.descripcion || "");
        setFechaVencimiento(res.fecha_vencimiento ? new Date(res.fecha_vencimiento).toISOString().split('T')[0] : "");
        setProveedorId(res.proveedor_id || "");
        // CARGAR LOS NUEVOS CAMPOS AL EDITAR
        setDiasTransitoProveedor(res.dias_transito_proveedor !== undefined ? res.dias_transito_proveedor.toString() : "7"); // Cargar y convertir a string, con default
        setFactorSeguridadStock(res.factor_seguridad_stock !== undefined ? res.factor_seguridad_stock.toString() : "1.20"); // Cargar y convertir a string, con default
        setStockMinimoSugerido(res.stock_minimo_sugerido !== undefined ? res.stock_minimo_sugerido.toString() : "0"); // Cargar y convertir a string, con default

      } catch (err) {
        console.error("Error al cargar producto para edición (catch del frontend):", err);
        if (err.response && err.response.data && err.response.data.error) {
          setError("Error al cargar producto: " + err.response.data.error);
        } else {
          setError("Error al cargar producto. Por favor, verifica el ID y tu conexión.");
        }
      }
    }
    fetchProducto();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones de Frontend para campos que consideramos obligatorios
    if (!nombre.trim()) {
      setError("El Nombre del producto es obligatorio.");
      console.error("Validación Frontend: Nombre vacío.");
      return;
    }
    if (stock === "" || Number(stock) < 0) {
      setError("El Stock es obligatorio y debe ser un número positivo.");
      console.error("Validación Frontend: Stock inválido o vacío.");
      return;
    }
    if (precio === "" || Number(precio) < 0) {
      setError("El Precio es obligatorio y debe ser un número positivo.");
      console.error("Validación Frontend: Precio inválido o vacío.");
      return;
    }

    // Opcional: Validación para fecha_vencimiento si se ingresa
    if (fechaVencimiento && isNaN(new Date(fechaVencimiento).getTime())) {
      setError("La fecha de vencimiento no es una fecha válida.");
      console.error("Validación Frontend: Fecha de vencimiento inválida.");
      return;
    }
    // Opcional: Validación para proveedorId si se ingresa
    if (proveedorId !== "" && Number(proveedorId) <= 0) {
      setError("El ID del proveedor debe ser un número positivo si se proporciona.");
      console.error("Validación Frontend: ID de proveedor inválido.");
      return;
    }

    // Validación para diasTransitoProveedor
    if (diasTransitoProveedor === "" || Number(diasTransitoProveedor) < 0) {
      setError("Días de tránsito debe ser un número positivo.");
      return;
    }
    // Validación para factorSeguridadStock
    if (factorSeguridadStock === "" || Number(factorSeguridadStock) <= 0) {
      setError("Factor de seguridad de stock debe ser un número mayor a cero.");
      return;
    }
    // Validación para stockMinimoSugerido
    if (stockMinimoSugerido === "" || Number(stockMinimoSugerido) < 0) {
      setError("Stock mínimo sugerido debe ser un número positivo.");
      return;
    }


    try {
      const productoData = {
        nombre,
        stock: Number(stock),
        precio: Number(precio),
        descripcion: descripcion.trim() === '' ? null : descripcion,
        fecha_vencimiento: fechaVencimiento || null,
        proveedor_id: proveedorId === "" ? null : Number(proveedorId),
        // INCLUIR LOS CAMPOS ADICIONALES EN EL OBJETO DE ACTUALIZACIÓN
        dias_transito_proveedor: Number(diasTransitoProveedor),
        factor_seguridad_stock: Number(factorSeguridadStock),
        stock_minimo_sugerido: Number(stockMinimoSugerido),
      };
      console.log("Intentando actualizar producto con ID:", id, "y datos:", productoData);

      await editarProducto(id, productoData);

      console.log("Producto actualizado exitosamente.");
      navigate("/inventario");

    } catch (err) {
      console.error("Error al actualizar producto (catch del frontend):", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al actualizar producto: " + err.response.data.error);
      } else {
        setError("Error al actualizar producto. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Editar Producto</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label><br />
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Stock:</label><br />
            <input
              type="number"
              min="0"
              value={stock}
              onChange={e => setStock(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Precio:</label><br />
            <input
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Descripción (Opcional):</label><br />
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label>ID del Proveedor (Opcional):</label><br />
            <input
              type="number"
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
            />
          </div>
          <div>
            <label>Fecha de Vencimiento (Opcional - YYYY-MM-DD):</label><br />
            <input
              type="date"
              value={fechaVencimiento}
              onChange={e => setFechaVencimiento(e.target.value)}
            />
          </div>

          {/* NUEVOS CAMPOS AÑADIDOS */}
          <div>
            <label>Días de Tránsito del Proveedor:</label><br />
            <input
              type="number"
              min="0"
              value={diasTransitoProveedor}
              onChange={e => setDiasTransitoProveedor(e.target.value)}
            />
          </div>
          <div>
            <label>Factor de Seguridad de Stock:</label><br />
            <input
              type="number"
              step="0.01"
              min="0"
              value={factorSeguridadStock}
              onChange={e => setFactorSeguridadStock(e.target.value)}
            />
          </div>
          <div>
            <label>Stock Mínimo Sugerido:</label><br />
            <input
              type="number"
              min="0"
              value={stockMinimoSugerido}
              onChange={e => setStockMinimoSugerido(e.target.value)}
            />
          </div>
          {/* FIN NUEVOS CAMPOS */}

          <button type="submit" style={{ marginTop: "1rem" }}>Guardar cambios</button>
        </form>
      </main>
    </div>
  );
}

export default EditarProducto;