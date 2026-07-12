const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithInterceptor(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        // Manejo de errores globales de HTTP
        if (!response.ok) {
            let errorMessage = `Error HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // El cuerpo no es JSON válido
            }

            console.error(`[API Error] ${endpoint}:`, errorMessage);
            
            if (response.status === 401) {
                console.warn("Sesión expirada o no autorizada. Limpiando token...");
                // localStorage.removeItem('token');
                // Redirigir a login si es necesario
            }
            
            throw new Error(errorMessage);
        }

        // Si la respuesta es JSON, se parsea, si está vacía (204) retorna null
        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        // Manejo global de errores de red (ej: backend caido)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error("[Network Error] No se pudo conectar al servidor.");
            throw new Error("Error de conexión: El servidor no responde o no tienes internet.");
        }
        throw error;
    }
}

export default fetchWithInterceptor;
