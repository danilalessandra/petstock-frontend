import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { agregarProducto } from "../../api/productosService";
import { useNavigate } from "react-router-dom";

function AgregarProducto() {
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  // NUEVOS ESTADOS PARA LOS CAMPOS ADICIONALES
  const [diasTransitoProveedor, setDiasTransitoProveedor] = useState("7"); // Valor por defecto igual al del modelo
  const [factorSeguridadStock, setFactorSeguridadStock] = useState("1.20"); // Valor por defecto igual al del modelo
  const [stockMinimoSugerido, setStockMinimoSugerido] = useState("0"); // Valor por defecto igual al del modelo
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones de Frontend para campos que consideramos obligatorios por lógica de negocio
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
        // AHORA INCLUIMOS LOS CAMPOS ADICIONALES EN EL OBJETO productoData
        dias_transito_proveedor: Number(diasTransitoProveedor),
        factor_seguridad_stock: Number(factorSeguridadStock),
        stock_minimo_sugerido: Number(stockMinimoSugerido),
      };
      console.log("Intentando agregar producto con datos:", productoData);

      await agregarProducto(productoData);

      console.log("Producto agregado exitosamente.");
      navigate("/inventario");

    } catch (err) {
      console.error("Error al agregar producto (catch del frontend):", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al agregar producto: " + err.response.data.error);
      } else {
        setError("Error al agregar producto. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Agregar Producto</h2>
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
          {/* CAMPO DE DESCRIPCIÓN - OPCIONAL EN DB, PERO DEBEMOS ENVIARLO */}
          <div>
            <label>Descripción (Opcional):</label><br />
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            ></textarea>
          </div>
          {/* CAMPOS OPCIONALES SEGÚN TU DB */}
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
              step="0.01" // Para permitir decimales
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

          <button type="submit" style={{ marginTop: "1rem" }}>Guardar Producto</button>
        </form>
      </main>
    </div>
  );
}

export default AgregarProducto;