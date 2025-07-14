// frontend/src/pages/Login.js
import React, { useState, useContext, useEffect } from "react"; // *** AÑADIDO useEffect ***
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Importa el AuthContext
import "../assets/css/Login.css";
// Importar iconos de ojo (si usas react-icons)
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Iconos para mostrar/ocultar contraseña

const PawIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
    width="48"
    height="48"
    fill="none"
    stroke="currentColor"
    strokeWidth="20"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M190 140 c30-2.7 50-36 48-75 c-2.7-39-25-67-55-65 c-30 2.7-50 36-48 75 c2.7 39 25 67 55 65 z"/>
    <path d="M306 140 c30 2.7 53-27 56-65 c2.7-38-19-70-50-73 c-30-2.7-53 27-56 65 c-2.7 38 19 70 50 73 z"/>
    <path d="M130 240 c27-13 33-50 18-87 c-15-36-49-58-77-47 c-27 13-33 50-18 87 c15 36 49 58 77 47 z"/>
    <path d="M366 240 c27 13 62-8 79-47 c17-39-8-83-37-90 c-29-7-63 8-80 47 c-17 39-8 83 38 90 z"/>
    <path d="M248,190 C180,190 80,320 140,400 Q248,500 356,400 C416,320 316,190 248,190 Z"/>
  </svg>
);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para la visibilidad de la contraseña
  const navigate = useNavigate();
  const { login, error: authContextError, loading } = useContext(AuthContext);

  // *** NUEVO useEffect para manejar la clase 'login-page' en el body ***
  useEffect(() => {
    document.body.classList.add('login-page'); // Añade la clase cuando el componente se monta

    return () => {
      document.body.classList.remove('login-page'); // Quita la clase cuando el componente se desmonta
    };
  }, []); // El array vacío asegura que se ejecute solo una vez al montar y al desmontar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Por favor, ingresa tu email y contraseña.");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error en el componente Login durante el envío del formulario:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    // La clase 'login-page' ya está en el div, pero la añadimos al body con useEffect para que el CSS global funcione
    <div className="login-page">
      <div className="brand-header">
        <span className="paw-logo" aria-label="Logo patita">
          <PawIcon />
        </span>
        <span className="brand-title">petstock</span>
      </div>

      <div className="login-container" role="main">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              aria-required="true"
            />
          </div>
          <div className="password-input-container" style={{ marginTop: "1rem" }}> {/* Contenedor para el input y el icono */}
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // Cambia el tipo según el estado
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-required="true"
              // Agrega padding-right en CSS para dejar espacio al icono
            />
            <button
              type="button" // Importante: tipo "button" para no enviar el formulario
              onClick={togglePasswordVisibility}
              className="password-toggle-button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Icono de ojo */}
            </button>
          </div>
          <button type="submit" aria-label="Iniciar sesión" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
        {(localError || authContextError) && (
          <p className="error-message" role="alert">
            {localError || authContextError}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;