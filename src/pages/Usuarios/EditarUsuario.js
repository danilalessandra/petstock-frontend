// frontend/src/pages/Usuarios/EditarUsuario.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsuario, actualizarUsuario } from '../../api/usuariosService';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Iconos para mostrar/ocultar contraseña

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState(''); // Usamos 'newPassword' para claridad
  const [rol, setRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false); // Nuevo estado para la visibilidad

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);
        const userData = await getUsuario(id);
        setNombre(userData.nombre);
        setEmail(userData.email);
        setRol(userData.rol);
        // No cargamos la contraseña existente por seguridad
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
        setError('Error al cargar los datos del usuario para edición. ' + (err.response?.data?.error || ''));
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeConfirmacion(null);

    if (!nombre || !email || !rol) {
      setError('Nombre, email y rol son obligatorios.');
      return;
    }

    try {
      const updatedData = { nombre, email, rol };
      if (newPassword) { // Solo si se ingresa una nueva contraseña
        updatedData.password = newPassword;
      }

      const usuarioActualizado = await actualizarUsuario(id, updatedData);
      setMensajeConfirmacion(`Usuario "${usuarioActualizado.nombre}" actualizado exitosamente.`);
      setNewPassword(''); // Limpiar el campo de nueva contraseña después de actualizar
      navigate('/usuarios');
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setError('Error al actualizar usuario: ' + (err.response?.data?.error || 'Intenta de nuevo.'));
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <p>Cargando datos del usuario...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="form-container">
          <h2>Editar Usuario</h2>
          {error && <p className="error-message">{error}</p>}
          {mensajeConfirmacion && <p className="success-message">{mensajeConfirmacion}</p>}

          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group password-input-container"> {/* Clase para el contenedor */}
              <label htmlFor="newPassword">Nueva Contraseña (opcional):</label>
              <input
                type={showNewPassword ? "text" : "password"} // Cambia el tipo
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Deja vacío para no cambiar"
                // Agrega padding-right en CSS para dejar espacio al icono
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                className="password-toggle-button" // Clase para el botón
                aria-label={showNewPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="rol">Rol:</label>
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option value="empleado">Empleado</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/usuarios')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditarUsuario;