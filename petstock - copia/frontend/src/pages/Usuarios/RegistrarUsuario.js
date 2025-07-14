// frontend/src/pages/Usuarios/RegistrarUsuario.js
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { crearUsuario } from '../../api/usuariosService';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Iconos para mostrar/ocultar contraseña

function RegistrarUsuario() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('empleado');
  const [error, setError] = useState(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para la visibilidad
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeConfirmacion(null);

    if (!nombre || !email || !password || !rol) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const nuevoUsuario = await crearUsuario({ nombre, email, password, rol });
      setMensajeConfirmacion(`Usuario "${nuevoUsuario.nombre}" registrado exitosamente con ID: ${nuevoUsuario.id}`);
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('empleado');
      navigate('/usuarios');
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError('Error al registrar usuario: ' + (err.response?.data?.error || 'Intenta de nuevo.'));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="form-container">
          <h2>Registrar Nuevo Usuario</h2>
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
              <label htmlFor="password">Contraseña:</label>
              <input
                type={showPassword ? "text" : "password"} // Cambia el tipo
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // Agrega padding-right en CSS para dejar espacio al icono
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-button" // Clase para el botón
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
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
              <button type="submit" className="btn btn-primary">Registrar Usuario</button>
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

export default RegistrarUsuario;