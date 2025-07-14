import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { getVenta, editarVenta } from "../../api/ventasService"; 
import { getProductos } from "../../api/productosService"; 

function EditarVenta() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [fechaVenta, setFechaVenta] = useState("");
  const [clienteNombre, setClienteNombre] = useState(""); 
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [productosEnVenta, setProductosEnVenta] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null); // Cambiado a null para claridad

  const [ventaOriginal, setVentaOriginal] = useState(null); // Guardar la venta original

  // Cargar productos disponibles y datos de la venta existente
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitialData(true);
        setError(null);

        // Cargar productos disponibles
        const productosData = await getProductos();
        const productosNumericos = productosData.map(p => ({
            ...p,
            precio: Number(p.precio)
        }));
        setProductosDisponibles(productosNumericos);

        // Cargar datos de la venta a editar
        const ventaData = await getVenta(id);
        console.log("Datos de venta para edición:", ventaData);

        setVentaOriginal(ventaData); // Guardar la venta original en el estado

        setFechaVenta(new Date(ventaData.fecha).toISOString().split('T')[0]);
        // Si tienes campo de cliente en Venta, carga aquí: setClienteNombre(ventaData.cliente_nombre || "");

        // Mapear los detalles de la venta para el estado productosEnVenta
        const detallesMapeados = ventaData.detalles.map(d => ({
          producto_id: d.producto_id,
          nombre_producto: d.producto?.nombre || 'Producto Desconocido', 
          sku: d.producto?.sku || 'N/A', 
          cantidad: d.cantidad,
          precio_unitario_venta: Number(d.precio_unitario),
          subtotal: d.cantidad * Number(d.precio_unitario),
        }));
        setProductosEnVenta(detallesMapeados);

      } catch (err) {
        console.error("Error al cargar datos para edición de venta:", err);
        setError("Error al cargar los datos de la venta para edición.");
        setVentaOriginal(null); // Asegurarse de que no se intente usar una venta nula
      } finally {
        setLoadingInitialData(false);
      }
    }
    loadData();
  }, [id]);

  // Recalcular total cada vez que cambian los productos en venta
  useEffect(() => {
    const calcularTotal = () => {
      const total = productosEnVenta.reduce((acc, item) => acc + item.subtotal, 0);
      setTotalVenta(total);
    };
    calcularTotal();
  }, [productosEnVenta]);

  const handleAddProduct = () => {
    setError(null);
    setMensajeConfirmacion(null);

    const producto = productosDisponibles.find(p => p.id === Number(productoSeleccionadoId));

    if (!producto) {
      setError("Por favor, selecciona un producto.");
      return;
    }
    if (cantidadProducto <= 0 || !Number.isInteger(Number(cantidadProducto))) {
      setError("La cantidad debe ser un número entero positivo.");
      return;
    }
    // Lógica de stock para edición: más compleja, aquí una verificación básica
    // Esto debería idealmente comparar con el stock disponible REAL después de "descontar" lo que ya está en la venta original
    // Por ahora, una verificación simple contra el stock actual del producto.
    if (cantidadProducto > producto.stock) {
        setError(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
        return;
    }

    const productoExistenteIndex = productosEnVenta.findIndex(item => item.producto_id === producto.id);

    const precioUnitarioVenta = Number(producto.precio);
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
    setMensajeConfirmacion(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeConfirmacion(null);

    if (!fechaVenta) {
      setError("La fecha de venta es obligatoria.");
      return;
    }
    if (productosEnVenta.length === 0) {
      setError("Debes agregar al menos un producto a la venta.");
      return;
    }
    // Asegurarse de que ventaOriginal esté disponible antes de usarlo
    if (!ventaOriginal || !ventaOriginal.usuario_id) {
        setError("Error: No se pudo obtener la información original de la venta.");
        return;
    }
    
    try {
      const ventaData = {
        fecha: fechaVenta,
        usuario_id: ventaOriginal.usuario_id, // Usar el usuario_id de la venta original
        detalles: productosEnVenta.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario_venta,
        })),
      };
      console.log("Datos de la venta a enviar para edición:", ventaData);

      const res = await editarVenta(id, ventaData); 
      console.log("Venta editada exitosamente:", res);
      setMensajeConfirmacion("Venta editada exitosamente con ID: " + res.id);
      
      navigate("/ventas"); 

    } catch (err) {
      console.error("Error al editar venta (catch del frontend):", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al editar venta: " + err.response.data.error);
      } else {
        setError("Error al editar venta. Intenta de nuevo.");
      }
    }
  };

  if (loadingInitialData) {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flexGrow: 1, padding: "1rem" }}>
                <p>Cargando datos de la venta para edición...</p>
            </main>
        </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Editar Venta # {id}</h2>
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
              disabled // Generalmente, el cliente no se edita directamente en la venta
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
          {productosDisponibles.length === 0 ? (
            <p>No hay productos disponibles para seleccionar. Agrega productos en Inventario.</p>
          ) : (
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
            Guardar Cambios
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/ventas")} 
            style={{ marginTop: "1rem", marginLeft: "10px", padding: "10px 20px", fontSize: "1.1rem", backgroundColor: '#ccc', border: 'none' }}
          >
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditarVenta;
