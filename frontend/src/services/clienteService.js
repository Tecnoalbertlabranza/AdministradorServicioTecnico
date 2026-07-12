import api from './api';

export const clienteService = {
    obtenerTodos: async () => {
        return await api('/clientes/');
    }
};
