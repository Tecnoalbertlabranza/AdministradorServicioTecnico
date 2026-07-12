import api from './api';

export const ventaService = {
    obtenerHistorialAdmin: async () => {
        return await api('/ventas/');
    },

    obtenerVentasPublicas: async () => {
        return await api('/ventas/publicas');
    }
};
