import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Comentado/Eliminado - Asegúrate de que este archivo esté vacío o solo contenga estilos muy básicos
// import './App.css'; // Comentado/Eliminado - Asegúrate de que este archivo esté vacío o solo contenga estilos muy básicos
import './assets/css/GlobalStyles.css'; // ¡Este es el único que importa las variables globales!
import './assets/css/Login.css';
import './assets/css/Sidebar.css';
import './assets/css/Reportes.css';
import './assets/css/Dashboard.css'; // <--- ¡IMPORTACIÓN AÑADIDA!

import App from './App';
import reportWebVitals from './reportWebVitals';

// Importa el AuthProvider y SocketProvider que creaste
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // <-- ¡AGREGADO ESTO!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
  <SocketProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SocketProvider>
</React.StrictMode>
);

reportWebVitals();