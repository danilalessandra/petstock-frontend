// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const [loading, setLoading] = useState(true); // Siempre true al inicio
    const [error, setError] = useState(null);

    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        setLoading(false); // Asegúrate de que loading se ponga en false al hacer logout
        setError(null);
    }, []);

    const refreshAuthToken = useCallback(async () => {
        try {
            if (!refreshToken) {
                logout();
                return;
            }

            const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);

            const decodedToken = jwtDecode(newAccessToken);
            setUser({
                id: decodedToken.id,
                nombre: decodedToken.nombre,
                email: decodedToken.email,
                rol: decodedToken.rol,
            });
            setError(null);
        } catch (error) {
            console.error("Error refreshing token:", error);
            setError("Sesión expirada. Por favor, inicia sesión de nuevo.");
            logout();
            throw error; // Propagar el error para que el interceptor o el llamador lo manejen
        }
    }, [refreshToken, logout]);

    const checkTokenValidity = useCallback(async () => {
        setLoading(true); // Se inicia la verificación, se pone loading en true
        try {
            if (!accessToken) {
                // Si no hay accessToken, no hay sesión activa, termina el proceso de carga
                setUser(null);
                setError(null); // Limpiar errores previos si los hubiera
                return; // Retorna, finally se encargará de setLoading(false)
            }

            const decodedToken = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp < currentTime) {
                // Si el token está expirado, intenta refrescarlo
                await refreshAuthToken();
            } else {
                // Si el token es válido, establece el usuario
                setUser({
                    id: decodedToken.id,
                    nombre: decodedToken.nombre,
                    email: decodedToken.email,
                    rol: decodedToken.rol,
                });
                setError(null);
            }
        } catch (error) {
            console.error("Error checking token validity:", error);
            // Si hay un error al decodificar o refrescar, limpia la sesión
            setError("Token inválido o sesión expirada. Por favor, inicia sesión de nuevo.");
            logout(); // Asegura un logout completo
        } finally {
            setLoading(false); // Siempre desactiva loading al finalizar la verificación
        }
    }, [accessToken, refreshAuthToken, logout]);

    const login = async (email, password) => {
        setLoading(true); // Activa loading al inicio del login
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('userId', jwtDecode(newAccessToken).id);

            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);

            const decodedToken = jwtDecode(newAccessToken);
            setUser({
                id: decodedToken.id,
                nombre: decodedToken.nombre,
                email: decodedToken.email,
                rol: decodedToken.rol,
            });
            setError(null);
            return true;
        } catch (err) {
            console.error('Login failed:', err.response?.data?.error || err.message);
            const errorMessage = err.response?.data?.error || "Error al iniciar sesión.";
            setError(errorMessage);
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            throw err;
        } finally {
            setLoading(false); // Desactiva loading siempre al finalizar el login
        }
    };

    // Este useEffect se ejecuta una vez al montar el AuthProvider
    // o cuando accessToken/refreshToken cambian de null a un valor.
    useEffect(() => {
        // Solo ejecuta checkTokenValidity si hay tokens y no estamos ya cargando
        // (la primera vez, `loading` es true por defecto, así que se ejecutará).
        // Si no hay tokens, simplemente desactiva loading, ya que no hay sesión que verificar.
        if (accessToken || refreshToken) {
            checkTokenValidity();
        } else {
            setLoading(false); // Si no hay tokens, no hay necesidad de verificar, desactiva loading
        }
    }, [accessToken, refreshToken, checkTokenValidity]); // Dependencias para re-ejecutar

    // Interceptores de Axios (mantener como están, son correctos)
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                // Evita reintentar la petición de login o refresh-token para evitar bucles infinitos
                if (error.response?.status === 401 && !originalRequest._retry &&
                    originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
                    originalRequest._retry = true;
                    try {
                        await refreshAuthToken();
                        originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        console.error("Refresh token failed in interceptor, logging out.");
                        logout();
                        return Promise.reject(refreshError);
                    }
                } else if (error.response?.status === 403) {
                    console.error("Acceso prohibido (403). Redirigiendo al login.");
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userId');
                    // Usar window.location.href para asegurar la redirección completa fuera de React Router
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, refreshAuthToken, logout]);

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, error, login, logout, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
};