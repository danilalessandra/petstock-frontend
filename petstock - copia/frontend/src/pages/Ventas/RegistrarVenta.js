// CORRECCIÓN DE SINTAXIS EN LA LÍNEA 1
import React, { useState, useEffect, useContext } from "react"; 
import Sidebar from "../../components/Sidebar";
import { getProductos } from "../../api/productosService";
import { registrarVenta } from "../../api/ventasService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RegistrarVenta() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
  const [clienteNombre, setClienteNombre] = useState("");

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);

  const [productosEnVenta, setProductosEnVenta] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);

  const [loadingProductos, setLoadingProductos] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  useEffect(() => {
    async function fetchProductosDisponibles() {
      try {
        setLoadingProductos(true);
        setError(null);
        const data = await getProductos();
        const productosNumericos = data.map(p => ({
            ...p,
            // Asegurarse de que el precio sea numérico, incluso si viene como string
            precio: Number(p.precio) 
        }));
        setProductosDisponibles(productosNumericos);
      } catch (err) {
        console.error("Error al cargar productos disponibles:", err);
        setError("Error al cargar la lista de productos.");
      } finally {
        setLoadingProductos(false);
      }
    }
    fetchProductosDisponibles();
  }, []);

  useEffect(() => {
    const calcularTotal = () => {
      const total = productosEnVenta.reduce((acc, item) => acc + item.subtotal, 0);
      setTotalVenta(total);
    };
    calcularTotal();
  }, [productosEnVenta]);

  const handleAddProduct = () => {
    setError(null);
    setMensajeConfirmacion("");

    const producto = productosDisponibles.find(p => p.id === Number(productoSeleccionadoId));

    if (!producto) {
      setError("Por favor, selecciona un producto.");
      return;
    }
    if (cantidadProducto <= 0 || !Number.isInteger(Number(cantidadProducto))) {
      setError("La cantidad debe ser un número entero positivo.");
      return;
    }
    if (cantidadProducto > producto.stock) {
        setError(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
        return;
    }

    const productoExistenteIndex = productosEnVenta.findIndex(item => item.producto_id === producto.id);

    const precioUnitarioVenta = Number(producto.precio); // Ya es numérico, pero se reconfirma
    const subtotal = cantidadProducto * precioUnitarioVenta;

    if (productoExistenteIndex > -1) {
      const updatedProductosEnVenta = [...productosEnVenta];
      const existingItem = updatedProductosEnVenta[productoExistenteIndex];
      
      const nuevaCantidadTotal = existingItem.cantidad + cantidadProducto;
      if (nuevaCantidadTotal > producto.stock) {
        setError(`No se puede agregar más. Stock insuficiente para ${producto.nombre}. Total en venta: ${existingItem.cantidad}, Nuevo total: ${nuevaCantidadTotal}, Disponible: ${producto.stock}`);
        return;
      }

      existingItem.cantidad = nuevaCantidadTotal;
      existingItem.subtotal = nuevaCantidadTotal * precioUnitarioVenta;
      setProductosEnVenta(updatedProductosEnVenta);
    } else {
      setProductosEnVenta([
        ...productosEnVenta,
        {
          producto_id: producto.id,
          nombre_producto: producto.nombre,
          sku: producto.sku || 'N/A',
          cantidad: Number(cantidadProducto),
          precio_unitario_venta: precioUnitarioVenta,
          subtotal: subtotal,
        },
      ]);
    }

    setProductoSeleccionadoId("");
    setCantidadProducto(1);
  };

  const handleRemoveProduct = (productoId) => {
    setProductosEnVenta(productosEnVenta.filter(item => item.producto_id !== productoId));
    setMensajeConfirmacion("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeConfirmacion("");

    if (!fechaVenta) {
      setError("La fecha de venta es obligatoria.");
      return;
    }
    if (productosEnVenta.length === 0) {
      setError("Debes agregar al menos un producto a la venta.");
      return;
    }
    if (!user || !user.id) {
        setError("Error: No se pudo obtener la información del usuario para registrar la venta.");
        console.error("Usuario no autenticado o ID de usuario no disponible en el contexto.");
        return;
    }

    try {
      const ventaData = {
        fecha: fechaVenta,
        usuario_id: user.id,
        detalles: productosEnVenta.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario_venta,
        })),
      };
      console.log("Datos de la venta a enviar:", ventaData);

      const res = await registrarVenta(ventaData);
      console.log("Venta registrada exitosamente:", res);
      setMensajeConfirmacion("Venta registrada exitosamente con ID: " + res.id);

      setFechaVenta(new Date().toISOString().split('T')[0]);
      setClienteNombre("");
      setProductosEnVenta([]);
      setTotalVenta(0);
      setProductoSeleccionadoId("");
      setCantidadProducto(1);
      
      navigate("/ventas");

    } catch (err) {
      console.error("Error al registrar venta (catch del frontend):", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al registrar venta: " + err.response.data.error);
      } else {
        setError("Error al registrar venta. Intenta de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Registrar Venta</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        {mensajeConfirmacion && <p style={{ color: "green", fontWeight: "bold" }}>{mensajeConfirmacion}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Cliente:</label><br />
            <input
              type="text"
              value={clienteNombre}
              onChange={e => setClienteNombre(e.target.value)}
              placeholder="Nombre del cliente (opcional)"
              style={{ width: "calc(100% - 10px)", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Fecha:</label><br />
            <input
              type="date"
              value={fechaVenta}
              onChange={e => setFechaVenta(e.target.value)}
              required
              style={{ padding: "8px" }}
            />
          </div>

          <h3>Productos</h3>
          {loadingProductos && <p>Cargando productos disponibles...</p>}
          {!loadingProductos && productosDisponibles.length === 0 && (
            <p>No hay productos disponibles para seleccionar. Agrega productos en Inventario.</p>
          )}
          {!loadingProductos && productosDisponibles.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "1rem" }}>
              <div style={{ flex: 2 }}>
                <label>Producto:</label><br />
                <select
                  value={productoSeleccionadoId}
                  onChange={e => setProductoSeleccionadoId(e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="">Seleccione producto</option>
                  {productosDisponibles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock: {p.stock}, Precio: ${p.precio})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 0.5 }}>
                <label>Cantidad:</label><br />
                <input
                  type="number"
                  min="1"
                  value={cantidadProducto}
                  onChange={e => setCantidadProducto(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>
              <button type="button" onClick={handleAddProduct} style={{ padding: "8px 15px", whiteSpace: "nowrap" }}>
                Agregar
              </button>
            </div>
          )}

          <h3>Productos seleccionados</h3>
          {productosEnVenta.length === 0 ? (
            <p>No se han agregado productos a la venta.</p>
          ) : (
            <table border="1" cellPadding="5" style={{ width: "100%", marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosEnVenta.map((item, index) => (
                  <tr key={item.producto_id + "-" + index}> 
                    <td>{item.nombre_producto}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.precio_unitario_venta.toFixed(2)}</td>
                    <td>${item.subtotal.toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => handleRemoveProduct(item.producto_id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={{ textAlign: "right", marginTop: "1rem" }}>Total: ${totalVenta.toFixed(2)}</h3>

          <button type="submit" style={{ marginTop: "1rem", padding: "10px 20px", fontSize: "1.1rem" }}>
            Registrar Venta
          </button>
        </form>
      </main>
    </div>
  );
}

export default RegistrarVenta;
