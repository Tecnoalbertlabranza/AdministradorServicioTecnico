import api from './api';

export const clienteService = {
    obtenerTodos: async () => {
        return await api('/clientes/');
    },

    crearCliente: async (datosCliente) => {
        return await api('/clientes/', {
            method: 'POST',
            body: JSON.stringify(datosCliente)
        });
    },

    crear: async (datosCliente) => {
        return await api('/clientes/', {
            method: 'POST',
            body: JSON.stringify(datosCliente)
        });
    }
};
