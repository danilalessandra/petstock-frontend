import React, { useEffect } from "react"; // <-- AGREGADO useEffect aquí
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'; // ToastContainer y toast son importados
import 'react-toastify/dist/ReactToastify.css'; // <-- CORRECCIÓN de la ruta del CSS de Toastify (mayúscula 'T')

import { useSocket } from './context/SocketContext';
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from './context/ThemeContext';

// Páginas de Autenticación
import Login from "./pages/Login"; // <-- ¡Asegúrate de que estas rutas sean correctas!

// Páginas de la Aplicación
import Dashboard from "./pages/Dashboard"; // <-- ¡Asegúrate de que estas rutas sean correctas!

// Componentes de Inventario (Productos)
import ListarProductos from "./pages/Inventario/ListarProductos"; // <-- ¡Asegúrate de que estas rutas sean correctas!
import AgregarProducto from "./pages/Inventario/AgregarProducto";
import EditarProducto from "./pages/Inventario/EditarProducto";
import ListarMovimientosInventario from "./pages/Inventario/ListarMovimientosInventario";
import RegistrarMovimientoInventario from "./pages/Inventario/RegistrarMovimientoInventario";
import EditarMovimientoInventario from "./pages/Inventario/EditarMovimientoInventario";

// Componentes de Proveedores
import ListarProveedores from "./pages/Proveedores/ListarProveedores"; // <-- ¡Asegúrate de que estas rutas sean correctas!
import AgregarProveedor from "./pages/Proveedores/AgregarProveedor";
import EditarProveedor from "./pages/Proveedores/EditarProveedor";

// Componentes de Ventas
import RegistrarVenta from "./pages/Ventas/RegistrarVenta"; // <-- ¡Asegúrate de que estas rutas sean correctas!
import HistorialVentas from "./pages/Ventas/HistorialVentas";
import DetallesVenta from "./pages/Ventas/DetallesVenta";
import EditarVenta from "./pages/Ventas/EditarVenta";

// Componentes de Órdenes de Compra
import RegistrarOrden from "./pages/Ordenes/RegistrarOrden"; // <-- ¡Asegúrate de que estas rutas sean correctas!
import VerOrdenes from "./pages/Ordenes/VerOrdenes";
import EditarOrden from "./pages/Ordenes/EditarOrden";
import DetallesOrden from "./pages/Ordenes/DetallesOrden";

// Componentes de Reportes
import Reportes from "./pages/Reportes/Reportes"; // <-- ¡Asegúrate de que estas rutas sean correctas!

// Componentes de Gestión de Usuarios
import ListarUsuarios from "./pages/Usuarios/ListarUsuarios"; // <-- ¡Asegúrate de que estas rutas sean correctas!
import RegistrarUsuario from "./pages/Usuarios/RegistrarUsuario";
import EditarUsuario from "./pages/Usuarios/EditarUsuario";

import ReabastecimientoTabla from "./components/ReabastecimientoTabla"; // <-- ¡Asegúrate de que esta ruta sea correcta!

function App() {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('stockAlert', (alertData) => {
        console.log('🔔 Alerta de stock recibida via WebSocket:', alertData);
        toast.warn(alertData.message, {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });

      socket.on('expirationAlert', (alertData) => {
          console.log('⏳ Alerta de vencimiento recibida via WebSocket:', alertData);
          toast.info(alertData.message, {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
      });

      return () => {
        socket.off('stockAlert');
        socket.off('expirationAlert');
      };
    }
  }, [socket]);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rutas protegidas para Administrador y Empleado */}
            <Route element={<PrivateRoute allowedRoles={['administrador', 'empleado']} />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Rutas de Inventario */}
              <Route path="/inventario" element={<ListarProductos />} />
              <Route path="/inventario/agregar" element={<AgregarProducto />} />
              <Route path="/inventario/editar/:id" element={<EditarProducto />} />
              <Route path="/inventario/reabastecimiento" element={<ReabastecimientoTabla />} />

              {/* Rutas de Movimientos de Inventario */}
              <Route path="/movimientos-inventario" element={<ListarMovimientosInventario />} />
              <Route path="/movimientos-inventario/registrar" element={<RegistrarMovimientoInventario />} />
              <Route path="/movimientos-inventario/editar/:id" element={<EditarMovimientoInventario />} />

              {/* Rutas de Proveedores */}
              <Route path="/proveedores" element={<ListarProveedores />} />
              <Route path="/proveedores/agregar" element={<AgregarProveedor />} />
              <Route path="/proveedores/editar/:id" element={<EditarProveedor />} />

              {/* Rutas de Ventas */}
              <Route path="/ventas" element={<HistorialVentas />} />
              <Route path="/ventas/registrar" element={<RegistrarVenta />} />
              <Route path="/ventas/detalles/:id" element={<DetallesVenta />} />
              <Route path="/ventas/editar/:id" element={<EditarVenta />} />

              {/* Rutas de Órdenes de Compra */}
              <Route path="/ordenes" element={<VerOrdenes />} />
              <Route path="/ordenes/registrar" element={<RegistrarOrden />} />
              <Route path="/ordenes/editar/:id" element={<EditarOrden />} />
              <Route path="/ordenes/detalles/:id" element={<DetallesOrden />} />

              {/* Ruta de Reportes */}
              <Route path="/reportes" element={<Reportes />} />
            </Route>

            {/* Rutas de Gestión de Usuarios (Solo Administrador) */}
            <Route element={<PrivateRoute allowedRoles={['administrador']} />}>
              <Route path="/usuarios" element={<ListarUsuarios />} />
              <Route path="/usuarios/registrar" element={<RegistrarUsuario />} />
              <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
      {/* Coloca ToastContainer al final de tu componente raíz para que las notificaciones se muestren */}
      <ToastContainer /> {/* <-- ¡IMPORTANTE! PARA QUE LAS NOTIFICACIONES SE VEAN */}
    </AuthProvider>
  );
}

export default App;