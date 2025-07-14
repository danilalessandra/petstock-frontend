// frontend/src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading, accessToken } = useContext(AuthContext); 

    console.log("--- PrivateRoute Evaluation Cycle ---");
    console.log("PrivateRoute: Current loading state from context:", loading);
    console.log("PrivateRoute: Current accessToken from context:", accessToken ? "Presente" : "Ausente"); 
    console.log("PrivateRoute: Current user object from context:", user);
    console.log("PrivateRoute: Type of user:", typeof user); 

    if (user) {
        console.log("PrivateRoute: Checking user properties...");
        console.log("PrivateRoute: User ID:", user.id);
        console.log("PrivateRoute: User Role:", user.rol); 
        console.log("PrivateRoute: Allowed Roles for this route:", allowedRoles);
        console.log("PrivateRoute: Is user role included in allowed roles?", allowedRoles.includes(user.rol));
    } else {
        console.log("PrivateRoute: User object is NULL or UNDEFINED in context.");
    }
    console.log("--- End PrivateRoute Evaluation Cycle ---");

    if (loading) {
        console.log("PrivateRoute: Still loading, showing loading message.");
        return <div>Cargando autenticación...</div>; 
    }

    if (!user) {
        console.log("PrivateRoute: User is null/undefined AFTER loading, redirecting to /login.");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        console.warn(`PrivateRoute: Acceso denegado para el rol '${user.rol}'. Roles permitidos: [${allowedRoles.join(', ')}]. Redirigiendo a /dashboard.`);
        return <Navigate to="/dashboard" replace />;
    }

    console.log("PrivateRoute: Acceso CONCEDIDO. Renderizando contenido.");
    return <Outlet />;
};

export default PrivateRoute;