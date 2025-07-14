import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
// getProveedor y editarProveedor en proveedoresService.js deben enviar el token de autorización
import { getProveedor, editarProveedor } from "../../api/proveedoresService";
import { useNavigate, useParams } from "react-router-dom";

function EditarProveedor() {
  const { id } = useParams(); // Obtiene el ID del proveedor de la URL
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [direccion, setDireccion] = useState(""); // Nuevo estado para Dirección
  const [error, setError] = useState(null); // Para mostrar errores al usuario

  const navigate = useNavigate();

  // useEffect para cargar los datos del proveedor cuando el componente se monta o el ID cambia
  useEffect(() => {
    async function fetchProveedor() {
      setError(null); // Limpiar errores previos
      try {
        // getProveedor en proveedoresService.js devuelve directamente el objeto de proveedor
        const res = await getProveedor(id);
        console.log("Datos de proveedor cargados para edición:", res); // Log para ver la respuesta completa

        // CORRECCIÓN CLAVE: Acceder directamente a las propiedades de 'res'
        setNombre(res.nombre || ""); // Usa '|| ""' para evitar undefined
        setContacto(res.contacto || "");
        setDireccion(res.direccion || ""); // Cargar la dirección existente

      } catch (err) {
        console.error("Error al cargar proveedor para edición (catch del frontend):", err);
        // Mostrar un mensaje de error más específico
        if (err.response && err.response.data && err.response.data.error) {
          setError("Error al cargar proveedor: " + err.response.data.error);
        } else {
          setError("Error al cargar proveedor. Por favor, verifica el ID y tu conexión.");
        }
      }
    }
    fetchProveedor();
  }, [id]); // Dependencia del ID para recargar si cambia la URL

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
        direccion: direccion.trim() === '' ? null : direccion, // Envía null si está vacía
      };
      console.log("Intentando actualizar proveedor con ID:", id, "y datos:", proveedorData);

      // La función editarProveedor en proveedoresService.js ya se encarga de adjuntar el token
      await editarProveedor(id, proveedorData);
      
      console.log("Proveedor actualizado exitosamente.");
      navigate("/proveedores"); // Redirigir a la lista de proveedores después de un éxito

    } catch (err) {
      console.error("Error al actualizar proveedor (catch del frontend):", err);
      // Mostrar un mensaje de error más específico
      if (err.response && err.response.data && err.response.data.error) {
        setError("Error al actualizar proveedor: " + err.response.data.error);
      } else {
        setError("Error al actualizar proveedor. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <h2>Editar Proveedor</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>} {/* Muestra los errores al usuario */}
        <form onSubmit={handleSubmit}>
          {/* El ID no se edita directamente en el formulario, pero se pasa por la URL */}
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
          {/* CAMPO DE DIRECCIÓN - Opcional según tu DB */}
          <div>
            <label>Dirección (Opcional):</label><br />
            <textarea
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>Guardar cambios</button>
        </form>
      </main>
    </div>
  );
}

export default EditarProveedor;
