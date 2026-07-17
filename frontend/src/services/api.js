import axios from 'axios';
import { toast } from 'react-hot-toast';

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
        // Si estamos enviando un FormData, debemos asegurarnos de no forzar application/json
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
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
            toast.error("Error de conexión con el servidor");
            return Promise.reject(new Error("Error de conexión: El servidor no responde o no tienes internet."));
        }

        const status = error.response.status;
        const errorData = error.response.data || {};
        const errorMessage = errorData.error || errorData.message || `Error HTTP: ${status}`;

        console.error(`[API Error] ${error.config.url}:`, errorMessage);
        
        // No mostrar toast para 401 si viene de Login, ya que Login lo maneja o queremos silenciarlo.
        // Pero para otros, sí podemos mostrarlo globalmente si lo deseamos.
        if (status !== 401) {
            toast.error(errorMessage);
        }

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
        let requestData;
        let customHeaders = { ...restOptions.headers };

        if (body instanceof FormData) {
            requestData = body;
            // axios maneja automáticamente el Content-Type para FormData y el boundary
            delete customHeaders['Content-Type']; 
        } else if (body && typeof body === 'string') {
            requestData = JSON.parse(body);
        } else {
            requestData = body;
        }

        const response = await apiClient({
            url: endpoint,
            method: method,
            data: requestData,
            headers: customHeaders,
            ...restOptions
        });
        
        return response.data;
    } catch (error) {
        throw error;
    }
}

export default fetchWithInterceptor;
