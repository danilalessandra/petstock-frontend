// src/components/Sidebar.js
import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from '../context/ThemeContext';
import "../assets/css/Sidebar.css";

import {
  MdDashboard,
  MdInventory,
  MdAddBox,
  MdSyncAlt,
  MdLocalShipping,
  MdPeople,
  MdBarChart,
  MdStore,
  MdShoppingCart,
  MdAttachMoney,
  MdPersonAdd,
  MdLogout,
  MdAssignment,
  MdMenu,
  MdClose,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";

function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Estado inicial del sidebar: abierto si es desktop (más de 768px), cerrado si es móvil
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  // Usamos el theme del contexto global
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  // Efecto para ajustar el estado inicial y manejar el resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Se ejecuta una vez al montar

  // Bloquea scroll en body cuando sidebar está abierto (modo móvil)
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    } else {
      document.body.style.overflow = ""; // Asegurarse de que no esté bloqueado en desktop
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    // Cierra el sidebar solo si estamos en modo móvil
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  // Función auxiliar para verificar si el usuario es administrador
  const isAdmin = user && user.rol === "administrador";

  return (
    <>
      {/* Botón hamburguesa: visible en móvil, oculto en desktop por CSS */}
      <button
        type="button"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="sidebar-navigation"
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen && window.innerWidth > 768 ? <MdClose size={28} /> : <MdMenu size={28} />}
      </button>

      <aside
        id="sidebar-navigation"
        className={`sidebar ${isOpen ? "open" : ""}`}
        aria-label="Barra lateral de navegación"
      >
        <div className="sidebar-header">
          <h3>
            <MdStore style={{ marginRight: 8, verticalAlign: "middle" }} />
            Tienda de mascotas
          </h3>
        </div>

        {/* Navegación con scroll automática gracias a CSS */}
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink
                to="/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdDashboard /></span> Inicio
              </NavLink>
            </li>

            <li className="menu-category">Inventario</li>
            <li>
              <NavLink
                to="/inventario"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdInventory /></span> Listar Productos
              </NavLink>
            </li>
            {/* Solo administradores pueden ver "Agregar Producto" */}
            {isAdmin && ( //
              <li>
                <NavLink
                  to="/inventario/agregar"
                  onClick={handleLinkClick}
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                >
                  <span className="icon"><MdAddBox /></span> Agregar Producto
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/movimientos-inventario"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdSyncAlt /></span> Movimientos de Inventario
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inventario/reabastecimiento"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdAssignment /></span> Asistente de Reabastecimiento
              </NavLink>
            </li>

            <li className="menu-category">Proveedores</li>
            <li>
              <NavLink
                to="/proveedores"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdLocalShipping /></span> Listar Proveedores
              </NavLink>
            </li>
            {/* Solo administradores pueden ver "Agregar Proveedor" */}
            {isAdmin && ( //
              <li>
                <NavLink
                  to="/proveedores/agregar"
                  onClick={handleLinkClick}
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                >
                  <span className="icon"><MdAddBox /></span> Agregar Proveedor
                </NavLink>
              </li>
            )}

            <li className="menu-category">Ventas</li>
            <li>
              <NavLink
                to="/ventas"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdAttachMoney /></span> Historial de Ventas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ventas/registrar"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdAssignment /></span> Registrar Venta
              </NavLink>
            </li>

            <li className="menu-category">Órdenes de Compra</li>
            <li>
              <NavLink
                to="/ordenes"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdShoppingCart /></span> Ver Órdenes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ordenes/registrar"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="icon"><MdAddBox /></span> Registrar Orden
              </NavLink>
            </li>

            {/* Este bloque ya estaba restringido a administradores */}
            {isAdmin && ( //
              <>
                <li className="menu-category">Gestión de Usuarios</li>
                <li>
                  <NavLink
                    to="/usuarios"
                    onClick={handleLinkClick}
                    className={({ isActive }) => (isActive ? "active-link" : "")}
                  >
                    <span className="icon"><MdPeople /></span> Listar Usuarios
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/usuarios/registrar"
                    onClick={handleLinkClick}
                    className={({ isActive }) => (isActive ? "active-link" : "")}
                  >
                    <span className="icon"><MdPersonAdd /></span> Registrar Usuario
                  </NavLink>
                </li>
              </>
            )}

            {/* Solo administradores pueden ver "Reportes" */}
            {isAdmin && ( //
              <>
                <li className="menu-category">Informes</li>
                <li>
                  <NavLink
                    to="/reportes"
                    onClick={handleLinkClick}
                    className={({ isActive }) => (isActive ? "active-link" : "")}
                  >
                    <span className="icon"><MdBarChart /></span> Reportes
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Botón para cambiar tema */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-button"
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}{" "}
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" onClick={handleLogout} className="logout-button">
            <MdLogout style={{ marginRight: 8, verticalAlign: "middle" }} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;