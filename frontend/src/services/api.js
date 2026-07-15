import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de peticiones (añadir JWT)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas (manejo de errores)
apiClient.interceptors.response.use(
    (response) => {
        // En axios, la respuesta exitosa viene en response.data
        return response;
    },
    (error) => {
        if (!error.response) {
            console.error("[Network Error] No se pudo conectar al servidor.");
            return Promise.reject(new Error("Error de conexión: El servidor no responde o no tienes internet."));
        }

        const status = error.response.status;
        const errorData = error.response.data || {};
        const errorMessage = errorData.error || errorData.message || `Error HTTP: ${status}`;

        console.error(`[API Error] ${error.config.url}:`, errorMessage);

        if (status === 401) {
            console.warn("Sesión expirada o no autorizada. Limpiando token...");
            localStorage.removeItem('token');
            // Podríamos emitir un evento para que App.jsx lo capture y redirija a login
            window.dispatchEvent(new Event('auth:unauthorized'));
        }

        return Promise.reject(new Error(errorMessage));
    }
);

/**
 * Wrapper de compatibilidad hacia atrás para los servicios actuales
 * que esperan un uso estilo fetch(endpoint, options).
 */
async function fetchWithInterceptor(endpoint, options = {}) {
    const { method = 'GET', body, ...restOptions } = options;
    
    try {
        const response = await apiClient({
            url: endpoint,
            method: method,
            data: body ? JSON.parse(body) : undefined,
            ...restOptions
        });
        
        return response.data;
    } catch (error) {
        throw error;
    }
}

export default fetchWithInterceptor;
