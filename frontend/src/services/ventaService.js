import api from './api';

export const ventaService = {
    obtenerHistorialAdmin: async () => {
        return await api('/ventas/');
    },

    obtenerVentasPublicas: async () => {
        return await api('/ventas/publicas');
    },

    registrarVentaManual: async (datosVenta) => {
        return await api('/ventas', {
            method: 'POST',
            body: JSON.stringify(datosVenta)
        });
    }
};
