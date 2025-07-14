import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Asegúrate de que la ruta sea correcta
import '../assets/css/Ventas.css'; // Crea este archivo CSS si no existe

function Ventas() {
    const navigate = useNavigate();
    const location = useLocation(); // Para saber la ruta actual

    // Determina qué pestaña debe estar activa basándose en la URL
    // Si la ruta es /ventas o /ventas/registrar, 'registrar' es activa
    // Si la ruta es /ventas/historial, 'historial' es activa
    const [activeTab, setActiveTab] = useState(() => {
        if (location.pathname === '/ventas/historial') {
            return 'historial';
        }
        return 'registrar'; // Por defecto, si es /ventas o /ventas/registrar
    });

    // Sincroniza la pestaña activa con la URL
    useEffect(() => {
        if (location.pathname === '/ventas/historial') {
            setActiveTab('historial');
        } else {
            setActiveTab('registrar');
        }
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'registrar') {
            navigate('/ventas/registrar');
        } else if (tab === 'historial') {
            navigate('/ventas/historial');
        }
    };

    return (
        <div className="ventas-container">
            <Sidebar />
            <main className="ventas-main-content">
                <h2>Gestión de Ventas</h2>
                <p>Aquí puedes registrar nuevas ventas o consultar el historial de transacciones.</p>

                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'registrar' ? 'active' : ''}`}
                        onClick={() => handleTabChange('registrar')}
                    >
                        Registrar Venta
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => handleTabChange('historial')}
                    >
                        Historial de Ventas
                    </button>
                </div>

                {/* Outlet renderiza el componente de la ruta anidada (RegistrarVenta o HistorialVentas) */}
                <div className="ventas-content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Ventas;