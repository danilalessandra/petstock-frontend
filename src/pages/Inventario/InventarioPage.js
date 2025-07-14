// src/pages/InventarioPage.js
import React from 'react';
import Sidebar from "../../components/Sidebar";
import ReabastecimientoTabla from '../components/ReabastecimientoTabla';
import '../assets/css/Dashboard.css'; // Importa los estilos del dashboard para el layout general

function InventarioPage() {
  return (
    // Envuelve toda la página en el contenedor principal del dashboard
    <div className="dashboard-container">
      {/* Renderiza el Sidebar */}
      <Sidebar />
      
      {/* El contenido principal de la página, envuelto en dashboard-main */}
      <main className="dashboard-main" role="main" tabIndex={-1}>
        {/* Puedes añadir un encabezado específico para esta página si lo deseas */}
        <header className="dashboard-header">
          <h1>Asistente de Reabastecimiento Inteligente</h1>
          <p>Gestiona las sugerencias de reabastecimiento para tu inventario.</p>
        </header>

        {/* Aquí se renderiza el componente de la tabla de reabastecimiento */}
        <ReabastecimientoTabla />
      </main>
    </div>
  );
}

export default InventarioPage;