import api from './api';

export const equipoVentaService = {
    obtenerTodos: async () => {
        return await api('/equipos');
    },

    crearEquipo: async (formData) => {
        // En api.js ya modificamos para que reciba el formData nativo 
        // y se encargue de no hacer JSON.parse si es FormData.
        return await api('/equipos', {
            method: 'POST',
            body: formData,
            headers: {} // el api.js eliminará el Content-Type permitiendo que Axios asigne multipart/form-data
        });
    }
};
