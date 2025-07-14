import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

import {
  MdInventory,
  MdAttachMoney,
  MdLocalShipping,
  MdShoppingCart,
  MdPeople,
} from "react-icons/md";

import "../assets/css/Dashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useSocket();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketMessage, setSocketMessage] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        if (!response.ok) {
          throw new Error(`Error al cargar estadísticas: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Datos del dashboard:", data);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    if (socket) {
      socket.on("connect", () => {
        console.log("Conectado al servidor WebSocket! Socket ID:", socket.id);
        setSocketMessage("Conectado al servidor en tiempo real!");
        if (user?.id) {
          socket.emit("joinDashboard", user.id);
        }
      });

      socket.on("welcome", (message) => {
        console.log("Mensaje de bienvenida del servidor:", message);
        setSocketMessage(message);
      });

      socket.on("inventarioActualizado", (data) => {
        console.log("El inventario ha sido actualizado:", data);
        setSocketMessage(`Inventario actualizado: ${data.message}`);
        fetchStats(); // Refrescar datos
      });

      socket.on("stockAlert", (data) => {
        console.warn("🚨 Alerta de Stock:", data);
        setSocketMessage(`🚨 Alerta de Stock: ${data.message}`);
      });

      socket.on("expirationAlert", (data) => {
        console.warn("⏳ Alerta de Vencimiento:", data);
        setSocketMessage(`⏳ Alerta de Vencimiento: ${data.message}`);
      });

      socket.on("disconnect", () => {
        console.log("Desconectado del servidor WebSocket.");
        setSocketMessage("Desconectado del servidor en tiempo real.");
      });

      socket.on("connect_error", (err) => {
        console.error("Error de conexión WebSocket:", err.message);
        setSocketMessage(`Error de conexión: ${err.message}`);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("welcome");
        socket.off("inventarioActualizado");
        socket.off("stockAlert");
        socket.off("expirationAlert");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, [user, socket]);

  const quickAccessItems = [
    { label: "Inventario", icon: <MdInventory size={32} />, path: "/inventario" },
    { label: "Ventas", icon: <MdAttachMoney size={32} />, path: "/ventas" },
    { label: "Proveedores", icon: <MdLocalShipping size={32} />, path: "/proveedores" },
    { label: "Órdenes de Compra", icon: <MdShoppingCart size={32} />, path: "/ordenes" },
  ];

  if (user && user.rol === "administrador") {
    quickAccessItems.push({
      label: "Usuarios",
      icon: <MdPeople size={32} />,
      path: "/usuarios",
    });
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main
        className="dashboard-main"
        role="main"
        tabIndex={-1}
      >
        <header className="dashboard-header">
          <h1>¡Bienvenido, {user?.nombre || "Usuario"}!</h1>
          <p>Gestiona tu tienda de mascotas con eficiencia y control total.</p>
        </header>

        {socketMessage && (
          <div
            className="socket-status"
            style={{
              padding: "10px",
              backgroundColor: "#e0ffe0",
              borderLeft: "5px solid #4CAF50",
              margin: "15px 0",
            }}
          >
            <p>Estado de conexión en tiempo real: {socketMessage}</p>
          </div>
        )}

        <section className="quick-access">
          <h2>Acceso rápido</h2>
          <div className="quick-access-grid">
            {quickAccessItems.map(({ label, icon, path }) => (
              <button
                key={label}
                className="quick-access-card"
                onClick={() => handleNavigate(path)}
                aria-label={`Ir a ${label}`}
              >
                <div className="icon-wrapper">{icon}</div>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="stats-section"
          aria-label="Estadísticas principales"
        >
          {loading && <p>Cargando estadísticas...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
          {stats && (
            <>
              <article
                className="stat-card"
                tabIndex={0}
                aria-describedby="productos-en-inventario-desc"
              >
                <div className="stat-icon">
                  <MdInventory size={28} />
                </div>
                <div className="stat-info">
                  <h3 id="productos-en-inventario-desc">
                    Productos en Inventario
                  </h3>
                  <p className="stat-value">{stats.totalProductos}</p>
                </div>
              </article>

              <article
                className="stat-card"
                tabIndex={0}
                aria-describedby="ventas-hoy-desc"
              >
                <div className="stat-icon">
                  <MdAttachMoney size={28} />
                </div>
                <div className="stat-info">
                  <h3 id="ventas-hoy-desc">Ventas Hoy</h3>
                  <p className="stat-value">{stats.ventasHoy}</p>
                </div>
              </article>

              <article
                className="stat-card"
                tabIndex={0}
                aria-describedby="ventas-totales-desc"
              >
                <div className="stat-icon">
                  <MdAttachMoney size={28} />
                </div>
                <div className="stat-info">
                  <h3 id="ventas-totales-desc">Ventas Totales</h3>
                  <p className="stat-value">{stats.totalVentas}</p>
                </div>
              </article>

              <article
                className="stat-card"
                tabIndex={0}
                aria-describedby="proveedores-desc"
              >
                <div className="stat-icon">
                  <MdLocalShipping size={28} />
                </div>
                <div className="stat-info">
                  <h3 id="proveedores-desc">Proveedores</h3>
                  <p className="stat-value">{stats.totalProveedores}</p>
                </div>
              </article>

              <article
                className="stat-card"
                tabIndex={0}
                aria-describedby="ordenes-pendientes-desc"
              >
                <div className="stat-icon">
                  <MdShoppingCart size={28} />
                </div>
                <div className="stat-info">
                  <h3 id="ordenes-pendientes-desc">Órdenes Pendientes</h3>
                  <p className="stat-value">{stats.ordenesPendientes}</p>
                </div>
              </article>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;