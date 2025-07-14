// frontend/src/pages/Ordenes/RegistrarOrden.js

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getProveedores } from "../../api/proveedoresService";
import { getProductos } from "../../api/productosService"; // Corrected 'from'
import { registrarOrden } from "../../api/ordenesCompraService";
import { useNavigate } from "react-router-dom";

// Importar los íconos de React Icons
import { FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

function RegistrarOrden() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorId, setProveedorId] = useState("");
  const [lineas, setLineas] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [p, prod] = await Promise.all([getProveedores(), getProductos()]);
        setProveedores(Array.isArray(p) ? p : []);
        // Asegúrate de que los precios de los productos sean números
        setProductos(Array.isArray(prod) ? prod.map(product => ({
          ...product,
          precio_venta: Number(product.precio_venta) || Number(product.precio) || 0, // Convertir a número, por defecto 0
          precio: Number(product.precio) || 0 // Convertir a número, por defecto 0
        })) : []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar proveedores o productos.");
      }
    }
    fetchData();
  }, []);

  const addLinea = () => setLineas([...lineas, { producto_id: "", cantidad: 1, precio: 0 }]);
  const removeLinea = idx => setLineas(lineas.filter((_, i) => i !== idx));
  const changeLinea = (idx, field, val) => {
    const newL = [...lineas];
    newL[idx][field] = field === "cantidad" || field === "precio" ? Number(val) : val;
    const selected = productos.find(x => x.id === Number(val));
    if (field === "producto_id" && selected) newL[idx].precio = selected.precio_venta || selected.precio; // Ya son números por el map inicial
    setLineas(newL);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!proveedorId || lineas.length === 0) {
      setError("Por favor, selecciona un proveedor y agrega al menos un producto.");
      return;
    }
    if (lineas.some(l => !l.producto_id || l.cantidad <= 0 || l.precio <= 0)) {
      setError("Todas las líneas de producto deben tener un producto seleccionado, cantidad mayor a 0 y precio mayor a 0.");
      return;
    }
    try {
      await registrarOrden({
        proveedor_id: Number(proveedorId),
        fecha: new Date().toISOString().substring(0, 10),
        estado: "Pendiente",
        productos: lineas.map(l => ({
          producto_id: l.producto_id,
          cantidad: l.cantidad,
          precio: l.precio
        }))
      });
      alert("Orden de compra registrada exitosamente.");
      navigate("/ordenes");
    } catch (err) {
      console.error("Error al registrar la orden:", err);
      setError(`Error al crear la orden. ${err.response?.data?.error || 'Intenta de nuevo.'}`);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "2rem" }}>
        <h2 style={{ color: 'var(--color-secondary)', marginBottom: '1.5rem' }}>Registrar Orden de Compra</h2>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem",
          backgroundColor: 'var(--color-bg-glass)',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--glass-shadow)',
          transition: 'background-color var(--transition), box-shadow var(--transition)',
        }}>
          <div>
            <label htmlFor="proveedor" style={{ color: 'var(--color-text)', marginBottom: '0.5rem', display: 'block' }}>Proveedor:</label>
            <select
              id="proveedor"
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            >
              <option value="">Seleccionar un proveedor...</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: 'var(--color-text)', marginBottom: '0.5rem', display: 'block' }}>Productos a Ordenar:</label>
            {lineas.map((l, idx) => (
              <div key={idx} style={{ display: "flex", flexWrap: 'wrap', alignItems: 'center', gap: "0.75rem", marginBottom: "0.75rem" }}>
                <select
                  value={l.producto_id}
                  onChange={e => changeLinea(idx, 'producto_id', e.target.value)}
                  required
                  style={{ flex: '2 1 200px', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p=> <option key={p.id} value={p.id}>{p.nombre} - ${p.precio_venta?.toFixed(2) || p.precio?.toFixed(2) || '0.00'}</option>)}
                </select>
                <input
                  type="number"
                  min="1"
                  value={l.cantidad}
                  onChange={e => changeLinea(idx, 'cantidad', e.target.value)}
                  required
                  placeholder="Cantidad"
                  style={{ flex: '1 1 80px', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={l.precio}
                  onChange={e => changeLinea(idx, 'precio', e.target.value)}
                  required
                  placeholder="Precio Unitario"
                  style={{ flex: '1 1 100px', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
                <button
                  type="button"
                  onClick={() => removeLinea(idx)}
                  className="btn btn-danger btn-icon"
                  style={{ flexShrink: 0 }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLinea}
              className="btn"
              style={{ background: 'var(--color-primary)', color: 'var(--color-text-light)', marginTop: '0.5rem' }}
            >
              <FaPlus style={{ marginRight: '8px' }} /> Agregar Producto
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn">
              <FaSave style={{ marginRight: '8px' }} /> Guardar Orden
            </button>
            <button
              type="button"
              onClick={() => navigate("/ordenes")}
              className="btn btn-secondary"
              style={{ background: 'var(--color-secondary)', color: 'var(--color-text-light)' }}
            >
              <FaTimes style={{ marginRight: '8px' }} /> Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default RegistrarOrden;