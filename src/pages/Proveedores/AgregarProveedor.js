import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { agregarProveedor } from "../../api/proveedoresService";
import { useNavigate } from "react-router-dom";

function AgregarProveedor() {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [direccion, setDireccion] = useState(""); // Estado para Dirección
  const [error, setError] = useState(null); // Para mostrar errores al usuario

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos

    // Validaciones de Frontend para campos obligatorios
    if (!nombre.trim()) {
      setError("El Nombre del proveedor es obligatorio.");
      console.error("Validación Frontend: Nombre vacío.");
      return;
    }
    if (!contacto.trim()) {
      setError("El Contacto del proveedor es obligatorio.");
      console.error("Validación Frontend: Contacto vacío.");
      return;
    }
    // La dirección es opcional en tu DB, así que no es obligatoria aquí.

    try {
      const proveedorData = {
        nombre,
        contacto,
        // Envía la dirección. Si está vacía, se enviará null (consistente con DB anulable).
        direccion: direccion.trim() === '' ? null : direccion,
      };
      console.log("Intentando agregar proveedor con datos:", proveedorData);

      // La función agregarProveedor en proveedoresService.js ya se encarga de adjuntar el token
      // y no enviamos el ID, ya que la DB lo auto-genera.
      await agregarProveedor(proveedorData);
      
      console.log("Proveedor agregado exitosamente.");
      navigate("/proveedores"); // Redirigir a la lista de proveedores después de un éxito

    } catch (err) {
      console.error("Error al agregar proveedor (catch del frontend):", err);
      // Intentar mostrar un mensaje de error más específico del backend al usuario
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al agregar proveedor: " + err.response.data.error);
      } else {
        setError("Error al agregar proveedor. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Agregar Proveedor</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* El campo ID no se incluye aquí porque la base de datos lo auto-genera */}
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
            <label>Contacto:</label><br />
            <input
              type="text"
              value={contacto}
              onChange={e => setContacto(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Dirección (Opcional):</label><br />
            <textarea
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>Guardar</button>
        </form>
      </main>
    </div>
  );
}

export default AgregarProveedor;
