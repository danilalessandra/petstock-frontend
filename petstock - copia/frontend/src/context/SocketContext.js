import React, { createContext, useContext, useEffect, useState, useRef } from 'react'; // <-- Importa useRef
import io from 'socket.io-client';

const SocketContext = createContext(null); // <-- Inicializa con null

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null); // <-- ¡Aquí la clave! Para controlar la instancia del socket

    const BACKEND_HTTP = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    let BACKEND_WS = BACKEND_HTTP;

    if (BACKEND_WS.startsWith('https')) {
        BACKEND_WS = BACKEND_WS.replace(/^https/, 'wss');
    } else if (BACKEND_WS.startsWith('http')) {
        BACKEND_WS = BACKEND_WS.replace(/^http/, 'ws');
    }

    useEffect(() => {
        // Solo inicializa el socket si aún no ha sido inicializado en esta instancia del proveedor
        if (!socketRef.current) { // <-- ¡Usa el ref para la condición!
            console.log('📦 Inicializando conexión Socket.IO a:', BACKEND_WS);
            const newSocket = io(BACKEND_WS, {
                // transports: ['websocket'], // <-- Considera COMENTAR o ELIMINAR esta línea para permitir polling inicial
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket.IO conectado al backend. ID:', newSocket.id);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket.IO desconectado del backend. Razón:', reason);
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Error de conexión Socket.IO:', err.message);
            });

            // Guarda la instancia del socket tanto en el ref como en el estado
            socketRef.current = newSocket;
            setSocket(newSocket);
        }

        // La función de limpieza se ejecutará cuando el componente se desmonte
        // o antes de que el efecto se re-ejecute si sus dependencias cambian.
        // Aquí, la instancia newSocket siempre será la que se creó o no si socketRef.current ya existía
        return () => {
            // Asegúrate de que la desconexión se haga solo si el socket existe en el ref
            if (socketRef.current) {
                console.log('🚀 Desconectando Socket.IO al desmontar o re-ejecutar efecto...');
                socketRef.current.disconnect();
                socketRef.current = null; // Limpia el ref al desconectar
            }
        };
    }, [BACKEND_WS]); // <-- Solo depende de BACKEND_WS para re-crear si la URL base cambia

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};